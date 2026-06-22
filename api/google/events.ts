import { google } from 'googleapis';
import { z } from 'zod';
import type { VercelRequest, VercelResponse } from '../_types';
import { getSupabaseAdmin } from '../_supabaseAdmin';
import { getOAuthClient } from './_oauth';

const querySchema = z.object({
  userId: z.string().uuid(),
  days: z.coerce.number().int().min(1).max(90).default(14),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const query = querySchema.parse(req.query);
    const supabase = getSupabaseAdmin();
    const { data: connections, error } = await supabase
      .from('google_calendar_connections')
      .select('*')
      .eq('user_id', query.userId);

    if (error) {
      throw error;
    }

    const events = [];
    for (const connection of connections ?? []) {
      const oauth2Client = getOAuthClient();
      oauth2Client.setCredentials({
        access_token: connection.access_token,
        refresh_token: connection.refresh_token,
        expiry_date: connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : undefined,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const list = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + query.days * 86_400_000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      events.push(
        ...(list.data.items ?? []).map((event) => ({
          id: event.id,
          title: event.summary,
          start: event.start?.dateTime ?? event.start?.date,
          end: event.end?.dateTime ?? event.end?.date,
          location: event.location,
          calendarEmail: connection.google_email,
        })),
      );

      const credentials = oauth2Client.credentials;
      if (credentials.access_token && credentials.access_token !== connection.access_token) {
        await supabase
          .from('google_calendar_connections')
          .update({
            access_token: credentials.access_token,
            token_expires_at: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
          })
          .eq('id', connection.id);
      }
    }

    res.status(200).json({ events });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to read calendar events.' });
  }
}

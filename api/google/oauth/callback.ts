import type { Credentials } from 'google-auth-library';
import type { VercelRequest, VercelResponse } from '../../_types';
import { getSupabaseAdmin } from '../../_supabaseAdmin';
import { getOAuthClient } from '../_oauth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const userId = typeof req.query.state === 'string' ? req.query.state : '';

    if (!code || !userId) {
      res.status(400).json({ error: 'Missing OAuth code or user state.' });
      return;
    }

    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const userInfo = await oauth2Client.request<{ email?: string }>({ url: 'https://www.googleapis.com/oauth2/v2/userinfo' });

    await saveConnection(userId, tokens, userInfo.data.email);
    res.redirect('/settings?calendar=connected');
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to complete Google OAuth.' });
  }
}

async function saveConnection(userId: string, tokens: Credentials, email?: string) {
  const supabase = getSupabaseAdmin();
  const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null;

  const { error } = await supabase.from('google_calendar_connections').upsert(
    {
      user_id: userId,
      google_email: email ?? 'Connected Google account',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt,
      scope: tokens.scope,
    },
    { onConflict: 'user_id,google_email' },
  );

  if (error) {
    throw error;
  }
}

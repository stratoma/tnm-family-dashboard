import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import type { VercelRequest, VercelResponse } from '../_types.js';
import { getCalConnectionStatus, removeCalConnection, saveCalApiKey } from './_connection.js';

const calApiVersion = '2026-02-25';

const bodySchema = z.object({
  apiKey: z.string().trim().min(12).max(512).regex(/^cal(?:_[a-z]+)?_/, 'Enter a valid Cal.com API key.'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = authorisedUser(req);
  if (!userId) {
    res.status(401).json({ error: 'Cal.com connections require the family access code.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      res.status(200).json({ connection: await getCalConnectionStatus(userId) });
      return;
    }

    if (req.method === 'POST') {
      const { apiKey } = bodySchema.parse(req.body);
      const verified = await fetch('https://api.cal.com/v2/bookings?status=upcoming&take=1', {
        headers: { Accept: 'application/json', Authorization: `Bearer ${apiKey}`, 'cal-api-version': calApiVersion },
      });

      if (!verified.ok) {
        res.status(400).json({ error: 'Cal.com could not verify that API key. Please create a new key and try again.' });
        return;
      }

      await saveCalApiKey(userId, apiKey);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      await removeCalConnection(userId);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Enter a valid Cal.com API key.' });
      return;
    }
    res.status(500).json({ error: safeConnectionError(error) });
  }
}

function safeConnectionError(error: unknown) {
  const message = readErrorMessage(error).toLowerCase();

  if (message.includes('invalid api key') || message.includes('invalid jwt') || message.includes('jwt')) {
    return 'Supabase rejected SUPABASE_SERVICE_ROLE_KEY. Copy the service-role or secret key from this Supabase project.';
  }

  if (message.includes('supabaseurl is required') || message.includes('fetch failed') || message.includes('getaddrinfo')) {
    return 'Supabase could not be reached. Check that SUPABASE_URL is the project URL.';
  }

  if (message.includes('invalid input syntax for type uuid')) {
    return 'FAMILY_USER_ID is not a valid Supabase user UUID.';
  }

  if (message.includes('cal_calendar_connections') || message.includes('schema cache') || message.includes('relation')) {
    return 'The Cal.com connection table is unavailable. Run the current Supabase schema and try again.';
  }

  if (message.includes('cal_connection_encryption_key')) {
    return 'CAL_CONNECTION_ENCRYPTION_KEY must be the base64 32-byte value generated for this deployment.';
  }

  return 'Supabase could not save the Cal.com connection. Check the production Supabase variables.';
}

function readErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return '';
}

function authorisedUser(req: VercelRequest) {
  const expected = process.env.ACCESS_CODE;
  const provided = req.headers?.['x-family-access-code'];
  const userId = process.env.FAMILY_USER_ID;
  if (!expected || typeof provided !== 'string' || !userId) return null;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer) ? userId : null;
}

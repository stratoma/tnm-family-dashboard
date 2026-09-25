import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import type { VercelRequest, VercelResponse } from '../_types';
import { getCalConnectionStatus, removeCalConnection, saveCalApiKey } from './_connection';

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
    res.status(500).json({ error: 'Unable to update the Cal.com connection.' });
  }
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

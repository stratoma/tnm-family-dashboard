import { z } from 'zod';
import { timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '../_types';
import { getCalApiKey } from './_connection';

const calApiVersion = '2026-02-25';

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
});

type CalBooking = {
  id?: number | string;
  uid?: string;
  title?: string;
  start?: string;
  end?: string;
  location?: string | { address?: string; link?: string };
  hosts?: Array<{ name?: string; username?: string }>;
};

function bookingLocation(location: CalBooking['location']) {
  if (typeof location === 'string') return location;
  return location?.address ?? location?.link ?? '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  if (!hasFamilyAccess(req)) {
    res.status(401).json({ error: 'Cal.com sync requires the family access code.' });
    return;
  }

  const userId = process.env.FAMILY_USER_ID;
  if (!userId) {
    res.status(503).json({ error: 'Cal.com sync is not configured yet.' });
    return;
  }

  try {
    const apiKey = await getCalApiKey(userId);
    if (!apiKey) {
      res.status(404).json({ error: 'Connect a Cal.com account in Settings before syncing.' });
      return;
    }
    const { days } = querySchema.parse(req.query);
    const response = await fetch('https://api.cal.com/v2/bookings?status=upcoming&take=100', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'cal-api-version': calApiVersion,
      },
    });

    if (!response.ok) {
      res.status(response.status === 401 || response.status === 403 ? 502 : 503).json({
        error: response.status === 401 || response.status === 403
          ? 'Cal.com could not verify the configured API key.'
          : 'Cal.com is temporarily unavailable. Please try again shortly.',
      });
      return;
    }

    const payload = await response.json() as { data?: CalBooking[] };
    const latest = Date.now() + days * 86_400_000;
    const events = (payload.data ?? [])
      .filter((booking) => booking.start && booking.end)
      .filter((booking) => new Date(booking.start as string).getTime() <= latest)
      .map((booking) => ({
        id: `cal-${booking.uid ?? booking.id}`,
        title: booking.title?.trim() || 'Cal.com booking',
        calendar: 'Cal.com',
        owner: booking.hosts?.[0]?.name ?? booking.hosts?.[0]?.username ?? 'Cal.com',
        start: booking.start,
        end: booking.end,
        location: bookingLocation(booking.location),
        color: '#5f8fa5',
        source: 'cal.com' as const,
      }));

    res.status(200).json({ events, syncedAt: new Date().toISOString() });
  } catch {
    res.status(400).json({ error: 'Unable to read Cal.com bookings.' });
  }
}

function hasFamilyAccess(req: VercelRequest) {
  const expected = process.env.ACCESS_CODE;
  const provided = req.headers?.['x-family-access-code'];
  if (!expected || typeof provided !== 'string') return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}

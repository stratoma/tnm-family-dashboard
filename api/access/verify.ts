import { timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '../_types';

type AccessBody = {
  code?: unknown;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const accessCode = process.env.ACCESS_CODE;
  if (!accessCode) {
    res.status(500).json({ ok: false, error: 'Access code is not configured.' });
    return;
  }

  const body = (req.body ?? {}) as AccessBody;
  const providedCode = typeof body.code === 'string' ? body.code.trim() : '';

  if (!providedCode) {
    res.status(400).json({ ok: false, error: 'Enter the family access code.' });
    return;
  }

  const ok = safeCompare(providedCode, accessCode);
  if (!ok) {
    res.status(401).json({ ok: false, error: 'That code does not look right.' });
    return;
  }

  res.status(200).json({ ok: true });
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

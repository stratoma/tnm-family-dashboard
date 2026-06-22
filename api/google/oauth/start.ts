import type { VercelRequest, VercelResponse } from '../../_types';
import { calendarScopes, getOAuthClient } from '../_oauth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : '';
    const oauth2Client = getOAuthClient();
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: calendarScopes,
      state: userId,
    });

    res.redirect(url);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to start Google OAuth.' });
  }
}

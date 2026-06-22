import { z } from 'zod';
import type { VercelRequest, VercelResponse } from '../_types';

const querySchema = z.object({
  city: z.string().min(2).default('New York'),
  units: z.enum(['imperial', 'metric']).default('imperial'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Missing WEATHER_API_KEY.' });
      return;
    }

    const query = querySchema.parse(req.query);
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('q', query.city);
    url.searchParams.set('appid', apiKey);
    url.searchParams.set('units', query.units);

    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).json({ error: 'Weather provider request failed.' });
      return;
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.status(200).json({
      city: data.name,
      temperature: Math.round(data.main.temp),
      low: Math.round(data.main.temp_min),
      high: Math.round(data.main.temp_max),
      description: data.weather?.[0]?.description ?? 'Weather unavailable',
      icon: data.weather?.[0]?.icon,
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to load weather.' });
  }
}

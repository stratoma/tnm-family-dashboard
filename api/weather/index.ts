import { z } from 'zod';
import type { VercelRequest, VercelResponse } from '../_types';
import { getWeather, WeatherProviderError } from '../_weather';

const querySchema = z.object({
  city: z.string().min(2).default('New York'),
  units: z.enum(['imperial', 'metric']).default('imperial'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const query = querySchema.parse(req.query);
    const weather = await getWeather(query.city, query.units, process.env.WEATHER_API_KEY);

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.status(200).json(weather);
  } catch (error) {
    if (error instanceof WeatherProviderError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to load weather.' });
  }
}

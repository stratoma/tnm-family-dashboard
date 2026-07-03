import { timingSafeEqual } from 'node:crypto';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), accessCodeDevPlugin(env.ACCESS_CODE), weatherDevPlugin(env.WEATHER_API_KEY)],
  };
});

function accessCodeDevPlugin(accessCode?: string): Plugin {
  return {
    name: 'family-dashboard-access-code-dev',
    configureServer(server) {
      server.middlewares.use('/api/access/verify', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        let rawBody = '';
        req.on('data', (chunk) => {
          rawBody += chunk;
        });
        req.on('end', () => {
          try {
            if (!accessCode) {
              sendJson(res, 500, { ok: false, error: 'Access code is not configured.' });
              return;
            }

            const body = JSON.parse(rawBody || '{}') as { code?: unknown };
            const providedCode = typeof body.code === 'string' ? body.code.trim() : '';

            if (!providedCode) {
              sendJson(res, 400, { ok: false, error: 'Enter the family access code.' });
              return;
            }

            if (!safeCompare(providedCode, accessCode)) {
              sendJson(res, 401, { ok: false, error: 'That code does not look right.' });
              return;
            }

            sendJson(res, 200, { ok: true });
          } catch {
            sendJson(res, 400, { ok: false, error: 'Unable to verify that code.' });
          }
        });
      });
    },
  };
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

function sendJson(res: { statusCode: number; setHeader(name: string, value: string): void; end(body: string): void }, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function weatherDevPlugin(apiKey?: string): Plugin {
  return {
    name: 'family-dashboard-weather-dev',
    configureServer(server) {
      server.middlewares.use('/api/weather', async (req, res) => {
        try {
          const requestUrl = new URL(req.url ?? '', 'http://localhost');
          const city = requestUrl.searchParams.get('city')?.trim() || 'New York';
          const units = requestUrl.searchParams.get('units') === 'metric' ? 'metric' : 'imperial';
          const weather = await getDevWeather(city, units, apiKey);

          sendJson(res, 200, weather);
        } catch (error) {
          if (error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number') {
            sendJson(res, error.statusCode, { error: error.message });
            return;
          }

          sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unable to load weather.' });
        }
      });
    },
  };
}

type WeatherUnits = 'imperial' | 'metric';

type DevWeatherProviderError = Error & {
  statusCode?: number;
};

async function getDevWeather(city: string, units: WeatherUnits, apiKey?: string) {
  if (apiKey?.trim()) {
    return getDevOpenWeather(city, units, apiKey);
  }

  return getDevOpenMeteoWeather(city, units);
}

async function getDevOpenWeather(city: string, units: WeatherUnits, apiKey: string) {
  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('q', city);
  url.searchParams.set('appid', apiKey);
  url.searchParams.set('units', units);

  const response = await fetch(url);
  if (!response.ok) {
    throw devProviderError(response.status, 'Weather provider request failed.');
  }

  const data = await response.json();
  return {
    city: data.name,
    temperature: Math.round(data.main.temp),
    low: Math.round(data.main.temp_min),
    high: Math.round(data.main.temp_max),
    description: data.weather?.[0]?.description ?? 'Weather unavailable',
    icon: data.weather?.[0]?.icon,
  };
}

async function getDevOpenMeteoWeather(city: string, units: WeatherUnits) {
  const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
  geocodingUrl.searchParams.set('name', city);
  geocodingUrl.searchParams.set('count', '1');
  geocodingUrl.searchParams.set('language', 'en');
  geocodingUrl.searchParams.set('format', 'json');

  const geocodingResponse = await fetch(geocodingUrl);
  if (!geocodingResponse.ok) {
    throw devProviderError(geocodingResponse.status, 'Unable to find that city.');
  }

  const geocodingData = (await geocodingResponse.json()) as {
    results?: Array<{ name?: string; admin1?: string; latitude?: number; longitude?: number }>;
  };
  const place = geocodingData.results?.[0];
  if (!place || typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
    throw devProviderError(404, 'Unable to find that city.');
  }

  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
  forecastUrl.searchParams.set('latitude', String(place.latitude));
  forecastUrl.searchParams.set('longitude', String(place.longitude));
  forecastUrl.searchParams.set('current', 'temperature_2m,weather_code');
  forecastUrl.searchParams.set('daily', 'temperature_2m_min,temperature_2m_max');
  forecastUrl.searchParams.set('temperature_unit', units === 'imperial' ? 'fahrenheit' : 'celsius');
  forecastUrl.searchParams.set('timezone', 'auto');
  forecastUrl.searchParams.set('forecast_days', '1');

  const forecastResponse = await fetch(forecastUrl);
  if (!forecastResponse.ok) {
    throw devProviderError(forecastResponse.status, 'Weather provider request failed.');
  }

  const forecastData = (await forecastResponse.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
    daily?: { temperature_2m_min?: number[]; temperature_2m_max?: number[] };
  };
  const temperature = forecastData.current?.temperature_2m;
  const low = forecastData.daily?.temperature_2m_min?.[0];
  const high = forecastData.daily?.temperature_2m_max?.[0];

  if (typeof temperature !== 'number' || typeof low !== 'number' || typeof high !== 'number') {
    throw devProviderError(502, 'Weather provider response was incomplete.');
  }

  return {
    city: [place.name, place.admin1].filter(Boolean).join(', '),
    temperature: Math.round(temperature),
    low: Math.round(low),
    high: Math.round(high),
    description: weatherCodeDescription(forecastData.current?.weather_code),
  };
}

function devProviderError(statusCode: number, message: string): DevWeatherProviderError {
  const error = new Error(message) as DevWeatherProviderError;
  error.statusCode = statusCode;
  return error;
}

function weatherCodeDescription(code?: number) {
  if (code === undefined) {
    return 'Weather conditions unavailable';
  }

  if (code === 0) {
    return 'Clear sky';
  }

  if (code === 1 || code === 2 || code === 3) {
    return 'Partly cloudy';
  }

  if (code === 45 || code === 48) {
    return 'Fog';
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return 'Rain';
  }

  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return 'Snow';
  }

  if (code === 95 || code === 96 || code === 99) {
    return 'Thunderstorm';
  }

  return 'Weather conditions unavailable';
}

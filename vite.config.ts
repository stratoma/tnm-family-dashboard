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
          if (!apiKey) {
            sendJson(res, 500, { error: 'Missing WEATHER_API_KEY.' });
            return;
          }

          const requestUrl = new URL(req.url ?? '', 'http://localhost');
          const city = requestUrl.searchParams.get('city')?.trim() || 'New York';
          const units = requestUrl.searchParams.get('units') === 'metric' ? 'metric' : 'imperial';
          const weatherUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
          weatherUrl.searchParams.set('q', city);
          weatherUrl.searchParams.set('appid', apiKey);
          weatherUrl.searchParams.set('units', units);

          const response = await fetch(weatherUrl);
          if (!response.ok) {
            sendJson(res, response.status, { error: 'Weather provider request failed.' });
            return;
          }

          const data = await response.json();
          sendJson(res, 200, {
            city: data.name,
            temperature: Math.round(data.main.temp),
            low: Math.round(data.main.temp_min),
            high: Math.round(data.main.temp_max),
            description: data.weather?.[0]?.description ?? 'Weather unavailable',
            icon: data.weather?.[0]?.icon,
          });
        } catch (error) {
          sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unable to load weather.' });
        }
      });
    },
  };
}

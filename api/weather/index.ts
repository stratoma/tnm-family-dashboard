type WeatherUnits = 'imperial' | 'metric';

type WeatherRequest = {
  query: Record<string, string | string[] | undefined>;
};

type WeatherResponse = {
  status(code: number): WeatherResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
};

type OpenMeteoGeocodingResponse = {
  results?: Array<{
    name?: string;
    admin1?: string;
    latitude?: number;
    longitude?: number;
  }>;
};

type OpenMeteoForecastResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
  daily?: {
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
  };
};

const fallbackWeather = {
  city: 'New York, New York',
  temperature: 72,
  low: 66,
  high: 78,
  description: 'Weather temporarily unavailable',
};

export default async function handler(req: WeatherRequest, res: WeatherResponse) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  try {
    const city = getStringQuery(req.query.city, 'New York');
    const units = getUnits(req.query.units);
    const weather = await getWeather(city, units, getWeatherApiKey());

    res.status(200).json(weather);
  } catch (error) {
    res.status(200).json({
      ...fallbackWeather,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unable to load weather.',
    });
  }
}

function getWeatherApiKey() {
  if (typeof process === 'undefined') {
    return undefined;
  }

  return process.env.WEATHER_API_KEY;
}

function getStringQuery(value: string | string[] | undefined, fallback: string) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const trimmed = firstValue?.trim();

  return trimmed && trimmed.length >= 2 ? trimmed : fallback;
}

function getUnits(value: string | string[] | undefined): WeatherUnits {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue === 'metric' ? 'metric' : 'imperial';
}

async function getWeather(city: string, units: WeatherUnits, apiKey?: string) {
  if (apiKey?.trim()) {
    return getOpenWeather(city, units, apiKey);
  }

  return getOpenMeteoWeather(city, units);
}

async function getOpenWeather(city: string, units: WeatherUnits, apiKey: string) {
  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('q', city);
  url.searchParams.set('appid', apiKey);
  url.searchParams.set('units', units);

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error('Weather provider request failed.');
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

async function getOpenMeteoWeather(city: string, units: WeatherUnits) {
  const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
  geocodingUrl.searchParams.set('name', city);
  geocodingUrl.searchParams.set('count', '1');
  geocodingUrl.searchParams.set('language', 'en');
  geocodingUrl.searchParams.set('format', 'json');

  const geocodingResponse = await fetchWithTimeout(geocodingUrl);
  if (!geocodingResponse.ok) {
    throw new Error('Unable to find that city.');
  }

  const geocodingData = (await geocodingResponse.json()) as OpenMeteoGeocodingResponse;
  const place = geocodingData.results?.[0];
  if (!place || typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
    throw new Error('Unable to find that city.');
  }

  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
  forecastUrl.searchParams.set('latitude', String(place.latitude));
  forecastUrl.searchParams.set('longitude', String(place.longitude));
  forecastUrl.searchParams.set('current', 'temperature_2m,weather_code');
  forecastUrl.searchParams.set('daily', 'temperature_2m_min,temperature_2m_max');
  forecastUrl.searchParams.set('temperature_unit', units === 'imperial' ? 'fahrenheit' : 'celsius');
  forecastUrl.searchParams.set('timezone', 'auto');
  forecastUrl.searchParams.set('forecast_days', '1');

  const forecastResponse = await fetchWithTimeout(forecastUrl);
  if (!forecastResponse.ok) {
    throw new Error('Weather provider request failed.');
  }

  const forecastData = (await forecastResponse.json()) as OpenMeteoForecastResponse;
  const temperature = forecastData.current?.temperature_2m;
  const low = forecastData.daily?.temperature_2m_min?.[0];
  const high = forecastData.daily?.temperature_2m_max?.[0];

  if (typeof temperature !== 'number' || typeof low !== 'number' || typeof high !== 'number') {
    throw new Error('Weather provider response was incomplete.');
  }

  return {
    city: [place.name, place.admin1].filter(Boolean).join(', '),
    temperature: Math.round(temperature),
    low: Math.round(low),
    high: Math.round(high),
    description: weatherCodeDescription(forecastData.current?.weather_code),
  };
}

async function fetchWithTimeout(url: URL) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
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

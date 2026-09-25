export async function readJsonResponse<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function apiResponseError(response: Response, fallback: string) {
  if (response.status === 404) {
    return 'The dashboard API is unavailable. Run it with the configured server or deploy the API routes.';
  }

  return fallback;
}

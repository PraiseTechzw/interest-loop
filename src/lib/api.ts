export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

/** Small fetch wrapper with a timeout and typed HTTP errors. */
export async function fetchJson<T>(
  url: string,
  options: { headers?: Record<string, string>; timeoutMs?: number } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', ...options.headers },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(`Request failed (${response.status})`, response.status);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function buildUrl(base: string, params: Record<string, string | number>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    query.set(key, String(value));
  }
  return `${base}?${query.toString()}`;
}

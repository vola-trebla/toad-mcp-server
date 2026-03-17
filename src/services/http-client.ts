const DEFAULT_TIMEOUT_MS = 10_000;

interface HttpClientConfig {
  baseUrl: string;
  timeoutMs?: number;
}

interface HttpResponse<T> {
  ok: boolean;
  status: number;
  data: T;
}

export class HttpClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<HttpResponse<T>> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    const data = (await response.json()) as T;
    return { ok: response.ok, status: response.status, data };
  }

  async post<T>(path: string, body: unknown): Promise<HttpResponse<T>> {
    const url = new URL(path, this.baseUrl);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    const data = (await response.json()) as T;
    return { ok: response.ok, status: response.status, data };
  }
}

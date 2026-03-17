import { HttpClient } from "./http-client.js";
import { config } from "./config.js";
import { extractError } from "../utils/responses.js";

export interface HealthCheck {
  name: string;
  url: string;
  healthy: boolean;
  latencyMs: number;
  error?: string;
}

export async function checkService(name: string, baseUrl: string): Promise<HealthCheck> {
  const client = new HttpClient({ baseUrl, timeoutMs: config.healthCheckTimeoutMs });
  const start = Date.now();

  try {
    const response = await client.get<unknown>("/health");
    return {
      name,
      url: baseUrl,
      healthy: response.ok,
      latencyMs: Date.now() - start,
      ...(!response.ok && { error: `HTTP ${response.status}` }),
    };
  } catch (error) {
    return {
      name,
      url: baseUrl,
      healthy: false,
      latencyMs: Date.now() - start,
      error: extractError(error),
    };
  }
}

export async function checkAllServices(): Promise<{ checks: HealthCheck[]; allHealthy: boolean }> {
  const checks = await Promise.all([
    checkService("Semantic Search API", config.semanticSearch.baseUrl),
    checkService("Eval Framework", config.evalFramework.baseUrl),
  ]);

  return { checks, allHealthy: checks.every((c) => c.healthy) };
}

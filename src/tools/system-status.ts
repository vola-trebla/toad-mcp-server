import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { HttpClient } from "../services/http-client.js";
import { config } from "../services/config.js";

interface HealthCheck {
  name: string;
  url: string;
  healthy: boolean;
  latencyMs: number;
  error?: string;
}

async function checkService(name: string, baseUrl: string): Promise<HealthCheck> {
  const client = new HttpClient({ baseUrl, timeoutMs: 5_000 });
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
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function registerSystemStatusTool(server: McpServer): void {
  server.tool(
    "toad_system_status",
    "Check health of all portfolio services: Semantic Search API and Eval Framework. Returns status, latency, and error details for each component.",
    {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () => {
      const checks = await Promise.all([
        checkService("Semantic Search API", config.semanticSearch.baseUrl),
        checkService("Eval Framework", config.evalFramework.baseUrl),
      ]);

      const allHealthy = checks.every((c) => c.healthy);

      const lines = [
        `## System Status: ${allHealthy ? "ALL HEALTHY" : "DEGRADED"}`,
        "",
        ...checks.map(
          (c) =>
            `- ${c.healthy ? "OK" : "DOWN"} **${c.name}** (${c.url}) — ${c.latencyMs}ms${c.error ? ` — ${c.error}` : ""}`,
        ),
      ];

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
      };
    },
  );
}

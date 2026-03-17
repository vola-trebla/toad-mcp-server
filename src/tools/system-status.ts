import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { checkAllServices } from "../services/health-check.js";
import { textContent } from "../utils/responses.js";

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
      const { checks, allHealthy } = await checkAllServices();

      const lines = [
        `## System Status: ${allHealthy ? "ALL HEALTHY" : "DEGRADED"}`,
        "",
        ...checks.map(
          (c) =>
            `- ${c.healthy ? "OK" : "DOWN"} **${c.name}** (${c.url}) — ${c.latencyMs}ms${c.error ? ` — ${c.error}` : ""}`,
        ),
      ];

      return textContent(lines.join("\n"));
    },
  );
}

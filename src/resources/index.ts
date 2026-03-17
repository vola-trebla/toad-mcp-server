import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPrompts, getPromptByName } from "../services/prompt-registry.js";
import { config } from "../services/config.js";
import { HttpClient } from "../services/http-client.js";

export function registerResources(server: McpServer): void {
  // Static resource: system status
  server.registerResource(
    "system-status",
    "toad://system/status",
    {
      title: "System Status",
      description: "Current health status of all portfolio services",
      mimeType: "application/json",
    },
    async (uri) => {
      const checks = await Promise.all(
        [
          { name: "Semantic Search API", baseUrl: config.semanticSearch.baseUrl },
          { name: "Eval Framework", baseUrl: config.evalFramework.baseUrl },
        ].map(async ({ name, baseUrl }) => {
          const client = new HttpClient({ baseUrl, timeoutMs: 5_000 });
          const start = Date.now();
          try {
            const res = await client.get<unknown>("/health");
            return { name, url: baseUrl, healthy: res.ok, latencyMs: Date.now() - start };
          } catch (error) {
            return {
              name,
              url: baseUrl,
              healthy: false,
              latencyMs: Date.now() - start,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }),
      );

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ services: checks, allHealthy: checks.every((c) => c.healthy) }, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    },
  );

  // Dynamic resource: prompt by name
  const promptTemplate = new ResourceTemplate("toad://prompts/{name}", {
    list: async () => {
      return {
        resources: getPrompts().map((p) => ({
          uri: `toad://prompts/${p.name}`,
          name: p.name,
          title: `${p.name} (v${p.version})`,
          description: p.description,
          mimeType: "application/json",
        })),
      };
    },
  });

  server.registerResource(
    "prompt",
    promptTemplate,
    {
      title: "Prompt",
      description: "Get a specific prompt by name from the Prompt Registry",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const name = typeof variables.name === "string" ? variables.name : variables.name?.[0];
      if (!name) {
        return { contents: [{ uri: uri.href, text: JSON.stringify({ error: "Missing prompt name" }) }] };
      }

      const prompt = getPromptByName(name);
      if (!prompt) {
        return { contents: [{ uri: uri.href, text: JSON.stringify({ error: `Prompt "${name}" not found` }) }] };
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(prompt, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    },
  );
}

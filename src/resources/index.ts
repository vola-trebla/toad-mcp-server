import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPrompts, getPromptByName } from "../services/prompt-registry.js";
import { checkAllServices } from "../services/health-check.js";

export function registerResources(server: McpServer): void {
  server.registerResource(
    "system-status",
    "toad://system/status",
    {
      title: "System Status",
      description: "Current health status of all portfolio services",
      mimeType: "application/json",
    },
    async (uri) => {
      const status = await checkAllServices();

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(status, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    },
  );

  const promptTemplate = new ResourceTemplate("toad://prompts/{name}", {
    list: async () => ({
      resources: getPrompts().map((p) => ({
        uri: `toad://prompts/${p.name}`,
        name: p.name,
        title: `${p.name} (v${p.version})`,
        description: p.description,
        mimeType: "application/json",
      })),
    }),
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
        contents: [{ uri: uri.href, text: JSON.stringify(prompt, null, 2), mimeType: "application/json" }],
      };
    },
  );
}

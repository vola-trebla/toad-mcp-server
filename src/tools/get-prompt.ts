import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPromptByName } from "../services/prompt-registry.js";

export function registerGetPromptTool(server: McpServer): void {
  server.tool(
    "toad_get_prompt",
    "Get a specific prompt by name with full metadata including version, score history, and template content.",
    {
      name: z.string().describe("Prompt name to retrieve"),
      response_format: z
        .enum(["markdown", "json"])
        .default("markdown")
        .describe("Response format: markdown for human reading, json for machine processing"),
    },
    {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async ({ name, response_format }) => {
      const prompt = getPromptByName(name);

      if (!prompt) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Prompt "${name}" not found. Use toad_list_prompts to see available prompts.`,
            },
          ],
        };
      }

      if (response_format === "json") {
        return {
          content: [{ type: "text" as const, text: JSON.stringify(prompt, null, 2) }],
        };
      }

      const scoreHistory = prompt.scoreHistory.length
        ? prompt.scoreHistory.map((s) => `  - ${s.date}: ${(s.score * 100).toFixed(1)}%`).join("\n")
        : "  _No score history_";

      const lines = [
        `## ${prompt.name} (v${prompt.version})`,
        "",
        `**Description:** ${prompt.description}`,
        `**Tags:** ${prompt.tags.join(", ") || "none"}`,
        `**Created:** ${prompt.createdAt}`,
        `**Updated:** ${prompt.updatedAt}`,
        "",
        "### Template",
        "```",
        prompt.template,
        "```",
        "",
        "### Score History",
        scoreHistory,
      ];

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
      };
    },
  );
}

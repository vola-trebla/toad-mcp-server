import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPrompts } from "../services/prompt-registry.js";
import { textContent } from "../utils/responses.js";

export function registerListPromptsTool(server: McpServer): void {
  server.tool(
    "toad_list_prompts",
    "List available prompts from the Prompt Registry. Supports pagination and optional filtering by tag.",
    {
      limit: z.number().min(1).max(100).default(20).describe("Maximum number of prompts to return"),
      offset: z.number().min(0).default(0).describe("Number of prompts to skip"),
      tag: z.string().optional().describe("Filter prompts by tag"),
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
    async ({ limit, offset, tag, response_format }) => {
      const allPrompts = getPrompts();
      const filtered = tag ? allPrompts.filter((p) => p.tags.includes(tag)) : allPrompts;
      const total = filtered.length;
      const page = filtered.slice(offset, offset + limit);
      const hasMore = offset + limit < total;

      if (response_format === "json") {
        return textContent(JSON.stringify({ prompts: page, total, offset, limit, has_more: hasMore }, null, 2));
      }

      const lines = [
        `## Prompts (${offset + 1}–${offset + page.length} of ${total})`,
        "",
        ...page.map(
          (p) =>
            `- **${p.name}** (v${p.version}) — ${p.description}${p.tags.length ? `  \n  Tags: ${p.tags.join(", ")}` : ""}`,
        ),
        "",
        hasMore ? `_More results available. Use offset=${offset + limit} to continue._` : "_End of list._",
      ];

      return textContent(lines.join("\n"));
    },
  );
}

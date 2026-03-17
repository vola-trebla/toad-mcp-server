import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { HttpClient } from "../services/http-client.js";
import { config } from "../services/config.js";

interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
}

const httpClient = new HttpClient({ baseUrl: config.semanticSearch.baseUrl });

export function registerSearchDocumentsTool(server: McpServer): void {
  server.tool(
    "toad_search_documents",
    "Search documents using semantic similarity. Connects to the Semantic Search Engine to find relevant documents based on a natural language query.",
    {
      query: z.string().describe("Natural language search query"),
      limit: z.number().min(1).max(50).default(10).describe("Maximum number of results to return"),
    },
    {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async ({ query, limit }) => {
      try {
        const response = await httpClient.post<SearchResponse>("/api/search", {
          query,
          limit,
        });

        if (!response.ok) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Semantic Search API returned ${response.status}. Ensure the service is running at ${config.semanticSearch.baseUrl}`,
              },
            ],
          };
        }

        const { results, total } = response.data;

        const formatted = results
          .map(
            (r, i) =>
              `**${i + 1}.** (score: ${r.score.toFixed(3)})\n${r.content}${r.metadata ? `\n_metadata: ${JSON.stringify(r.metadata)}_` : ""}`,
          )
          .join("\n\n---\n\n");

        return {
          content: [
            {
              type: "text" as const,
              text: `Found ${total} results for "${query}" (showing ${results.length}):\n\n${formatted}`,
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Failed to reach Semantic Search API at ${config.semanticSearch.baseUrl}: ${message}`,
            },
          ],
        };
      }
    },
  );
}

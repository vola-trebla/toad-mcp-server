import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { HttpClient } from "../services/http-client.js";
import { config } from "../services/config.js";
import { textContent, errorResponse, extractError } from "../utils/responses.js";

interface EvalResult {
  suite: string;
  variant: string;
  score: number;
  passed: number;
  failed: number;
  total: number;
  details: Array<{
    testCase: string;
    passed: boolean;
    score: number;
    output?: string;
  }>;
}

const httpClient = new HttpClient({ baseUrl: config.evalFramework.baseUrl });

export function registerRunEvalTool(server: McpServer): void {
  server.tool(
    "toad_run_eval",
    "Run an evaluation suite from the Eval Framework. Executes test cases against a prompt variant and returns scores and pass/fail results.",
    {
      suite: z.string().describe("Name of the eval suite to run"),
      variant: z.string().default("default").describe("Prompt variant to evaluate"),
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async ({ suite, variant }) => {
      try {
        const response = await httpClient.post<EvalResult>("/api/eval/run", { suite, variant });

        if (!response.ok) {
          return errorResponse(
            `Eval Framework returned ${response.status}. Ensure the service is running at ${config.evalFramework.baseUrl}`,
          );
        }

        const { score, passed, failed, total, details } = response.data;

        const summary = [
          `## Eval Results: ${suite} (variant: ${variant})`,
          "",
          `**Score:** ${(score * 100).toFixed(1)}%`,
          `**Passed:** ${passed}/${total} | **Failed:** ${failed}/${total}`,
          "",
          "### Details",
          ...details.map(
            (d) =>
              `- ${d.passed ? "PASS" : "FAIL"} \`${d.testCase}\` (${(d.score * 100).toFixed(1)}%)${d.output ? `: ${d.output}` : ""}`,
          ),
        ].join("\n");

        return textContent(summary);
      } catch (error) {
        return errorResponse(
          `Failed to reach Eval Framework at ${config.evalFramework.baseUrl}: ${extractError(error)}`,
        );
      }
    },
  );
}

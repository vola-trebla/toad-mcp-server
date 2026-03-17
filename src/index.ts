import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSearchDocumentsTool } from "./tools/search-documents.js";
import { registerRunEvalTool } from "./tools/run-eval.js";
import { registerSystemStatusTool } from "./tools/system-status.js";
import { registerListPromptsTool } from "./tools/list-prompts.js";
import { registerGetPromptTool } from "./tools/get-prompt.js";

const server = new McpServer({
  name: "toad-mcp-server",
  version: "1.0.0",
});

registerSearchDocumentsTool(server);
registerRunEvalTool(server);
registerSystemStatusTool(server);
registerListPromptsTool(server);
registerGetPromptTool(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[toad-mcp-server] Running on stdio transport");
}

main().catch((error) => {
  console.error("[toad-mcp-server] Fatal error:", error);
  process.exit(1);
});

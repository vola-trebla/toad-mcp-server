import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchDocumentsTool } from "./tools/search-documents.js";
import { registerRunEvalTool } from "./tools/run-eval.js";
import { registerSystemStatusTool } from "./tools/system-status.js";
import { registerListPromptsTool } from "./tools/list-prompts.js";
import { registerGetPromptTool } from "./tools/get-prompt.js";
import { registerResources } from "./resources/index.js";

function createServer(): McpServer {
  const server = new McpServer({
    name: "toad-mcp-server",
    version: "1.0.0",
  });

  registerSearchDocumentsTool(server);
  registerRunEvalTool(server);
  registerSystemStatusTool(server);
  registerListPromptsTool(server);
  registerGetPromptTool(server);
  registerResources(server);

  return server;
}

async function startStdio(): Promise<void> {
  const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[toad-mcp-server] Running on stdio transport");
}

async function startHttp(): Promise<void> {
  const { StreamableHTTPServerTransport } = await import("@modelcontextprotocol/sdk/server/streamableHttp.js");
  const { randomUUID } = await import("node:crypto");
  const { default: express } = await import("express");

  const app = express();
  app.use(express.json());

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
  await server.connect(transport);

  app.post("/mcp", async (req, res) => {
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (req, res) => {
    await transport.handleRequest(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    await transport.handleRequest(req, res);
  });

  const port = parseInt(process.env.PORT ?? "3100", 10);
  const host = process.env.HOST ?? "127.0.0.1";

  app.listen(port, host, () => {
    console.error(`[toad-mcp-server] Running on http://${host}:${port}/mcp`);
  });
}

const transportMode = process.env.TRANSPORT ?? "stdio";

if (transportMode === "http") {
  startHttp().catch((error) => {
    console.error("[toad-mcp-server] Fatal error:", error);
    process.exit(1);
  });
} else {
  startStdio().catch((error) => {
    console.error("[toad-mcp-server] Fatal error:", error);
    process.exit(1);
  });
}

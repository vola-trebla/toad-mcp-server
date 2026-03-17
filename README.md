# toad-mcp-server 🐸

MCP server exposing portfolio AI tools via [Model Context Protocol](https://modelcontextprotocol.io). Connect to Claude Desktop and call Semantic Search, Eval Framework, and Prompt Management tools directly from chat.

## Architecture

```
┌─────────────────────┐    stdio / HTTP     ┌──────────────────────────┐
│   Claude Desktop    │◄──────────────────►│    toad-mcp-server       │
│   (MCP Client)      │                     │                          │
└─────────────────────┘                     │  ┌────────────────────┐  │
                                            │  │ toad_search_docs   │──┼──► Semantic Search API
                                            │  ├────────────────────┤  │
                                            │  │ toad_run_eval      │──┼──► Eval Framework API
                                            │  ├────────────────────┤  │
                                            │  │ toad_system_status  │──┼──► Health checks
                                            │  ├────────────────────┤  │
                                            │  │ toad_list_prompts   │  │
                                            │  ├────────────────────┤  │
                                            │  │ toad_get_prompt     │  │
                                            │  └────────────────────┘  │
                                            └──────────────────────────┘
```

## Tools

| Tool                    | Description                                               | Read-only |
| ----------------------- | --------------------------------------------------------- | --------- |
| `toad_search_documents` | Semantic search over documents via natural language query | Yes       |
| `toad_run_eval`         | Run eval suite against a prompt variant, returns scores   | No        |
| `toad_system_status`    | Health check all portfolio services (latency, status)     | Yes       |
| `toad_list_prompts`     | List prompts with pagination and tag filtering            | Yes       |
| `toad_get_prompt`       | Get prompt by name with version, template, score history  | Yes       |

All tools support `response_format: "markdown" | "json"` where applicable.

## Quick Start

```bash
# Install
npm install

# Build
npm run build

# Run (stdio — for Claude Desktop)
npm start

# Dev mode
npm run dev
```

## Claude Desktop Setup

1. Build the server:

   ```bash
   npm run build
   ```

2. Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

   ```json
   {
     "mcpServers": {
       "toad-mcp-server": {
         "command": "node",
         "args": ["dist/index.js"],
         "cwd": "/absolute/path/to/toad-mcp-server",
         "env": {
           "SEMANTIC_SEARCH_URL": "http://localhost:3001",
           "EVAL_FRAMEWORK_URL": "http://localhost:3002"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop — tools appear automatically.

## Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Opens a web UI to test each tool interactively.

## Environment Variables

| Variable              | Default                 | Description                     |
| --------------------- | ----------------------- | ------------------------------- |
| `SEMANTIC_SEARCH_URL` | `http://localhost:3001` | Semantic Search Engine endpoint |
| `EVAL_FRAMEWORK_URL`  | `http://localhost:3002` | Eval Framework endpoint         |

## Scripts

| Script           | Description                   |
| ---------------- | ----------------------------- |
| `npm run build`  | Compile TypeScript to `dist/` |
| `npm run dev`    | Run with tsx (hot reload)     |
| `npm start`      | Run compiled server           |
| `npm run lint`   | ESLint check                  |
| `npm run format` | Prettier format               |

## Tech Stack

- TypeScript (NodeNext, strict)
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) — MCP server SDK
- [Zod](https://zod.dev) v4 — input validation
- ESLint + Prettier + Husky — code quality
- GitHub Actions — CI (lint → format → build)

## License

ISC

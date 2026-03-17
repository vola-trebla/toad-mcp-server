# toad-mcp-server

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-Model_Context_Protocol-8B5CF6)
![Zod](https://img.shields.io/badge/Zod-v4-3E67B1?logo=zod&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black)
![CI](https://img.shields.io/github/actions/workflow/status/vola-trebla/toad-mcp-server/ci.yml?label=CI&logo=githubactions&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

> 🔌 MCP server exposing portfolio AI tools via [Model Context Protocol](https://modelcontextprotocol.io).
> Connect to Claude Desktop and call Semantic Search, Eval Framework, and Prompt Management tools directly from chat.

## 🏗️ Architecture

```
┌─────────────────────┐    stdio / HTTP     ┌──────────────────────────┐
│   Claude Desktop    │◄────────────────-──►│    toad-mcp-server       │
│   (MCP Client)      │                     │                          │
└─────────────────────┘                     │  ┌────────────────────┐  │
                                            │  │ toad_search_docs   │──┼──► Semantic Search API
                                            │  ├────────────────────┤  │
                                            │  │ toad_run_eval      │──┼──► Eval Framework API
                                            │  ├────────────────────┤  │
                                            │  │ toad_system_status │──┼──► Health checks
                                            │  ├───────────────-────┤  │
                                            │  │ toad_list_prompts  │  │
                                            │  ├────────────────────┤  │
                                            │  │ toad_get_prompt    │  │
                                            │  └────────────────────┘  │
                                            └──────────────────────────┘
```

## 🛠️ Tools

| Tool                    | Description                                               | Read-only |
| ----------------------- | --------------------------------------------------------- | --------- |
| `toad_search_documents` | Semantic search over documents via natural language query | Yes       |
| `toad_run_eval`         | Run eval suite against a prompt variant, returns scores   | No        |
| `toad_system_status`    | Health check all portfolio services (latency, status)     | Yes       |
| `toad_list_prompts`     | List prompts with pagination and tag filtering            | Yes       |
| `toad_get_prompt`       | Get prompt by name with version, template, score history  | Yes       |

All tools support `response_format: "markdown" | "json"` where applicable.

## 📦 Resources

| URI                     | Description                                  |
| ----------------------- | -------------------------------------------- |
| `toad://system/status`  | Health status of all services (JSON)         |
| `toad://prompts/{name}` | Get prompt by name with full metadata (JSON) |

## 🚀 Quick Start

```bash
# Install
npm install

# Build
npm run build

# Run (stdio — for Claude Desktop)
npm start

# Run (HTTP — for remote/multi-client access)
TRANSPORT=http npm start

# Dev mode
npm run dev
```

## 🖥️ Claude Desktop Setup

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

## 🔍 Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Opens a web UI to test each tool interactively.

## ⚙️ Environment Variables

| Variable              | Default                 | Description                       |
| --------------------- | ----------------------- | --------------------------------- |
| `SEMANTIC_SEARCH_URL` | `http://localhost:3001` | Semantic Search Engine endpoint   |
| `EVAL_FRAMEWORK_URL`  | `http://localhost:3002` | Eval Framework endpoint           |
| `TRANSPORT`           | `stdio`                 | Transport mode: `stdio` or `http` |
| `PORT`                | `3100`                  | HTTP transport port               |
| `HOST`                | `127.0.0.1`             | HTTP transport bind address       |

## 📜 Scripts

| Script           | Description                   |
| ---------------- | ----------------------------- |
| `npm run build`  | Compile TypeScript to `dist/` |
| `npm run dev`    | Run with tsx (hot reload)     |
| `npm start`      | Run compiled server           |
| `npm run lint`   | ESLint check                  |
| `npm run format` | Prettier format               |

## 🧱 Tech Stack

- TypeScript (NodeNext, strict)
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) — MCP server SDK
- [Zod](https://zod.dev) v4 — input validation
- ESLint + Prettier + Husky — code quality
- GitHub Actions — CI (lint → format → build)

## 📄 License

ISC

export const config = {
  semanticSearch: {
    baseUrl: process.env.SEMANTIC_SEARCH_URL ?? "http://localhost:3001",
  },
  evalFramework: {
    baseUrl: process.env.EVAL_FRAMEWORK_URL ?? "http://localhost:3002",
  },
} as const;

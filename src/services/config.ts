export const config = {
  semanticSearch: {
    baseUrl: process.env.SEMANTIC_SEARCH_URL ?? "http://localhost:3001",
  },
} as const;

export function textContent(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function errorResponse(text: string) {
  return { isError: true, content: [{ type: "text" as const, text }] };
}

export function extractError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

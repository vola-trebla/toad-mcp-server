/**
 * MCP tool response helpers.
 * Eliminates repeated boilerplate for content wrapping and error formatting
 * across all tool handlers.
 */

/** Wraps a text string into a standard MCP tool success response. */
export function textContent(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

/** Wraps a text string into an MCP tool error response (isError: true). */
export function errorResponse(text: string) {
  return { isError: true, content: [{ type: "text" as const, text }] };
}

/** Safely extracts a human-readable message from an unknown caught error. */
export function extractError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

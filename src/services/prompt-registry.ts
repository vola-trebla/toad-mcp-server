/**
 * Local prompt registry — serves as a data source for prompt management tools.
 * Currently backed by an in-memory array of sample prompts.
 * Designed to be swapped with an HTTP integration to the Prompt Registry service
 * when that project is ready.
 */

export interface ScoreEntry {
  date: string;
  score: number;
}

export interface Prompt {
  name: string;
  version: number;
  description: string;
  tags: string[];
  template: string;
  createdAt: string;
  updatedAt: string;
  scoreHistory: ScoreEntry[];
}

const prompts: Prompt[] = [
  {
    name: "document-qa",
    version: 3,
    description: "Answer questions based on retrieved document context",
    tags: ["rag", "qa", "production"],
    template:
      "You are a helpful assistant. Use the following context to answer the user's question.\n\nContext:\n{{context}}\n\nQuestion: {{question}}\n\nAnswer concisely and cite sources when possible.",
    createdAt: "2025-12-01",
    updatedAt: "2026-02-15",
    scoreHistory: [
      { date: "2026-01-10", score: 0.82 },
      { date: "2026-02-01", score: 0.87 },
      { date: "2026-02-15", score: 0.91 },
    ],
  },
  {
    name: "code-review",
    version: 2,
    description: "Review code changes and suggest improvements",
    tags: ["code", "review", "dev-tools"],
    template:
      "Review the following code diff. Focus on:\n1. Bugs and potential issues\n2. Performance concerns\n3. Readability improvements\n\nDiff:\n{{diff}}\n\nProvide actionable feedback.",
    createdAt: "2026-01-05",
    updatedAt: "2026-03-01",
    scoreHistory: [
      { date: "2026-01-20", score: 0.78 },
      { date: "2026-03-01", score: 0.85 },
    ],
  },
  {
    name: "summarize-thread",
    version: 1,
    description: "Summarize a conversation thread into key points",
    tags: ["summarization", "productivity"],
    template:
      "Summarize the following conversation thread into:\n- Key decisions made\n- Action items with owners\n- Open questions\n\nThread:\n{{thread}}",
    createdAt: "2026-02-20",
    updatedAt: "2026-02-20",
    scoreHistory: [{ date: "2026-02-25", score: 0.88 }],
  },
  {
    name: "eval-judge",
    version: 4,
    description: "LLM-as-judge prompt for evaluating model outputs",
    tags: ["eval", "judge", "production"],
    template:
      "You are an expert evaluator. Rate the following model output on a scale of 1-5 for each criterion.\n\nCriteria: {{criteria}}\n\nInput: {{input}}\nExpected: {{expected}}\nActual: {{actual}}\n\nReturn JSON: {scores: {criterion: score}, reasoning: string}",
    createdAt: "2025-11-15",
    updatedAt: "2026-03-10",
    scoreHistory: [
      { date: "2025-12-01", score: 0.72 },
      { date: "2026-01-15", score: 0.81 },
      { date: "2026-02-20", score: 0.86 },
      { date: "2026-03-10", score: 0.89 },
    ],
  },
  {
    name: "entity-extraction",
    version: 1,
    description: "Extract structured entities from unstructured text",
    tags: ["extraction", "structured-output"],
    template:
      "Extract the following entities from the text below:\n- People (name, role)\n- Organizations\n- Dates and deadlines\n- Key topics\n\nText:\n{{text}}\n\nReturn as JSON.",
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
    scoreHistory: [],
  },
];

export function getPrompts(): Prompt[] {
  return prompts;
}

export function getPromptByName(name: string): Prompt | undefined {
  return prompts.find((p) => p.name === name);
}

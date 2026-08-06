import { ApiError, mapChatResponseToContent } from "@/lib/api";
import type { ChatMessage, ChatResponse } from "@/types";

// Defensive: the backend occasionally joins multiple related questions
// onto a single string with " - " instead of returning separate array
// items. Split those back apart so the UI never renders one giant
// concatenated chip.
function normalizeRelatedQuestions(list: string[] | undefined): string[] {
  if (!list) return [];
  return list.flatMap((item) =>
    item
      .split(/(?<=\?)\s*[-–—]\s*/)
      .map((part) => part.trim())
      .filter(Boolean),
  );
}

export function createUserMessage(content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    content,
  };
}

export function createAssistantMessage(response: ChatResponse): ChatMessage {
  const content = mapChatResponseToContent(response);

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    type: response.type,
    verse: response.primary_verse,
    sources: response.answer?.sources ?? [],
    relatedQuestions: normalizeRelatedQuestions(response.answer?.related_questions),
    metadata: response.metadata,
    explanation: response.primary_verse?.explanation,
    status: "complete",
  };
}

export function createErrorMessage(
  error: unknown,
  retryQuery: string,
): ChatMessage {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: message,
    type: "error",
    status: "error",
    errorMessage: message,
    retryQuery,
  };
}

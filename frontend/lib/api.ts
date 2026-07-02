import type {
  ChatResponse,
  CorpusStats,
  EvaluationSummary,
} from "@/types";

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_BASE_URL = "http://localhost:8000";

export type ApiErrorCode =
  | "network"
  | "timeout"
  | "server"
  | "invalid_response"
  | "empty_response"
  | "cancelled";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly detail?: string;

  constructor(
    message: string,
    code: ApiErrorCode,
    status?: number,
    detail?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!url) {
    return DEFAULT_BASE_URL;
  }
  return url.replace(/\/$/, "");
}

function combineAbortSignals(
  external: AbortSignal,
  internal: AbortSignal,
): AbortSignal {
  const controller = new AbortController();

  const abort = () => controller.abort();
  if (external.aborted || internal.aborted) {
    controller.abort();
    return controller.signal;
  }

  external.addEventListener("abort", abort, { once: true });
  internal.addEventListener("abort", abort, { once: true });
  return controller.signal;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isChatResponse(value: unknown): value is ChatResponse {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }
  const validTypes = [
    "wisdom_response",
    "clarification",
    "clarification_needed",
    "no_results",
    "error",
  ];
  return validTypes.includes(value.type);
}

function isCorpusStats(value: unknown): value is CorpusStats {
  return (
    isRecord(value) &&
    typeof value.total_verses === "number" &&
    Array.isArray(value.books)
  );
}

function isEvaluationSummary(value: unknown): value is EvaluationSummary {
  return (
    isRecord(value) &&
    typeof value.model_name === "string" &&
    typeof value.num_samples === "number"
  );
}

function friendlyServerMessage(status: number, detail?: string): string {
  if (status === 503) {
    return "The wisdom service is starting up. Please try again in a moment.";
  }
  if (status === 404) {
    return detail || "The requested resource was not found.";
  }
  if (status >= 500) {
    return detail || "The server encountered an error. Please try again.";
  }
  return detail || "Something went wrong. Please try again.";
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) {
    throw new ApiError(
      "The server returned an empty response.",
      "empty_response",
      response.status,
    );
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(
      "The server returned an invalid response.",
      "invalid_response",
      response.status,
    );
  }
}

async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    signal?: AbortSignal;
    timeout?: number;
    validate: (value: unknown) => value is T;
  },
): Promise<T> {
  const { method = "GET", body, signal, timeout = DEFAULT_TIMEOUT_MS, validate } =
    options;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
  const combinedSignal = signal
    ? combineAbortSignals(signal, timeoutController.signal)
    : timeoutController.signal;

  try {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: combinedSignal,
    });

    const parsed = await parseJsonBody(response);

    if (!response.ok) {
      const detail =
        isRecord(parsed) && typeof parsed.detail === "string"
          ? parsed.detail
          : isRecord(parsed) && typeof parsed.error === "string"
            ? parsed.error
            : undefined;

      throw new ApiError(
        friendlyServerMessage(response.status, detail),
        "server",
        response.status,
        detail,
      );
    }

    if (!validate(parsed)) {
      throw new ApiError(
        "The server returned an unexpected response format.",
        "invalid_response",
        response.status,
      );
    }

    return parsed;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      if (signal?.aborted) {
        throw new ApiError("Request cancelled.", "cancelled");
      }
      throw new ApiError(
        "The request timed out. Please try again.",
        "timeout",
      );
    }
    if (error instanceof TypeError) {
      throw new ApiError(
        "Unable to reach the server. Check that the API is running.",
        "network",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestChat(
  query: string,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    DEFAULT_TIMEOUT_MS,
  );
  const combinedSignal = signal
    ? combineAbortSignals(signal, timeoutController.signal)
    : timeoutController.signal;

  try {
    const response = await fetch(`${getBaseUrl()}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: combinedSignal,
    });

    const parsed = await parseJsonBody(response);

    if (!isChatResponse(parsed)) {
      throw new ApiError(
        "The server returned an unexpected chat response.",
        "invalid_response",
        response.status,
      );
    }

    if (!response.ok && parsed.type !== "error") {
      const detail =
        parsed.error ||
        (isRecord(parsed) && typeof parsed.detail === "string"
          ? parsed.detail
          : undefined);
      throw new ApiError(
        friendlyServerMessage(response.status, detail),
        "server",
        response.status,
        detail,
      );
    }

    return parsed;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      if (signal?.aborted) {
        throw new ApiError("Request cancelled.", "cancelled");
      }
      throw new ApiError(
        "The request timed out. Please try again.",
        "timeout",
      );
    }
    if (error instanceof TypeError) {
      throw new ApiError(
        "Unable to reach the server. Check that the API is running.",
        "network",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface ApiClient {
  sendChat: (query: string, signal?: AbortSignal) => Promise<ChatResponse>;
  getCorpusStats: (signal?: AbortSignal) => Promise<CorpusStats>;
  getEvaluationSummary: (signal?: AbortSignal) => Promise<EvaluationSummary>;
}

let apiClient: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!apiClient) {
    apiClient = {
      sendChat: requestChat,
      getCorpusStats: (signal) =>
        request("/api/v1/corpus/stats", {
          signal,
          validate: isCorpusStats,
        }),
      getEvaluationSummary: (signal) =>
        request("/api/v1/evaluation/summary", {
          signal,
          validate: isEvaluationSummary,
        }),
    };
  }
  return apiClient;
}

export function mapChatResponseToContent(response: ChatResponse): string {
  if (response.type === "error") {
    return response.error || "An unknown error occurred.";
  }

  const summary = response.answer?.summary?.trim();
  if (!summary) {
    throw new ApiError(
      "The server returned an empty answer.",
      "empty_response",
    );
  }

  return summary;
}

export function mapApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

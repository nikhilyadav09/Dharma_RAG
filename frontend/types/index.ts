/** API types aligned with FastAPI schemas (api/schemas/) */

export type ResponseType =
  | "wisdom_response"
  | "clarification"
  | "clarification_needed"
  | "no_results"
  | "error";

export interface QueryInfo {
  original: string;
  processed: string;
}

export interface AnswerContent {
  summary: string;
  sources: string[];
}

export interface VerseDetail {
  id?: number;
  book: string;
  chapter: number | string;
  verse: number | string;
  sanskrit?: string;
  translation?: string;
  explanation?: string;
  confidence_score?: number;
}

export interface ResponseMetadata {
  model?: string;
  latency_ms: number;
}

export interface ChatResponse {
  type: ResponseType;
  query?: QueryInfo;
  answer?: AnswerContent;
  primary_verse?: VerseDetail;
  error?: string;
  metadata?: ResponseMetadata;
}

export interface ChatRequest {
  query: string;
  session_id?: string;
}

export interface CorpusStats {
  total_verses: number;
  books: { book: string; count: number }[];
}

export interface EvaluationSummary {
  model_name: string;
  average_semantic_similarity: number;
  average_bleu_score: number;
  average_rouge1: number;
  average_rouge2: number;
  average_rougeL: number;
  average_question_match_score: number;
  num_samples: number;
  source_file: string;
}

/** UI message model for chat thread */
export type ChatMessageStatus = "complete" | "error";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: ResponseType;
  verse?: VerseDetail;
  sources?: string[];
  metadata?: ResponseMetadata;
  explanation?: string;
  status?: ChatMessageStatus;
  errorMessage?: string;
  retryQuery?: string;
}

import { Sparkles } from "lucide-react";

import {
  AnswerSection,
  CollapsibleSection,
} from "@/components/common/collapsible-section";
import { CopyButton } from "@/components/common/copy-button";
import { MarkdownContent } from "@/components/common/markdown-content";
import { ErrorState } from "@/components/common/error-state";
import { RelatedQuestions } from "@/components/chat/related-questions";
import { ResponseMetadata } from "@/components/chat/response-metadata";
import { SourceCards } from "@/components/chat/source-cards";
import { VerseCardPlaceholder } from "@/components/chat/verse-card-placeholder";
import type { ChatMessage } from "@/types";

interface AssistantMessageProps {
  message: ChatMessage;
  onRetry?: (query: string) => void;
  onSelectQuestion?: (question: string) => void;
}

export function AssistantMessage({
  message,
  onRetry,
  onSelectQuestion,
}: AssistantMessageProps) {
  if (message.status === "error") {
    return (
      <article className="space-y-4" aria-label="Assistant error">
        <ErrorState
          title="Unable to get a response"
          description={message.errorMessage || message.content}
          onRetry={
            message.retryQuery && onRetry
              ? () => onRetry(message.retryQuery!)
              : undefined
          }
          className="text-left"
        />
      </article>
    );
  }

  const showSources =
    message.type === "wisdom_response" && (message.sources?.length ?? 0) > 0;
  const showVerse = message.type === "wisdom_response" && message.verse;
  const showExplanation =
    message.explanation &&
    message.explanation.trim() !== message.verse?.translation?.trim();
  const showRelated =
    (message.relatedQuestions?.length ?? 0) > 0 && onSelectQuestion;

  return (
    <article className="space-y-4" aria-label="Assistant response">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-muted"
          aria-hidden
        >
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <AnswerSection actions={<CopyButton text={message.content} label="Copy response" />}>
            <MarkdownContent
              content={message.content}
              className="text-sm leading-relaxed sm:text-base"
            />
          </AnswerSection>

          <ResponseMetadata
            metadata={message.metadata}
            sourcesCount={message.sources?.length ?? 0}
          />

          {showRelated ? (
            <RelatedQuestions
              questions={message.relatedQuestions!}
              onSelect={onSelectQuestion}
            />
          ) : null}

          {showExplanation ? (
            <CollapsibleSection title="Reasoning from scripture" defaultOpen={false}>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {message.explanation}
              </p>
            </CollapsibleSection>
          ) : null}

          {showSources ? (
            <SourceCards sources={message.sources} primaryVerse={message.verse} />
          ) : null}

          {showVerse ? <VerseCardPlaceholder verse={message.verse} /> : null}
        </div>
      </div>
    </article>
  );
}

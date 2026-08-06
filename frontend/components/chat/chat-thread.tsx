"use client";

import { AssistantMessage } from "@/components/chat/assistant-message";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { ResponsePlaceholder } from "@/components/chat/response-placeholder";
import { UserMessage } from "@/components/chat/user-message";
import type { ChatMessage } from "@/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onRetry?: (query: string) => void;
  onSelectQuestion?: (question: string) => void;
  onEditMessage?: (id: string, newContent: string) => void;
  onRegenerate?: (id: string) => void;
}

export function ChatThread({
  messages,
  isLoading,
  onRetry,
  onSelectQuestion,
  onEditMessage,
  onRegenerate,
}: ChatThreadProps) {
  if (messages.length === 0 && !isLoading) {
    return <ChatWelcome />;
  }

  // Edit and regenerate only make sense on the most recent exchange —
  // going further back would mean branching the conversation into multiple
  // versions, which this UI doesn't model.
  const lastUserIndex = messages.reduce(
    (acc, message, index) => (message.role === "user" ? index : acc),
    -1,
  );
  const lastAssistantIndex = messages.reduce(
    (acc, message, index) =>
      message.role === "assistant" && message.status !== "error" ? index : acc,
    -1,
  );

  return (
    <div className="space-y-8 sm:space-y-10" role="feed" aria-label="Conversation">
      {messages.map((message, index) =>
        message.role === "user" ? (
          <UserMessage
            key={message.id}
            content={message.content}
            onEdit={
              !isLoading && index === lastUserIndex && onEditMessage
                ? (newContent) => onEditMessage(message.id, newContent)
                : undefined
            }
          />
        ) : (
          <AssistantMessage
            key={message.id}
            message={message}
            onRetry={onRetry}
            onSelectQuestion={onSelectQuestion}
            onRegenerate={
              !isLoading && index === lastAssistantIndex && onRegenerate
                ? () => onRegenerate(message.id)
                : undefined
            }
          />
        ),
      )}
      {isLoading ? <ResponsePlaceholder /> : null}
    </div>
  );
}

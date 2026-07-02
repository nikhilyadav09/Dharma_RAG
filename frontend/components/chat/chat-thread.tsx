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
}

export function ChatThread({
  messages,
  isLoading,
  onRetry,
  onSelectQuestion,
}: ChatThreadProps) {
  if (messages.length === 0 && !isLoading) {
    return <ChatWelcome onSelectQuestion={onSelectQuestion} />;
  }

  return (
    <div className="space-y-8 sm:space-y-10" role="feed" aria-label="Conversation">
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage key={message.id} content={message.content} />
        ) : (
          <AssistantMessage
            key={message.id}
            message={message}
            onRetry={onRetry}
          />
        ),
      )}
      {isLoading ? <ResponsePlaceholder /> : null}
    </div>
  );
}

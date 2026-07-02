"use client";

import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatInputPlaceholder } from "@/components/chat/chat-input-placeholder";
import { ChatThread } from "@/components/chat/chat-thread";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { ApiError, getApiClient } from "@/lib/api";
import {
  createAssistantMessage,
  createErrorMessage,
  createUserMessage,
} from "@/lib/chat-messages";
import type { ChatMessage } from "@/types";

const SESSION_STORAGE_KEY = "dharma-chat-session-id";

function getStoredSessionId(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return sessionStorage.getItem(SESSION_STORAGE_KEY) ?? undefined;
}

function storeSessionId(sessionId: string): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

export function ChatLayout({ initialQuery }: { initialQuery?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialQuerySent = useRef(false);

  useEffect(() => {
    setSessionId(getStoredSessionId());
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((prev) => [
      ...prev.filter(
        (message) =>
          !(message.status === "error" && message.retryQuery === trimmed),
      ),
      createUserMessage(trimmed),
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getApiClient().sendChat(
        trimmed,
        controller.signal,
        sessionId,
      );

      if (response.session_id) {
        setSessionId(response.session_id);
        storeSessionId(response.session_id);
      }

      if (response.type === "error") {
        setMessages((prev) => [
          ...prev,
          createErrorMessage(
            new ApiError(
              response.error || "The server returned an error.",
              "server",
              500,
              response.error,
            ),
            trimmed,
          ),
        ]);
        return;
      }

      setMessages((prev) => [...prev, createAssistantMessage(response)]);
    } catch (error) {
      if (error instanceof ApiError && error.code === "cancelled") {
        return;
      }
      setMessages((prev) => [...prev, createErrorMessage(error, trimmed)]);
    } finally {
      setIsLoading(false);
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      inputRef.current?.focus();
    }
  }, [isLoading, sessionId]);

  useEffect(() => {
    if (initialQuery && !initialQuerySent.current) {
      initialQuerySent.current = true;
      void sendMessage(initialQuery);
    }
  }, [initialQuery, sendMessage]);

  const handleSubmit = useCallback(() => {
    void sendMessage(input);
  }, [input, sendMessage]);

  const handleSuggestion = useCallback(
    (question: string) => {
      void sendMessage(question);
    },
    [sendMessage],
  );

  const handleClearChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setIsLoading(false);
    setInput("");
    setSessionId(undefined);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    inputRef.current?.focus();
  }, []);

  const showSuggestions = messages.length === 0 && !isLoading;
  const hasMessages = messages.length > 0 || isLoading;

  return (
    <PageContainer flush className="flex flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h1 className="text-display text-xl font-semibold tracking-tight sm:text-2xl">
              Wisdom Chat
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Intent-aware answers from the Bhagavad Gita and Yoga Sutras
            </p>
          </div>
          {hasMessages ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={handleClearChat}
              disabled={isLoading}
              aria-label="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          <ChatThread
            messages={messages}
            isLoading={isLoading}
            onRetry={sendMessage}
            onSelectQuestion={handleSuggestion}
          />
          <div ref={messagesEndRef} aria-hidden />
        </div>

        <div className="safe-bottom border-t border-border bg-background/95 px-4 py-4 backdrop-blur-md sm:px-6">
          <div className="space-y-4">
            {showSuggestions ? (
              <SuggestedQuestions
                onSelect={handleSuggestion}
                disabled={isLoading}
                compact
              />
            ) : null}
            <ChatInputPlaceholder
              ref={inputRef}
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

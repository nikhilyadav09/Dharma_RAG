"use client";

import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatInputPlaceholder } from "@/components/chat/chat-input-placeholder";
import { ChatThread } from "@/components/chat/chat-thread";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { ApiError, getApiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  createAssistantMessage,
  createErrorMessage,
  createUserMessage,
} from "@/lib/chat-messages";
import type { ChatMessage } from "@/types";

const FALLBACK_BOTTOM_BAR_HEIGHT = 96;

const SESSION_STORAGE_KEY = "dharma-chat-session-id";
const MESSAGES_STORAGE_KEY = "dharma-chat-messages";

function getStoredSessionId(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return sessionStorage.getItem(SESSION_STORAGE_KEY) ?? undefined;
}

function storeSessionId(sessionId: string): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

function getStoredMessages(): ChatMessage[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = sessionStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function storeMessages(messages: ChatMessage[]): void {
  try {
    sessionStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage may be full or unavailable (private browsing) — losing
    // persistence here isn't worth surfacing an error to the user.
  }
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
  const [hasHydrated, setHasHydrated] = useState(false);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [bottomBarHeight, setBottomBarHeight] = useState(FALLBACK_BOTTOM_BAR_HEIGHT);

  // The fixed bottom bar's height varies a lot -- just the composer during
  // a conversation, much taller with the suggestions grid on the welcome
  // screen, taller still if that grid is expanded or the textarea grows to
  // multiple lines. Measure it directly rather than guessing a fixed
  // padding, so the scroll area never ends up hidden behind it.
  useEffect(() => {
    const el = bottomBarRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight;
      setBottomBarHeight(height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setSessionId(getStoredSessionId());
    setMessages(getStoredMessages());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    // Skip the pre-hydration render so we don't stomp stored messages with
    // the initial empty state before getStoredMessages() has loaded.
    if (!hasHydrated) return;
    storeMessages(messages);
  }, [messages, hasHydrated]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    // Skip on touch devices: autofocusing on mount pops the virtual keyboard
    // and force-scrolls the page with zero user action, pushing the header
    // off-screen before the user has even looked at it. Desktop autofocus
    // is harmless (no keyboard, no scroll-jump) so it stays there.
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouchDevice) {
      inputRef.current?.focus();
    }
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

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Edit-and-resend: drop the edited message and everything after it, then
  // resend the new content as a fresh turn.
  const handleEditMessage = useCallback(
    (id: string, newContent: string) => {
      setMessages((prev) => {
        const index = prev.findIndex((message) => message.id === id);
        return index === -1 ? prev : prev.slice(0, index);
      });
      void sendMessage(newContent);
    },
    [sendMessage],
  );

  // Regenerate: drop the assistant answer and its triggering user message,
  // then resend the same query as a fresh turn.
  const handleRegenerate = useCallback(
    (assistantId: string) => {
      const assistantIndex = messages.findIndex((m) => m.id === assistantId);
      if (assistantIndex === -1) return;
      let userIndex = -1;
      for (let i = assistantIndex - 1; i >= 0; i -= 1) {
        if (messages[i].role === "user") {
          userIndex = i;
          break;
        }
      }
      if (userIndex === -1) return;
      const query = messages[userIndex].content;
      setMessages((prev) => prev.slice(0, userIndex));
      void sendMessage(query);
    },
    [messages, sendMessage],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      } else if (event.key === "Escape" && isLoading) {
        handleStop();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, handleStop]);

  const handleClearChat = useCallback(() => {
    if (messages.length > 0 && !window.confirm("Clear this conversation? This can't be undone.")) {
      return;
    }
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setIsLoading(false);
    setInput("");
    setSessionId(undefined);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(MESSAGES_STORAGE_KEY);
    inputRef.current?.focus();
  }, [messages.length]);

  const showSuggestions = messages.length === 0 && !isLoading;
  const hasMessages = messages.length > 0 || isLoading;

  return (
    <PageContainer flush hideFooter className="flex flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
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

        <div
          className={cn(
            "flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8",
            // No messages yet: center the welcome text so its position
            // stays stable regardless of whether the suggestions grid below
            // is expanded or collapsed, instead of drifting with the fixed
            // bar's height (bottom-align would move it every time that
            // height changes; top-align leaves it stranded near the top).
            messages.length === 0 && !isLoading && "flex flex-col justify-center",
          )}
          style={{ paddingBottom: bottomBarHeight + 24 }}
        >
          <ChatThread
            messages={messages}
            isLoading={isLoading}
            onRetry={sendMessage}
            onSelectQuestion={handleSuggestion}
            onEditMessage={handleEditMessage}
            onRegenerate={handleRegenerate}
          />
          <div ref={messagesEndRef} aria-hidden />
        </div>
      </div>

      {/*
        Fixed to the real viewport rather than sitting as the last flex-col
        child -- on mobile, the browser's own address bar hides/shows during
        scroll and recalculates layout height, which would otherwise make
        this bar visibly drift. Pinning it here keeps it put no matter what
        the browser chrome does; only the conversation above scrolls.
      */}
      <div
        ref={bottomBarRef}
        className={cn(
          "safe-bottom fixed inset-x-0 bottom-0 z-30 bg-background/95 backdrop-blur-md",
          // Only show the top divider when there's real conversation
          // content scrolling behind it -- the suggestions grid already has
          // its own bordered box, so a second line above it here is just
          // visual clutter on the welcome screen.
          !showSuggestions && "border-t border-border",
        )}
      >
        <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 sm:px-6">
          {showSuggestions ? (
            <SuggestedQuestions
              onSelect={handleSuggestion}
              disabled={isLoading}
              compact
              collapsible
            />
          ) : null}
          <ChatInputPlaceholder
            ref={inputRef}
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onStop={handleStop}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageContainer>
  );
}

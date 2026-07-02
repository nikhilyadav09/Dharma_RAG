"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { forwardRef, useCallback } from "react";

import { Button } from "@/components/ui/button";

interface ChatInputPlaceholderProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ChatInputPlaceholder = forwardRef<
  HTMLTextAreaElement,
  ChatInputPlaceholderProps
>(function ChatInputPlaceholder(
  { value, onChange, onSubmit, disabled = false, isLoading = false },
  ref,
) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onSubmit();
      }
    },
    [onSubmit],
  );

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-border/50">
      <div className="flex items-end gap-2 p-2">
        <div className="flex min-h-11 flex-1 items-center px-3 py-2">
          <label htmlFor="chat-input" className="sr-only">
            Ask a question about dharma or yoga
          </label>
          <textarea
            ref={ref}
            id="chat-input"
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            placeholder="Ask about dharma, yoga, or consciousness..."
            className="max-h-36 min-h-[24px] w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed sm:text-base"
            aria-describedby="chat-input-hint"
          />
        </div>
        <Button
          size="icon"
          disabled={disabled || isLoading || !value.trim()}
          className="h-10 w-10 shrink-0 rounded-xl"
          aria-label="Send question"
          onClick={onSubmit}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
      <div
        id="chat-input-hint"
        className="flex items-center gap-1.5 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground"
      >
        <Sparkles className="h-3 w-3 text-accent" aria-hidden />
        Enter to send · Shift+Enter for newline
      </div>
    </div>
  );
});

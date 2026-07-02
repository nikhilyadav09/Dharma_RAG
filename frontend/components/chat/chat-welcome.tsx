"use client";

import { BookOpen, Sparkles } from "lucide-react";

interface ChatWelcomeProps {
  onSelectQuestion?: (question: string) => void;
}

const highlights = [
  "Grounded in Bhagavad Gita & Yoga Sutras",
  "Every answer cites source verses",
  "Calm, focused reading experience",
];

export function ChatWelcome({ onSelectQuestion }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center px-2 py-8 text-center sm:py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-muted">
        <Sparkles className="h-7 w-7 text-accent" aria-hidden />
      </div>
      <h2 className="mt-6 text-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Welcome to Wisdom Chat
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        Ask about dharma, yoga, consciousness, or daily practice. DHARMA retrieves
        relevant verses and synthesizes thoughtful, source-grounded guidance.
      </p>
      <ul className="mt-6 flex flex-col gap-2 text-left text-sm text-muted-foreground sm:items-center">
        {highlights.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {onSelectQuestion ? (
        <p className="mt-8 text-xs text-muted-foreground">
          Choose a suggested question below, or type your own.
        </p>
      ) : null}
    </div>
  );
}

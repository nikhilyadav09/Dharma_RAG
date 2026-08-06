"use client";

import { Sparkles } from "lucide-react";

export function ChatWelcome() {
  return (
    <div className="flex flex-col items-center px-2 py-4 text-center sm:py-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-muted">
        <Sparkles className="h-5 w-5 text-accent" aria-hidden />
      </div>
      <h2 className="mt-4 text-display text-xl font-semibold tracking-tight sm:text-2xl">
        Welcome to Wisdom Chat
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Ask about a verse, a teaching, or daily practice — answers are grounded
        in the Gita and Yoga Sutras, with citations.
      </p>
    </div>
  );
}

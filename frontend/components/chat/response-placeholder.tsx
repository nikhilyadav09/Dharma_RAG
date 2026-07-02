"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

const LOADING_MESSAGES = [
  "Searching Bhagavad Gita…",
  "Searching Yoga Sutras…",
  "Retrieving verses…",
  "Generating response…",
  "Almost ready…",
];

const ROTATION_MS = 1800;

export function ResponsePlaceholder() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, ROTATION_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <article
      className="flex items-start gap-3"
      aria-busy="true"
      aria-live="polite"
      aria-label="Generating response"
    >
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-muted"
        aria-hidden
      >
        <Sparkles className="h-4 w-4 animate-pulse text-accent" />
      </div>
      <div className="min-w-0 flex-1 space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
          <span className="transition-opacity duration-300">
            {LOADING_MESSAGES[messageIndex]}
          </span>
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-3 w-[90%]" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[75%]" />
          <Skeleton className="mt-4 h-14 w-full rounded-lg" />
        </div>
      </div>
    </article>
  );
}

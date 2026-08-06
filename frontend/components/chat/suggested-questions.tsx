"use client";

import {
  ChevronDown,
  Compass,
  Heart,
  Lightbulb,
  Scale,
  Sparkles,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_SUGGESTIONS: {
  title: string;
  question: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Inner peace",
    icon: Sun,
    question: "What does the Gita teach about finding peace amid daily responsibilities?",
  },
  {
    title: "Dharma",
    icon: Scale,
    question: "How can I understand my dharma when facing difficult choices?",
  },
  {
    title: "Self-knowledge",
    icon: Lightbulb,
    question: "What do the Yoga Sutras say about understanding the true self?",
  },
  {
    title: "Detachment",
    icon: Heart,
    question: "How do I perform my duties without attachment to outcomes?",
  },
  {
    title: "Meditation",
    icon: Compass,
    question: "What guidance do these texts offer for deepening meditation practice?",
  },
  {
    title: "Purpose of yoga",
    icon: Sparkles,
    question: "What is the ultimate purpose of yoga according to Patanjali?",
  },
];

interface SuggestedQuestionsProps {
  questions?: string[];
  onSelect?: (question: string) => void;
  disabled?: boolean;
  compact?: boolean;
  hideHeading?: boolean;
  /** Lets the heading act as a toggle to hide/show the grid. Starts open. */
  collapsible?: boolean;
}

export function SuggestedQuestions({
  questions,
  onSelect,
  disabled = false,
  compact = false,
  hideHeading = false,
  collapsible = false,
}: SuggestedQuestionsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (questions && questions.length > 0) {
    return (
      <div className="flex flex-wrap gap-2" role="list" aria-label="Question suggestions">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            role="listitem"
            disabled={disabled}
            onClick={() => onSelect?.(question)}
            className="rounded-full border border-border bg-card px-3.5 py-2 text-left text-sm leading-snug transition-colors hover:border-accent/40 hover:bg-accent-subtle focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Ask: ${question}`}
          >
            {question}
          </button>
        ))}
      </div>
    );
  }

  // Compact mode renders inside the fixed composer bar on the chat page --
  // on short mobile viewports, a 2-row grid there can push the welcome
  // text above it off screen before the user's even scrolled. One row
  // keeps the bar short enough that everything fits by default.
  const visible = compact
    ? DEFAULT_SUGGESTIONS.slice(0, 2)
    : DEFAULT_SUGGESTIONS;

  return (
    <div aria-label="Suggested questions">
      {!hideHeading ? (
        collapsible ? (
          <button
            type="button"
            className="flex w-full items-center justify-between py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Try asking
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
              aria-hidden
            />
          </button>
        ) : (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Try asking
          </p>
        )
      ) : null}
      {isOpen ? (
        <div className="grid grid-cols-2 gap-2 pt-3">
          {visible.map((item) => (
            <button
              key={item.question}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(item.question)}
              className="group rounded-2xl border border-border bg-card px-3 py-3 text-left transition-colors hover:border-accent/40 hover:bg-accent-subtle focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3.5"
              aria-label={`Suggested question: ${item.question}`}
            >
              <span className="flex items-center gap-2 text-xs font-medium text-accent">
                <item.icon className="h-3.5 w-3.5" aria-hidden />
                {item.title}
              </span>
              <span className="mt-1.5 block text-sm leading-snug text-foreground">
                {item.question}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Simple chip list for related follow-ups */
export function QuestionChips({
  questions,
  onSelect,
  disabled = false,
}: {
  questions: string[];
  onSelect?: (question: string) => void;
  disabled?: boolean;
}) {
  return (
    <SuggestedQuestions
      questions={questions}
      onSelect={onSelect}
      disabled={disabled}
      hideHeading
    />
  );
}

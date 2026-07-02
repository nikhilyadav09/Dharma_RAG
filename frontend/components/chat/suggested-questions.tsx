"use client";

import { Compass, Heart, Lightbulb, Scale, Sparkles, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const suggestions: {
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
  onSelect?: (question: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function SuggestedQuestions({
  onSelect,
  disabled = false,
  compact = false,
}: SuggestedQuestionsProps) {
  const visible = compact ? suggestions.slice(0, 4) : suggestions;

  return (
    <div className="space-y-3" aria-label="Suggested questions">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Try asking
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {visible.map((item) => (
          <button
            key={item.question}
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(item.question)}
            className="group rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:border-accent/40 hover:bg-accent-subtle focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}

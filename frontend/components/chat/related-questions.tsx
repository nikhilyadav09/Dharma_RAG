"use client";

import { QuestionChips } from "@/components/chat/suggested-questions";

interface RelatedQuestionsProps {
  questions: string[];
  onSelect?: (question: string) => void;
  disabled?: boolean;
}

export function RelatedQuestions({
  questions,
  onSelect,
  disabled = false,
}: RelatedQuestionsProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" aria-label="Related questions">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Related questions
      </p>
      <QuestionChips
        questions={questions}
        onSelect={onSelect}
        disabled={disabled}
      />
    </div>
  );
}

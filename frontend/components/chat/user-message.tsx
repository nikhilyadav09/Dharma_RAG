"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

import { CopyButton } from "@/components/common/copy-button";
import { Button } from "@/components/ui/button";

interface UserMessageProps {
  content: string;
  onEdit?: (newContent: string) => void;
}

export function UserMessage({ content, onEdit }: UserMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  const startEdit = () => {
    setDraft(content);
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === content) {
      setIsEditing(false);
      return;
    }
    onEdit?.(trimmed);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <article className="flex justify-end" aria-label="Editing your question">
        <div className="w-full max-w-[85%] space-y-2 sm:max-w-[75%]">
          <textarea
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                saveEdit();
              } else if (event.key === "Escape") {
                cancelEdit();
              }
            }}
            rows={3}
            className="w-full resize-none rounded-2xl border border-accent/50 bg-muted px-4 py-3 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
              <X className="h-3.5 w-3.5" aria-hidden />
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={saveEdit}>
              <Check className="h-3.5 w-3.5" aria-hidden />
              Save &amp; resend
            </Button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col items-end gap-1.5" aria-label="Your question">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] sm:text-base">
        {content}
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <CopyButton text={content} label="Copy question" size="icon" />
        {onEdit ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            aria-label="Edit question"
            onClick={startEdit}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
      </div>
    </article>
  );
}

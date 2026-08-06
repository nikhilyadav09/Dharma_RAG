"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { CopyButton } from "@/components/common/copy-button";
import { MarkdownContent } from "@/components/common/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  detectScriptureBook,
  formatBookBadge,
  formatCitationLabel,
  formatVerseReference,
} from "@/lib/format-relevance";
import { formatVerseCopyText } from "@/lib/parse-source";
import type { VerseDetail } from "@/types";
import { cn } from "@/lib/utils";

interface VerseCardPlaceholderProps {
  verse?: VerseDetail;
}

function bookBadgeClass(book: string): string {
  const scripture = detectScriptureBook(book);
  if (scripture === "Bhagavad Gita") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200";
  }
  if (scripture === "Yoga Sutras") {
    return "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200";
  }
  return "";
}

/**
 * The cited verse, shown immediately alongside the answer rather than
 * buried behind a collapsed section — this is the source people actually
 * want to see. Only the (often very long) purport/commentary is tucked
 * behind its own toggle, since that part genuinely is optional depth.
 */
export function VerseCardPlaceholder({ verse }: VerseCardPlaceholderProps) {
  const [showCommentary, setShowCommentary] = useState(false);

  if (!verse) {
    return null;
  }

  const reference = formatVerseReference(verse);
  const copyText = formatVerseCopyText(verse);

  return (
    <div className="rounded-xl border border-border/60 bg-muted/15 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{reference}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className={cn("text-[10px]", bookBadgeClass(verse.book))}
            >
              {formatBookBadge(verse.book)}
            </Badge>
            <Badge variant="source" className="text-[10px]">
              {formatCitationLabel("primary")}
            </Badge>
          </div>
        </div>
        <CopyButton text={copyText} label="Copy verse" size="icon" />
      </div>

      {verse.sanskrit ? (
        <p className="font-devanagari mt-4 text-base leading-loose md:text-lg">
          {verse.sanskrit}
        </p>
      ) : null}

      {verse.sanskrit && verse.translation ? <Separator className="my-4" /> : null}

      {verse.translation ? (
        <p className="text-sm leading-relaxed text-foreground/90">
          {verse.translation}
        </p>
      ) : null}

      {verse.explanation ? (
        <div className="mt-4 border-t border-border/50 pt-3">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={showCommentary}
            onClick={() => setShowCommentary((prev) => !prev)}
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                showCommentary && "rotate-180",
              )}
              aria-hidden
            />
            {showCommentary ? "Hide commentary" : "Read full commentary"}
          </button>
          {showCommentary ? (
            <MarkdownContent
              content={verse.explanation}
              className="mt-3 max-h-80 overflow-y-auto rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

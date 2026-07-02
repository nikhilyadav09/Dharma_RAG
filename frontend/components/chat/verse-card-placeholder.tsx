"use client";

import { CopyButton } from "@/components/common/copy-button";
import { CollapsibleSection } from "@/components/common/collapsible-section";
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

export function VerseCardPlaceholder({ verse }: VerseCardPlaceholderProps) {
  if (!verse) {
    return null;
  }

  const reference = formatVerseReference(verse);
  const copyText = formatVerseCopyText(verse);

  return (
    <CollapsibleSection title="Primary verse" defaultOpen={false}>
      <div className="space-y-4">
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
          <p className="font-devanagari text-base leading-loose md:text-lg">
            {verse.sanskrit}
          </p>
        ) : null}

        {verse.sanskrit && verse.translation ? <Separator /> : null}

        {verse.translation ? (
          <p className="text-sm leading-relaxed text-foreground/90">
            {verse.translation}
          </p>
        ) : null}

        {verse.explanation ? (
          <p className="rounded-lg bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
            {verse.explanation}
          </p>
        ) : null}
      </div>
    </CollapsibleSection>
  );
}

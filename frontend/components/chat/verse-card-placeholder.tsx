"use client";

import { CopyButton } from "@/components/common/copy-button";
import { CollapsibleSection } from "@/components/common/collapsible-section";
import { Separator } from "@/components/ui/separator";
import {
  formatRelevanceLabel,
  formatVerseReference,
} from "@/lib/format-relevance";
import { formatVerseCopyText } from "@/lib/parse-source";
import type { VerseDetail } from "@/types";

interface VerseCardPlaceholderProps {
  verse?: VerseDetail;
}

export function VerseCardPlaceholder({ verse }: VerseCardPlaceholderProps) {
  if (!verse) {
    return null;
  }

  const reference = formatVerseReference(verse);
  const relevanceLabel = formatRelevanceLabel(verse.confidence_score);
  const copyText = formatVerseCopyText(verse);
  const confidence = verse.confidence_score != null
    ? Math.round(verse.confidence_score <= 1 ? verse.confidence_score * 100 : verse.confidence_score)
    : null;

  return (
    <CollapsibleSection title="Primary verse" defaultOpen={false}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{reference}</p>
            {relevanceLabel ? (
              <p className="mt-1 text-xs text-muted-foreground">{relevanceLabel}</p>
            ) : null}
          </div>
          <CopyButton text={copyText} label="Copy verse" size="icon" />
        </div>

        {confidence !== null ? (
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={confidence}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Retrieval relevance"
          >
            <div
              className="h-full rounded-full bg-accent/80 transition-all duration-300"
              style={{ width: `${confidence}%` }}
            />
          </div>
        ) : null}

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

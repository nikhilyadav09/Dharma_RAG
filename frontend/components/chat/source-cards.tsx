"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { CollapsibleSection } from "@/components/common/collapsible-section";
import { Badge } from "@/components/ui/badge";
import {
  formatRelevancePercent,
  formatRelevanceLabel,
} from "@/lib/format-relevance";
import { parseSourceRef, verseRefKey } from "@/lib/parse-source";
import type { VerseDetail } from "@/types";
import { cn } from "@/lib/utils";

interface SourceCardsProps {
  sources?: string[];
  primaryVerse?: VerseDetail;
}

export function SourceCards({ sources = [], primaryVerse }: SourceCardsProps) {
  const [expandedRaw, setExpandedRaw] = useState<string | null>(null);

  if (sources.length === 0) {
    return null;
  }

  const primaryKey = primaryVerse ? verseRefKey(primaryVerse) : null;
  const primaryConfidence = formatRelevancePercent(primaryVerse?.confidence_score);
  const parsed = sources.map(parseSourceRef);

  const toggleSource = (raw: string) => {
    setExpandedRaw((current) => (current === raw ? null : raw));
  };

  return (
    <CollapsibleSection title="Sources" count={sources.length} defaultOpen={false}>
      <ul className="space-y-1" aria-label="Source citations">
        {parsed.map((source) => {
          const isPrimary =
            primaryKey != null &&
            source.chapter != null &&
            source.verse != null &&
            `${source.book} ${source.chapter}.${source.verse}` === primaryKey;
          const isExpanded = expandedRaw === source.raw;
          const relevanceLabel =
            isPrimary && primaryConfidence != null
              ? formatRelevanceLabel(primaryVerse?.confidence_score)
              : null;

          return (
            <li key={source.raw}>
              <button
                type="button"
                onClick={() => toggleSource(source.raw)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted/50",
                  isExpanded && "bg-muted/40",
                )}
                aria-expanded={isExpanded}
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isExpanded && "rotate-90",
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 font-medium">{source.raw}</span>
                {relevanceLabel ? (
                  <Badge variant="source" className="shrink-0 text-[10px]">
                    {relevanceLabel}
                  </Badge>
                ) : null}
              </button>
              <div
                className={cn(
                  "collapsible-panel grid transition-[grid-template-rows] duration-200 ease-out",
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-2 pb-2 pl-8 text-xs leading-relaxed text-muted-foreground">
                    Cited in this response. Expand the primary verse below for
                    Sanskrit text and translation when available.
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </CollapsibleSection>
  );
}

/** @deprecated Use SourceCards */
export function SourcesPlaceholder(props: SourceCardsProps) {
  return <SourceCards {...props} />;
}

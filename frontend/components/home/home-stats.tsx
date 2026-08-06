"use client";

import { useEffect, useState } from "react";

import { getApiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CorpusStats } from "@/types";

const FALLBACK_STATS = {
  books: 2,
  verses: 867,
};

/**
 * Compact inline trust line — not a stat dashboard. A first-time visitor
 * doesn't care about raw row counts on their own; this exists only to
 * quietly establish scope ("this covers real, bounded scripture") right
 * under the hero CTA.
 */
export function HomeStats({ className }: { className?: string }) {
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    const controller = new AbortController();

    getApiClient()
      .getCorpusStats(controller.signal)
      .then((data: CorpusStats) => {
        setStats({ books: data.books.length, verses: data.total_verses });
      })
      .catch(() => {
        setStats(FALLBACK_STATS);
      });

    return () => controller.abort();
  }, []);

  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        className,
      )}
    >
      Grounded in the Bhagavad Gita &amp; Yoga Sutras
      <span className="hidden sm:inline">
        <span className="mx-2 text-muted-foreground/40" aria-hidden>
          ·
        </span>
      </span>
      <span className="block sm:inline">
        {stats.verses.toLocaleString()} verses across {stats.books} sacred texts
      </span>
    </p>
  );
}

"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiClient } from "@/lib/api";
import type { CorpusStats } from "@/types";

const STATIC_META = {
  embeddingModel: "bge-small-en-v1.5",
  retrievalType: "Hybrid + rerank",
};

const FALLBACK_STATS = [
  { label: "Sacred texts", value: "2" },
  { label: "Verses indexed", value: "867" },
  { label: "Embedding model", value: STATIC_META.embeddingModel },
  { label: "Retrieval method", value: STATIC_META.retrievalType },
];

function buildStatsFromApi(data: CorpusStats) {
  return [
    { label: "Sacred texts", value: String(data.books.length) },
    { label: "Verses indexed", value: data.total_verses.toLocaleString() },
    { label: "Embedding model", value: STATIC_META.embeddingModel },
    { label: "Retrieval method", value: STATIC_META.retrievalType },
  ];
}

export function HomeStats() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    getApiClient()
      .getCorpusStats(controller.signal)
      .then((data) => {
        setStats(buildStatsFromApi(data));
      })
      .catch(() => {
        setStats(FALLBACK_STATS);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-border/80 bg-card/60 text-center transition-colors hover:border-accent/30 hover:bg-card"
        >
          <CardContent className="p-6 md:p-8">
            {isLoading ? (
              <Skeleton className="mx-auto h-9 w-24" />
            ) : (
              <p className="text-3xl font-semibold tracking-tight md:text-4xl">
                {stat.value}
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

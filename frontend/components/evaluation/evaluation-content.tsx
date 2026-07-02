"use client";

import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiClient } from "@/lib/api";
import type { EvaluationSummary } from "@/types";

function formatMetric(value: number): string {
  return value.toFixed(3);
}

function MetricBar({
  label,
  value,
  max = 1,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{formatMetric(value)}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${formatMetric(value)}`}
      >
        <div
          className="h-full rounded-full bg-accent/80 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function EvaluationContent() {
  const [data, setData] = useState<EvaluationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    getApiClient()
      .getEvaluationSummary(controller.signal)
      .then((summary) => {
        setData(summary);
        setHasError(false);
      })
      .catch(() => {
        setData(null);
        setHasError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-border/80">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hasError || !data) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Evaluation data unavailable"
        description="Start the API server to load the latest offline evaluation metrics."
      />
    );
  }

  const headlineMetrics = [
    {
      label: "Semantic similarity",
      value: formatMetric(data.average_semantic_similarity),
      note: "Embedding cosine vs reference",
    },
    {
      label: "ROUGE-1",
      value: formatMetric(data.average_rouge1),
      note: "Lexical overlap",
    },
    {
      label: "Question match",
      value: formatMetric(data.average_question_match_score),
      note: "Query alignment",
    },
    {
      label: "Samples",
      value: String(data.num_samples),
      note: data.model_name,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {headlineMetrics.map((metric) => (
          <Card key={metric.label} className="border-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {metric.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {metric.note}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">Metric comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <MetricBar
            label="Semantic similarity"
            value={data.average_semantic_similarity}
          />
          <MetricBar label="Question match" value={data.average_question_match_score} />
          <MetricBar label="ROUGE-1" value={data.average_rouge1} />
          <MetricBar label="ROUGE-2" value={data.average_rouge2} />
          <MetricBar label="ROUGE-L" value={data.average_rougeL} />
          <MetricBar label="BLEU" value={data.average_bleu_score} max={0.05} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Dataset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Evaluation uses a held-out set of {data.num_samples} question–answer
              pairs drawn from the project&apos;s reference translations.
            </p>
            <p>
              Model evaluated: <span className="font-medium text-foreground">{data.model_name}</span>
            </p>
            <p className="text-xs">Source: {data.source_file}</p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Metrics are computed via src/evaluation/run_evaluation.py using BLEU,
              ROUGE, semantic similarity, markdown structure, readability, citation
              overlap, groundedness proxy, answer length, and verse diversity scores.
            </p>
            <p>
              Low BLEU scores are expected for generative paraphrase — semantic
              similarity, structure, and citation metrics are more informative for this use case.
            </p>
            <p>
              Retrieval uses BAAI/bge-small-en-v1.5 embeddings with hybrid BM25 fusion
              and cross-encoder reranking over 867 indexed verses.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>Small evaluation sample ({data.num_samples} queries).</p>
            <p>Offline metrics — not live user feedback or A/B testing.</p>
            <p>Reference answers may not capture acceptable paraphrase variation.</p>
            <p>API summary shows core metrics; extended quality scores are in evaluation JSON files.</p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Future improvements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>Expand evaluation set with domain-expert reviewed answers.</p>
            <p>Expose Phase 8/9 quality metrics (structure, groundedness) via API.</p>
            <p>LLM-as-judge faithfulness scoring in production.</p>
            <p>Human preference evaluation for answer quality and tone.</p>
            <p>Verse-level precision@k benchmark with gold Q→verse pairs.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

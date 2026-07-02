import { Clock, Database } from "lucide-react";

import type { ResponseMetadata } from "@/types";

interface ResponseMetadataProps {
  metadata?: ResponseMetadata;
  sourcesCount?: number;
}

export function ResponseMetadata({ metadata, sourcesCount = 0 }: ResponseMetadataProps) {
  if (!metadata) {
    return null;
  }

  const latencySeconds = (metadata.latency_ms / 1000).toFixed(1);

  return (
    <div
      className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground"
      aria-label="Response metadata"
    >
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        {latencySeconds}s
      </span>
      {sourcesCount > 0 ? (
        <span className="inline-flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5" aria-hidden />
          {sourcesCount} {sourcesCount === 1 ? "source" : "sources"}
        </span>
      ) : null}
      {metadata.model ? (
        <span className="rounded-full bg-accent-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
          {metadata.model}
        </span>
      ) : null}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const flowSteps = [
  "User",
  "Next.js",
  "FastAPI",
  "Hybrid Retrieval",
  "Groq LLM",
  "Response",
];

export function RequestFlowDiagram() {
  return (
    <Card className="border-border/80 bg-muted/20">
      <CardHeader>
        <CardTitle>Request flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="mx-auto flex max-w-xs flex-col items-center gap-1"
          role="img"
          aria-label="Request flow from User through Next.js, FastAPI, Hybrid Retrieval, Groq LLM to Response"
        >
          {flowSteps.map((step, index) => (
            <div key={step} className="flex w-full flex-col items-center">
              <div className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center transition-colors hover:border-accent/30">
                <p className="text-sm font-semibold">{step}</p>
              </div>
              {index < flowSteps.length - 1 ? (
                <span
                  className="py-1 text-muted-foreground"
                  aria-hidden
                >
                  ↓
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const layers = [
  { label: "Browser", sub: "Next.js · React · Tailwind" },
  { label: "API", sub: "FastAPI · Pydantic" },
  { label: "Pipeline", sub: "Retriever · Generator" },
  { label: "Database", sub: "PostgreSQL · pgvector" },
];

export function FlowDiagram() {
  return (
    <Card className="border-border/80 bg-muted/20">
      <CardHeader>
        <CardTitle>System overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between"
          role="img"
          aria-label="System layers: Browser, API, Pipeline, Database"
        >
          {layers.map((layer, index) => (
            <div key={layer.label} className="flex flex-1 items-center gap-2">
              <div className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-center transition-colors hover:border-accent/25">
                <p className="text-sm font-semibold">{layer.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{layer.sub}</p>
              </div>
              {index < layers.length - 1 ? (
                <span
                  className="hidden shrink-0 text-muted-foreground sm:inline"
                  aria-hidden
                >
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

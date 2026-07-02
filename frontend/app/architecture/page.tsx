import type { Metadata } from "next";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FlowDiagram, RequestFlowDiagram } from "@/components/architecture/flow-diagram";
import { PageHeader } from "@/components/common/page-header";
import { SectionHeading } from "@/components/common/section-heading";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Architecture",
  description: "System design of the DHARMA RAG application.",
};

const layers = [
  {
    name: "Presentation — Next.js",
    detail:
      "App Router frontend with TypeScript, Tailwind CSS, and a calm design system. Handles chat UI, markdown rendering, and API consumption.",
  },
  {
    name: "API — FastAPI",
    detail:
      "Thin REST layer exposing health, readiness, chat, corpus stats, and evaluation summary. No business logic duplication.",
  },
  {
    name: "RAG Pipeline — Python",
    detail:
      "VedicWisdomPipeline orchestrates query preprocessing, hybrid retrieval, and Groq-based generation with citation mapping.",
  },
  {
    name: "Data — PostgreSQL + pgvector",
    detail:
      "867 verses with 384-dimensional embeddings (all-MiniLM-L6-v2). IVFFlat index for approximate nearest-neighbor search.",
  },
];

const flows = [
  {
    title: "Request & API flow",
    steps: [
      "User submits question in Next.js /chat",
      "POST /api/v1/chat with JSON body",
      "FastAPI validates input and invokes pipeline",
      "Response mapped to typed JSON schema",
      "Frontend renders markdown, sources, and verse card",
    ],
  },
  {
    title: "Retrieval flow",
    steps: [
      "QueryPreprocessor normalizes and expands query",
      "Semantic search via pgvector cosine similarity",
      "BM25 keyword scoring on verse text",
      "Hybrid fusion (0.7 semantic + 0.3 BM25)",
      "Top-k verses passed to generator as context",
    ],
  },
  {
    title: "Embedding & database flow",
    steps: [
      "Verses loaded from CSV into PostgreSQL",
      "sentence-transformers encodes each verse",
      "384-dim vectors stored in pgvector column",
      "IVFFlat index built after bulk insert",
      "Retriever queries index at inference time",
    ],
  },
  {
    title: "LLM generation flow",
    steps: [
      "Retrieved verses formatted into prompt context",
      "Groq llama-3.3-70b-versatile generates answer",
      "Response template enforces citation style",
      "Primary verse and sources extracted",
      "Latency and model metadata attached",
    ],
  },
];

const stack = [
  "Next.js 15",
  "FastAPI",
  "PostgreSQL",
  "pgvector",
  "sentence-transformers",
  "BM25",
  "Groq",
];

export default function ArchitecturePage() {
  return (
    <PageContainer className="space-y-12">
      <PageHeader
        eyebrow="System design"
        title="Architecture"
        description="DHARMA separates presentation, API, and RAG core. Each layer has a single responsibility — enabling independent evolution of frontend and backend."
      />

      <RequestFlowDiagram />

      <FlowDiagram />

      <div className="space-y-6">
        <SectionHeading
          title="End-to-end request flow"
          description="From browser click to cited wisdom response."
        />
        <Card className="border-border/80">
          <CardContent className="p-6">
            <ol className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {flows[0].steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-xs font-semibold text-accent">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {flows.slice(1).map((flow) => (
          <Card key={flow.title} className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base">{flow.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                {flow.steps.map((step, index) => (
                  <li key={step}>
                    <span className="font-medium text-foreground">{index + 1}.</span>{" "}
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <SectionHeading title="System layers" />
        <div className="grid gap-4 md:grid-cols-2">
          {layers.map((layer) => (
            <Card key={layer.name} className="border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{layer.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {layer.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <SectionHeading title="Technology stack" />
        <div className="flex flex-wrap gap-2">
          {stack.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
        <Link href="/chat">
          <Button variant="outline" className="mt-4">
            Try the live application
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
}

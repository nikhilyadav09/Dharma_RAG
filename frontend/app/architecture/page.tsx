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
      "App Router frontend with TypeScript, Tailwind CSS, Markdown rendering, related-question chips, and multi-turn session handling.",
  },
  {
    name: "API — FastAPI",
    detail:
      "REST layer exposing health, readiness, chat (with session_id), corpus stats, and evaluation summary. Thin wrapper over the RAG pipeline.",
  },
  {
    name: "RAG Pipeline — Python",
    detail:
      "VedicWisdomPipeline: query preprocessing, intent routing, metadata lookup, hybrid retrieval with reranking, conversation memory, and Groq generation.",
  },
  {
    name: "Data — PostgreSQL + pgvector",
    detail:
      "867 verses with 384-dimensional BGE embeddings (bge-small-en-v1.5). IVFFlat index for approximate nearest-neighbor search.",
  },
];

const flows = [
  {
    title: "Request & API flow",
    steps: [
      "User submits question in Next.js /chat (optional session_id for memory)",
      "POST /api/v1/chat with JSON body",
      "FastAPI validates input and invokes VedicWisdomPipeline",
      "Response mapped to typed JSON (answer, sources, related_questions)",
      "Frontend renders Markdown, related chips, sources, and verse card",
    ],
  },
  {
    title: "Retrieval flow",
    steps: [
      "QueryPreprocessor cleans query and detects scripture preference",
      "MetadataRetriever resolves explicit chapter/verse references",
      "Semantic search via pgvector (BGE embeddings, normalized)",
      "BM25 keyword scoring on translation + explanation",
      "Score-based hybrid fusion (0.65 semantic + 0.35 BM25)",
      "Cross-encoder reranking and chapter deduplication",
      "Top verses passed to generator (1 primary + 2 supporting)",
    ],
  },
  {
    title: "Embedding & database flow",
    steps: [
      "Verses loaded from CSV into PostgreSQL",
      "BAAI/bge-small-en-v1.5 encodes translation + explanation",
      "384-dim normalized vectors stored in pgvector column",
      "IVFFlat index built after bulk insert",
      "Retriever queries index at inference time",
    ],
  },
  {
    title: "LLM generation flow",
    steps: [
      "Intent router selects dynamic Markdown template",
      "Conversation context injected for multi-turn queries",
      "Groq llama-3.3-70b-versatile generates structured answer",
      "Inline citations and related follow-up questions parsed",
      "Primary verse, sources, and session_id returned",
    ],
  },
];

const stack = [
  "Next.js 15",
  "FastAPI",
  "PostgreSQL",
  "pgvector",
  "BGE embeddings",
  "BM25",
  "Cross-encoder",
  "Groq",
];

export default function ArchitecturePage() {
  return (
    <PageContainer className="space-y-12">
      <PageHeader
        eyebrow="System design"
        title="Architecture"
        description="DHARMA separates presentation, API, and RAG core — with intent routing, metadata lookup, hybrid retrieval, and multi-turn memory."
      />

      <RequestFlowDiagram />

      <FlowDiagram />

      <div className="space-y-6">
        <SectionHeading
          title="End-to-end request flow"
          description="From browser click to cited, structured wisdom response."
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

import type { Metadata } from "next";
import { ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { CollapsibleSection } from "@/components/common/collapsible-section";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the DHARMA project and its sacred text corpus.",
};

const faqs = [
  {
    title: "What's in the corpus?",
    body: "867 verses — 700 from the Bhagavad Gita and 167 from the Yoga Sutras — each with its original Sanskrit, an English translation, and traditional commentary, embedded with BAAI/bge-small-en-v1.5 and stored in PostgreSQL with pgvector.",
  },
  {
    title: "Why these two texts?",
    body: "The Bhagavad Gita offers practical wisdom on duty, devotion, and equanimity. The Yoga Sutras provide a systematic framework for consciousness and inner discipline — together forming a rich corpus for philosophical inquiry.",
  },
  {
    title: "How are answers generated?",
    body: "Your question is routed by intent. An explicit chapter/verse reference resolves directly; otherwise hybrid retrieval (pgvector + BM25 + cross-encoder reranking) finds the most relevant passages. An LLM then synthesizes a structured answer with inline citations, sourced directly from what was retrieved — not from unconstrained model knowledge.",
  },
  {
    title: "Does it remember earlier messages?",
    body: "Yes, within a session. Follow-ups like “explain more” or “what did he teach?” build on the prior answer instead of starting over.",
  },
];

export default function AboutPage() {
  return (
    <PageContainer size="narrow" className="space-y-10">
      <PageHeader
        eyebrow="About"
        title="About DHARMA"
        description="An AI assistant for exploring the Bhagavad Gita and Yoga Sutras — grounded in retrieved verses, not open-ended generation."
      />

      <p className="prose-width text-sm leading-relaxed text-muted-foreground md:text-[15px]">
        DHARMA (Divine Healing And Reflective Mindfulness Assistant) answers
        questions about dharma, yoga, and daily practice by retrieving relevant
        verses first, then generating a response grounded in what was found —
        with the source cited alongside every answer.
      </p>

      <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
        <ShieldAlert
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-foreground/90">
          <span className="font-medium">Not a substitute for scholarship.</span>{" "}
          This is a software engineering project exploring RAG, not a religious
          authority, medical advice, or a replacement for guidance from a
          qualified teacher or scholar of these texts.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <CollapsibleSection key={faq.title} title={faq.title} headingLevel="h3">
            <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              {faq.body}
            </p>
          </CollapsibleSection>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Link href="/chat">
          <Button size="lg">
            Try it yourself
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
}

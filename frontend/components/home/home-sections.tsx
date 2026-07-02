"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";

const examples = [
  "What does the Gita teach about finding peace amid daily responsibilities?",
  "What is Chapter 2 Verse 47 about?",
  "How can I understand my dharma when facing difficult choices?",
  "What do the Yoga Sutras say about meditation?",
];

export function HomeExampleQuestions() {
  return (
    <Section className="py-14 md:py-16">
      <Container className="space-y-8">
        <SectionHeading
          title="Example questions"
          description="Start with a thoughtful inquiry — each answer is grounded in retrieved verses with related follow-ups."
          className="mx-auto max-w-xl text-center"
        />
        <ul className="mx-auto grid max-w-2xl gap-2 sm:grid-cols-2">
          {examples.map((question) => (
            <li key={question}>
              <Link
                href={`/chat?q=${encodeURIComponent(question)}`}
                className="block rounded-xl border border-border bg-card px-4 py-3.5 text-sm leading-snug transition-colors hover:border-accent/40 hover:bg-accent-subtle"
              >
                {question}
              </Link>
            </li>
          ))}
        </ul>
        <div className="text-center">
          <Link href="/chat">
            <Button>
              Open chat
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}

const stack = [
  "Next.js 15",
  "TypeScript",
  "FastAPI",
  "PostgreSQL",
  "pgvector",
  "BGE embeddings",
  "BM25 + reranker",
  "Groq LLM",
];

export function HomeAboutSections() {
  return (
    <>
      <Section variant="muted" className="py-14 md:py-20">
        <Container className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold">What is DHARMA?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              DHARMA (Divine Healing And Reflective Mindfulness Assistant) is a
              production-quality RAG application that helps you explore philosophical
              questions through verses from the Bhagavad Gita and Patanjali Yoga
              Sutras — with intent-aware answers, inline citations, and multi-turn memory.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">How RAG works here</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Retrieval-Augmented Generation combines search with language models.
              Your question is routed by intent, verses are retrieved via metadata lookup
              or hybrid search with reranking, and an LLM synthesizes a structured answer
              with inline citations and follow-up questions.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Why these texts?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The Bhagavad Gita offers practical wisdom on duty, devotion, and
              equanimity. The Yoga Sutras provide a systematic framework for
              consciousness and inner discipline — together forming a rich corpus
              for philosophical inquiry.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="py-14 md:py-16">
        <Container className="space-y-8">
          <SectionHeading
            title="Technology stack"
            description="Production patterns across frontend, API, retrieval, reranking, and generation."
            className="mx-auto max-w-xl text-center"
          />
          <div className="flex flex-wrap justify-center gap-2">
            {stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="text-center">
            <Link href="/architecture">
              <Button variant="outline">
                Explore architecture
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}

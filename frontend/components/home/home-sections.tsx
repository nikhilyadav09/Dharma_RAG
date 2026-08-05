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


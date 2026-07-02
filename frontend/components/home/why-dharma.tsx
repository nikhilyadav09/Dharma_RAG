"use client";

import {
  BookOpen,
  Brain,
  GitBranch,
  Layers,
  Rocket,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Container } from "@/components/common/container";
import { Card, CardContent } from "@/components/ui/card";

const whyFeatures: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Shield,
    title: "Grounded responses",
    description: "Answers synthesized only from retrieved scripture — not open-ended speculation.",
  },
  {
    icon: BookOpen,
    title: "Real citations",
    description: "Every wisdom response links to specific Bhagavad Gita and Yoga Sutras verses.",
  },
  {
    icon: Brain,
    title: "Hybrid retrieval",
    description: "Semantic pgvector search combined with BM25 for precise verse matching.",
  },
  {
    icon: Layers,
    title: "Modern AI stack",
    description: "Groq LLM with a production FastAPI backend and Next.js frontend.",
  },
  {
    icon: GitBranch,
    title: "Open source",
    description: "Full codebase available for review, learning, and contribution.",
  },
  {
    icon: Rocket,
    title: "Production ready",
    description: "Docker, typed APIs, evaluation metrics, and a polished product UI.",
  },
];

export function WhyDharma() {
  return (
    <Section className="py-14 md:py-16">
      <Container className="space-y-8">
        <SectionHeading
          title="Why DHARMA?"
          description="A calm, credible way to explore ancient wisdom — built with modern engineering."
          className="mx-auto max-w-xl text-center"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyFeatures.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/80 transition-colors hover:border-accent/25"
            >
              <CardContent className="space-y-3 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted">
                  <feature.icon className="h-4 w-4 text-accent" aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

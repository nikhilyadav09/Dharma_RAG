"use client";

import {
  BookOpen,
  Brain,
  GitBranch,
  Layers,
  MessageCircle,
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
    description: "Answers synthesized only from retrieved scripture — with inline citations, not speculation.",
  },
  {
    icon: BookOpen,
    title: "Real citations",
    description: "Primary and supporting teachings from Bhagavad Gita and Yoga Sutras with scripture badges.",
  },
  {
    icon: Brain,
    title: "Advanced retrieval",
    description: "BGE embeddings, BM25, cross-encoder reranking, and direct chapter/verse lookup.",
  },
  {
    icon: MessageCircle,
    title: "AI teacher flow",
    description: "Multi-turn memory and related follow-up questions guide deeper exploration.",
  },
  {
    icon: Layers,
    title: "Intent-aware answers",
    description: "Dynamic templates adapt to meaning, practice, comparison, and philosophical questions.",
  },
  {
    icon: Rocket,
    title: "Production ready",
    description: "Docker, typed APIs, expanded evaluation metrics, and a polished product UI.",
  },
  {
    icon: GitBranch,
    title: "Open source",
    description: "Full codebase available for review, learning, and contribution.",
  },
];

export function WhyDharma() {
  return (
    <Section className="py-14 md:py-16">
      <Container className="space-y-8">
        <SectionHeading
          title="Why DHARMA?"
          description="Ancient wisdom explored through modern AI engineering — grounded, structured, and conversational."
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

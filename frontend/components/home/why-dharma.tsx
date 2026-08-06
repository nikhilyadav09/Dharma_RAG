"use client";

import {
  BookOpen,
  Brain,
  Layers,
  MessageCircle,
  ScrollText,
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
    description: "Answers are built only from retrieved scripture — never speculation or the model's own opinion.",
  },
  {
    icon: BookOpen,
    title: "Citations you can check",
    description: "Every claim points to a specific chapter and verse, so you can go read it yourself.",
  },
  {
    icon: Brain,
    title: "Understands what you're asking",
    description: "Ask in your own words — it finds the verse that actually answers your question, not just matching keywords.",
  },
  {
    icon: MessageCircle,
    title: "Remembers the conversation",
    description: "Ask a follow-up like “explain that more” and it knows what you're referring to.",
  },
  {
    icon: Layers,
    title: "Answers shaped to your question",
    description: "A definition, a comparison, daily guidance — the structure adapts to what you actually need.",
  },
  {
    icon: ScrollText,
    title: "Traditional commentary included",
    description: "Go beyond the verse itself with classical commentary, whenever you want to go deeper.",
  },
];

export function WhyDharma() {
  return (
    <Section className="py-14 md:py-16">
      <Container className="space-y-8">
        <SectionHeading
          title="Why DHARMA?"
          description="Every answer traces back to an actual verse — nothing invented, nothing vague."
          className="mx-auto max-w-xl text-center"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {whyFeatures.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/80 transition-colors hover:border-accent/25"
            >
              <CardContent className="space-y-2.5 p-4 sm:p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-muted">
                    <feature.icon className="h-4 w-4 text-accent" aria-hidden />
                  </div>
                  <h3 className="text-sm font-semibold leading-snug">{feature.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

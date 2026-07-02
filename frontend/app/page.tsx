"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Database,
  Layers,
  Sparkles,
} from "lucide-react";

import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Container } from "@/components/common/container";
import { HomeAboutSections, HomeExampleQuestions } from "@/components/home/home-sections";
import { HomeStats } from "@/components/home/home-stats";
import { WhyDharma } from "@/components/home/why-dharma";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "Hybrid retrieval",
    description:
      "Semantic pgvector search combined with BM25 keyword ranking for precise verse matching.",
  },
  {
    icon: BookOpen,
    title: "Source-grounded answers",
    description:
      "Every response cites specific verses from the Bhagavad Gita and Patanjali Yoga Sutras.",
  },
  {
    icon: Database,
    title: "Production architecture",
    description:
      "FastAPI backend, PostgreSQL with pgvector, Groq LLM, and a modern Next.js frontend.",
  },
];

const steps = [
  {
    icon: Layers,
    step: "01",
    title: "Ask with intention",
    description: "Pose a question about dharma, yoga, consciousness, or daily practice.",
  },
  {
    icon: Database,
    step: "02",
    title: "Retrieve relevant verses",
    description: "Hybrid search surfaces the most aligned passages from the sacred corpus.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Receive grounded guidance",
    description: "An LLM synthesizes a clear answer with citations you can explore.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <div className="bg-grid-subtle absolute inset-0 opacity-40" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-b from-accent-subtle/80 via-background/50 to-background" />
          <Container className="relative py-20 md:py-28 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="mx-auto max-w-3xl text-center"
            >
              <Badge variant="secondary" className="mb-6 border border-border/60">
                <Sparkles className="mr-1.5 h-3 w-3 text-accent" aria-hidden />
                AI wisdom assistant
              </Badge>
              <h1 className="text-display text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-[3.5rem]">
                Ancient wisdom,
                <span className="text-accent"> thoughtfully retrieved</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                DHARMA helps you explore philosophical guidance from the Bhagavad
                Gita and Yoga Sutras — with calm design, cited sources, and
                production-grade engineering.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/chat">
                  <Button size="lg" className="min-w-[180px]">
                    Start exploring
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
                <Link href="/architecture">
                  <Button variant="outline" size="lg" className="min-w-[180px]">
                    View architecture
                  </Button>
                </Link>
              </div>
            </motion.div>
          </Container>
        </section>

        <Section className="py-14 md:py-16">
          <Container>
            <HomeStats />
          </Container>
        </Section>

        <WhyDharma />

        <HomeAboutSections />

        <Section variant="muted" className="py-14 md:py-20">
          <Container className="space-y-10">
            <SectionHeading
              title="Built for clarity and trust"
              description="A retrieval-augmented experience designed to feel calm, credible, and easy to read."
              className="mx-auto max-w-2xl text-center"
            />
            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-border/80 bg-card/80 transition-colors hover:border-accent/25"
                >
                  <CardContent className="space-y-4 p-6 md:p-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted">
                      <feature.icon className="h-5 w-5 text-accent" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="py-14 md:py-20">
          <Container className="space-y-10">
            <SectionHeading
              title="How it works"
              description="Three calm steps from question to cited guidance."
              className="mx-auto max-w-xl text-center"
            />
            <ol className="grid gap-6 md:grid-cols-3">
              {steps.map((item) => (
                <li key={item.step}>
                  <Card className="h-full border-border/80">
                    <CardContent className="space-y-4 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted">
                          <item.icon className="h-5 w-5 text-accent" aria-hidden />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.step}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        <HomeExampleQuestions />

        <Section variant="accent" className="py-14 md:py-16">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-display text-2xl font-semibold tracking-tight md:text-3xl">
                Begin your inquiry
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                Explore timeless teachings with a interface designed for focus,
                reading comfort, and source transparency.
              </p>
              <Link href="/chat" className="mt-8 inline-block">
                <Button size="lg">
                  Open wisdom chat
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Section } from "@/components/common/section";
import { Container } from "@/components/common/container";
import { HomeExampleQuestions } from "@/components/home/home-sections";
import { HomeStats } from "@/components/home/home-stats";
import { WhyDharma } from "@/components/home/why-dharma";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
                Gita and Yoga Sutras — with intent-aware answers, inline citations,
                and multi-turn memory.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/chat">
                  <Button size="lg" className="min-w-[180px]">
                    Start exploring
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Learn more about DHARMA
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

        <HomeExampleQuestions />

        <Section variant="accent" className="py-14 md:py-16">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-display text-2xl font-semibold tracking-tight md:text-3xl">
                Begin your inquiry
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                Explore timeless teachings with structured answers, related questions,
                and transparent scripture sources.
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

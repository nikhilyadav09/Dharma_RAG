import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the DHARMA project and its sacred text corpus.",
};

const sections = [
  {
    title: "What is DHARMA?",
    body: "DHARMA (Divine Healing And Reflective Mindfulness Assistant) is a production-quality RAG system that helps users explore philosophical questions using verses from the Bhagavad Gita and Patanjali Yoga Sutras — with intent-aware answers, inline citations, and multi-turn conversation memory.",
  },
  {
    title: "What it is not",
    body: "This is a software engineering portfolio project — not religious authority, medical advice, or a replacement for scholarly study of primary texts.",
  },
  {
    title: "Corpus",
    body: "The knowledge base includes 867 verses (700 Bhagavad Gita + 167 Yoga Sutras) with translation and explanation text embedded using BAAI/bge-small-en-v1.5 and stored in PostgreSQL with pgvector.",
  },
  {
    title: "How answers are generated",
    body: "Your question is preprocessed and routed by intent. Metadata lookup resolves explicit chapter/verse references; otherwise hybrid retrieval (pgvector + BM25 + cross-encoder reranking) finds relevant passages. Groq LLM synthesizes a structured Markdown answer with inline citations, related follow-up questions, and scripture source cards.",
  },
  {
    title: "Conversation memory",
    body: "Multi-turn sessions remember recent context so follow-up questions like “explain more” or “what did he teach?” build on prior answers without starting over.",
  },
];

export default function AboutPage() {
  return (
    <PageContainer size="narrow" className="space-y-10">
      <PageHeader
        eyebrow="About"
        title="About DHARMA"
        description="A full-stack AI knowledge assistant demonstrating production RAG engineering over ancient wisdom texts."
      />

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {section.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

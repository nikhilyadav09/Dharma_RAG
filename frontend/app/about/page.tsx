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
    body: "DHARMA (Divine Healing And Reflective Mindfulness Assistant) is an educational RAG system that helps users explore philosophical questions using verses from the Bhagavad Gita and Patanjali Yoga Sutras.",
  },
  {
    title: "What it is not",
    body: "This is a software engineering portfolio project — not religious authority, medical advice, or a replacement for scholarly study of primary texts.",
  },
  {
    title: "Corpus",
    body: "The knowledge base includes processed verse translations and explanations embedded with sentence-transformers and stored in PostgreSQL with pgvector.",
  },
  {
    title: "How answers are generated",
    body: "Your question is preprocessed, relevant verses are retrieved via hybrid search, and a Groq LLM synthesizes a grounded response with citations.",
  },
];

export default function AboutPage() {
  return (
    <PageContainer size="narrow" className="space-y-10">
      <PageHeader
        eyebrow="About"
        title="About DHARMA"
        description="A full-stack AI application demonstrating RAG engineering over ancient wisdom texts."
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

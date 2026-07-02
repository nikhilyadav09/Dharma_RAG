import type { Metadata } from "next";

import { EvaluationContent } from "@/components/evaluation/evaluation-content";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Evaluation",
  description: "Offline RAG evaluation metrics for DHARMA.",
};

export default function EvaluationPage() {
  return (
    <PageContainer className="space-y-10">
      <PageHeader
        eyebrow="Quality metrics"
        title="Evaluation"
        description="Offline metrics from the Python evaluation pipeline, loaded live from the API when available."
      />

      <EvaluationContent />
    </PageContainer>
  );
}

"use client";

import { ErrorState } from "@/components/common/error-state";
import { PageContainer } from "@/components/layout/page-container";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer size="narrow" className="flex min-h-[50vh] items-center justify-center">
      <ErrorState
        title="Unable to load this page"
        description="An unexpected error occurred while rendering the page."
        onRetry={reset}
      />
    </PageContainer>
  );
}

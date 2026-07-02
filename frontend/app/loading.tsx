import { LoadingState } from "@/components/common/loading-state";
import { PageContainer } from "@/components/layout/page-container";

export default function Loading() {
  return (
    <PageContainer size="narrow" className="flex min-h-[40vh] items-center justify-center">
      <LoadingState label="Loading page..." />
    </PageContainer>
  );
}

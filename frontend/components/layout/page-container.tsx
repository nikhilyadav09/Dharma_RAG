import { Container } from "@/components/common/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
  /** When true, main content fills viewport without default vertical padding (chat layout). */
  flush?: boolean;
}

export function PageContainer({
  children,
  className,
  size = "default",
  flush = false,
}: PageContainerProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main
        id="main-content"
        className={cn("flex-1", !flush && "py-10 md:py-14", className)}
      >
        {flush ? children : <Container size={size}>{children}</Container>}
      </main>
      <Footer />
    </div>
  );
}

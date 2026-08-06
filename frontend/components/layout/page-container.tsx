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
  /** When true, omits the site footer (chat layout doesn't need one). */
  hideFooter?: boolean;
}

export function PageContainer({
  children,
  className,
  size = "default",
  flush = false,
  hideFooter = false,
}: PageContainerProps) {
  return (
    // flush layouts (chat) need a hard-capped viewport height, not a
    // minimum -- with min-h-screen, any content/padding that pushes the
    // total past 100vh grows the whole page instead of scrolling inside
    // the intended inner region, which breaks a fixed-position footer's
    // assumptions about what's actually on screen.
    <div className={cn("flex flex-col", flush ? "h-dvh" : "min-h-screen")}>
      <Navbar />
      <main
        id="main-content"
        className={cn("flex-1 min-h-0", !flush && "py-10 md:py-14", flush && className)}
      >
        {flush ? (
          children
        ) : (
          <Container size={size} className={className}>
            {children}
          </Container>
        )}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

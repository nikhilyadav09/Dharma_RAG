import Link from "next/link";

import { Container } from "@/components/common/container";
import { Separator } from "@/components/ui/separator";

const productLinks = [
  { href: "/chat", label: "Chat" },
  { href: "/about", label: "About" },
  { href: "/architecture", label: "Architecture" },
  { href: "/evaluation", label: "Evaluation" },
];

const resourceLinks = [
  {
    href: "https://github.com/nikhilyadav09/Dharma_RAG",
    label: "GitHub",
    external: true,
  },
  {
    href: "http://localhost:8000/docs",
    label: "API Docs",
    external: true,
  },
  {
    href: "https://nikhilyadav.dev",
    label: "Portfolio",
    external: true,
  },
];

const techStack = [
  "Next.js",
  "FastAPI",
  "PostgreSQL",
  "pgvector",
  "Groq",
  "Docker",
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/25">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm text-accent-foreground"
                aria-hidden
              >
                ॐ
              </span>
              <span className="font-semibold tracking-tight">DHARMA</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Divine Healing And Reflective Mindfulness Assistant — a full-stack RAG
              application for exploring timeless Sanskrit wisdom with cited sources.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Built with ❤️ by{" "}
              <Link
                href="https://nikhilyadav.dev"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground transition-colors hover:text-accent"
              >
                Nikhil Yadav
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              {techStack.join(" · ")}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Product</h2>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Resources</h2>
            <ul className="mt-4 space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    {...(link.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Educational RAG demo. Not religious authority or medical advice.</p>
          <p>© {new Date().getFullYear()} DHARMA</p>
        </div>
      </Container>
    </footer>
  );
}

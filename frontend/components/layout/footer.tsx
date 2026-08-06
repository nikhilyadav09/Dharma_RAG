import Link from "next/link";

import { Container } from "@/components/common/container";
import { Separator } from "@/components/ui/separator";

const productLinks = [
  { href: "/chat", label: "Chat" },
  { href: "/about", label: "About" },
];

const developerLinks = [
  { href: "/architecture", label: "Architecture" },
  { href: "/evaluation", label: "Evaluation" },
  {
    href: "https://github.com/nikhilyadav09/Dharma_RAG",
    label: "GitHub",
    external: true,
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/25">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
          <div className="col-span-2 space-y-4 md:col-span-1">
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
              Divine Healing And Reflective Mindfulness Assistant — a production-quality
              RAG application for exploring Sanskrit wisdom with intent-aware answers,
              inline citations, and multi-turn conversation.
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
            <h2 className="text-sm font-semibold">Developer</h2>
            <ul className="mt-4 space-y-2.5">
              {developerLinks.map((link) => (
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

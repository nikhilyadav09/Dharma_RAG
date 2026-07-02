"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/about", label: "About" },
  { href: "/architecture", label: "Architecture" },
  { href: "/evaluation", label: "Evaluation" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <Container>
          <div className="flex h-14 items-center justify-between gap-4 md:h-16">
            <Link
              href="/"
              className="group flex items-center gap-2.5 font-semibold tracking-tight"
              aria-label="DHARMA home"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm text-accent-foreground transition-transform group-hover:scale-[1.02]">
                ॐ
              </span>
              <span className="hidden sm:inline">DHARMA</span>
            </Link>

            <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              <Link href="/chat" className="hidden sm:inline-flex">
                <Button size="sm">Ask</Button>
              </Link>
              <MobileNav />
            </div>
          </div>
        </Container>
      </header>
    </>
  );
}

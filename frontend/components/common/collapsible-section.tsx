"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  headingLevel?: "h3" | "h4";
}

export function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
  className,
  headingLevel: Heading = "h3",
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  const label = count != null ? `${title} (${count})` : title;

  return (
    <section className={cn("rounded-xl border border-border/60 bg-muted/15", className)}>
      <Heading>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="text-sm font-medium text-foreground">{label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </Heading>
      <div
        id={panelId}
        className={cn(
          "collapsible-panel grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border/50 px-4 py-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Always-visible answer block with optional actions */
export function AnswerSection({
  title = "Answer",
  actions,
  children,
  className,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  );
}

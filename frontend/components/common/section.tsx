import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  variant?: "default" | "muted" | "accent";
}

const variants = {
  default: "",
  muted: "bg-muted/30 border-y border-border",
  accent: "bg-accent-subtle border-y border-border",
};

export function Section({
  children,
  className,
  id,
  variant = "default",
}: SectionProps) {
  return (
    <section id={id} className={cn(variants[variant], className)}>
      {children}
    </section>
  );
}

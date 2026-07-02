import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  variant?: "spinner" | "skeleton";
  className?: string;
}

export function LoadingState({
  label = "Loading...",
  variant = "spinner",
  className,
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)} aria-busy aria-label={label}>
        <Skeleton className="h-4 w-[75%]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[83%]" />
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-center gap-2 py-8", className)}
      aria-busy
      aria-label={label}
    >
      <Loader2 className="h-5 w-5 animate-spin text-accent" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

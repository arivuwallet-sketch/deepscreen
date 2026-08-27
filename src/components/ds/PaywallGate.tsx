import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { PLANS, useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

export function ProBadge() {
  const { isPro, tier } = useSubscription();
  if (!isPro) return null;
  return (
    <span className="num rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
      Pro · {tier}
    </span>
  );
}

/**
 * Blurs premium content for free users and overlays an upgrade prompt.
 * Basic search and headline data stay public — only the deep model is gated.
 */
export function PaywallGate({
  feature,
  children,
  className,
  minHeight = "min-h-40",
}: {
  feature: string;
  children: ReactNode;
  className?: string;
  minHeight?: string;
}) {
  const { isPro, loading } = useSubscription();

  if (loading) {
    return <div className={cn("animate-pulse rounded-lg border border-border bg-panel", minHeight, className)} />;
  }
  if (isPro) return <>{children}</>;

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <div aria-hidden className="pointer-events-none select-none blur-[6px] saturate-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 p-6 text-center backdrop-blur-[2px]">
        <span className="flex size-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
          <Lock className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">{feature} is a DeepScreen Pro feature</p>
          <p className="num mt-1 text-xs text-muted-foreground">
            Unlock from ₹{PLANS[0]!.price}/week · ₹{PLANS[1]!.price}/month · ₹{PLANS[2]!.price}/year
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/pricing">
            <Sparkles className="size-4" /> Unlock Pro
          </Link>
        </Button>
      </div>
    </div>
  );
}

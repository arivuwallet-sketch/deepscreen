import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

/** Do not mount paid interactive tools until entitlement is resolved. */
export function ProAccess({ feature, children }: { feature: string; children: ReactNode }) {
  const { isPro, loading } = useSubscription();
  if (loading) return <div role="status" className="py-12 text-center text-sm text-muted-foreground">Checking Pro access…</div>;
  if (isPro) return <>{children}</>;
  return (
    <div className="flex min-h-60 flex-col items-center justify-center gap-4 border-y border-border px-5 py-12 text-center">
      <Lock className="size-6 text-primary" />
      <h2 className="text-xl font-semibold">{feature} requires DeepScreen Pro</h2>
      <Button asChild><Link to="/pricing"><Sparkles className="size-4" /> Unlock Pro</Link></Button>
    </div>
  );
}
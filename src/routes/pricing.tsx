import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Shell } from "@/components/ds/Shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PLANS, useSubscription, type Plan } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "DeepScreen Pro Pricing — ₹25 Weekly, ₹75 Monthly, ₹800 Yearly" },
      {
        name: "description",
        content:
          "Unlock DeepScreen Pro: 12-factor deep scores, DCF intrinsic value, target prices, stop-losses, portfolio risk matrix and event calendar.",
      },
      { property: "og:title", content: "DeepScreen Pro Pricing" },
      {
        property: "og:description",
        content: "Weekly ₹25, monthly ₹75 or annual ₹800 access to DeepScreen's full god-mode analysis engine.",
      },
    ],
  }),
  component: PricingPage,
});

const FREE = ["Search all 13,000+ listed companies", "Price, market cap and headline ratios", "Market news and economic calendar"];

const PRO = [
  "Full 12-factor deep score and verdict",
  "Automated DCF intrinsic-value calculator",
  "Target price, trim level and stop-loss",
  "Holding period and live sell alerts",
  "Portfolio health & risk matrix",
  "Earnings and dividend calendar",
  "Crypto SMC confirmed signals",
  "Every upcoming feature (IPOs, options chain)",
];

function PricingPage() {
  const { user } = useAuth();
  const { isPro, tier, expiresAt, refresh } = useSubscription();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  const start = async (plan: Plan) => {
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    setBusy(plan.tier);
    const expires = new Date();
    expires.setDate(expires.getDate() + plan.days);
    const { error } = await supabase.from("subscriptions").upsert({
      user_id: user.id,
      tier: plan.tier,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: expires.toISOString(),
    });
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
    toast.success(`${plan.name} activated — everything is unlocked.`);
  };

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <p className="num text-xs uppercase tracking-[0.25em] text-primary">DeepScreen Pro</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Unlock the full god-mode engine
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Search and headline data stay free forever. Pro opens the deep score, DCF valuation, targets,
            stop-losses, portfolio matrix and every feature we ship next.
          </p>
          {isPro && (
            <p className="num mt-4 inline-block rounded border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
              Active plan: {tier} · renews/expires {expiresAt?.slice(0, 10)}
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.tier}
              className={cn(
                "flex flex-col rounded-lg border bg-panel p-6",
                p.tier === "monthly" ? "border-primary/50 shadow-[0_0_0_1px_var(--primary)]" : "border-border",
              )}
            >
              {p.tier === "monthly" && (
                <span className="num mb-3 w-fit rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                  Most popular
                </span>
              )}
              <h2 className="text-sm font-semibold uppercase tracking-wide">{p.name}</h2>
              <p className="num mt-2 text-4xl font-bold">₹{p.price}</p>
              <p className="num mt-1 text-xs text-muted-foreground">{p.perMonth}</p>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.blurb}</p>
              <Button
                className="mt-5"
                variant={p.tier === "monthly" ? "default" : "outline"}
                disabled={busy !== null || (isPro && tier === p.tier)}
                onClick={() => void start(p)}
              >
                {isPro && tier === p.tier ? "Current plan" : busy === p.tier ? "Activating…" : `Get ${p.name}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-panel p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Free</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {FREE.map((f) => (
                <li key={f} className="flex gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-primary/30 bg-panel p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="size-4" /> Pro
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {PRO.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-bull" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Card checkout is not connected yet — activating a plan today enables Pro instantly on your account.{" "}
          <Link to="/auth" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to keep it across devices.
        </p>
      </div>
    </Shell>
  );
}

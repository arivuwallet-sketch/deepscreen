import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Shell } from "@/components/ds/Shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PLANS, useSubscription, type Plan } from "@/hooks/useSubscription";
import { confirmCheckout, createCheckout } from "@/lib/billing/billing.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "DeepScreen Pro Pricing — ₹25 Weekly, ₹75 Monthly, ₹800 Yearly" },
      {
        name: "description",
        content:
          "Unlock DeepScreen Pro: 12-factor deep scores, DCF & Graham valuation, Vision score, Secret Tips, forensic breakdowns, sell alerts and portfolio X-ray.",
      },
      { property: "og:title", content: "DeepScreen Pro Pricing" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content:
          "Weekly ₹25, monthly ₹75 or annual ₹800 access to DeepScreen's full god-mode analysis engine. Pay by UPI, card or netbanking via Cashfree.",
      },
    ],
  }),
  component: PricingPage,
});

const FREE = [
  "Search all 13,000+ listed companies with live prices",
  "Raw fundamental ratios (P/E, ROE, ROCE, P/B, D/E, ROA, PEG)",
  "Live IPO pipeline across every tracked exchange",
  "Company financials, news feed and economic calendar",
  "Basic peer comparison — raw metrics side by side",
];

const PRO = [
  "DeepScreen Verdict — 12-factor weighted score",
  "Holding period, target price, trim level & stop-loss",
  "Automated DCF and Graham intrinsic-value models",
  "Vision & Utility score (10–40 year hold horizon)",
  "Secret Tips badges — ROE traps, fortress balance sheets, smart-money flows",
  "God's Eye forensic breakdown — which Piotroski/Altman/Beneish checks failed",
  "Advanced ratios — margins, cash flow, EV/EBITDA, turnover & DuPont",
  "Contextual ratio insights on every metric card",
  "Portfolio X-Ray and cross-platform alerts",
];

function PricingPage() {
  const { user } = useAuth();
  const { isPro, tier, expiresAt, refresh } = useSubscription();
  const navigate = useNavigate();
  const [linkId, setLinkId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const checkout = useServerFn(createCheckout);
  const confirm = useServerFn(confirmCheckout);
  const confirmed = useRef<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("cf_link_id");
    if (q) setLinkId(q);
  }, []);

  useEffect(() => {
    if (!linkId || !user || confirmed.current === linkId) return;
    confirmed.current = linkId;
    setVerifying(true);
    void (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setVerifying(false);
        return;
      }
      const res = await confirm({ data: { linkId, accessToken } });
      setVerifying(false);
      window.history.replaceState({}, "", "/pricing");
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.paid) {
        refresh();
        toast.success("Payment received — DeepScreen Pro is unlocked.");
      } else {
        toast.error(`Payment not completed (${res.status}). Nothing was charged.`);
      }
    })();
  }, [linkId, user, confirm, refresh]);

  const start = async (plan: Plan) => {
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    setBusy(plan.tier);
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setBusy(null);
      toast.error("Please sign in again.");
      return;
    }
    const result = await checkout({
      data: { tier: plan.tier, accessToken, origin: window.location.origin },
    });
    if (!result.ok) {
      setBusy(null);
      toast.error(result.error);
      return;
    }
    window.location.href = result.url;
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
            Search, live prices, raw ratios, IPOs and news stay free forever. Pro opens the
            verdict, valuation models, forensic breakdowns, sell alerts and portfolio X-ray.
          </p>
          {verifying && (
            <p className="num mt-4 text-xs text-muted-foreground">Verifying your payment…</p>
          )}
          {isPro && (
            <p className="num mt-4 inline-block rounded border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
              Active plan: {tier} · expires {expiresAt?.slice(0, 10)}
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.tier}
              className={cn(
                "flex flex-col rounded-lg border bg-panel p-6",
                p.tier === "annual"
                  ? "border-primary/50 shadow-[0_0_0_1px_var(--primary)]"
                  : "border-border",
              )}
            >
              {p.badge && (
                <span className="num mb-3 w-fit rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                  {p.badge} · Most Popular
                </span>
              )}
              <h2 className="text-sm font-semibold uppercase tracking-wide">{p.name}</h2>
              <p className="num mt-2 text-4xl font-bold">₹{p.price}</p>
              <p className="num mt-1 text-xs font-medium text-primary">{p.perMonth}</p>
              <p className="mt-2 text-xs italic text-muted-foreground/80">{p.anchorQuote}</p>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.blurb}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-bull" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5"
                variant={p.tier === "annual" ? "default" : "outline"}
                disabled={busy !== null || verifying}
                onClick={() => void start(p)}
              >
                {isPro && tier === p.tier
                  ? "Extend plan"
                  : busy === p.tier
                    ? "Opening checkout…"
                    : `Get ${p.name}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-panel p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Free forever
            </h3>
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
          Secure checkout by Cashfree — UPI, RuPay, netbanking, wallets and international cards.{" "}
          <Link to="/auth" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to keep your plan across devices.
        </p>
      </div>
    </Shell>
  );
}

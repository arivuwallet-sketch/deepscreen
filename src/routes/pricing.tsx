import { jsonLd } from "@/lib/seo/json-ld";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronRight, Lock, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { metaKeywords, screenerKeywords, stocksKeywords } from "@/lib/seo/keywords";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PLANS, useSubscription, type Plan } from "@/hooks/useSubscription";
import { confirmCheckout, createCheckout } from "@/lib/billing/billing.functions";
import { FEATURE_COMPARISON, FREE_FEATURES, PRO_FEATURES } from "@/lib/billing/features";
import { openCashfreeCheckout } from "@/lib/billing/cashfree-sdk";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  countryFlag,
  getPhoneCountry,
  normalizeNationalPhone,
  validatePhoneNumber,
} from "@/lib/billing/phone";

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "DeepScreen Pro Pricing — ₹50 Weekly, ₹175 Monthly, ₹1800 Yearly" },
      {
        name: "description",
        content:
          "Compare DeepScreen Free vs Pro. Free includes company search, core ratios, public research and basic DeepChart. Pro unlocks the 13-factor verdict, DeepChart trade plans, Options Strategy Lab analytics, valuation models, alerts and Portfolio X-Ray.",
      },
      { name: "keywords", content: metaKeywords(screenerKeywords, stocksKeywords) },
      { property: "og:title", content: "DeepScreen Pro Pricing" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DeepScreen Pro Pricing — ₹50 Weekly, ₹175 Monthly, ₹1800 Yearly" },
      { name: "twitter:description", content: "Compare weekly, monthly and yearly DeepScreen Pro plans." },
      {
        property: "og:description",
        content:
          "Weekly ₹50, monthly ₹175 or annual ₹1800 access to DeepScreen's full god-mode analysis engine. Pay by UPI, card or netbanking via Cashfree.",
      },
      { property: "og:url", content: "https://deepscreen.online/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "DeepScreen Pro",
          url: "https://deepscreen.online/pricing",
          description:
            "DeepScreen Pro unlocks the 13-factor verdict, advanced DeepChart analysis and trade plans, Options Strategy Lab analytics, DCF and Graham valuation, forensic breakdowns, research alerts and Portfolio X-Ray.",
          brand: { "@type": "Brand", name: "DeepScreen" },
          offers: [
            {
              "@type": "Offer",
              name: "Weekly",
              price: "50",
              priceCurrency: "INR",
              url: "https://deepscreen.online/pricing",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              name: "Monthly",
              price: "175",
              priceCurrency: "INR",
              url: "https://deepscreen.online/pricing",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              name: "Yearly",
              price: "1800",
              priceCurrency: "INR",
              url: "https://deepscreen.online/pricing",
              availability: "https://schema.org/InStock",
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://deepscreen.online/" },
            { "@type": "ListItem", position: 2, name: "Pricing", item: "https://deepscreen.online/pricing" },
          ],
        }),
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { user } = useAuth();
  const { isPro, tier, expiresAt, refresh } = useSubscription();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationAttempt, setVerificationAttempt] = useState(0);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_PHONE_COUNTRY);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const checkout = useServerFn(createCheckout);
  const confirm = useServerFn(confirmCheckout);
  const confirmed = useRef<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("cf_order_id");
    if (q) setOrderId(q);
  }, []);

  useEffect(() => {
    if (!orderId || !user || confirmed.current === orderId) return;
    confirmed.current = orderId;
    setVerifying(true);
    void (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          toast.error("Please sign in again, then retry payment verification.");
          return;
        }
        const res = await confirm({ data: { orderId, accessToken } });
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        if (res.paid) {
          const url = new URL(window.location.href);
          url.searchParams.delete("cf_order_id");
          window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
          setOrderId(null);
          refresh();
          toast.success("Payment received — DeepScreen Pro is unlocked.");
        } else {
          toast.info(`Payment is not confirmed yet (${res.status}). If you already paid, retry verification; do not pay again.`);
        }
      } catch {
        toast.error("Payment verification is temporarily unavailable. If you already paid, retry verification; do not pay again.");
      } finally {
        setVerifying(false);
      }
    })();
  }, [orderId, user, confirm, refresh, verificationAttempt]);

  const start = (plan: Plan) => {
    if (!user) {
      window.localStorage.setItem("deepscreen_auth_redirect", "/pricing");
      window.location.assign("/auth?redirect=%2Fpricing");
      return;
    }
    setPhoneCountry(DEFAULT_PHONE_COUNTRY);
    setPhone("");
    setPhoneError("");
    setCheckoutPlan(plan);
  };

  const submitCheckout = async () => {
    if (!checkoutPlan) return;
    const country = getPhoneCountry(phoneCountry);
    if (!country) {
      setPhoneError("Select a valid country calling code.");
      return;
    }

    const normalizedPhone = normalizeNationalPhone(phone, country);
    setPhone(normalizedPhone);
    const validation = validatePhoneNumber(country.iso2, normalizedPhone);
    if (!validation.valid) {
      setPhoneError(validation.error);
      return;
    }

    setPhoneError("");
    setBusy(checkoutPlan.tier);
    const selectedPlan = checkoutPlan;

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setBusy(null);
      toast.error("Please sign in again.");
      return;
    }

    const result = await checkout({
      data: {
        tier: selectedPlan.tier,
        accessToken,
        origin: window.location.origin,
        countryIso2: country.iso2,
        phone: validation.digits,
      },
    });

    if (!result.ok) {
      setBusy(null);
      toast.error(result.error);
      return;
    }

    setCheckoutPlan(null);

    try {
      await openCashfreeCheckout(result.paymentSessionId);
      setVerifying(true);
      const confirmation = await confirm({ data: { orderId: result.orderId, accessToken } });
      setVerifying(false);
      setBusy(null);

      if (!confirmation.ok) {
        toast.error(confirmation.error);
        return;
      }
      if (confirmation.paid) {
        refresh();
        toast.success("Payment received — DeepScreen Pro is unlocked.");
      } else {
        toast.info("Checkout closed before payment was confirmed. You can try again from the plan card.");
      }
    } catch (e) {
      setBusy(null);
      setVerifying(false);
      toast.error(e instanceof Error ? e.message : "Payment could not be started.");
    }
  };

  const phoneHelperText = () => {
    const country = getPhoneCountry(phoneCountry);
    if (!country) return "Select a country and enter your phone number.";
    if (country.minLength === country.maxLength) {
      return country.minLength + " digits for " + country.name + ". Spaces and hyphens are optional.";
    }
    return "Enter your national phone number for " + country.name + ". Spaces and hyphens are optional.";
  };

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <p className="num text-xs uppercase tracking-[0.25em] text-primary">DeepScreen Pro</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Free research. Pro-grade analysis when you need it.
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            DeepScreen Free keeps the public research layer open: company search, core ratios, market
            guides, news, calendars and the basic DeepChart chart. Pro unlocks model-derived outputs:
            the 13-factor verdict, advanced DeepChart reading and trade plan, Options Strategy Lab
            analytics, valuation models, alerts and Portfolio X-Ray.
          </p>
          {verifying && (
            <p className="num mt-4 text-xs text-muted-foreground">Verifying your payment…</p>
          )}
          {orderId && user && !verifying && (
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                confirmed.current = null;
                setVerificationAttempt((attempt) => attempt + 1);
              }}
            >
              Retry payment verification
            </Button>
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
                "relative flex flex-col rounded-lg border bg-panel p-6",
                p.tier === "annual"
                  ? "border-primary/70 bg-primary/5 shadow-[0_0_24px_-8px_var(--primary)]"
                  : "border-border",
              )}
            >
              {p.badge && (
                <span className="num mb-3 w-fit rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                  {p.badge}
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
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Useful public research stays available without a paid subscription.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="size-4" /> DeepScreen Pro
            </h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              All paid durations unlock the same Pro feature set; only the access period changes.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-bull" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="mt-10 overflow-hidden rounded-lg border border-border bg-panel" aria-labelledby="feature-comparison-heading">
          <div className="border-b border-border px-5 py-4">
            <p className="num text-xs uppercase tracking-[0.18em] text-primary">Feature access</p>
            <h2 id="feature-comparison-heading" className="mt-1 text-xl font-semibold">Free vs Pro</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Free keeps discovery and education open. Pro gates advanced derived analytics, trade-plan outputs and portfolio intelligence.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-border bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Feature</th>
                  <th className="px-5 py-3">Free</th>
                  <th className="px-5 py-3 text-primary">Pro</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((row) => (
                  <tr key={row.name} className="border-b border-border/60 last:border-0">
                    <th scope="row" className="px-5 py-3.5 font-medium">{row.name}</th>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {row.free === true ? (
                        <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-bull" /> Included</span>
                      ) : row.free === false ? (
                        <span className="inline-flex items-center gap-1.5"><Lock className="size-3.5" /> Pro only</span>
                      ) : row.free}
                    </td>
                    <td className="px-5 py-3.5">
                      {row.pro === true ? (
                        <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-bull" /> Included</span>
                      ) : row.pro === false ? "—" : row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Secure checkout by Cashfree — UPI, RuPay, netbanking, wallets and international cards.{" "}
          <Link to="/auth" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to keep your plan across devices.
        </p>
      </div>
      <Dialog open={checkoutPlan !== null} onOpenChange={(open) => !open && busy === null && setCheckoutPlan(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto overflow-x-hidden border-border/80 bg-background p-0 shadow-2xl sm:max-w-lg">
          <div className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-background px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
            <DialogHeader className="text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                    <Smartphone className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="text-lg sm:text-xl">Secure checkout</DialogTitle>
                    <DialogDescription className="mt-1.5 max-w-xl text-xs leading-relaxed sm:text-sm">
                      Select your country code and enter your national phone number. The country code is shown once and never counted as part of the number.
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6">
            {checkoutPlan && (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-panel px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Selected plan</p>
                  <p className="mt-1 truncate text-sm font-semibold">{checkoutPlan.name}</p>
                </div>
                <p className="num shrink-0 text-lg font-bold sm:text-xl">₹{checkoutPlan.price}</p>
              </div>
            )}

            <div>
              <Label htmlFor="checkout-country" className="text-sm font-medium">Phone number</Label>
              <div className={cn(
                "mt-2 grid min-w-0 grid-cols-[minmax(118px,42%)_minmax(0,1fr)] overflow-hidden rounded-xl border bg-background transition-colors",
                phoneError ? "border-destructive ring-1 ring-destructive/20" : "border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20",
              )}>
                <div className="min-w-0 border-r border-border bg-muted/30 p-1">
                  <Select
                    value={phoneCountry}
                    onValueChange={(value) => {
                      setPhoneCountry(value);
                      setPhone("");
                      setPhoneError("");
                    }}
                  >
                    <SelectTrigger
                      id="checkout-country"
                      aria-label="Country and calling code"
                      className="h-10 w-full min-w-0 border-0 bg-transparent px-2 shadow-none focus:ring-0 sm:px-3"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-base" aria-hidden="true">{countryFlag(phoneCountry)}</span>
                        <span className="num truncate font-semibold text-foreground">
                          {getPhoneCountry(phoneCountry)?.dialCode ?? "+"}
                        </span>
                      </span>
                    </SelectTrigger>
                    <SelectContent className="z-[100] max-h-72 w-[min(24rem,calc(100vw-2rem))]">
                      {PHONE_COUNTRIES.map((country) => (
                        <SelectItem key={country.iso2} value={country.iso2}>
                          <span className="flex items-center gap-2">
                            <span aria-hidden="true">{countryFlag(country.iso2)}</span>
                            <span className="min-w-0 flex-1 truncate">{country.name}</span>
                            <span className="num shrink-0 text-muted-foreground">{country.dialCode}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  id="checkout-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  maxLength={getPhoneCountry(phoneCountry)?.maxLength ?? 15}
                  value={phone}
                  onChange={(e) => {
                    const country = getPhoneCountry(phoneCountry);
                    if (!country) return;
                    setPhone(normalizeNationalPhone(e.target.value, country));
                    if (phoneError) setPhoneError("");
                  }}
                  onBlur={() => {
                    const country = getPhoneCountry(phoneCountry);
                    if (!country || !phone) return;
                    const validation = validatePhoneNumber(country.iso2, phone);
                    setPhoneError(validation.valid ? "" : validation.error);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void submitCheckout();
                    }
                  }}
                  placeholder="Enter phone number"
                  aria-invalid={phoneError ? true : undefined}
                  aria-describedby="checkout-phone-help"
                  className="h-12 min-w-0 rounded-none border-0 bg-transparent px-3 text-base shadow-none focus-visible:ring-0 sm:px-4"
                />
              </div>

              <div id="checkout-phone-help" className="mt-2 flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <p className={cn("text-xs leading-relaxed", phoneError ? "text-destructive" : "text-muted-foreground")}>
                  {phoneError || phoneHelperText()}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0 text-primary" />
                <p className="text-xs font-semibold">Secure payment flow</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Your phone number is used to create the Cashfree payment order. Cashfree handles the payment details in its secure checkout.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCheckoutPlan(null)}
              disabled={busy !== null}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submitCheckout()}
              disabled={busy !== null || verifying || !checkoutPlan}
              className="w-full sm:w-auto sm:min-w-44"
            >
              {busy ? (
                "Opening secure checkout…"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Continue to payment
                  <ChevronRight className="size-4" />
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TopicIndex ids={["screener"]} title={"What you can screen for on any DeepScreen plan"} />
    </Shell>
  );
}

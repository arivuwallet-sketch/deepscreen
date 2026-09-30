import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  isSubscriptionActive,
  MAX_EXPIRY_TIMER_MS,
  subscriptionExpiryDelay,
} from "@/lib/billing/subscription-entitlement";
import { useAuth } from "./useAuth";

export type Tier = "weekly" | "monthly" | "annual";

export interface Plan {
  tier: Tier;
  name: string;
  price: number;
  days: number;
  blurb: string;
  perMonth: string;
  anchorQuote: string;
  features: string[];
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    tier: "weekly",
    name: "Weekly Plan",
    price: 50,
    days: 7,
    perMonth: "₹50 / week",
    anchorQuote: "🍪 The cost of one packet of biscuits.",
    features: ["Standard Pro Features", "Real-Time Alerts", "Basic Screener"],
    blurb: "Try the full god-mode engine for a week — every metric unlocked.",
  },
  {
    tier: "monthly",
    name: "Monthly Plan",
    price: 175,
    days: 30,
    perMonth: "₹175 / month",
    anchorQuote: "🍿 The price of a single movie ticket.",
    features: ["Standard Pro Features", "Real-Time Alerts", "Basic Screener"],
    blurb: "The everyday plan: deep scores, DCF, portfolio matrix and alerts.",
  },
  {
    tier: "annual",
    name: "Yearly Plan",
    price: 1800,
    days: 365,
    perMonth: "Only ₹150/month!",
    anchorQuote: "📺 Cheaper than your yearly Netflix plan, but it actually makes you smarter.",
    features: ["All Pro Features", "Priority Support", "Beta Access", "Advanced Forensic Badges"],
    badge: "Most Popular",
    blurb: "Best value. A full year of DeepScreen Pro plus every upcoming feature.",
  },
];

export interface SubscriptionState {
  isPro: boolean;
  tier: Tier | null;
  expiresAt: string | null;
  loading: boolean;
  signedIn: boolean;
  refresh: () => void;
}

type SubscriptionRow = {
  tier: Tier;
  expires_at: string;
  status: string;
};

export function useSubscription(): SubscriptionState {
  const { user, loading: authLoading } = useAuth();
  const [row, setRow] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRow(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    const nowIso = new Date().toISOString();

    supabase
      .from("subscriptions")
      .select("tier, expires_at, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gt("expires_at", nowIso)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const candidate = data
          ? {
              tier: data.tier as Tier,
              expires_at: data.expires_at,
              status: data.status,
            }
          : null;
        setRow(isSubscriptionActive(candidate) ? candidate : null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, authLoading, nonce]);

  // Lock paid features at the exact end time even if the user leaves a page
  // open continuously. Long plans are re-armed in browser-safe timer chunks.
  useEffect(() => {
    if (!row) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      const remaining = subscriptionExpiryDelay(row.expires_at);
      if (remaining <= 0) {
        setRow(null);
        return;
      }
      timer = setTimeout(arm, Math.min(remaining + 25, MAX_EXPIRY_TIMER_MS));
    };
    arm();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [row]);

  // Revalidate against the database whenever the tab becomes active again.
  // This catches server-side cancellations and expiries that happened while
  // the browser was asleep/suspended.
  useEffect(() => {
    if (!user) return;
    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user, refresh]);

  return {
    isPro: isSubscriptionActive(row),
    tier: isSubscriptionActive(row) ? row?.tier ?? null : null,
    expiresAt: isSubscriptionActive(row) ? row?.expires_at ?? null : null,
    loading: authLoading || loading,
    signedIn: !!user,
    refresh,
  };
}

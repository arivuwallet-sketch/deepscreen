import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
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

export function useSubscription(): SubscriptionState {
  const { user, loading: authLoading } = useAuth();
  const [row, setRow] = useState<{ tier: Tier; expires_at: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRow(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    supabase
      .from("subscriptions")
      .select("tier, expires_at, status")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setRow(
          data && data.status === "active" && new Date(data.expires_at) > new Date()
            ? { tier: data.tier as Tier, expires_at: data.expires_at }
            : null,
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, authLoading, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return {
    isPro: row !== null,
    tier: row?.tier ?? null,
    expiresAt: row?.expires_at ?? null,
    loading: authLoading || loading,
    signedIn: !!user,
    refresh,
  };
}

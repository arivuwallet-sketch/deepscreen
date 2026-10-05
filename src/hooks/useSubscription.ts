import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  entitlementFromPaidOrders,
  hasPaidOrderHistory,
  isSubscriptionActive,
  MAX_EXPIRY_TIMER_MS,
  subscriptionExpiryDelay,
  type PaidSubscriptionOrder,
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
    features: [
      "All DeepScreen Pro features",
      "DeepChart Pro analysis & trade plans",
      "Options Strategy Lab analytics",
      "Portfolio X-Ray & research alerts",
    ],
    blurb: "Try every Pro research feature for 7 days with the same access as the longer plans.",
  },
  {
    tier: "monthly",
    name: "Monthly Plan",
    price: 175,
    days: 30,
    perMonth: "₹175 / month",
    anchorQuote: "🍿 The price of a single movie ticket.",
    features: [
      "All DeepScreen Pro features",
      "DeepChart Pro analysis & trade plans",
      "Options Strategy Lab analytics",
      "Portfolio X-Ray & research alerts",
    ],
    blurb: "Full Pro access for 30 days: deep scores, valuation, advanced chart analysis and portfolio tools.",
  },
  {
    tier: "annual",
    name: "Yearly Plan",
    price: 1800,
    days: 365,
    perMonth: "Only ₹150/month!",
    anchorQuote: "📺 Cheaper than your yearly Netflix plan, but it actually makes you smarter.",
    features: [
      "All DeepScreen Pro features",
      "DeepChart Pro analysis & trade plans",
      "Options Strategy Lab analytics",
      "Portfolio X-Ray & research alerts",
      "Priority support & beta feature access",
    ],
    badge: "Best Value",
    blurb: "Full Pro access for 365 days at the lowest effective monthly price.",
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

  // Keep this hook's top-level hook sequence stable. Stock pages also call
  // React Query hooks immediately after useSubscription(), and changing the
  // number/order of hooks inside this custom hook can corrupt an already-mounted
  // Vite/React Fast Refresh tree (the updateReducerImpl "reading next" crash).
  // Expiry timing, focus revalidation and all database reads therefore live in
  // this single effect rather than adding/removing separate hooks over time.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRow(null);
      setLoading(false);
      return;
    }

    let active = true;
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;

    const clearExpiryTimer = () => {
      if (expiryTimer) {
        clearTimeout(expiryTimer);
        expiryTimer = undefined;
      }
    };

    const armExpiry = (expiresAt: string) => {
      clearExpiryTimer();
      const remaining = subscriptionExpiryDelay(expiresAt);
      if (remaining <= 0) {
        setRow(null);
        return;
      }

      expiryTimer = setTimeout(() => {
        if (!active) return;
        const nextRemaining = subscriptionExpiryDelay(expiresAt);
        if (nextRemaining <= 0) {
          setRow(null);
          // Re-read once at the boundary in case a legitimate extension was
          // purchased on another device while this tab stayed open.
          setNonce((n) => n + 1);
          return;
        }
        armExpiry(expiresAt);
      }, Math.min(remaining + 25, MAX_EXPIRY_TIMER_MS));
    };

    const revalidate = () => setNonce((n) => n + 1);
    const onVisibility = () => {
      if (document.visibilityState === "visible") revalidate();
    };

    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", onVisibility);

    setLoading(true);
    const nowIso = new Date().toISOString();

    // Read both the current subscription row and the user's immutable paid-order
    // ledger. For accounts that have paid orders, the ledger is authoritative:
    // it prevents a historically over-extended subscriptions.expires_at value
    // from keeping Pro unlocked after the actual purchased duration ended.
    void Promise.all([
      supabase
        .from("subscriptions")
        .select("tier, expires_at, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("expires_at", nowIso)
        .maybeSingle(),
      supabase
        .from("payment_orders")
        .select("tier, status, created_at, paid_at, entitlement_expires_at")
        .eq("user_id", user.id)
        .eq("status", "paid")
        .order("created_at", { ascending: true }),
    ]).then(([subscriptionResult, ordersResult]) => {
      if (!active) return;

      const paidOrders = (ordersResult.data ?? []) as PaidSubscriptionOrder[];
      let nextRow: SubscriptionRow | null = null;

      if (!ordersResult.error && hasPaidOrderHistory(paidOrders)) {
        const ledger = entitlementFromPaidOrders(paidOrders);
        nextRow = ledger
          ? { tier: ledger.tier, expires_at: ledger.expires_at, status: ledger.status }
          : null;
      } else {
        const data = subscriptionResult.data;
        const candidate = data
          ? {
              tier: data.tier as Tier,
              expires_at: data.expires_at,
              status: data.status,
            }
          : null;
        nextRow = isSubscriptionActive(candidate) ? candidate : null;
      }

      setRow(nextRow);
      setLoading(false);
      if (nextRow) armExpiry(nextRow.expires_at);
    });

    return () => {
      active = false;
      clearExpiryTimer();
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user, authLoading, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  const active = isSubscriptionActive(row);

  return {
    isPro: active,
    tier: active ? row?.tier ?? null : null,
    expiresAt: active ? row?.expires_at ?? null : null,
    loading: authLoading || loading,
    signedIn: !!user,
    refresh,
  };
}

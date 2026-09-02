import { useCallback } from "react";

export type Tier = "weekly" | "monthly" | "annual";

export interface Plan {
  tier: Tier;
  name: string;
  price: number;
  days: number;
  blurb: string;
  perMonth: string;
}

export const PLANS: Plan[] = [
  {
    tier: "weekly",
    name: "Weekly Pass",
    price: 25,
    days: 7,
    perMonth: "₹100 / mo equivalent",
    blurb: "Try the full god-mode engine for a week — every metric unlocked.",
  },
  {
    tier: "monthly",
    name: "Monthly Plan",
    price: 75,
    days: 30,
    perMonth: "₹75 / mo",
    blurb: "The everyday plan: deep scores, DCF, portfolio matrix and alerts.",
  },
  {
    tier: "annual",
    name: "Annual Plan",
    price: 800,
    days: 365,
    perMonth: "₹66 / mo — save 11%",
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
  const refresh = useCallback(() => {}, []);

  // Paywall disabled — everyone is Pro.
  return {
    isPro: true,
    tier: "annual",
    expiresAt: null,
    loading: false,
    signedIn: true,
    refresh,
  };
}

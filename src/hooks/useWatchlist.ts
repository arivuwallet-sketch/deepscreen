import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { findStock } from "@/lib/deepscreen/stocks";
import type { Stock } from "@/lib/deepscreen/types";
import { useAuth } from "./useAuth";

/** Watchlist rows resolved to screener stocks. */
export function useWatchlist() {
  const { user, loading: authLoading } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setStocks([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    void supabase
      .from("watchlist")
      .select("exchange, symbol")
      .then(({ data }) => {
        if (!active) return undefined;
        const rows = (data ?? [])
          .map((r) => findStock(r.exchange, r.symbol))
          .filter((s): s is Stock => Boolean(s));
        setStocks(rows);
        setLoading(false);
        return undefined;
      });
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  return { stocks, loading: loading || authLoading, signedIn: Boolean(user) };
}

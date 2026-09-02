import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PineScriptPurchaseState {
  purchased: boolean;
  downloadCount: number;
  loading: boolean;
  signedIn: boolean;
  refresh: () => void;
}

export function usePineScriptPurchase(): PineScriptPurchaseState {
  const { user, loading: authLoading } = useAuth();
  const [row, setRow] = useState<{ status: string; download_count: number } | null>(null);
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
      .from("pine_script_purchases")
      .select("status, download_count")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setRow(data);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, authLoading, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return {
    purchased: row?.status === "active",
    downloadCount: row?.download_count ?? 0,
    loading: authLoading || loading,
    signedIn: !!user,
    refresh,
  };
}

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Stock } from "@/lib/deepscreen/types";

export function WatchlistButton({ stock }: { stock: Stock }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tracked, setTracked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setTracked(false);
      return;
    }
    let active = true;
    void supabase
      .from("watchlist")
      .select("id")
      .eq("exchange", stock.exchange)
      .eq("symbol", stock.symbol)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setTracked(Boolean(data));
        return undefined;
      });
    return () => {
      active = false;
    };
  }, [user, stock.exchange, stock.symbol]);

  async function toggle(): Promise<void> {
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    if (tracked) {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("exchange", stock.exchange)
        .eq("symbol", stock.symbol);
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      setTracked(false);
      toast.success(`${stock.symbol} removed from My Stocks`);
      return;
    }
    const { error } = await supabase.from("watchlist").insert({
      user_id: user.id,
      exchange: stock.exchange,
      symbol: stock.symbol,
      name: stock.name,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTracked(true);
    toast.success(`${stock.symbol} added to My Stocks`);
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={tracked ? "secondary" : "outline"}
      onClick={toggle}
      disabled={busy || loading}
    >
      <Heart className={tracked ? "size-4 fill-current text-primary" : "size-4"} />
      {tracked ? "In My Stocks" : "Add to My Stocks"}
    </Button>
  );
}

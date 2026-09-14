import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

const KEY = "deepscreen_stock_views";

export function StockSignupPrompt() {
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading || user) return;
    const views = Number(window.localStorage.getItem(KEY) || "0") + 1;
    window.localStorage.setItem(KEY, String(views));
    setVisible(views >= 3);
  }, [loading, user]);

  if (!visible || user) return null;
  return (
    <aside className="mt-8 flex flex-col gap-4 rounded-lg border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold">Keep your research organised</h2>
        <p className="mt-1 text-sm text-muted-foreground">Create a free account to save watchlists, alerts and portfolio holdings. Stock ratios, scores and verdicts remain open.</p>
      </div>
      <Link to="/auth" className="shrink-0 rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">Create free account</Link>
    </aside>
  );
}
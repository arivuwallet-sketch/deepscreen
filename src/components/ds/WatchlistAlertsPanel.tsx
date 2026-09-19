import { useEffect, useMemo, useState } from "react";
import type { LiveFundamentals } from "@/lib/market/yahoo.server";
import type { Stock } from "@/lib/deepscreen/types";
import type { Analysis } from "@/lib/deepscreen/metrics";
import { buildWatchlistAlerts, readAlertHistory } from "@/lib/deepscreen/watchlist-alerts";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  stock: Stock;
  analysis: Analysis;
  fundamentals?: LiveFundamentals | null;
};

export function WatchlistAlertsPanel({ rows }: { rows: Row[] }) {
  const [notification, setNotification] = useState<"default" | "granted" | "denied">("default");
  const [refreshKey, setRefreshKey] = useState(0);

  const alerts = useMemo(() => {
    void refreshKey;
    return buildWatchlistAlerts(rows);
  }, [rows, refreshKey]);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    setNotification(Notification.permission);
  }, []);

  useEffect(() => {
    if (notification !== "granted" || !alerts.length) return;
    const sentKey = "deepscreen:browser-alerts:v1:" + alerts.map((a) => a.id).sort().join("|");
    try {
      if (sessionStorage.getItem(sentKey)) return;
      new Notification("DeepScreen watchlist alert", {
        body: alerts.slice(0, 2).map((a) => a.symbol + ": " + a.title).join(" · "),
        tag: sentKey,
      });
      sessionStorage.setItem(sentKey, "1");
    } catch {
      // Browser notifications can fail silently in restricted environments.
    }
  }, [alerts, notification]);

  async function enableNotifications(): Promise<void> {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotification(result);
  }

  const historyCount = Math.max(
    0,
    rows.reduce(
      (sum, row) => sum + readAlertHistory(row.stock.exchange, row.stock.symbol).length,
      0,
    ),
  );
  const hasFiveYearMedian = rows.some(
    (row) => readAlertHistory(row.stock.exchange, row.stock.symbol).length >= 20,
  );
  const indianRows = rows.filter((row) => row.stock.exchange === "NSE" || row.stock.exchange === "BSE").length;

  return (
    <section className="mt-6 rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Watchlist alerts</h2>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-muted-foreground">
            DeepScreen checks your My Stocks watchlist when fresh quarterly fundamentals are available.
            Alerts are evaluated locally, so no paid alert-data service is required.
          </p>
        </div>
        {typeof Notification !== "undefined" ? (
          <Button type="button" variant="outline" size="sm" onClick={enableNotifications} disabled={notification === "granted"}>
            {notification === "granted" ? <Bell className="mr-2 size-4" /> : <BellOff className="mr-2 size-4" />}
            {notification === "granted" ? "Browser alerts on" : "Enable browser alerts"}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-border p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Active alerts</div>
          <div className="num mt-1 text-lg font-semibold">{alerts.length}</div>
        </div>
        <div className="rounded border border-border p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Quarterly baselines</div>
          <div className="num mt-1 text-lg font-semibold">{historyCount}</div>
        </div>
        <div className="rounded border border-border p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">5Y P/E coverage</div>
          <div className="mt-1 text-sm font-semibold">{hasFiveYearMedian ? "Available" : "Collecting"}</div>
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "rounded border p-3",
                alert.tone === "attention" && "border-bear/30 bg-bear/5",
                alert.tone === "context" && "border-warn/30 bg-warn/5",
                alert.tone === "positive" && "border-bull/30 bg-bull/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">{alert.symbol}: {alert.title}</span>
                <span className="text-[9px] uppercase tracking-wide text-muted-foreground">New</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{alert.detail}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground">
          No new watchlist alerts in the latest quarterly comparison. DeepScreen is monitoring ROCE,
          debt, growth, free cash flow, P/E history, and promoter-pledge data where a live source exists.
        </div>
      )}

      {(indianRows > 0 && alerts.some((alert) => alert.title === "Promoter pledge increased") === false) ? (
        <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
          Promoter-pledge alerts are prepared in the alert engine, but the current per-company feed does not
          yet expose the pledged-share percentage needed to fire that alert. It will remain inactive rather
          than using an estimated value.
        </p>
      ) : null}

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        Browser alerts require permission and only notify while the browser can run DeepScreen code.
        Email and background server-side alerts require a separate scheduled delivery service.
      </p>
    </section>
  );
}

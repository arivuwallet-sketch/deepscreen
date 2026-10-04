import { useQuery } from "@tanstack/react-query";
import { getOptionsContext } from "@/lib/market/options-context.functions";
import { HistoryChart } from "./HistoryChart";
export function useOptionsContext(market: string, code: string) {
  return useQuery({
    queryKey: ["options-market-context", market, code],
    queryFn: () => getOptionsContext({ data: { market, code } }),
    staleTime: 55000,
    refetchInterval: 60000,
    retry: 1,
  });
}
export function OptionsMarketContext({
  market,
  code,
  days = 30,
  assumedVol = 28,
  onUseVol,
}: {
  market: string;
  code: string;
  days?: number;
  assumedVol?: number;
  onUseVol?: (value: number) => void;
}) {
  const { data, isFetching, isError, refetch } = useOptionsContext(market, code);
  const vol = data?.volatility20;
  const move =
    data?.price != null && vol != null ? ((data.price * vol) / 100) * Math.sqrt(days / 365) : null;
  return (
    <section className="my-8 rounded-xl border border-border bg-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Underlying market data · {code}</h2>
        <button
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          {isFetching ? "Refreshing…" : "Refresh market data"}
        </button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Dated provider price and daily history, refreshed every minute. Historical volatility
        measures past price movement; it is not option-chain implied volatility.
      </p>
      {!data ? (
        <p className="mt-4 text-sm" role="status">
          {isError ? "Market data is temporarily unavailable." : "Loading provider observations…"}
        </p>
      ) : (
        <>
          {data.error && (
            <p role="status" className="mt-4 text-sm">
              The provider did not return usable data. No sample market prices are substituted.
            </p>
          )}
          <dl className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              [
                "Provider spot",
                data.price === null ? "Unavailable" : `${data.currency} ${data.price.toFixed(2)}`,
              ],
              [
                "20-session realized volatility",
                vol == null ? "Unavailable" : `${vol.toFixed(2)}%`,
              ],
              [
                "60-session realized volatility",
                data.volatility60 === null ? "Unavailable" : `${data.volatility60.toFixed(2)}%`,
              ],
              ["Assumed model volatility", `${assumedVol.toFixed(1)}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-2 break-words font-mono text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Quote time: {data.asOf?.replace("T", " ").slice(0, 19) ?? "Unavailable"}{" "}
            {data.asOf ? "UTC" : ""} · History through{" "}
            {data.points.at(-1)
              ? new Date(data.points.at(-1)!.at).toISOString().slice(0, 10)
              : "Unavailable"}
            . Quotes may be delayed or from the last session.
          </p>
          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            Yahoo Finance source ↗
          </a>
          {vol != null && vol >= 5 && vol <= 120 && onUseVol && (
            <button
              type="button"
              onClick={() => onUseVol(Number(vol.toFixed(2)))}
              className="ml-4 mt-3 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              Use historical volatility as scenario
            </button>
          )}
          {move !== null && (
            <p className="mt-4 text-sm leading-relaxed">
              At the observed 20-session volatility, a {days}-calendar-day one-standard-deviation
              move approximation is ±{move.toFixed(2)} {data.currency}. This square-root-of-time
              scenario is not a price target or a reliable probability bound; jumps and volatility
              changes can exceed it.
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Realized volatility uses the sample standard deviation of daily log returns, annualized
            by √252.{" "}
            <a
              href="https://www.optionseducation.org/referencelibrary/faq/technical-information"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Historical versus implied volatility ↗
            </a>
          </p>
          <HistoryChart
            points={data.points}
            label={`Underlying adjusted-price history (${data.currency || "source currency"})`}
          />
        </>
      )}
    </section>
  );
}

import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { searchStocks } from "@/lib/deepscreen/stocks";
import { formatPrice } from "@/lib/deepscreen/format";
import { cn } from "@/lib/utils";

export function SearchBar({ className, placeholder }: { className?: string; placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchStocks(query), [query]);

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder ?? "Search any stock — RELIANCE, AAPL, Shell plc…"}
        className="h-11 w-full rounded-md border border-border bg-panel pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
        aria-label="Search stocks"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-xl">
          {results.map((s) => (
            <li key={`${s.exchange}-${s.symbol}`}>
              <Link
                to="/stock/$exchange/$symbol"
                params={{ exchange: s.exchange, symbol: s.symbol }}
                className="flex items-center justify-between gap-3 rounded px-3 py-2 text-sm hover:bg-accent"
              >
                <span className="min-w-0">
                  <span className="num font-semibold text-primary">{s.symbol}</span>
                  <span className="ml-2 truncate text-muted-foreground">{s.name}</span>
                </span>
                <span className="num shrink-0 text-xs text-muted-foreground">
                  {s.exchange} · {formatPrice(s.price, s.exchange)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

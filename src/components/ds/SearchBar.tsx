import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { searchStocks } from "@/lib/deepscreen/stocks";
import { formatPrice } from "@/lib/deepscreen/format";
import { cn } from "@/lib/utils";
import type { Stock } from "@/lib/deepscreen/types";

export function SearchBar({ className, placeholder }: { className?: string; placeholder?: string }) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchStocks(query), [query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const go = (s: Stock) => {
    setOpen(false);
    setQuery("");
    void navigate({
      to: "/stock/$exchange/$symbol",
      params: { exchange: s.exchange, symbol: s.symbol },
    });
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!results.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % results.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + results.length) % results.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            const pick = results[active] ?? results[0];
            if (pick) go(pick);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder ?? "Search any stock — RELIANCE, AAPL, Shell plc…"}
        className="h-11 w-full rounded-md border border-border bg-panel pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
        aria-label="Search stocks"
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-xl">
          {results.map((s, i) => (
            <li key={`${s.exchange}-${s.symbol}`}>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  go(s);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm hover:bg-accent",
                  i === active && "bg-accent",
                )}
              >
                <span className="min-w-0">
                  <span className="num font-semibold text-primary">{s.symbol}</span>
                  <span className="ml-2 truncate text-muted-foreground">{s.name}</span>
                </span>
                <span className="num shrink-0 text-xs text-muted-foreground">
                  {s.exchange} · {formatPrice(s.price, s.exchange)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

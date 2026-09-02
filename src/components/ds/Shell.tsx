import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import type { ReactNode } from "react";

import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { SearchBar } from "./SearchBar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <Activity className="size-4" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Deep<span className="text-primary">Screen</span>
            </span>
          </Link>
          <nav className="order-3 flex w-full gap-1 overflow-x-auto text-xs md:order-none md:w-auto">
            {EXCHANGES.map((e) => (
              <Link
                key={e.code}
                to="/exchange/$code"
                params={{ code: e.code }}
                activeProps={{ className: "bg-accent text-foreground" }}
                className="num whitespace-nowrap rounded px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {e.flag} {e.code}
              </Link>
            ))}
            <span className="mx-1 my-auto h-4 w-px shrink-0 bg-border" aria-hidden="true" />
            <Link
              to="/crypto"
              activeProps={{ className: "bg-accent text-foreground" }}
              className="num whitespace-nowrap rounded px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Crypto
            </Link>
            {(
              [
                ["/portfolio", "Portfolio"],
                ["/calendar", "Calendar"],
                ["/options", "Options"],
                ["/ipo", "IPO"],
                ["/pricing", "Pricing"],
              ] as const
            ).map(([to, label]) => (
              <Link
                key={to}
                to={to}
                activeProps={{ className: "bg-accent text-foreground" }}
                className="num whitespace-nowrap rounded px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {label}
              </Link>
            ))}

          </nav>
          <div className="ml-auto w-full md:w-80">
            <SearchBar />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-border py-8 text-center text-xs text-muted-foreground">
        DeepScreen — cross-exchange fundamental screening for India, the US and the UK. Analytical
        model output, not investment advice.
      </footer>
    </div>
  );
}

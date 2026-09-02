import { Link, useLocation } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import type { ReactNode } from "react";

import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { SearchBar } from "./SearchBar";

export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur transition-shadow">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="group flex items-center gap-2 transition-transform duration-150 hover:scale-[1.02]"
          >
            <span className="flex size-8 items-center justify-center rounded bg-primary text-primary-foreground transition-transform duration-300 group-hover:rotate-12">
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
                className="num whitespace-nowrap rounded px-2.5 py-1.5 text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground hover:-translate-y-px"
              >
                {e.flag} {e.code}
              </Link>
            ))}
            <span className="mx-1 my-auto h-4 w-px shrink-0 bg-border" aria-hidden="true" />
            <Link
              to="/pine-script"
              activeProps={{ className: "bg-accent text-foreground" }}
              className="num whitespace-nowrap rounded px-2.5 py-1.5 text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground hover:-translate-y-px"
            >
              Pine Script
            </Link>
            <Link
              to="/pricing"
              activeProps={{ className: "bg-accent text-foreground" }}
              className="num whitespace-nowrap rounded px-2.5 py-1.5 text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground hover:-translate-y-px"
            >
              Pricing
            </Link>
          </nav>
          <div className="ml-auto w-full md:w-80">
            <SearchBar />
          </div>
        </div>
      </header>
      <main key={location.pathname} className="animate-fade-in-up">
        {children}
      </main>
      <footer className="mt-16 border-t border-border py-8 text-center text-xs text-muted-foreground">
        DeepScreen — cross-exchange fundamental screening for India, the US and the UK. Analytical
        model output, not investment advice.
      </footer>
    </div>
  );
}

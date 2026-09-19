import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import type { ReactNode } from "react";

import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { AuthButton } from "./AuthButton";
import { SearchBar } from "./SearchBar";

const NAV_ITEMS: Array<readonly [string, string]> = [
  ["/portfolio", "Portfolio"],
  ["/calendar", "Calendar"],
  ["/options", "Options"],
  ["/ipo", "IPO"],
  ["/learn", "Learn"],
  ["/ratios", "Ratios"],
  ["/pricing", "Pricing"],
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="safe-area-x mx-auto grid w-full max-w-7xl min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 py-3 lg:flex lg:flex-wrap lg:gap-3">
          <Link to="/" className="flex min-w-0 shrink items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
              <Activity className="size-4" />
            </span>
            <span className="truncate text-lg font-bold tracking-tight">
              Deep<span className="text-primary">Screen</span>
            </span>
          </Link>

          <div className="col-start-1 row-start-2 w-full min-w-0 lg:order-2 lg:col-auto lg:row-auto lg:ml-auto lg:w-[clamp(16rem,26vw,22rem)]">
            <SearchBar />
          </div>

          <nav
            aria-label="Primary navigation"
            className="col-span-2 row-start-3 flex w-full min-w-0 gap-1 overflow-x-auto overscroll-x-contain pb-0.5 text-xs [scrollbar-width:thin] lg:order-3 lg:col-auto lg:row-auto lg:w-auto lg:max-w-[min(52vw,56rem)]"
          >
            <div className="flex min-w-max items-center gap-1">
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
              {NAV_ITEMS.map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  activeProps={{ className: "bg-accent text-foreground" }}
                  className="num whitespace-nowrap rounded px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="col-start-2 row-start-1 shrink-0 lg:order-4 lg:col-auto lg:row-auto">
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="min-w-0">{children}</main>

      <footer className="mt-16 min-w-0 border-t border-border py-8 text-center text-xs text-muted-foreground">
        <nav className="safe-area-x mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link to="/contact" className="hover:text-foreground">Contact Us</Link>
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/methodology" className="hover:text-foreground">Methodology</Link>
          <a href="/answers" className="hover:text-foreground">Answers</a>
          <a href="/research-checklist" className="hover:text-foreground">Research checklist</a>
          <a href="/data-sources" className="hover:text-foreground">Data sources</a>
          <a href="/developers" className="hover:text-foreground">Developers</a>
          <a href="/press" className="hover:text-foreground">Press</a>
          <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link to="/refund-policy" className="hover:text-foreground">Refund Policy</Link>
        </nav>
        <div className="safe-area-x">
          <p className="mx-auto max-w-3xl leading-relaxed">
            DeepScreen — cross-exchange fundamental screening for India, the US and the UK. Analytical model output, not investment advice.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground/80">Sooraj · Founder</p>
          <a href="tel:+917200689491" className="mt-1 inline-block max-w-full text-[11px] text-muted-foreground/80 hover:text-foreground">
            +91 72006 89491
          </a>
        </div>
      </footer>
    </div>
  );
}

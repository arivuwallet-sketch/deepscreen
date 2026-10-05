import { Link, useLocation } from "@tanstack/react-router";
import { Activity, ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { useWorkspaceEffects } from "@/hooks/useWorkspaceEffects";
import { AuthButton } from "./AuthButton";
import { SearchBar } from "./SearchBar";
import { ResearchNextSteps } from "./ResearchNextSteps";
import { WorkspaceAtmosphere } from "./WorkspaceAtmosphere";

const NAV_ITEMS: Array<readonly [string, string]> = [
  ["/screener", "Screener"],
  ["/investments", "Investments"],
  ["/stock-filters", "Filters"],
  ["/portfolio", "My Stocks"],
  ["/calendar", "Calendar"],
  ["/options", "Options"],
  ["/ipo", "IPO"],
  ["/learn", "Learn"],
  ["/ratios", "Ratios"],
  ["/compare", "Compare"],
  ["/pricing", "Pricing"],
];

const MARKET_GUIDES: Array<readonly [string, string]> = [
  ["/research-desk", "Research Desk"],
  ["/chart-reader", "DeepChart"],
  ["/trading", "Trading Guide"],
  ["/commodities", "Commodities"],
  ["/gift-nifty", "Gift Nifty"],
  ["/ipo-gmp", "IPO GMP"],
];

export function Shell({ children }: { children: ReactNode }) {
  const path = useLocation({ select: (location) => location.pathname });
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const { paused, toggle } = useMotionPreference();
  useWorkspaceEffects(root, path, paused);
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [path]);
  return (
    <div
      ref={root}
      className="ds-workspace min-h-screen min-w-0"
      data-motion={paused ? "paused" : "active"}
    >
      <a className="ds-workspace-skip" href="#workspace-content">
        Skip to content
      </a>
      <header className="ds-workspace-header">
        <div className="ds-workspace-topbar">
          <Link to="/" className="ds-workspace-brand" aria-label="DeepScreen home">
            <span className="ds-workspace-brand-mark">
              <Activity size={21} />
            </span>
            deep<span>screen</span>
          </Link>
          <span className="ds-workspace-brand-note">
            INDEPENDENT THINKING.
            <br />
            INFORMED INVESTING.
          </span>
          <div className="ds-workspace-search">
            <SearchBar placeholder="Search stocks, funds, ETFs…" />
          </div>
          <div className="ds-workspace-auth">
            <AuthButton />
          </div>
          <details
            className="ds-workspace-menu"
            ref={menu}
            onKeyDown={(event) => {
              if (event.key === "Escape" && menu.current) {
                menu.current.open = false;
                menu.current.querySelector("summary")?.focus();
              }
            }}
          >
            <summary aria-label="Toggle navigation">
              <Menu className="ds-menu-open-icon" size={20} />
              <X className="ds-menu-close-icon" size={20} />
            </summary>
            <nav
              aria-label="Mobile navigation"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a") && menu.current)
                  menu.current.open = false;
              }}
            >
              <p className="ds-eyebrow">Your workspace</p>
              <div className="ds-mobile-nav-links">
                {NAV_ITEMS.map(([to, label]) => (
                  <Link key={to} to={to} activeProps={{ className: "is-active" }}>
                    {label}
                    <ArrowUpRight size={14} />
                  </Link>
                ))}
                {MARKET_GUIDES.map(([to, label]) => (
                  <Link key={to} to={to} activeProps={{ className: "is-active" }}>
                    {label}<ArrowUpRight size={14} />
                  </Link>
                ))}
              </div>
              <p className="ds-eyebrow">Explore markets</p>
              <div className="ds-mobile-market-links">
                {EXCHANGES.map((exchange) => (
                  <Link
                    key={exchange.code}
                    to="/exchange/$code"
                    params={{ code: exchange.code }}
                    activeProps={{ className: "is-active" }}
                  >
                    {exchange.flag} {exchange.code}
                  </Link>
                ))}
              </div>
            </nav>
          </details>
        </div>
        <div className="ds-workspace-navrow">
          <nav aria-label="Primary navigation">
            {NAV_ITEMS.map(([to, label]) => (
              <Link key={to} to={to} activeProps={{ className: "is-active" }}>
                {label}
              </Link>
            ))}
            <details className="group relative flex items-stretch">
              <summary className="flex cursor-pointer list-none items-center text-xs text-muted-foreground hover:text-primary [&::-webkit-details-marker]:hidden">More ▾</summary>
              <div className="absolute left-0 top-full z-50 min-w-36 border border-border bg-panel p-2 shadow-lg">
                {MARKET_GUIDES.map(([to, label]) => <Link key={to} to={to} className="block px-3 py-2 text-xs" activeProps={{ className: "is-active" }}>{label}</Link>)}
              </div>
            </details>
          </nav>
          <nav aria-label="Market navigation">
            {EXCHANGES.map((exchange) => (
              <Link
                key={exchange.code}
                to="/exchange/$code"
                params={{ code: exchange.code }}
                activeProps={{ className: "is-active" }}
              >
                {exchange.code}
              </Link>
            ))}
          </nav>
        </div>
        <div className="ds-reading-progress" aria-hidden="true" />
      </header>
      <WorkspaceAtmosphere path={path} paused={paused} onToggle={toggle} />
      <main id="workspace-content" tabIndex={-1} className="ds-workspace-content min-w-0">
        {children}
        <ResearchNextSteps path={path} />
      </main>
      <footer className="ds-workspace-footer">
        <div className="ds-workspace-footer-intro">
          <Link to="/" className="ds-workspace-brand">
            <span className="ds-workspace-brand-mark">
              <Activity size={21} />
            </span>
            deep<span>screen</span>
          </Link>
          <p>
            See the signal.
            <br />
            <em>Beyond the noise.</em>
          </p>
          <Link to="/screener" className="ds-workspace-footer-cta">
            Explore the screener <ArrowUpRight size={17} />
          </Link>
        </div>
        <nav className="safe-area-x mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link to="/commodities" className="hover:text-foreground">Commodities</Link>
          <Link to="/gift-nifty" className="hover:text-foreground">Gift Nifty</Link>
          <Link to="/ipo-gmp" className="hover:text-foreground">IPO GMP</Link>
          <Link to="/chart-reader" className="hover:text-foreground">DeepChart</Link>
          <Link to="/stock-filters" className="hover:text-foreground">
            Stock Filters
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact Us
          </Link>
          <Link to="/about" className="hover:text-foreground">
            About
          </Link>
          <Link to="/methodology" className="hover:text-foreground">
            Methodology
          </Link>
          <Link to="/answers" className="hover:text-foreground">
            Answers
          </Link>
          <Link to="/knowledge" className="hover:text-foreground">
            Knowledge Index
          </Link>
          <Link to="/research-checklist" className="hover:text-foreground">
            Research checklist
          </Link>
          <Link to="/data-sources" className="hover:text-foreground">
            Data sources
          </Link>
          <Link to="/developers" className="hover:text-foreground">
            Developers
          </Link>
          <Link to="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <Link to="/press" className="hover:text-foreground">
            Press
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/refund-policy" className="hover:text-foreground">
            Refund Policy
          </Link>
        </nav>
        <div className="safe-area-x">
          <p className="mx-auto max-w-3xl leading-relaxed">
            DeepScreen — cross-exchange fundamental screening for India, the US and the UK.
            Analytical model output, not investment advice.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground/80">Sooraj · Founder</p>
        </div>
      </footer>
    </div>
  );
}
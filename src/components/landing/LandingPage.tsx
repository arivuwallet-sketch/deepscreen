import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Activity,
  Globe2,
  ScanLine,
  Layers3,
  Radar,
  CalendarDays,
  Newspaper,
  Rocket,
  BookOpen,
  BellRing,
  Plus,
  Minus,
  Pause,
  Play,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { MarketScene } from "./MarketScene";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { LANDING_FAQS } from "@/lib/discovery/landing-faq";
import { faqAnchor } from "@/lib/seo/faq-anchor";
import { DEEPSCREEN_ENTITY_SENTENCE, DEEPSCREEN_TITLE } from "@/lib/seo/brand";
import "./landing.css";

const MARKETS = [
  {
    code: "NSE",
    country: "India",
    name: "National Stock Exchange",
    currency: "INR",
    copy: "From India's established leaders to its emerging businesses. Explore companies by sector, size and fundamentals.",
  },
  {
    code: "BSE",
    country: "India",
    name: "Bombay Stock Exchange",
    currency: "INR",
    copy: "Go beyond the familiar names. Navigate a broad Indian company directory with consistent research tools.",
  },
  {
    code: "NYSE",
    country: "United States",
    name: "New York Stock Exchange",
    currency: "USD",
    copy: "Bring US industry leaders into focus. Compare business quality, financial strength and valuation in one workspace.",
  },
  {
    code: "NASDAQ",
    country: "United States",
    name: "Nasdaq Stock Market",
    currency: "USD",
    copy: "Look beneath the growth story. Investigate technology, innovation and the fundamentals behind the headline.",
  },
  {
    code: "LSE",
    country: "United Kingdom",
    name: "London Stock Exchange",
    currency: "GBP",
    copy: "Explore British and internationally exposed businesses with the same framework you use across other markets.",
  },
];
const FACTORS = [
  [
    "P/E",
    "Price meets earnings.",
    "Compare the price of a business with its reported earnings. Read valuation alongside growth, cyclicality and one-off items.",
  ],
  [
    "PEG",
    "Put growth in the picture.",
    "Relate the earnings multiple to growth. A useful second lens, with assumptions that deserve a closer look.",
  ],
  [
    "P/S",
    "The revenue perspective.",
    "Compare market value with sales, then investigate the margins and cash generation behind that revenue.",
  ],
  [
    "P/B",
    "Look at the balance sheet.",
    "Evaluate price against book value, with the business model and quality of the underlying assets in mind.",
  ],
  [
    "EV/Revenue",
    "See the whole enterprise.",
    "Bring enterprise value into your sales comparison to account for debt and cash alongside equity value.",
  ],
  [
    "EV/EBITDA",
    "Compare operating economics.",
    "Evaluate enterprise value against operating earnings before interest, tax, depreciation and amortisation.",
  ],
  [
    "ROE",
    "What does equity earn?",
    "Understand returns on shareholder capital. Check whether leverage or unusual items are driving the result.",
  ],
  [
    "ROA",
    "How hard do assets work?",
    "Compare profitability with the asset base a business needs to operate, using peers with similar economics.",
  ],
  [
    "ROCE",
    "Capital should work harder.",
    "Explore how efficiently the business turns capital employed into operating returns across its cycle.",
  ],
  [
    "D/E",
    "Understand the leverage.",
    "Read debt relative to equity alongside cash flow, funding costs and the company's ability to meet obligations.",
  ],
  [
    "LT D/E",
    "Take the longer view.",
    "Look beyond immediate obligations to long-term debt and the structural funding of a business.",
  ],
  [
    "Payout",
    "Follow the distributions.",
    "Assess how much of earnings is distributed, and whether dividends leave room for resilient future investment.",
  ],
  [
    "Op. leverage",
    "Know the sensitivity.",
    "Explore how the cost structure can amplify changes in revenue into changes in operating profit.",
  ],
];
function Brand() {
  return (
    <span className="ds-brand">
      <span className="ds-brand-mark">
        <Activity size={21} strokeWidth={2.2} />
      </span>
      deep<span>screen</span>
    </span>
  );
}
function StartButton({ small = false }: { small?: boolean }) {
  return (
    <a href="/screener" className={`ds-button ${small ? "ds-button-small" : ""}`}>
      Get started <ArrowUpRight size={small ? 16 : 20} />
    </a>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="ds-eyebrow">
      <span />
      {children}
    </p>
  );
}

function ValuationDemo() {
  const [growth, setGrowth] = useState(8);
  // Illustrative five-year DCF: 10 currency units of starting FCF/share,
  // 12% discount rate, 2% perpetual growth. No live security is represented.
  const cash = Array.from({ length: 5 }, (_, i) => 10 * (1 + growth / 100) ** (i + 1));
  const value =
    cash.reduce((sum, item, i) => sum + item / 1.12 ** (i + 1), 0) +
    (cash[4]! * 1.02) / 0.1 / 1.12 ** 5;
  return (
    <div className="ds-valuation-demo">
      <div className="ds-mini-label">
        ILLUSTRATIVE DCF <span>5-YEAR HORIZON</span>
      </div>
      <div className="ds-value">
        {value.toFixed(2)}
        <span>value / share</span>
      </div>
      <div className="ds-cashbars" aria-hidden="true">
        {cash.map((item, i) => (
          <div key={i}>
            <i style={{ height: `${(item * 3.5).toFixed(4)}px` }} />
            <span>Y{i + 1}</span>
          </div>
        ))}
      </div>
      <label htmlFor="ds-growth">
        Growth assumption <strong>{growth}%</strong>
      </label>
      <input
        id="ds-growth"
        type="range"
        min="0"
        max="15"
        value={growth}
        onChange={(event) => setGrowth(Number(event.target.value))}
      />
      <p>
        Starting FCF/share: 10 · Discount: 12% · Terminal growth: 2%. Change the growth assumption
        to see the effect.
      </p>
    </div>
  );
}
function OptionsDemo() {
  const [strategy, setStrategy] = useState(0);
  const names = ["Long call", "Bull spread", "Protective put"];
  const payoff = (s: number) =>
    strategy === 0
      ? Math.max(s - 100, 0) - 5
      : strategy === 1
        ? Math.max(s - 95, 0) - Math.max(s - 110, 0) - 7
        : s - 100 + Math.max(95 - s, 0) - 3;
  const points = Array.from(
    { length: 41 },
    (_, i) => `${20 + i * 7},${105 - payoff(80 + i) * 3.5}`,
  ).join(" ");
  return (
    <div className="ds-options-demo">
      <div className="ds-demo-tabs" aria-label="Example options strategy">
        {names.map((name, i) => (
          <button key={name} aria-pressed={strategy === i} onClick={() => setStrategy(i)}>
            {name}
          </button>
        ))}
      </div>
      <svg
        viewBox="0 0 320 180"
        role="img"
        aria-label={`Illustrative ${names[strategy]} payoff at expiry`}
      >
        <path
          d="M20 30H300M20 65H300M20 105H300M20 145H300M90 20V150M160 20V150M230 20V150"
          stroke="currentColor"
          opacity=".12"
        />
        <path d="M20 105H300" stroke="currentColor" opacity=".4" strokeDasharray="3 4" />
        <polyline
          points={points}
          fill="none"
          stroke="#c8fa86"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <text x="20" y="174">
          80
        </text>
        <text x="145" y="174">
          100
        </text>
        <text x="280" y="174">
          120
        </text>
      </svg>
      <p>Illustrative expiry payoff · underlying price in sample units · excludes fees</p>
    </div>
  );
}


type FeatureSceneKind =
  | "deepchart"
  | "investments"
  | "filters"
  | "trading"
  | "markets"
  | "workspace"
  | "knowledge";

const FEATURE_SCENES: {
  kind: FeatureSceneKind;
  icon: LucideIcon;
  tag: string;
  title: string;
  text: string;
  link: string;
  cta: string;
}[] = [
  {
    kind: "deepchart",
    icon: Activity,
    tag: "DEEPCHART",
    title: "Read the structure as it moves.",
    text: "See price structure, EMA layers, momentum, volatility, liquidity and higher-timeframe context come together as one explainable technical workspace.",
    link: "/chart-reader",
    cta: "Open DeepChart",
  },
  {
    kind: "investments",
    icon: Layers3,
    tag: "INVESTMENTS",
    title: "Compare different kinds of assets.",
    text: "Move through mutual funds, ETFs and REITs with product-specific research for NAV, fees, holdings, tracking, occupancy, cash flow and valuation.",
    link: "/investments",
    cta: "Explore investments",
  },
  {
    kind: "filters",
    icon: ScanLine,
    tag: "FILTERS",
    title: "Turn a thesis into a shortlist.",
    text: "Watch a broad market universe narrow through value, growth, quality, income, momentum, leverage, ROE/ROCE, sector, index and exchange filters.",
    link: "/stock-filters",
    cta: "Browse stock filters",
  },
  {
    kind: "trading",
    icon: Radar,
    tag: "TRADING",
    title: "See the risk before the signal.",
    text: "Connect position size, stop distance and reward-to-risk with crypto and forex mechanics such as leverage, liquidation, pips, spreads and volatility.",
    link: "/trading",
    cta: "Open trading guides",
  },
  {
    kind: "markets",
    icon: Globe2,
    tag: "MARKETS",
    title: "Watch the market around the company.",
    text: "Bring commodities, GIFT Nifty, scheduled macro events, news and IPO context into the same visual story instead of treating a stock in isolation.",
    link: "/commodities",
    cta: "Explore market context",
  },
  {
    kind: "workspace",
    icon: BellRing,
    tag: "WORKSPACE",
    title: "Keep the research trail together.",
    text: "Organise watchlists, holdings, notes, source documents and follow-up ideas across My Stocks and Research Desk without breaking the research flow.",
    link: "/portfolio",
    cta: "Open My Stocks",
  },
  {
    kind: "knowledge",
    icon: BookOpen,
    tag: "KNOWLEDGE",
    title: "Move from a number to understanding.",
    text: "Explore ratio guides, source-backed blogs, FAQs and answer hubs covering stocks, DeepChart, trading, crypto, forex, funds and personal finance.",
    link: "/knowledge",
    cta: "Explore the knowledge hub",
  },
];

function FeatureScene({ kind }: { kind: FeatureSceneKind }) {
  if (kind === "deepchart") {
    return (
      <div className="ds-motion-scene ds-motion-chart">
        <div className="ds-motion-grid" />
        <svg viewBox="0 0 520 250" role="img" aria-label="Animated DeepChart technical-analysis preview">
          <g className="ds-motion-candles">
            {[
              [34, 150, 118, 170, 102],
              [76, 130, 92, 148, 82],
              [118, 112, 142, 154, 101],
              [160, 136, 105, 150, 92],
              [202, 118, 78, 138, 69],
              [244, 92, 126, 140, 82],
              [286, 110, 72, 123, 61],
              [328, 82, 58, 103, 49],
              [370, 72, 102, 112, 61],
              [412, 94, 65, 107, 54],
              [454, 70, 46, 86, 38],
            ].map(([x, open, close, high, low], i) => {
              const up = close < open;
              const y = Math.min(open, close);
              const h = Math.max(8, Math.abs(close - open));
              return (
                <g key={x} style={{ animationDelay: `${i * 70}ms` }}>
                  <line x1={x} x2={x} y1={low} y2={high} />
                  <rect x={x - 7} y={y} width="14" height={h} className={up ? "up" : "down"} />
                </g>
              );
            })}
          </g>
          <path className="ds-motion-line ds-motion-line-a" d="M18 160 C90 132 134 149 194 116 S296 78 350 86 S430 63 502 48" />
          <path className="ds-motion-line ds-motion-line-b" d="M18 176 C82 163 130 164 190 143 S286 110 350 112 S438 91 502 78" />
          <path className="ds-motion-scanline" d="M26 62 H494" />
          <circle className="ds-motion-pulse" cx="454" cy="70" r="5" />
        </svg>
        <div className="ds-motion-hud">
          <span>EMA 20</span><span>RSI 61</span><span>ADX 28</span><span>HTF ↑</span>
        </div>
      </div>
    );
  }

  if (kind === "investments") {
    return (
      <div className="ds-motion-scene ds-motion-investments">
        <div className="ds-invest-orbit">
          <div className="ds-invest-ring"><span>64%</span></div>
          <div className="ds-invest-card ds-invest-card-a">
            <small>MUTUAL FUND</small><strong>NAV</strong><em>₹182.46</em>
            <i><b style={{ width: "72%" }} /></i>
          </div>
          <div className="ds-invest-card ds-invest-card-b">
            <small>ETF</small><strong>TRACKING</strong><em>0.18%</em>
            <i><b style={{ width: "86%" }} /></i>
          </div>
          <div className="ds-invest-card ds-invest-card-c">
            <small>REIT</small><strong>OCCUPANCY</strong><em>91%</em>
            <i><b style={{ width: "91%" }} /></i>
          </div>
        </div>
        <div className="ds-motion-axis"><span>NAV</span><span>TER</span><span>WALE</span><span>AFFO</span></div>
      </div>
    );
  }

  if (kind === "filters") {
    return (
      <div className="ds-motion-scene ds-motion-filters">
        <div className="ds-filter-cloud">
          {["13,000+", "ROCE > 15%", "D/E < 1", "P/E", "GROWTH", "NSE", "NASDAQ", "QUALITY"].map((label, i) => (
            <span key={label} style={{ animationDelay: `${i * -0.31}s` } as CSSProperties}>{label}</span>
          ))}
        </div>
        <div className="ds-filter-funnel">
          <i /><i /><i />
          <div className="ds-filter-beam" />
        </div>
        <div className="ds-filter-results">
          {[
            ["01", "QUALITY CO.", "82"],
            ["02", "VALUE LABS", "78"],
            ["03", "GROWTH PLC", "74"],
          ].map(([rank, name, score]) => (
            <div key={rank}><span>{rank}</span><strong>{name}</strong><em>{score}</em></div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "trading") {
    return (
      <div className="ds-motion-scene ds-motion-trading">
        <div className="ds-trading-tape">
          <span>BTC/USD <b>+2.4%</b></span>
          <span>EUR/USD <b>1.168</b></span>
          <span>USD/INR <b>88.73</b></span>
        </div>
        <svg viewBox="0 0 520 220" role="img" aria-label="Animated trading risk and reward preview">
          <rect className="ds-risk-zone" x="38" y="128" width="444" height="44" rx="3" />
          <rect className="ds-reward-zone" x="38" y="58" width="444" height="70" rx="3" />
          <path className="ds-motion-line ds-motion-line-a" d="M32 142 C86 128 112 154 164 122 S240 98 290 107 S352 88 398 72 S454 64 494 78" />
          <line className="ds-entry-line" x1="38" x2="482" y1="128" y2="128" />
          <line className="ds-stop-line" x1="38" x2="482" y1="172" y2="172" />
          <line className="ds-target-line" x1="38" x2="482" y1="68" y2="68" />
          <circle className="ds-motion-crosshair" cx="398" cy="72" r="8" />
        </svg>
        <div className="ds-risk-readout"><span>RISK 1R</span><strong>2.2R</strong><span>REWARD</span></div>
      </div>
    );
  }

  if (kind === "markets") {
    return (
      <div className="ds-motion-scene ds-motion-markets">
        <div className="ds-market-strip">
          {[
            ["GOLD", "▲ 1.2"],
            ["WTI", "▼ 0.7"],
            ["GIFT", "▲ 0.4"],
            ["CPI", "14:00"],
          ].map(([a, b]) => <span key={a}><small>{a}</small><strong>{b}</strong></span>)}
        </div>
        <div className="ds-market-radar">
          <i className="ds-radar-ring r1" /><i className="ds-radar-ring r2" /><i className="ds-radar-ring r3" />
          <i className="ds-radar-sweep" />
          <b className="p1" /><b className="p2" /><b className="p3" />
        </div>
        <div className="ds-market-events">
          <div><span>09:15</span><strong>NIFTY OPEN</strong></div>
          <div><span>14:00</span><strong>MACRO EVENT</strong></div>
          <div><span>IPO</span><strong>PIPELINE</strong></div>
        </div>
      </div>
    );
  }

  if (kind === "workspace") {
    return (
      <div className="ds-motion-scene ds-motion-workspace">
        <div className="ds-workspace-board">
          <div className="ds-workspace-column">
            <small>WATCHLIST</small>
            <span><b>RELIANCE</b><em>research</em></span>
            <span><b>NVDA</b><em>compare</em></span>
            <span><b>HDFCBANK</b><em>review</em></span>
          </div>
          <div className="ds-workspace-column">
            <small>NOTES</small>
            <span className="note"><b>Valuation</b><em>check assumptions</em></span>
            <span className="note"><b>Risk</b><em>read filing</em></span>
          </div>
          <div className="ds-workspace-column">
            <small>SOURCES</small>
            <span className="file"><b>10-K</b><em>PDF</em></span>
            <span className="file"><b>Annual report</b><em>PDF</em></span>
          </div>
        </div>
        <div className="ds-workspace-cursor">+</div>
      </div>
    );
  }

  return (
    <div className="ds-motion-scene ds-motion-knowledge">
      <div className="ds-knowledge-core"><BookOpen size={28} /><span>DEEPSCREEN</span></div>
      <div className="ds-knowledge-links" aria-hidden="true">
        <i className="l1" /><i className="l2" /><i className="l3" /><i className="l4" /><i className="l5" /><i className="l6" />
      </div>
      {[
        ["FAQ", "What is ROCE?"],
        ["GUIDE", "Read a chart"],
        ["BLOG", "Crypto risk"],
        ["RATIO", "EV / EBITDA"],
        ["FOREX", "Pips & spread"],
        ["SOURCE", "Methodology"],
      ].map(([type, label], i) => (
        <div key={type} className={`ds-knowledge-node n${i + 1}`}>
          <small>{type}</small><strong>{label}</strong>
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  const [market, setMarket] = useState(0);
  const [factor, setFactor] = useState(0);
  const { paused, toggle: toggleMotion } = useMotionPreference();
  const [menu, setMenu] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ds-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    page.querySelectorAll("[data-reveal]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  const selected = MARKETS[market]!;
  const active = FACTORS[factor]!;
  return (
    <div ref={root} className={`ds-landing ${paused ? "ds-paused" : ""}`}>
      <a href="#ds-main" className="ds-skip">
        Skip to content
      </a>
      <header className="ds-nav">
        <a href="#" aria-label="DeepScreen introduction">
          <Brand />
        </a>
        <nav className={menu ? "is-open" : ""} aria-label="Landing navigation">
          {[
            ["#markets", "Markets"],
            ["#engine", "The engine"],
            ["#toolkit", "Toolkit"],
            ["#questions", "FAQ"],
          ].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="ds-nav-actions">
          <StartButton small />
          <button
            className="ds-menu"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="ds-main">
        <div className="ds-journey">
          <MarketScene paused={paused} market={market} />
          <section className="ds-chapter ds-hero">
            <div className="ds-hero-copy">
              <Eyebrow>{DEEPSCREEN_TITLE}</Eyebrow>
              <h1>
                See the signal.
                <br />
                <span>Beyond</span>
                <br />
                <em>the noise.</em>
              </h1>
              <p className="ds-lead">
                {DEEPSCREEN_ENTITY_SENTENCE}
                <br className="ds-desktop-break" /> Move from fundamentals to DeepChart technicals,
                funds, ETFs, REITs, options, market context and research education in one workspace.
              </p>
              <div className="ds-hero-actions">
                <StartButton />
                <a className="ds-text-link" href="#engine">
                  Explore the engine <ArrowDown size={16} />
                </a>
              </div>
              <div className="ds-hero-proof">
                <span>
                  <i /> Built for curious investors
                </span>
                <span>India · United States · United Kingdom</span>
              </div>
            </div>
            <div className="ds-object-caption">
              <span>DEEPSCREEN ENGINE / 01</span>
              <p>
                Many dimensions.
                <br />
                <strong>One connected perspective.</strong>
              </p>
            </div>
            <div className="ds-hero-bottom">
              <a href="#markets">
                <span className="ds-scroll-line" />
                Scroll to discover
              </a>
              <button onClick={toggleMotion} aria-pressed={paused}>
                {paused ? <Play size={13} /> : <Pause size={13} />}
                {paused ? "Resume motion" : "Pause motion"}
              </button>
              <span>FUNDAMENTALS, IN FOCUS.</span>
            </div>
          </section>
          <section id="markets" className="ds-chapter ds-markets">
            <div className="ds-chapter-copy" data-reveal>
              <Eyebrow>01 / A global perspective</Eyebrow>
              <h2>
                Your curiosity.
                <br />
                <em>No borders.</em>
              </h2>
              <p className="ds-lead">
                Five exchanges. Three markets. One consistent way to explore businesses, from
                familiar leaders to your next research discovery.
              </p>
              <div className="ds-market-tabs" aria-label="Explore supported exchanges">
                {MARKETS.map((item, i) => (
                  <button key={item.code} onClick={() => setMarket(i)} aria-pressed={market === i}>
                    {item.code}
                  </button>
                ))}
              </div>
              <div className="ds-market-detail" aria-live="polite">
                <div>
                  <span>{selected.country}</span>
                  <span>{selected.currency}</span>
                </div>
                <h3>{selected.name}</h3>
                <p>{selected.copy}</p>
                <Link to="/exchange/$code" params={{ code: selected.code }}>
                  Explore {selected.code} stocks <ArrowUpRight size={17} />
                </Link>
              </div>
              <div className="ds-market-stats">
                <div>
                  <strong>13k+</strong>
                  <span>company listings</span>
                </div>
                <div>
                  <strong>05</strong>
                  <span>major exchanges</span>
                </div>
                <div>
                  <strong>01</strong>
                  <span>research workspace</span>
                </div>
              </div>
            </div>
            <span className="ds-chapter-number" aria-hidden="true">
              01 — CONNECT
            </span>
          </section>
          <section id="engine" className="ds-chapter ds-framework">
            <div className="ds-chapter-copy" data-reveal>
              <Eyebrow>02 / Under the surface</Eyebrow>
              <h2>
                Conviction starts
                <br />
                with <em>understanding.</em>
              </h2>
              <p className="ds-lead">
                A price tells you one thing. Thirteen fundamental factors reveal more. Unpack
                valuation, profitability, leverage and resilience before forming your view.
              </p>
              <div className="ds-factor-grid" aria-label="Explore fundamental factors">
                {FACTORS.map(([name], i) => (
                  <button key={name} onClick={() => setFactor(i)} aria-pressed={factor === i}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {name}
                  </button>
                ))}
              </div>
              <div className="ds-factor-detail" aria-live="polite">
                <span className="ds-factor-index">
                  {String(factor + 1).padStart(2, "0")}
                  <small>/13</small>
                </span>
                <div>
                  <h3>{active[1]}</h3>
                  <p>{active[2]}</p>
                </div>
              </div>
              <Link to="/methodology" className="ds-text-link">
                Understand the methodology <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="ds-engine-note">
              <ScanLine size={20} />
              <span>
                Look inside the model.
                <br />
                <strong>Never just trust a number.</strong>
              </span>
            </div>
          </section>
        </div>
        <section id="toolkit" className="ds-toolkit ds-section">
          <div className="ds-section-heading" data-reveal>
            <div>
              <Eyebrow>03 / Your research, connected</Eyebrow>
              <h2>
                Less tab-switching.
                <br />
                <em>More perspective.</em>
              </h2>
            </div>
            <p>
              From the first screen to fundamentals, technicals, funds, derivatives and the deeper questions.
              <br />A connected toolkit for researching markets without jumping between disconnected apps.
            </p>
          </div>
          <div className="ds-toolkit-workspace" data-reveal>
            <div className="ds-toolkit-workspace-copy">
              <span className="ds-icon-box">
                <Layers3 size={22} />
              </span>
              <h3>
                A clearer view of
                <br />
                the whole business.
              </h3>
              <p>
                Go from discovery to a complete research trail. Screen companies, inspect the
                13-factor score and raw fundamentals, compare peers, test valuation assumptions,
                read source context, then continue into DeepChart, market events and your own watchlist.
              </p>
              <a href="/screener" className="ds-text-link">
                Open the research workspace <ArrowUpRight size={16} />
              </a>
              <small>
                Model output supports research.
                <br />
                Provider coverage and plan access vary.
              </small>
            </div>
            <div className="ds-terminal">
              <div className="ds-terminal-top">
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <span>DEEPSCREEN / COMPANY RESEARCH</span>
                <span>PREVIEW</span>
              </div>
              <div className="ds-terminal-body">
                <div className="ds-company">
                  <div className="ds-company-icon">A</div>
                  <div>
                    <h4>Atlas Industries</h4>
                    <span>Illustrative company · not a listed security</span>
                  </div>
                  <ScanLine size={21} />
                </div>
                <div className="ds-analysis-demo">
                  <div className="ds-score-ring">
                    <span>
                      82<small>/100</small>
                    </span>
                  </div>
                  <div>
                    <span className="ds-mini-label">ILLUSTRATIVE MODEL SCORE</span>
                    <h4>Read the whole picture.</h4>
                    <p>Value. Quality. Resilience.</p>
                    <div className="ds-score-legend">
                      <i />
                      Explore the inputs behind the score
                    </div>
                  </div>
                </div>
                <div className="ds-demo-metrics">
                  {[
                    ["Valuation", "Context matters", 72],
                    ["Capital efficiency", "Compare with peers", 87],
                    ["Financial resilience", "Review the risks", 81],
                  ].map(([label, note, score]) => (
                    <div key={label}>
                      <span>
                        {label}
                        <small>{note}</small>
                      </span>
                      <i>
                        <b style={{ width: `${score}%` }} />
                      </i>
                    </div>
                  ))}
                </div>
                <div className="ds-terminal-bottom">
                  <span>
                    <Radar size={13} /> Strengths & risk flags
                  </span>
                  <span>
                    <Globe2 size={13} /> Peer comparison
                  </span>
                  <span>
                    <BookOpen size={13} /> Source context
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="ds-feature-grid">
            <article className="ds-feature-card ds-feature-large" data-reveal>
              <div className="ds-card-heading">
                <span className="ds-tag">VALUE / 01</span>
                <ArrowUpRight size={20} />
              </div>
              <h3>
                A price is a fact.
                <br />
                Value is a question.
              </h3>
              <p>
                Explore DCF and Graham valuation tools. Adjust your assumptions, investigate the
                margin of safety and see what changes your conclusion.
              </p>
              <ValuationDemo />
              <Link
                to="/stock/$exchange/$symbol"
                params={{ exchange: "NSE", symbol: "RELIANCE" }}
                className="ds-text-link"
              >
                Explore valuation tools <ArrowUpRight size={16} />
              </Link>
            </article>
            <article className="ds-feature-card ds-feature-large" data-reveal>
              <div className="ds-card-heading">
                <span className="ds-tag">STRATEGY / 02</span>
                <ArrowUpRight size={20} />
              </div>
              <h3>
                Know the shape
                <br />
                of your risk.
              </h3>
              <p>
                Model 12 options strategies with Black-Scholes-Merton Greeks, breakevens, payoff
                diagrams, max profit/loss and probability-of-profit estimates using provider or
                scenario spot inputs.
              </p>
              <OptionsDemo />
              <Link to="/options" className="ds-text-link">
                Enter the options lab <ArrowUpRight size={16} />
              </Link>
            </article>
          </div>
          <div className="ds-visual-showcase" aria-label="Interactive DeepScreen feature showcase">
            {FEATURE_SCENES.map(({ kind, icon: Icon, tag, title, text, link, cta }, index) => (
              <article
                key={kind}
                className={`ds-visual-feature ${index % 2 ? "is-reversed" : ""}`}
                data-reveal
                tabIndex={0}
              >
                <div className="ds-visual-stage" aria-hidden="true">
                  <FeatureScene kind={kind} />
                </div>
                <div className="ds-visual-copy">
                  <div className="ds-card-heading">
                    <Icon size={22} />
                    <span className="ds-tag">{tag}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <Link to={link} className="ds-text-link">
                    {cta} <ArrowUpRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="ds-process ds-section">
          <div data-reveal>
            <Eyebrow>04 / A better research habit</Eyebrow>
            <h2>
              From a question
              <br />
              to a <em>clearer view.</em>
            </h2>
          </div>
          <div className="ds-process-steps">
            {[
              [
                "01",
                "Discover",
                "Choose an exchange. Find a company. Screen by sector, market cap and the factors that matter to you.",
              ],
              [
                "02",
                "Understand",
                "Unpack the score and raw fundamentals, compare peers, test valuation, read the news and use DeepChart when technical context matters.",
              ],
              [
                "03",
                "Make it yours",
                "Connect market events, options, funds and risk research, then organise the companies and ideas that matter in My Stocks or Research Desk.",
              ],
            ].map(([number, title, text]) => (
              <div key={number} data-reveal>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="questions" className="ds-faq ds-section">
          <div data-reveal>
            <Eyebrow>A little more clarity</Eyebrow>
            <h2>
              Good questions.
              <br />
              <em>Straight answers.</em>
            </h2>
            <Link to="/answers" className="ds-text-link">
              Visit the answer hub <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="ds-accordion">
            {LANDING_FAQS.map(([question, answer], i) => (
              <div key={question} id={faqAnchor(question)} className={faq === i ? "is-open" : ""}>
                <h3>
                  <button
                    aria-expanded={faq === i}
                    aria-controls={`ds-answer-${i}`}
                    onClick={() => setFaq(faq === i ? null : i)}
                  >
                    {question}
                    {faq === i ? <Minus size={18} /> : <Plus size={18} />}
                  </button>
                </h3>
                <div id={`ds-answer-${i}`} hidden={faq !== i}>
                  <p>
                    {answer}
                    {i === 3 && (
                      <>
                        {" "}
                        <Link to="/pricing">View pricing →</Link>
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="ds-final">
          <div className="ds-final-grid" aria-hidden="true" />
          <div data-reveal>
            <Eyebrow>A deeper look changes everything</Eyebrow>
            <h2>
              Your next insight
              <br />
              <em>starts here.</em>
            </h2>
            <p>Bring your curiosity. We’ll bring the tools.</p>
            <StartButton />
            <span className="ds-final-note">Explore the screener. Find your perspective.</span>
          </div>
        </section>
      </main>
      <footer className="ds-footer">
        <div>
          <a href="#" aria-label="DeepScreen introduction">
            <Brand />
          </a>
          <p>
            Independent thinking.
            <br />A clearer view of the markets.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="/screener">Screener</a>
          <Link to="/chart-reader">DeepChart</Link>
          <Link to="/investments">Investments</Link>
          <Link to="/options">Options</Link>
          <Link to="/trading">Trading Guide</Link>
          <Link to="/commodities">Commodities</Link>
          <Link to="/gift-nifty">Gift Nifty</Link>
          <Link to="/ipo-gmp">IPO GMP</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/knowledge">Knowledge</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/methodology">Methodology</Link>
          <Link to="/data-sources">Data sources</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <div className="ds-footer-bottom">
          <span>© {new Date().getFullYear()} DeepScreen</span>
          <p>
            Research and education, not personalised investment advice. Data availability and delays
            vary. Interactive previews are illustrative.
          </p>
          <a href="#">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}

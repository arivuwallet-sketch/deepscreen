import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { MarketScene } from "./MarketScene";
import { useMotionPreference } from "@/hooks/useMotionPreference";
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
const FAQS = [
  [
    "What can I do with DeepScreen?",
    "Screen stocks across five exchanges, compare financial ratios, explore model scores, investigate company risks and peers, use valuation calculators, and connect your research with news, IPOs and economic events.",
  ],
  [
    "How does the 13-factor score work?",
    "DeepScreen combines valuation, profitability, leverage and payout measures into a research score out of 100. Open the methodology and individual metric explanations to understand the inputs and limitations; a score is a starting point for research.",
  ],
  [
    "Is the market data live?",
    "The research workspace refreshes quotes and other information from its providers. Availability, refresh frequency and exchange delays vary. Check each page's source and timestamp; the interactive examples on this landing page are illustrations.",
  ],
  [
    "Can I get started for free?",
    "You can explore the screener and public research tools. Advanced features have plan-based access; the pricing page explains what is included in each plan.",
  ],
  [
    "Does DeepScreen place trades for me?",
    "No. DeepScreen is a research and education platform. It does not execute trades, and model scores or strategy examples are not personalised investment advice or guarantees of returns.",
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
              <Eyebrow>Global stock screener. Informed investing.</Eyebrow>
              <h1>
                See the signal.
                <br />
                <span>Beyond</span>
                <br />
                <em>the noise.</em>
              </h1>
              <p className="ds-lead">
                Research stocks across India, the US and the UK.
                <br className="ds-desktop-break" /> Go deeper with powerful fundamentals, meaningful
                market context and tools that put you in control.
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
              From the first screen to the deeper questions.
              <br />A complete set of tools for your own research process.
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
                Go from a stock to its story. Explore the score out of 100, strengths, risk flags,
                peer comparisons and holding-plan context. Dig into the financial inputs and company
                profile behind each result.
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
                Compare options strategies, Greeks, breakevens and payoff diagrams. Examine calls,
                puts, spreads, strangles, collars and butterflies.
              </p>
              <OptionsDemo />
              <Link to="/options" className="ds-text-link">
                Enter the options lab <ArrowUpRight size={16} />
              </Link>
            </article>
          </div>
          <div className="ds-small-grid">
            {[
              {
                icon: Newspaper,
                tag: "CONTEXT",
                title: "Connect the headlines.",
                text: "Company news and broader market feeds bring the day's developments alongside the businesses you research.",
                link: "/screener",
                cta: "Explore market news",
              },
              {
                icon: CalendarDays,
                tag: "TIMING",
                title: "See what's ahead.",
                text: "An economic calendar, earnings events and dividends help you connect company research with the wider market schedule.",
                link: "/calendar",
                cta: "Open the calendar",
              },
              {
                icon: Rocket,
                tag: "DISCOVERY",
                title: "Follow the next chapter.",
                text: "Explore the IPO pipeline, offering details and available research context before a new name becomes familiar.",
                link: "/ipo",
                cta: "Explore upcoming IPOs",
              },
              {
                icon: Radar,
                tag: "DUE DILIGENCE",
                title: "Ask the harder questions.",
                text: "Forensic checks, risk explanations and peer analysis help you investigate accounting quality, business resilience and valuation traps.",
                link: "/research-checklist",
                cta: "Open the research checklist",
              },
              {
                icon: BellRing,
                tag: "YOUR WORKSPACE",
                title: "Keep your ideas close.",
                text: "Organise stocks in your watchlist, revisit your research and explore score-change tracking and research alerts where available.",
                link: "/portfolio",
                cta: "Open My Stocks",
              },
              {
                icon: BookOpen,
                tag: "UNDERSTANDING",
                title: "Build your own conviction.",
                text: "Plain-language ratio explanations, investing guides and company-research questions help you understand the why behind the numbers.",
                link: "/learn",
                cta: "Explore the learning hub",
              },
            ].map(({ icon: Icon, ...item }) => (
              <article key={item.tag} className="ds-feature-small" data-reveal>
                <div className="ds-card-heading">
                  <Icon size={22} />
                  <span className="ds-tag">{item.tag}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link to={item.link} className="ds-text-link">
                  {item.cta} <ArrowUpRight size={15} />
                </Link>
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
                "Unpack the score, explore financials, read the news and test your valuation assumptions.",
              ],
              [
                "03",
                "Make it yours",
                "Compare peers, study the downside and build a watchlist around your own research and objectives.",
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
            {FAQS.map(([question, answer], i) => (
              <div key={question} className={faq === i ? "is-open" : ""}>
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

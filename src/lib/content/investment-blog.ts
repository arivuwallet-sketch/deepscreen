export type BlogSource = {
  id: string;
  title: string;
  publisher: string;
  date: string;
  href: string;
};

export type BlogParagraph = {
  text: string;
  sources?: string[];
};

export type BlogTable = {
  caption: string;
  headers: string[];
  rows: string[][];
};

export type BlogSection = {
  id: string;
  heading: string;
  answer: string;
  paragraphs?: BlogParagraph[];
  bullets?: string[];
  table?: BlogTable;
  note?: string;
};

export type BlogFaq = {
  q: string;
  a: string;
};

export type BlogPost = {
  slug: string;
  category: "Mutual funds" | "ETFs" | "REITs";
  title: string;
  h1: string;
  description: string;
  excerpt: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  published: string;
  updated: string;
  readingMinutes: number;
  directAnswer: string;
  uniqueAngle: string;
  keyTakeaways: string[];
  sections: BlogSection[];
  faqs: BlogFaq[];
  sources: BlogSource[];
  relatedLinks: Array<{ label: string; href: string }>;
};

export const INVESTMENT_BLOG_POSTS: BlogPost[] = [
  {
    slug: "direct-vs-regular-mutual-funds-india",
    category: "Mutual funds",
    title: "Direct vs Regular Mutual Funds: Cost & NAV | DeepScreen",
    h1: "Direct vs regular mutual funds: what actually changes?",
    description:
      "Compare Direct and Regular mutual fund plans in India: portfolio, TER, NAV, distributor cost, long-term compounding and what to check before switching.",
    excerpt:
      "Direct and Regular plans can hold the same portfolio under the same fund manager, but their ongoing costs differ. This guide shows exactly where the gap comes from and how a small annual cost difference can compound over time.",
    primaryKeyword: "direct vs regular mutual funds",
    secondaryKeywords: [
      "direct mutual fund vs regular mutual fund",
      "direct plan mutual fund",
      "regular plan mutual fund",
      "mutual fund expense ratio",
      "TER mutual fund",
      "direct vs regular NAV",
      "switch regular to direct mutual fund",
    ],
    published: "2026-10-02",
    updated: "2026-10-02",
    readingMinutes: 9,
    directAnswer:
      "Direct and Regular plans are two ways to invest in the same mutual fund scheme. AMFI says they can share the same portfolio and fund manager, but Direct plans exclude distributor commission from the expense structure and therefore have a lower expense ratio. The practical trade-off is lower ongoing cost versus distributor assistance.",
    uniqueAngle:
      "The DeepScreen Cost-Gap Calculator shows how a hypothetical 0.25, 0.50 or 1.00 percentage-point annual return gap can change a 20-year SIP outcome without pretending those gaps apply to every scheme.",
    keyTakeaways: [
      "The underlying scheme can be the same while the plan-level expense ratio and NAV differ.",
      "Direct plans remove the distributor-commission layer; Regular plans are distributed through an intermediary.",
      "Compare the current TER of the exact plan, not a generic category average.",
      "A small recurring cost gap can become material over long holding periods because the difference compounds.",
      "Do not switch only because a Direct NAV is higher; check exit-load terms, tax implications and whether you still need ongoing advice or execution help.",
    ],
    sections: [
      {
        id: "quick-comparison",
        heading: "Direct vs Regular mutual funds: the quick comparison",
        answer:
          "The investment portfolio can be common to both plans; the main structural difference is how the plan is distributed and what recurring expenses it bears.",
        table: {
          caption: "Direct Plan vs Regular Plan",
          headers: ["Question", "Direct Plan", "Regular Plan"],
          rows: [
            ["Underlying scheme", "Same scheme", "Same scheme"],
            ["Portfolio and fund manager", "Common portfolio / manager", "Common portfolio / manager"],
            ["Distributor involved", "No distributor required", "Usually routed through a distributor or intermediary"],
            ["Distribution commission inside plan costs", "Excluded", "Can be included within plan expenses"],
            ["Expense ratio", "Lower than the Regular Plan of the same scheme", "Higher than the Direct Plan of the same scheme"],
            ["NAV", "Separate NAV", "Separate NAV"],
            ["What you manage", "Fund selection and execution yourself or through separately paid advice", "Distributor can assist with execution and service"],
          ],
        },
        paragraphs: [
          {
            text:
              "AMFI describes Direct and Regular as plans of the same scheme with a common portfolio and the same fund manager, while the expense ratios differ because Direct does not route distribution commission through the plan.",
            sources: ["amfi-direct"],
          },
        ],
      },
      {
        id: "expense-ratio",
        heading: "Why does the expense ratio matter?",
        answer:
          "The expense ratio is charged against scheme assets, so it reduces the NAV and the return investors keep. The effect is recurring, not a one-time fee.",
        paragraphs: [
          {
            text:
              "AMFI defines the total expense ratio, or TER, as the operating expenses of a mutual fund scheme expressed as a percentage of its net assets. The NAV is disclosed after deducting these expenses.",
            sources: ["amfi-ter-guide"],
          },
          {
            text:
              "AMFI's current TER disclosure page, which references the SEBI (Mutual Funds) Regulations, 2026, states that the base expense ratio of a Direct Plan must be lower because distribution expenses and commission are excluded.",
            sources: ["amfi-ter-current"],
          },
          {
            text:
              "This is why comparing two different schemes by NAV alone is misleading. A ₹100 NAV is not automatically cheaper than a ₹500 NAV. NAV is a per-unit accounting value; the decision should be based on the mandate, portfolio, risk, performance, costs and fit for the investor's objective.",
          },
        ],
      },
      {
        id: "cost-gap-calculator",
        heading: "How much can a small annual cost gap matter over 20 years?",
        answer:
          "Compounding makes recurring differences larger over long horizons, but the size of the effect depends on the actual TER gap, investment path and market returns.",
        paragraphs: [
          {
            text:
              "The table below is a DeepScreen illustration, not a forecast. It assumes a ₹10,000 monthly contribution for 20 years, month-end contributions, a hypothetical 11.5% annual return for the lower-cost plan, and the same underlying gross portfolio return before a 0.25, 0.50 or 1.00 percentage-point annual drag. Taxes, exit loads, cash-flow timing and real fund tracking are ignored.",
          },
        ],
        table: {
          caption: "DeepScreen Cost-Gap Calculator — hypothetical ₹10,000 monthly SIP for 20 years",
          headers: ["Hypothetical annual gap", "Lower-cost outcome", "Higher-cost outcome", "Difference after 20 years"],
          rows: [
            ["0.25 percentage point", "₹85.8 lakh", "₹83.3 lakh", "₹2.5 lakh"],
            ["0.50 percentage point", "₹85.8 lakh", "₹80.9 lakh", "₹5.0 lakh"],
            ["1.00 percentage point", "₹85.8 lakh", "₹76.2 lakh", "₹9.6 lakh"],
          ],
        },
        note:
          "Illustration only. The arithmetic demonstrates compounding; it does not estimate any specific scheme's future return or actual Direct-Regular TER gap.",
      },
      {
        id: "nav-difference",
        heading: "Why do Direct and Regular plans have different NAVs?",
        answer:
          "They have separate NAVs because plan-level expenses differ even when the portfolio is common.",
        paragraphs: [
          {
            text:
              "AMFI states that a Direct Plan has a separate NAV from the Regular Plan and that the lower expense ratio can translate into a higher value over time, all else equal.",
            sources: ["amfi-direct"],
          },
          {
            text:
              "That does not mean a higher NAV is evidence that one plan is overvalued or undervalued. The NAV difference mainly reflects the history of plan-level expenses and cash flows. Performance comparisons should therefore use total returns for the same scheme, option and time period.",
          },
        ],
      },
      {
        id: "who-does-what",
        heading: "What are you paying for in a Regular Plan?",
        answer:
          "A Regular Plan can compensate the distribution channel that helps an investor access, service and transact in the fund; it does not create a different underlying portfolio.",
        paragraphs: [
          {
            text:
              "AMFI's explanation is explicit that Direct plans are for investors who invest without routing the transaction through a distributor or agent, while Regular plans use that distribution channel.",
            sources: ["amfi-direct"],
          },
          {
            text:
              "The useful question is therefore not 'is Direct always better?' but 'what service am I receiving for the ongoing cost difference?' Someone who can independently choose, monitor and rebalance funds may value lower plan expenses. Someone relying on a distributor for service or hand-holding should assess the quality and conflicts of that service rather than treating it as free.",
          },
        ],
      },
      {
        id: "switching",
        heading: "Should you switch from Regular to Direct?",
        answer:
          "A lower TER can improve long-run economics, but a switch should be treated as a transaction, not a cosmetic plan rename.",
        paragraphs: [
          {
            text:
              "Scheme documents can apply different exit-load rules to switches between plans. The exact rule is scheme-specific, so the current Scheme Information Document and account statement should be checked before acting.",
            sources: ["sebi-switch-example", "amfi-switch-example"],
          },
          {
            text:
              "Tax treatment can also depend on the nature and timing of the transaction. DeepScreen does not provide personal tax advice; verify the current rules for your scheme and investor status before switching existing units.",
          },
          {
            text:
              "A practical alternative for someone who has decided to use Direct plans going forward is to evaluate future contributions separately from existing holdings. That avoids turning a cost comparison into an automatic instruction to sell.",
          },
        ],
      },
      {
        id: "decision-framework",
        heading: "A five-minute Direct vs Regular decision framework",
        answer:
          "Compare the exact plan costs, the service you actually receive and the consequences of changing existing units.",
        bullets: [
          "Confirm that you are comparing the same scheme, option and growth/IDCW choice.",
          "Look up the current TER for both plans on the AMC or AMFI disclosure, not an old screenshot.",
          "Write down what ongoing service the distributor provides and whether you use it.",
          "If considering a switch, check the scheme's current exit-load language and applicable tax treatment.",
          "Judge the plan choice separately from the fund choice: a low-cost plan does not rescue a fund that is unsuitable for the intended objective.",
        ],
      },
      {
        id: "mistakes",
        heading: "Common mistakes when comparing Direct and Regular plans",
        answer:
          "The most common errors are comparing different schemes, treating NAV as a price-to-value ratio and ignoring the service or transaction consequences behind the plan choice.",
        bullets: [
          "Comparing Direct Growth with Regular IDCW instead of matching the same option.",
          "Assuming a higher NAV means the Direct Plan is 'expensive'.",
          "Using an old TER when fund expenses can change.",
          "Assuming every switch has the same exit-load treatment.",
          "Focusing on a small fee gap while ignoring a poor benchmark fit, excessive risk or persistent underperformance.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do Direct and Regular mutual funds have the same portfolio?",
        a: "For the same mutual fund scheme, AMFI says Direct and Regular plans have a common portfolio and the same fund manager. Their expense ratios and NAVs differ because plan-level distribution costs differ.",
      },
      {
        q: "Why is Direct Plan NAV usually higher than Regular Plan NAV?",
        a: "The Direct Plan has lower recurring expenses because distributor commission is excluded. Since expenses are deducted from scheme assets, that lower drag can produce a higher NAV over time when the underlying portfolio is otherwise the same.",
      },
      {
        q: "Does a Direct Plan always give higher returns?",
        a: "Within the same scheme and option, lower recurring expenses create a structural return advantage all else equal. Actual investor outcomes still depend on the underlying portfolio, timing, taxes, loads and how long the units are held.",
      },
      {
        q: "Can I switch from Regular to Direct without selling the fund?",
        a: "Fund platforms may process a plan change as a switch, but it is still a transaction with scheme-specific load and possible tax consequences. Check the latest Scheme Information Document and current tax rules before acting.",
      },
      {
        q: "Where can I check the current expense ratio of a mutual fund?",
        a: "AMCs publish scheme expenses, and AMFI maintains a TER disclosure section for mutual fund schemes. Compare the exact Direct and Regular plan names because plan-level expense ratios differ.",
      },
    ],
    sources: [
      {
        id: "amfi-direct",
        title: "Direct Plan",
        publisher: "Association of Mutual Funds in India (AMFI)",
        date: "accessed October 2026",
        href: "https://www.amfiindia.com/investor/knowledge-center-info?zoneName=DirectPlan",
      },
      {
        id: "amfi-ter-guide",
        title: "Expense Ratio",
        publisher: "Association of Mutual Funds in India (AMFI)",
        date: "accessed October 2026",
        href: "https://www.amfiindia.com/investor/knowledge-center-info?zoneName=expenseRatio",
      },
      {
        id: "amfi-ter-current",
        title: "Total Expense Ratio (TER) of Mutual Fund Schemes",
        publisher: "Association of Mutual Funds in India (AMFI)",
        date: "accessed October 2026",
        href: "https://www.amfiindia.com/ter-of-mf-schemes",
      },
      {
        id: "sebi-switch-example",
        title: "Scheme Information Document example — plan switch and exit load",
        publisher: "Securities and Exchange Board of India (SEBI)",
        date: "2023",
        href: "https://www.sebi.gov.in/web/?file=https%3A%2F%2Fwww.sebi.gov.in%2Fsebi_data%2Fattachdocs%2Ffeb-2023%2F1676436991800.pdf",
      },
      {
        id: "amfi-switch-example",
        title: "Scheme disclosure example — Regular to Direct switch",
        publisher: "AMFI document repository",
        date: "scheme document",
        href: "https://portal.amfiindia.com/spages/6630.pdf",
      },
    ],
    relatedLinks: [
      { label: "Mutual fund analysis hub", href: "/mutual-funds" },
      { label: "Browse mutual funds on DeepScreen", href: "/investments" },
      { label: "DeepScreen data sources", href: "/data-sources" },
      { label: "ETF tracking error vs tracking difference", href: "/blog/etf-tracking-error-vs-tracking-difference" },
    ],
  },
  {
    slug: "etf-tracking-error-vs-tracking-difference",
    category: "ETFs",
    title: "ETF Tracking Error vs Tracking Difference | DeepScreen",
    h1: "ETF tracking error vs tracking difference: what each metric tells you",
    description:
      "Tracking difference is the ETF-index return gap; tracking error measures its variability. Learn the formulas, drivers and a practical comparison framework.",
    excerpt:
      "Two ETFs can follow the same index and still deliver different investor outcomes. Tracking difference measures the return gap; tracking error measures how consistently the ETF stays near its benchmark.",
    primaryKeyword: "ETF tracking error vs tracking difference",
    secondaryKeywords: [
      "ETF tracking error",
      "ETF tracking difference",
      "index fund tracking error",
      "ETF benchmark",
      "ETF expense ratio",
      "ETF premium discount NAV",
      "ETF bid ask spread",
    ],
    published: "2026-10-02",
    updated: "2026-10-02",
    readingMinutes: 10,
    directAnswer:
      "Tracking difference measures the return gap between an ETF and its benchmark over a period. Tracking error measures the variability of those return gaps. A passive ETF can have a small average gap but still track inconsistently, so the two metrics answer different questions and should be read together.",
    uniqueAngle:
      "The DeepScreen Tracking Matrix separates four ETF behaviours — efficient and consistent, consistently costly, erratic but near benchmark, and both costly and erratic — so two similar-looking tracking numbers become an actionable diagnostic.",
    keyTakeaways: [
      "Tracking difference is a return-gap measure; tracking error is a consistency measure.",
      "For Indian index funds, NSE describes tracking error against the Total Returns Index, which includes dividends.",
      "Expense ratio influences tracking, but cash, index changes, corporate actions and transaction costs also matter.",
      "Low tracking error does not guarantee a small return shortfall; a fund can lag consistently.",
      "ETF execution still matters: bid-ask spread and premium/discount to NAV can create costs that tracking statistics do not capture.",
    ],
    sections: [
      {
        id: "definitions",
        heading: "Tracking difference and tracking error are not the same thing",
        answer:
          "Tracking difference asks 'how far did the ETF finish from the index?' Tracking error asks 'how much did that gap wobble along the way?'",
        table: {
          caption: "Tracking difference vs tracking error",
          headers: ["Metric", "What it measures", "Simple interpretation", "Useful question"],
          rows: [
            ["Tracking difference", "Fund return minus benchmark return over a period", "Closer to zero means the realized return stayed nearer the benchmark", "How much return did the ETF gain or lose relative to the index?"],
            ["Tracking error", "Annualized standard deviation of periodic fund-minus-index return differences", "Lower means the relative return gap was more consistent", "How reliably did the ETF stay near the benchmark?"],
          ],
        },
        paragraphs: [
          {
            text:
              "NSE defines tracking error as the annualized standard deviation of the difference in returns between an index fund and its target index. NSE also says the calculation should use the Total Returns Index, which includes dividends.",
            sources: ["nse-tracking"],
          },
          {
            text:
              "Fidelity and ETF.com distinguish tracking difference from tracking error in the same way: tracking difference is the performance gap, while tracking error describes variability in that gap.",
            sources: ["fidelity-tracking", "etfcom-tracking"],
          },
        ],
      },
      {
        id: "formula",
        heading: "How do you calculate tracking difference?",
        answer:
          "Use the same period, currency and return convention for the ETF and benchmark, then subtract benchmark return from ETF return.",
        paragraphs: [
          {
            text:
              "DeepScreen uses the sign convention: tracking difference = ETF total return − benchmark total return. If an ETF returns 11.80% while its benchmark Total Returns Index returns 12.00%, the tracking difference is −0.20 percentage point.",
          },
          {
            text:
              "Always check the sign convention used by a factsheet or data vendor. Some presentations quote the shortfall as a positive number, while others preserve the negative sign for underperformance. The economic meaning is more important than the display convention.",
          },
        ],
      },
      {
        id: "tracking-error-formula",
        heading: "How do you calculate tracking error?",
        answer:
          "Calculate periodic ETF-minus-index return differences, take their standard deviation and annualize it using a frequency-appropriate factor.",
        paragraphs: [
          {
            text:
              "The important point is conceptual: tracking error does not tell you whether the ETF is ahead or behind the index. It tells you how variable the relative return has been.",
            sources: ["nse-tracking"],
          },
          {
            text:
              "That is why an ETF can have very low tracking error while delivering a persistent negative tracking difference. If it trails by nearly the same amount every period, the tracking path is consistent even though the long-run shortfall is real.",
          },
        ],
      },
      {
        id: "matrix",
        heading: "The DeepScreen Tracking Matrix: read both metrics together",
        answer:
          "Plot the size of the return gap against the variability of that gap. The combination is more informative than either number alone.",
        table: {
          caption: "DeepScreen Tracking Matrix",
          headers: ["Tracking difference", "Tracking error", "What it suggests", "What to investigate"],
          rows: [
            ["Small", "Low", "Efficient and consistent replication", "Confirm liquidity, costs and data period"],
            ["Large negative", "Low", "Consistently lagging benchmark", "TER, taxes, cash drag, replication structure"],
            ["Small average", "High", "Ends near benchmark but gets there erratically", "Rebalancing, cash flows, constituent changes, derivatives"],
            ["Large negative", "High", "Both costly and inconsistent tracking", "Fund structure, execution, liquidity and benchmark fit"],
          ],
        },
        paragraphs: [
          {
            text:
              "This matrix is a research framework, not a rating system. 'Small' and 'high' must be judged against ETFs tracking the same or a very similar benchmark over the same measurement period.",
          },
        ],
      },
      {
        id: "worked-example",
        heading: "Example: two ETFs can have the same annual gap but different tracking quality",
        answer:
          "A similar year-end tracking difference can hide very different paths.",
        table: {
          caption: "Illustrative quarterly relative returns; compounding ignored for clarity",
          headers: ["Quarter", "ETF A vs index", "ETF B vs index"],
          rows: [
            ["Q1", "−0.05 pp", "+0.10 pp"],
            ["Q2", "−0.05 pp", "−0.30 pp"],
            ["Q3", "−0.05 pp", "+0.15 pp"],
            ["Q4", "−0.05 pp", "−0.15 pp"],
            ["Approx. annual sum", "−0.20 pp", "−0.20 pp"],
          ],
        },
        paragraphs: [
          {
            text:
              "ETF A has the same small relative shortfall each quarter, so its tracking error would be low. ETF B finishes with a similar approximate annual shortfall but swings around the benchmark much more, so its tracking error would be higher. The example is hypothetical and exists only to show why the two metrics are not interchangeable.",
          },
        ],
      },
      {
        id: "drivers",
        heading: "What causes tracking error and tracking difference?",
        answer:
          "Fees are only one cause. Portfolio implementation, cash, flows and index events can all move an ETF away from its benchmark.",
        bullets: [
          "Expense ratio and other recurring fund costs.",
          "Bid-ask spreads and transaction costs when the fund trades holdings.",
          "Cash held for liquidity or pending subscriptions and redemptions.",
          "Index constituent changes and the timing of rebalancing trades.",
          "Corporate actions and implementation differences.",
          "Sampling or alternative replication methods instead of holding every index constituent at exact weight.",
          "Taxes, securities-lending revenue or derivative implementation where relevant to the fund.",
        ],
        paragraphs: [
          {
            text:
              "NSE specifically highlights inflows and outflows, corporate actions, changes in index constituents, liquidity cash and transaction costs as drivers of tracking error.",
            sources: ["nse-tracking"],
          },
        ],
      },
      {
        id: "execution",
        heading: "Why tracking statistics are not enough for an ETF trade",
        answer:
          "Tracking measures the fund against its benchmark; it does not fully capture the price you personally pay in the market.",
        paragraphs: [
          {
            text:
              "Investor.gov notes that ETF shares trade at market prices that can be above or below NAV. It also explains that the bid-ask spread is a transaction cost and that more liquid, higher-volume ETFs typically have tighter spreads.",
            sources: ["investor-etf"],
          },
          {
            text:
              "This creates two separate layers of due diligence: fund efficiency and trade execution. A well-tracking ETF can still be expensive to enter or exit if the spread is wide or the market price is far from NAV.",
          },
        ],
      },
      {
        id: "comparison-checklist",
        heading: "How to compare two ETFs tracking the same index",
        answer:
          "Use the same benchmark and measurement window, then compare tracking, cost, concentration and execution in that order.",
        bullets: [
          "Confirm both ETFs really track the same index version, ideally the same Total Returns Index.",
          "Compare multi-period tracking difference, not just the latest one-year number.",
          "Compare tracking error over the same frequency and window.",
          "Check expense ratio, but do not assume the lowest fee will always have the smallest realized tracking difference.",
          "Review AUM, normal trading volume, median spread and premium/discount history.",
          "Check whether one ETF uses sampling, derivatives or a different replication method.",
          "Re-check after major index rebalances or when fund size/liquidity changes materially.",
        ],
      },
      {
        id: "mistakes",
        heading: "Common tracking-metric mistakes",
        answer:
          "Most mistakes come from comparing incompatible numbers or treating one metric as a complete quality score.",
        bullets: [
          "Comparing an ETF against a price index while the fund benchmark is a Total Returns Index.",
          "Comparing one-year tracking difference for one fund with three-year tracking error for another.",
          "Thinking low tracking error means low cost.",
          "Ignoring the sign convention on tracking difference.",
          "Ignoring spread and premium/discount because they are not part of published tracking error.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which is more important: tracking error or tracking difference?",
        a: "They answer different questions. Tracking difference shows the realized return gap from the benchmark; tracking error shows the consistency of that gap. For a passive ETF, read both together and compare them over the same period and benchmark.",
      },
      {
        q: "Is lower tracking error always better?",
        a: "Lower tracking error means more consistent benchmark-relative performance, but it does not guarantee a small return shortfall. An ETF can lag its benchmark by a similar amount every period and still report low tracking error.",
      },
      {
        q: "Can tracking difference be positive?",
        a: "Yes. Under the fund-return-minus-index convention, a positive tracking difference means the ETF outperformed the benchmark over the measured period. Securities lending, implementation timing and other effects can sometimes offset part of the fee drag.",
      },
      {
        q: "Does expense ratio equal tracking difference?",
        a: "No. Expense ratio is one driver of tracking difference, but cash drag, transaction costs, taxes, rebalancing, sampling and securities-lending income can make the realized return gap larger or smaller than the headline fee.",
      },
      {
        q: "What benchmark should an Indian index ETF use for tracking?",
        a: "NSE states that tracking error should be calculated against the Total Returns Index because it includes dividends. Always verify the benchmark named in the ETF's own scheme documents.",
      },
    ],
    sources: [
      {
        id: "nse-tracking",
        title: "Tracking Error",
        publisher: "National Stock Exchange of India (NSE)",
        date: "accessed October 2026",
        href: "https://www.nseindia.com/static/products-services/indices-tracking-error",
      },
      {
        id: "fidelity-tracking",
        title: "Understanding tracking error and tracking difference for an ETF",
        publisher: "Fidelity",
        date: "accessed October 2026",
        href: "https://www.fidelity.com/learning-center/investment-products/etf/tracking-error-and-tracking-difference",
      },
      {
        id: "etfcom-tracking",
        title: "Tracking Difference / Tracking Error",
        publisher: "ETF.com",
        date: "accessed October 2026",
        href: "https://www.etf.com/tracking-differencetracking-error",
      },
      {
        id: "investor-etf",
        title: "Updated Investor Bulletin: Exchange-Traded Funds (ETFs)",
        publisher: "Investor.gov / U.S. SEC Office of Investor Education and Advocacy",
        date: "accessed October 2026",
        href: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-24",
      },
    ],
    relatedLinks: [
      { label: "ETF analysis hub", href: "/etfs" },
      { label: "Browse ETFs on DeepScreen", href: "/investments" },
      { label: "DeepScreen data sources", href: "/data-sources" },
      { label: "Direct vs Regular mutual funds", href: "/blog/direct-vs-regular-mutual-funds-india" },
    ],
  },
  {
    slug: "ndcf-vs-affo-reit-analysis-india",
    category: "REITs",
    title: "NDCF vs AFFO for Indian REITs: Cash Flow | DeepScreen",
    h1: "NDCF vs AFFO: which REIT cash-flow metric should you use in India?",
    description:
      "Understand NDCF, AFFO, FFO and NOI for REIT analysis. Learn why Indian REIT distributions use SEBI's NDCF framework and how to compare cash-flow quality.",
    excerpt:
      "Indian REITs are built around NDCF, while global REIT research often discusses FFO and AFFO. They are not interchangeable. This guide shows what each measure is for and how to connect property income to distributions.",
    primaryKeyword: "NDCF vs AFFO",
    secondaryKeywords: [
      "NDCF REIT",
      "AFFO REIT",
      "Indian REIT NDCF",
      "REIT cash flow India",
      "REIT distribution NDCF",
      "FFO vs AFFO",
      "REIT NOI",
      "REIT distribution coverage",
    ],
    published: "2026-10-02",
    updated: "2026-10-02",
    readingMinutes: 11,
    directAnswer:
      "For an Indian REIT, NDCF is the primary distribution-oriented cash-flow measure because SEBI prescribes a standardized NDCF framework and the REIT regulations require minimum distribution of NDCF. AFFO is useful for international comparison, but Nareit says AFFO has no standardized definition, so it should not be substituted for an Indian REIT's reported NDCF.",
    uniqueAngle:
      "The DeepScreen REIT Cash-Flow Bridge separates property economics, trust-level cash generation and investor distribution so readers do not mix NOI, accounting profit, AFFO and NDCF in one valuation shortcut.",
    keyTakeaways: [
      "NOI describes property-level operating economics; it is not the same as cash available to unit holders.",
      "Indian REITs report NDCF under a standardized SEBI framework.",
      "The SEBI REIT framework requires at least 90% of NDCF to be distributed, subject to the regulations and distribution mechanics.",
      "AFFO is widely used internationally but is not standardized; compare definitions before comparing REITs.",
      "Distribution yield is only one output. NDCF per unit growth, occupancy, WALE, leverage, capex and refinancing risk determine whether that distribution is durable.",
    ],
    sections: [
      {
        id: "metric-map",
        heading: "NDCF, AFFO, FFO and NOI: the metric map",
        answer:
          "These measures sit at different levels of the REIT economics, so they should not be used as synonyms.",
        table: {
          caption: "REIT cash-flow metrics at a glance",
          headers: ["Metric", "What it tries to show", "Best use", "Main caution"],
          rows: [
            ["NOI", "Property revenue less property operating expenses", "Asset operating performance", "Before financing, trust costs and several cash-flow adjustments"],
            ["FFO", "REIT operating performance after adjusting accounting earnings for real-estate depreciation and certain property-sale effects", "International REIT operating comparison", "Not a direct measure of cash available for distribution"],
            ["AFFO", "Recurring or normalized FFO after further company/analyst adjustments", "International recurring cash-flow analysis", "No standardized definition"],
            ["NDCF", "Net distributable cash flow under the applicable Indian REIT framework", "Indian REIT distribution capacity", "Read the reported reconciliation; not identical to AFFO"],
          ],
        },
        paragraphs: [
          {
            text:
              "Nareit defines FFO as a supplemental REIT operating-performance measure that adjusts net income for specified real-estate depreciation, property-sale and impairment effects. Nareit describes AFFO as a further recurring or normalized adjustment to FFO and explicitly says there is no standardized definition of AFFO.",
            sources: ["nareit-ffo", "nareit-affo"],
          },
          {
            text:
              "SEBI standardized the NDCF framework for Indian REITs, making NDCF the more relevant starting point when the question is how much cash the trust can distribute under Indian rules.",
            sources: ["sebi-ndcf-circular", "sebi-reit-regs"],
          },
        ],
      },
      {
        id: "india-ndcf",
        heading: "Why NDCF matters more for Indian REIT distributions",
        answer:
          "NDCF is tied directly to the Indian regulatory distribution framework, while AFFO is an analytical convention rather than the statutory payout base.",
        paragraphs: [
          {
            text:
              "The SEBI REIT Regulations, last amended on 18 April 2026, remain the governing framework for Indian REITs. SEBI's NDCF circular provides a standardized computation framework, and the regulations require minimum distribution of net distributable cash flows.",
            sources: ["sebi-reit-regs", "sebi-ndcf-circular"],
          },
          {
            text:
              "The Indian REITs Association explains the same chain in investor language: after cash expenses and relevant adjustments, the remaining cash flows are NDCF, calculated under the standardized SEBI framework, and at least 90% is distributed to unit holders subject to the rules.",
            sources: ["ira-knowledge"],
          },
        ],
      },
      {
        id: "cash-flow-bridge",
        heading: "The DeepScreen REIT Cash-Flow Bridge",
        answer:
          "Start with rent and property expenses, move through financing and trust-level adjustments, then compare NDCF with the actual distribution.",
        table: {
          caption: "Illustrative cash-flow bridge — not a real REIT",
          headers: ["Step", "Illustrative amount", "What it represents"],
          rows: [
            ["Rental and other property income", "₹110", "Cash generated by the property platform before property operating costs"],
            ["Less property operating costs", "₹30", "Maintenance, property taxes, insurance and other property-level costs"],
            ["Illustrative NOI", "₹80", "Property-level operating income"],
            ["Less financing, trust costs, taxes and other NDCF adjustments", "₹30", "Simplified bridge to distributable cash; actual SEBI calculation is more detailed"],
            ["Illustrative NDCF", "₹50", "Cash base available for distribution in this simplified example"],
            ["Illustrative distribution", "₹46", "92% of the illustrative NDCF"],
          ],
        },
        paragraphs: [
          {
            text:
              "The point of the bridge is not the numbers. It is the order. NOI tells you how the buildings are performing; NDCF moves closer to the cash available for unit-holder distributions after financing and trust-level adjustments.",
          },
          {
            text:
              "Brookfield India REIT's investor presentation provides a real-world example of an NDCF walk-down from revenue and NOI through financing and other adjustments to NDCF per unit and distribution per unit.",
            sources: ["brookfield-example"],
          },
        ],
        note:
          "The example is deliberately simplified. Use each REIT's published NDCF reconciliation for actual analysis.",
      },
      {
        id: "affo",
        heading: "Where does AFFO fit?",
        answer:
          "AFFO is useful when comparing REITs in markets where it is commonly reported, but it must be read with the issuer's definition.",
        paragraphs: [
          {
            text:
              "Nareit's glossary says AFFO typically starts from FFO and adjusts for recurring capital expenditures and non-cash rent items, but there is no standardized definition. Two REITs can therefore report AFFO using different adjustment sets.",
            sources: ["nareit-affo"],
          },
          {
            text:
              "For an Indian REIT, DeepScreen treats AFFO as contextual rather than authoritative if the issuer does not report it. We do not manufacture an AFFO number from generic company cash-flow fields and label it as if it were issuer-reported.",
          },
        ],
      },
      {
        id: "ninety-percent",
        heading: "What does the 90% NDCF distribution rule actually tell you?",
        answer:
          "It sets a minimum distribution framework; it does not guarantee a high, stable or growing yield.",
        paragraphs: [
          {
            text:
              "SEBI's framework requires minimum distribution of NDCF, and its standardized circular illustrates that the minimum must be satisfied on a cumulative periodic basis for the financial year.",
            sources: ["sebi-ndcf-circular"],
          },
          {
            text:
              "A 90% payout rule does not remove business risk. If occupancy falls, rent growth slows, interest costs rise or refinancing becomes more expensive, NDCF itself can weaken. The payout percentage is therefore only as strong as the cash-flow base underneath it.",
          },
        ],
      },
      {
        id: "coverage",
        heading: "How should you test REIT distribution quality?",
        answer:
          "Follow NDCF per unit and the distribution per unit together, then test whether property operations and the balance sheet can support both.",
        bullets: [
          "NDCF per unit: is the cash-flow base growing, flat or shrinking over several periods?",
          "Distribution per unit: is it supported by recurring NDCF rather than one-off asset sales or unusual financing movements?",
          "Occupancy and WALE: do leases provide enough visibility to support future rent collection?",
          "Tenant concentration: would losing one or two major tenants materially hit NOI?",
          "Leverage: compare LTV or net debt to asset value, interest coverage and debt maturities.",
          "Interest-rate exposure: check fixed versus floating debt and near-term refinancing.",
          "Capital expenditure: distinguish maintenance capex from expansion or acquisition spending.",
          "NAV and cap rate: use compatible valuation dates and realistic NOI assumptions before calling a discount cheap.",
        ],
      },
      {
        id: "valuation",
        heading: "Why a high REIT yield can be misleading",
        answer:
          "Distribution yield rises when distributions increase, but it also rises when the unit price falls. A high yield can therefore be a warning signal rather than a bargain.",
        paragraphs: [
          {
            text:
              "A sustainable distribution should be tested against recurring NDCF, property occupancy, lease expiries, debt service and required capital expenditure. Yield without coverage analysis is incomplete.",
          },
          {
            text:
              "For valuation, compare the market price with a current NAV estimate and implied cap rate only after checking the valuation date and property assumptions. A discount to stale NAV can disappear when market cap rates move.",
          },
        ],
      },
      {
        id: "mistakes",
        heading: "Common mistakes in Indian REIT cash-flow analysis",
        answer:
          "The biggest errors come from mixing accounting, operating and distributable measures that answer different questions.",
        bullets: [
          "Using PAT as if it were distributable property cash flow.",
          "Treating NOI as cash available to unit holders before financing and trust costs.",
          "Comparing AFFO across REITs without checking each issuer's definition.",
          "Replacing issuer-reported NDCF with a homemade generic free-cash-flow number.",
          "Looking at distribution yield without NDCF per unit, leverage and lease quality.",
          "Comparing NAV discounts from different valuation dates.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is NDCF in an Indian REIT?",
        a: "NDCF means net distributable cash flow. Indian REITs calculate it under a standardized SEBI framework, and it is the regulatory cash-flow base used for minimum distribution requirements. Read the REIT's own reconciliation because the calculation includes multiple trust, SPV and financing adjustments.",
      },
      {
        q: "Is NDCF the same as AFFO?",
        a: "No. Both try to get closer to recurring cash economics, but NDCF is the Indian regulatory distribution framework while AFFO is a non-standardized analytical measure used widely in international REIT research. Do not substitute one for the other without a reconciliation.",
      },
      {
        q: "Do Indian REITs have to distribute 90% of NDCF?",
        a: "SEBI's REIT framework requires at least 90% of applicable net distributable cash flows to be distributed, subject to the regulations and the trust's distribution mechanics. That minimum does not guarantee that NDCF itself will grow.",
      },
      {
        q: "What is the difference between NOI and NDCF?",
        a: "NOI measures property-level operating income before financing and several trust-level items. NDCF moves further down the cash-flow chain and is designed to represent cash available for distribution under the Indian REIT framework.",
      },
      {
        q: "Why not use P/E to value a REIT?",
        a: "P/E can be distorted by real-estate depreciation and other accounting items. REIT analysis usually adds property and cash-flow measures such as NOI, NDCF or AFFO, leverage, NAV and cap rates. P/E can be secondary context but should not be the only valuation tool.",
      },
    ],
    sources: [
      {
        id: "sebi-reit-regs",
        title: "Securities and Exchange Board of India (Real Estate Investment Trusts) Regulations, 2014 — last amended 18 April 2026",
        publisher: "SEBI",
        date: "18 April 2026",
        href: "https://www.sebi.gov.in/legal/regulations/apr-2026/securities-and-exchange-board-of-india-real-estate-investment-trusts-regulations-2014-last-amended-on-april-18-2026-_101013.html",
      },
      {
        id: "sebi-ndcf-circular",
        title: "Framework for calculation of Net Distributable Cash Flow by REITs",
        publisher: "SEBI",
        date: "6 December 2023",
        href: "https://www.sebi.gov.in/sebi_data/attachdocs/dec-2023/1701864866797.PDF",
      },
      {
        id: "nareit-ffo",
        title: "Funds From Operations (FFO)",
        publisher: "Nareit",
        date: "accessed October 2026",
        href: "https://www.reit.com/glossary/funds-operation-ffo",
      },
      {
        id: "nareit-affo",
        title: "Adjusted Funds from Operations (AFFO)",
        publisher: "Nareit",
        date: "accessed October 2026",
        href: "https://www.reit.com/glossary/adjusted-funds-operations-affo",
      },
      {
        id: "ira-knowledge",
        title: "Knowledge Centre",
        publisher: "Indian REITs Association",
        date: "accessed October 2026",
        href: "https://indianreitsassociation.com/knowledge-centre/",
      },
      {
        id: "brookfield-example",
        title: "Q1 FY2026 Earnings Presentation — NDCF walk-down",
        publisher: "Brookfield India Real Estate Trust",
        date: "1 August 2025",
        href: "https://www.brookfieldindiareit.in/files/presentation/Earnings_Presentation_01_aug_2025.pdf",
      },
    ],
    relatedLinks: [
      { label: "REIT analysis hub", href: "/reits" },
      { label: "Browse REITs on DeepScreen", href: "/investments" },
      { label: "DeepScreen data sources", href: "/data-sources" },
      { label: "ETF tracking error vs tracking difference", href: "/blog/etf-tracking-error-vs-tracking-difference" },
    ],
  },
];

const BLOG_BY_SLUG = new Map(INVESTMENT_BLOG_POSTS.map((post) => [post.slug, post]));

export function findInvestmentBlogPost(slug: string): BlogPost | undefined {
  return BLOG_BY_SLUG.get(slug);
}

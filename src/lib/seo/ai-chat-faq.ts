/**
 * Public DeepScreen AI chatbot FAQ — factual product documentation.
 * Facts reflect the 7 October 2026 chat UI and server tool contracts.
 * The visible HTML, FAQ JSON-LD and knowledge index share these answers.
 */
export type AiChatFaq = {
  id: string;
  question: string;
  answer: string;
  link: { label: string; href: string };
};

export type AiChatFaqGroup = {
  id: string;
  title: string;
  description: string;
  faqs: AiChatFaq[];
};

export const AI_CHAT_FAQ_GROUPS: AiChatFaqGroup[] = [
  {
    "id": "about-ai",
    "title": "About the DeepScreen AI chatbot",
    "description": "What the assistant does, who it is for, and how to get a useful first answer.",
    "faqs": [
      {
        "id": "what-is-deepscreen-ai",
        "question": "What is DeepScreen AI?",
        "answer": "DeepScreen AI is a finance-focused chatbot inside DeepScreen. It explains investing and personal-finance concepts, searches supported listed companies, and can retrieve available stock quotes, financial ratios, DeepScreen's 13-factor score and risk context. It is a research aid, not a brokerage or a personal investment adviser.",
        "link": {
          "label": "Explore the DeepScreen stock screener",
          "href": "/screener"
        }
      },
      {
        "id": "what-can-i-ask",
        "question": "What can I ask the DeepScreen AI finance chatbot?",
        "answer": "Ask about company fundamentals, stock comparisons, P/E, ROE, ROCE, debt, mutual funds, ETFs, REITs, IPOs, options, chart concepts, commodities, crypto, forex, budgeting, emergency funds and debt management. It focuses on financial education and may decline unrelated topics.",
        "link": {
          "label": "Browse finance questions and answers",
          "href": "/answers"
        }
      },
      {
        "id": "which-stock-markets",
        "question": "Which stock exchanges and how many stocks does DeepScreen AI cover?",
        "answer": "The DeepScreen stock directory covers more than 13,000 listings across NSE and BSE in India, NYSE and Nasdaq in the United States, and LSE in the United Kingdom. Directory coverage does not guarantee a live quote or complete fundamentals for every ticker.",
        "link": {
          "label": "Browse supported exchanges",
          "href": "/screener"
        }
      },
      {
        "id": "beginner-or-professional",
        "question": "Is DeepScreen AI useful for beginners and experienced investors?",
        "answer": "Yes. A beginner can ask for plain-English definitions and worked examples; an experienced researcher can ask for available peer comparisons, valuation assumptions and risk checks. Either way, the answer is a starting point for independent verification.",
        "link": {
          "label": "Read the research checklist",
          "href": "/research-checklist"
        }
      },
      {
        "id": "how-to-ask-stock-question",
        "question": "How do I write a useful prompt for stock analysis?",
        "answer": "Include the company name or ticker, exchange, the metrics you care about and your research question. For example: 'Compare three NSE banks on ROE, valuation, debt and major risks; show source dates and missing fields.' A precise question makes assumptions easier to check.",
        "link": {
          "label": "Learn how DeepScreen evaluates stocks",
          "href": "/methodology"
        }
      },
      {
        "id": "chatbot-free-access",
        "question": "Can I open DeepScreen AI without buying a subscription?",
        "answer": "Yes. The chat page and its FAQs are publicly accessible, but sending questions to DeepScreen AI requires a signed-in account with an active Pro plan. Stock search, prices, scores, news and educational research remain free. Check the pricing page for current plan features; Pro does not guarantee unlimited AI usage or provider data availability.",
        "link": {
          "label": "Check current pricing and features",
          "href": "/pricing"
        }
      }
    ]
  },
  {
    "id": "stock-research",
    "title": "Stocks, screening, scores and market data",
    "description": "How company search and financial-data checks work—and what the assistant cannot verify.",
    "faqs": [
      {
        "id": "find-stock-by-name",
        "question": "Can DeepScreen AI search for a stock by ticker or company name?",
        "answer": "Yes. For a supported listing, the chat uses DeepScreen's stock-search tool to match a company name, symbol, sector or exchange. Supply the exchange when a symbol is ambiguous. An unlisted or unsupported company may not appear.",
        "link": {
          "label": "Search DeepScreen stocks",
          "href": "/screener"
        }
      },
      {
        "id": "latest-stock-prices",
        "question": "Does DeepScreen AI show live or real-time stock prices?",
        "answer": "It can request the latest available provider-backed quote for a supported stock, including a data timestamp when available. It does not guarantee an exchange-grade real-time feed: quotes can be delayed, missing or stale. Verify executable prices with your broker or exchange.",
        "link": {
          "label": "Read market-data sources and limitations",
          "href": "/data-sources"
        }
      },
      {
        "id": "stock-fundamentals",
        "question": "Where does DeepScreen AI get financial ratios and fundamentals?",
        "answer": "Its stock-research tool can combine available market quotes and fundamentals from supported provider inputs, including Yahoo Finance, and eligible Indian company ratio summaries from Screener.in. Returned fields can be missing or modeled; important values should be checked against current company filings.",
        "link": {
          "label": "How DeepScreen sources its data",
          "href": "/data-sources"
        }
      },
      {
        "id": "compare-stocks",
        "question": "Can DeepScreen AI compare two or more stocks?",
        "answer": "Yes, when the companies can be located and their research data is available. It can compare valuation, profitability, capital efficiency, leverage, growth and stated risks, while noting reporting differences and missing data. A comparison is not a guaranteed ranking of future returns.",
        "link": {
          "label": "Use the fundamental research checklist",
          "href": "/research-checklist"
        }
      },
      {
        "id": "how-ai-score-works",
        "question": "What does the DeepScreen 13-factor stock score mean in AI answers?",
        "answer": "The score is DeepScreen's analytical model output from its documented fundamental factors, not a third-party rating or a recommendation to buy. The assistant should distinguish available provider inputs from modeled or unavailable fields and discuss risks alongside any verdict.",
        "link": {
          "label": "Read the 13-factor scoring methodology",
          "href": "/methodology"
        }
      },
      {
        "id": "buy-sell-picks",
        "question": "Can DeepScreen AI tell me which stock to buy or sell today?",
        "answer": "It can help build a research shortlist and compare factors, but it does not provide personalized buy/sell advice or a guaranteed winning pick. A decision depends on your goals, time horizon, risk capacity, position size and information verified beyond the model.",
        "link": {
          "label": "Research before buying",
          "href": "/research-checklist"
        }
      },
      {
        "id": "missing-stock-data",
        "question": "Why might a stock price, ratio or score be unavailable?",
        "answer": "A ticker may be outside the directory, a provider may time out, a filing may not contain the required value, or data may not pass verification. DeepScreen should identify unavailable information rather than invent a quote, ratio or financial fact.",
        "link": {
          "label": "Understand missing financial data",
          "href": "/data-sources"
        }
      },
      {
        "id": "price-target-prediction",
        "question": "Can DeepScreen AI predict tomorrow's stock price or guarantee a price target?",
        "answer": "No model can guarantee tomorrow's price, a listing-day result or investment returns. The assistant can explain historical context and conditional scenarios, but any valuation estimate depends on assumptions that may prove wrong.",
        "link": {
          "label": "Understand valuation assumptions",
          "href": "/methodology"
        }
      }
    ]
  },
  {
    "id": "finance-topics",
    "title": "Funds, trading and personal-finance questions",
    "description": "Research areas the AI can explain, with links to the appropriate specialist pages.",
    "faqs": [
      {
        "id": "fund-etf-reit",
        "question": "Can DeepScreen AI explain mutual funds, ETFs and REITs?",
        "answer": "Yes. It can explain NAV, expense ratios, tracking differences, diversification, REIT cash flow and research checklists. Its dedicated chat tools currently fetch stock-directory and stock-research information—not a separate live fund, ETF or REIT data feed—so check the specialist pages and issuer disclosures for current figures.",
        "link": {
          "label": "Explore mutual funds, ETFs and REITs",
          "href": "/investments"
        }
      },
      {
        "id": "options-greeks",
        "question": "Can I ask DeepScreen AI about options strategies and Greeks?",
        "answer": "Yes. Ask for educational explanations of calls, puts, spreads, delta, gamma, theta, vega, payoffs and risk. The chat does not have a dedicated live option-chain or trade-execution tool; confirm current strikes, premiums and expiries through authorized market sources.",
        "link": {
          "label": "Explore options strategy guides",
          "href": "/options"
        }
      },
      {
        "id": "ipo-guide",
        "question": "Can DeepScreen AI help me understand an upcoming IPO?",
        "answer": "It can explain IPO pricing, prospectus checks, business and valuation risks, subscription mechanics and the limits of unofficial grey-market premiums. It cannot promise listing gains or a confirmed live IPO quote for every offering.",
        "link": {
          "label": "Open DeepScreen IPO research",
          "href": "/ipo"
        }
      },
      {
        "id": "chart-screenshots",
        "question": "Can I upload a chart screenshot to the AI chatbot for analysis?",
        "answer": "The current DeepScreen chat form accepts text prompts rather than image attachments. You can describe a chart or ask about support, resistance and indicators in text. DeepChart is the separate chart-research experience.",
        "link": {
          "label": "Open DeepChart",
          "href": "/chart-reader"
        }
      },
      {
        "id": "personal-finance-ai",
        "question": "Can the chatbot help with budgeting, debt and emergency funds?",
        "answer": "Yes. It can explain budget methods, sinking funds, emergency reserves, credit-card interest, savings trade-offs, insurance concepts and legitimate ways to increase income. Examples are educational and should be adapted to your circumstances without disclosing account passwords or confidential identifiers.",
        "link": {
          "label": "Read DeepScreen personal-finance guides",
          "href": "/blog"
        }
      },
      {
        "id": "crypto-forex-commodities",
        "question": "Does DeepScreen AI answer crypto, forex and commodity questions?",
        "answer": "Yes. It can explain volatility, leverage, futures, currency pairs, market mechanisms, risk management and commodity benchmarks. Rules and market conditions vary by country and instrument; verify current exchange and regulator information before acting.",
        "link": {
          "label": "Read trading, crypto and forex education",
          "href": "/trading"
        }
      },
      {
        "id": "execute-trades",
        "question": "Can DeepScreen AI place trades, connect a bank account or manage my portfolio automatically?",
        "answer": "No. The current chat exposes company-search and stock-research tools; it does not have a broker order-entry, banking, fund-transfer or automated portfolio-trading function. Its responses support research, not execution.",
        "link": {
          "label": "View DeepScreen's terms",
          "href": "/terms"
        }
      }
    ]
  },
  {
    "id": "trust-privacy",
    "title": "Accuracy, source checking, privacy and troubleshooting",
    "description": "How to judge answers and manage the browser-stored conversation responsibly.",
    "faqs": [
      {
        "id": "is-chatbot-advice",
        "question": "Is DeepScreen AI a registered investment adviser or personal financial adviser?",
        "answer": "No. DeepScreen AI provides general financial education and model-based research. It does not assess your complete personal situation or replace a regulated adviser, tax professional or legal adviser.",
        "link": {
          "label": "Read the educational-use terms",
          "href": "/terms"
        }
      },
      {
        "id": "verify-ai-answers",
        "question": "How should I verify an AI stock analysis or financial answer?",
        "answer": "Check the ticker and exchange, quote timestamp, reporting period, source names and missing-data notes. Confirm material numbers against original filings, exchange disclosures and the linked DeepScreen research page; treat an unsupported AI statement as unverified.",
        "link": {
          "label": "Inspect data sources and limitations",
          "href": "/data-sources"
        }
      },
      {
        "id": "ai-can-make-mistakes",
        "question": "Can DeepScreen AI make mistakes or give outdated information?",
        "answer": "Yes. Generative answers may misinterpret a question, use incomplete inputs or describe an outdated rule or market figure. Request assumptions and source dates, cross-check important claims and do not act solely on a chatbot response.",
        "link": {
          "label": "Follow a structured verification checklist",
          "href": "/research-checklist"
        }
      },
      {
        "id": "chat-storage",
        "question": "Where does DeepScreen AI save my chat history?",
        "answer": "The chat interface saves conversation messages in this browser's local storage and sends messages to DeepScreen's AI service to generate replies. Browser storage is not a secure vault, and an external AI service processes requests. Avoid entering passwords, card details, government ID numbers or other highly sensitive information.",
        "link": {
          "label": "Read DeepScreen's privacy policy",
          "href": "/privacy"
        }
      },
      {
        "id": "delete-chat-history",
        "question": "How do I clear the DeepScreen AI conversation?",
        "answer": "Use the 'New conversation' button in the chat header to clear the displayed thread and its saved copy in the current browser. That action does not by itself establish deletion of any records previously processed by external services; consult the privacy policy for data questions.",
        "link": {
          "label": "Privacy and data requests",
          "href": "/privacy"
        }
      },
      {
        "id": "cross-device-sync",
        "question": "Will my DeepScreen AI chat history sync between devices?",
        "answer": "The current chat interface stores its history in the local browser. It does not implement account-synchronized conversation history, so a different browser or device should not be assumed to have the same saved thread.",
        "link": {
          "label": "Open your browser's chat",
          "href": "/chat"
        }
      },
      {
        "id": "chat-not-working",
        "question": "Why does DeepScreen AI show an error or say it is not configured?",
        "answer": "Replies depend on the site's AI backend and available data services. A missing server configuration, network problem, unavailable provider or oversized conversation may prevent a response. Try again later, start a new conversation if needed, or use the public screener and answer hub.",
        "link": {
          "label": "Contact DeepScreen support",
          "href": "/contact"
        }
      },
      {
        "id": "cite-chatbot",
        "question": "Can I cite an answer from DeepScreen AI as investment research?",
        "answer": "Use the answer as a research aid, not as the sole source for a financial claim. Where possible, cite the canonical DeepScreen company page, methodology, dated source output and original regulatory or company filing rather than an unsourced chatbot statement.",
        "link": {
          "label": "Browse the public research knowledge index",
          "href": "/knowledge"
        }
      }
    ]
  }
];

export const AI_CHAT_FAQS: AiChatFaq[] = AI_CHAT_FAQ_GROUPS.flatMap((group) => group.faqs);

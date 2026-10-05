export type MarketEducationTopic = "DEEPCHART" | "TRADING" | "CRYPTO" | "FOREX";

export type MarketEducationFaq = {
  id: string;
  topic: MarketEducationTopic;
  question: string;
  answer: string;
};

export const MARKET_EDUCATION_FAQS: readonly MarketEducationFaq[] = [
  {
    id: "what-is-deepchart",
    topic: "DEEPCHART",
    question: "What is DeepChart?",
    answer:
      "DeepChart is DeepScreen's technical-analysis workspace for stocks, indices, forex, crypto and commodities. It combines price structure, support and resistance, momentum, volatility, volume context, liquidity zones and higher-timeframe confirmation into an explainable chart reading. It is an educational research tool, not a promise that a trade will work.",
  },
  {
    id: "how-deepchart-works",
    topic: "DEEPCHART",
    question: "How does DeepChart analyze a chart?",
    answer:
      "DeepChart reads recent candles and combines multiple technical inputs rather than relying on one indicator. The workspace evaluates structure, moving averages, RSI and other momentum measures, volatility, support and resistance, Fibonacci levels, volume profile, liquidity areas and a higher timeframe. It then explains the factors behind the current reading and risk plan.",
  },
  {
    id: "deepchart-markets",
    topic: "DEEPCHART",
    question: "Which markets can DeepChart analyze?",
    answer:
      "DeepChart is designed for supported stocks, major indices, forex pairs, crypto pairs and commodity futures symbols. The same technical framework can be useful across markets, but liquidity, trading hours, gaps, volatility, contract mechanics and available data differ, so a setup should always be interpreted in the context of the instrument being analyzed.",
  },
  {
    id: "deepchart-timeframes",
    topic: "DEEPCHART",
    question: "Which timeframe is best for technical analysis?",
    answer:
      "There is no universally best timeframe. A useful workflow is to match the chart interval to the intended holding period and then check a higher timeframe for context. Very short intervals contain more noise and execution friction, while longer intervals react more slowly. DeepChart pairs the selected timeframe with a higher-timeframe reading to reduce single-chart tunnel vision.",
  },
  {
    id: "deepchart-buy-sell",
    topic: "DEEPCHART",
    question: "Does DeepChart give guaranteed buy or sell signals?",
    answer:
      "No. DeepChart can classify technical conditions and show a directional reading, confidence, levels and an illustrative trade plan, but technical signals can fail. Price can gap through levels, news can change the market regime and historical patterns do not guarantee future results. Treat every signal as a research hypothesis that needs risk control.",
  },
  {
    id: "support-resistance-deepchart",
    topic: "DEEPCHART",
    question: "How should support and resistance be used in DeepChart?",
    answer:
      "Support and resistance are better treated as zones of prior market reaction than as exact prices that must hold. Look for repeated touches, nearby structure, volume or liquidity evidence and whether the higher timeframe agrees. A level becomes more useful when it helps define invalidation and reward-to-risk, not when it is used as a prediction by itself.",
  },
  {
    id: "what-is-trading",
    topic: "TRADING",
    question: "What is trading?",
    answer:
      "Trading is the buying and selling of financial instruments with the goal of benefiting from price movement over a chosen horizon. Depending on the market, that can involve shares, futures, options, currencies, crypto assets or other instruments. Trading differs from long-term investing mainly in decision horizon, turnover, execution sensitivity and the importance of risk management.",
  },
  {
    id: "trading-risk-management",
    topic: "TRADING",
    question: "What is risk management in trading?",
    answer:
      "Trading risk management is the process of deciding how much capital can be lost, where a trade is invalidated, how large the position should be and when exposure must be reduced. A chart setup is incomplete without a defined loss scenario. Position size should be derived from affordable risk and stop distance rather than from the size of the hoped-for profit.",
  },
  {
    id: "risk-reward-ratio",
    topic: "TRADING",
    question: "What is a risk-reward ratio in trading?",
    answer:
      "The risk-reward ratio compares the amount that can be lost if a trade reaches its invalidation level with the potential gain to a target. A 2R target means the planned reward is twice the planned risk. A high reward-to-risk ratio does not make a trade good by itself because the probability of reaching the target also matters.",
  },
  {
    id: "stop-loss-trading",
    topic: "TRADING",
    question: "What is a stop-loss and how should it be placed?",
    answer:
      "A stop-loss is an exit instruction or risk threshold intended to limit loss when the market moves against the trade. A useful stop is linked to the trade thesis: it should sit beyond a level that would invalidate the setup, while position size is reduced enough to keep the resulting loss affordable. Stops can still experience slippage or gaps.",
  },
  {
    id: "position-sizing",
    topic: "TRADING",
    question: "How do traders calculate position size?",
    answer:
      "A simple framework is position size = maximum money risk per trade divided by the distance between entry and stop, adjusted for the instrument's contract value or point value. This turns a technical invalidation level into a capital-risk decision. Leverage, lot size, gaps, fees and minimum contract sizes can change the real exposure.",
  },
  {
    id: "technical-analysis-limitations",
    topic: "TRADING",
    question: "Can technical analysis predict the market?",
    answer:
      "Technical analysis cannot reliably know the future. It organizes observable price, volume, volatility and momentum into repeatable decision rules. Its value is in defining conditions, invalidation and risk consistently; its weakness is that patterns can fail, market regimes can change and indicators derived from the same price history can become redundant.",
  },
  {
    id: "what-is-crypto-trading",
    topic: "CRYPTO",
    question: "What is crypto trading?",
    answer:
      "Crypto trading is the buying and selling of crypto assets or crypto-linked instruments in an attempt to benefit from price changes. The instrument matters: spot ownership, exchange-traded products, futures and perpetual contracts can have very different custody, leverage, liquidation, funding and counterparty risks.",
  },
  {
    id: "crypto-spot-vs-futures",
    topic: "CRYPTO",
    question: "What is the difference between crypto spot trading and crypto futures?",
    answer:
      "Spot trading generally means buying or selling the crypto asset itself for current settlement, while a futures contract is a derivative whose value is linked to the underlying asset and has contract rules such as expiry or settlement. Perpetual derivatives may not expire but can use funding payments. Derivatives can create leverage and liquidation risk that spot ownership does not have in the same form.",
  },
  {
    id: "crypto-volatility",
    topic: "CRYPTO",
    question: "Why is crypto so volatile?",
    answer:
      "Crypto prices can move sharply because liquidity, leverage, market concentration, sentiment, token-specific events, regulatory news and 24-hour trading can interact quickly. Different crypto assets can have very different market depth and design. A move that looks normal in a highly liquid asset can be extreme or difficult to exit in a thinly traded token.",
  },
  {
    id: "crypto-leverage-liquidation",
    topic: "CRYPTO",
    question: "What is liquidation in leveraged crypto trading?",
    answer:
      "Liquidation occurs when losses reduce margin below the platform or contract's required level and the position is forcibly reduced or closed. Higher leverage means a smaller adverse price move can consume the available margin. Liquidation rules, mark-price methodology, maintenance margin and fees differ by venue and contract.",
  },
  {
    id: "crypto-custody-risk",
    topic: "CRYPTO",
    question: "What is crypto custody risk?",
    answer:
      "Crypto custody risk is the risk of losing access to assets or exposing them to theft, platform failure or operational mistakes. A wallet controls access through private keys or credentials rather than storing the blockchain asset itself. Self-custody and third-party custody have different responsibilities, and private keys or seed phrases should never be shared.",
  },
  {
    id: "crypto-chart-analysis",
    topic: "CRYPTO",
    question: "Does technical analysis work on crypto?",
    answer:
      "Technical analysis can describe crypto price structure, momentum, volatility and liquidity just as it can in other traded markets, but that does not make signals certain. Crypto can trade continuously, react strongly to leverage and token-specific events, and experience abrupt liquidity changes, so risk controls and venue quality matter as much as the chart pattern.",
  },
  {
    id: "what-is-forex-trading",
    topic: "FOREX",
    question: "What is forex trading?",
    answer:
      "Forex trading is the exchange or speculative trading of one currency against another, quoted as a pair such as EUR/USD or USD/INR. The first currency is the base currency and the second is the quote currency. A forex price therefore expresses how much of the quote currency is required for one unit of the base currency.",
  },
  {
    id: "forex-pips-spread",
    topic: "FOREX",
    question: "What are pips and spreads in forex?",
    answer:
      "A pip is a conventional unit used to describe a small change in a currency pair, while the spread is the difference between the quoted bid and ask. The monetary value of a pip depends on the pair, position size and account currency. Spread, commission, financing and slippage are part of the real cost of a forex trade.",
  },
  {
    id: "forex-leverage",
    topic: "FOREX",
    question: "How does leverage work in forex?",
    answer:
      "Leverage lets a trader control a position larger than the cash or margin committed. It magnifies both gains and losses, so a small currency move can create a large percentage change in account equity. Margin requirements and loss protections vary by jurisdiction, dealer and instrument.",
  },
  {
    id: "forex-drivers",
    topic: "FOREX",
    question: "What moves forex prices?",
    answer:
      "Currency pairs can respond to relative interest-rate expectations, inflation, economic growth, central-bank policy, political risk, capital flows, trade balances and broad risk sentiment. Because a forex pair compares two currencies, the market is often reacting to the relative outlook for both economies rather than to one country in isolation.",
  },
  {
    id: "forex-india-legal",
    topic: "FOREX",
    question: "Can Indian residents trade forex on any online platform?",
    answer:
      "No. RBI guidance says Indian residents may undertake permitted forex transactions only with authorised persons and, when trading electronically, on RBI-authorised electronic trading platforms or recognised stock exchanges under the applicable rules. An entity's absence from the RBI Alert List does not by itself prove that the entity is authorised.",
  },
  {
    id: "forex-chart-analysis",
    topic: "FOREX",
    question: "How should a forex chart be analyzed?",
    answer:
      "Start with the pair's trend and higher-timeframe structure, mark support and resistance, identify volatility and recent liquidity zones, and then check whether momentum confirms or diverges from price. Add the macro calendar because central-bank decisions, inflation data and employment releases can invalidate a purely technical setup very quickly.",
  },
] as const;

export function marketEducationFaq(topic: MarketEducationTopic): MarketEducationFaq[] {
  return MARKET_EDUCATION_FAQS.filter((faq) => faq.topic === topic);
}

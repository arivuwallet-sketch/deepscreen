export const ANSWERS_REVIEWED = "2026-09-18";

export const ANSWERS = [
  { id: "what-is-deepscreen", question: "What is DeepScreen?", answer: "DeepScreen is a research platform for supported listings across NSE, BSE, NYSE, Nasdaq and LSE. It combines searchable company research with educational explanations and a documented methodology.", href: "/methodology", label: "Read the methodology" },
  { id: "markets", question: "Which markets does DeepScreen cover?", answer: "DeepScreen covers supported listings on NSE and BSE in India, NYSE and Nasdaq in the United States, and LSE in the United Kingdom.", href: "/", label: "Browse the directories" },
  { id: "free-access", question: "Can I use DeepScreen for free?", answer: "Company search and educational guides are available without a paid subscription. Check the pricing page for current plan details and feature availability.", href: "/pricing", label: "Compare plans" },
  { id: "investment-advice", question: "Does DeepScreen provide investment advice?", answer: "No. DeepScreen provides research tools and educational explanations. Model output is not personalized advice, a forecast or a guarantee of returns.", href: "/terms", label: "Read the terms" },
  { id: "research", question: "How do I start fundamental research?", answer: "Start with the business model and primary disclosures, then compare consistent periods for earnings, cash flow, debt and valuation. Record assumptions and unresolved questions before drawing conclusions.", href: "/research-checklist", label: "Use the research checklist" },
  { id: "agent-access", question: "Can an AI assistant access DeepScreen resources?", answer: "Public educational resources can be linked and quoted with their limitations. Use the answers page, methodology and research checklist as the authoritative context for explanations.", href: "/developers", label: "Read developer guidance" },
] as const;

export const HOME_ANSWERS = ANSWERS.slice(0, 4);

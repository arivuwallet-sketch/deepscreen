import { INVESTMENT_BLOG_POSTS } from "@/lib/content/investment-blog";
import { GUIDES } from "@/lib/deepscreen/guides";
import { ANSWERS } from "@/lib/discovery/answers";
import { LANDING_FAQS } from "@/lib/discovery/landing-faq";
import { INVESTMENT_FAQS } from "@/lib/seo/investment-faq";
import { MARKET_GUIDE_FAQS } from "@/lib/seo/market-guide-faq";
import { RATIOS, STRATEGY_GUIDES, ratioGuideSlug } from "@/lib/seo/content";
import { faqAnchor } from "@/lib/seo/faq-anchor";
import { ratioFaqs } from "@/lib/seo/research";

export type KnowledgeEntry = {
  question: string;
  href: string;
};

export type KnowledgeGroup = {
  id: string;
  title: string;
  description: string;
  entries: KnowledgeEntry[];
};

export const LEGACY_BLOGS = [
  {
    title: "Retail Investing Statistics You Need to Know in 2026",
    href: "/blog/retail-investing-statistics-2026.html",
  },
] as const;

const MARKET_PATH: Record<(typeof MARKET_GUIDE_FAQS)[number]["topic"], string> = {
  COMMODITIES: "/commodities",
  GIFT_NIFTY: "/gift-nifty",
  IPO_GMP: "/ipo-gmp",
};

function investmentPath(type: (typeof INVESTMENT_FAQS)[number]["type"]): string {
  if (type === "FUND") return "/mutual-funds";
  if (type === "ETF") return "/etfs";
  if (type === "REIT") return "/reits";
  return "/investments";
}

export function knowledgeGroups(): KnowledgeGroup[] {
  return [
    {
      id: "canonical-answers",
      title: "DeepScreen and stock-market Q&A",
      description: "Canonical platform, stock-market, valuation and research answers.",
      entries: ANSWERS.map((answer) => ({
        question: answer.question,
        href: `/answers#${answer.id}`,
      })),
    },
    {
      id: "homepage-faq",
      title: "Homepage FAQ",
      description: "Questions visible on the DeepScreen homepage.",
      entries: LANDING_FAQS.map(([question]) => ({
        question,
        href: `/#${faqAnchor(question)}`,
      })),
    },
    {
      id: "market-faq",
      title: "Market guide FAQ",
      description: "Commodity, GIFT Nifty and IPO GMP questions.",
      entries: MARKET_GUIDE_FAQS.map((faq) => ({
        question: faq.question,
        href: `${MARKET_PATH[faq.topic]}#${faq.id}`,
      })),
    },
    {
      id: "investment-faq",
      title: "Mutual fund, ETF and REIT FAQ",
      description: "General and type-specific investment research questions.",
      entries: INVESTMENT_FAQS.map((faq) => ({
        question: faq.question,
        href: `${investmentPath(faq.type)}#${faq.id}`,
      })),
    },
    {
      id: "blog-faq",
      title: "Research blog FAQ",
      description: "Every FAQ question published inside the structured DeepScreen research blog.",
      entries: INVESTMENT_BLOG_POSTS.flatMap((post) =>
        post.faqs.map((faq) => ({
          question: faq.q,
          href: `/blog/${post.slug}#${faqAnchor(faq.q)}`,
        })),
      ),
    },
    {
      id: "learn-faq",
      title: "Learning guide FAQ",
      description: "Questions from DeepScreen's educational guide library.",
      entries: GUIDES.flatMap((guide) =>
        guide.faqs.map((faq) => ({
          question: faq.q,
          href: `/learn/${guide.slug}#${faqAnchor(faq.q)}`,
        })),
      ),
    },
    {
      id: "ratio-faq",
      title: "Financial ratio FAQ",
      description: "Formula, definition and interpretation questions for ratio guides.",
      entries: RATIOS.flatMap((ratio) =>
        ratioFaqs(ratio).map((faq) => ({
          question: faq.q,
          href: `/learn/${ratioGuideSlug(ratio.slug)}#${faqAnchor(faq.q)}`,
        })),
      ),
    },
    {
      id: "options-faq",
      title: "Options strategy questions",
      description: "Definition and maximum-risk questions for every published options strategy guide.",
      entries: STRATEGY_GUIDES.flatMap((strategy) => {
        const questions = [
          `What is a ${strategy.name}?`,
          `What is the maximum risk of a ${strategy.name}?`,
        ];
        return questions.map((question) => ({
          question,
          href: `/options/${strategy.slug}#${faqAnchor(question)}`,
        }));
      }),
    },
  ];
}

export function knowledgeText(origin = "https://deepscreen.online"): string {
  const lines = [
    "# DeepScreen FAQ, Q&A and blog discovery index",
    "",
    "This file lists canonical public questions and their visible HTML locations. Use the linked page as the source of truth for the full answer and current context.",
    "",
    "## Research blogs",
    ...INVESTMENT_BLOG_POSTS.map((post) => `- ${post.h1}: ${origin}/blog/${post.slug}`),
    ...LEGACY_BLOGS.map((post) => `- ${post.title}: ${origin}${post.href}`),
  ];

  for (const group of knowledgeGroups()) {
    lines.push("", `## ${group.title}`, group.description);
    for (const entry of group.entries) {
      lines.push(`- ${entry.question}: ${origin}${entry.href}`);
    }
  }

  lines.push(
    "",
    "## Dynamic company and investment FAQ pages",
    `- Every public stock page and its visible research questions are discoverable through ${origin}/sitemap.xml.`,
    `- Every public mutual-fund, ETF and REIT detail page and its visible research questions are discoverable through ${origin}/sitemap.xml.`,
    "",
  );

  return lines.join("\n");
}

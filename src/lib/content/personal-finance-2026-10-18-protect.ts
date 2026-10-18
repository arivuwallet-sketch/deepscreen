import type { BlogPost } from "@/lib/content/investment-blog";

// DeepScreen daily personal-finance guide: 18 October 2026.
export const PERSONAL_FINANCE_2026_10_18_PROTECT: BlogPost[] = [
  {
    slug: "family-financial-emergency-file-india",
    category: "Protect Money",
    title: "How to Build a Family Financial Emergency File in India | DeepScreen",
    h1: "How to build a family financial emergency file in India",
    description: "Organise essential bank, insurance, loan, pension and tax records so a trusted family member can find official contacts and documents during an emergency.",
    excerpt: "A secure financial emergency file reduces confusion during illness, travel disruption or account-access problems. Use the DeepScreen FILE-SAFE checklist without storing passwords in an ordinary document.",
    primaryKeyword: "family financial emergency file India",
    secondaryKeywords: ["financial documents checklist India", "family financial records", "insurance policy documents checklist", "bank account emergency file", "secure financial records"],
    published: "2026-10-18",
    updated: "2026-10-18",
    readingMinutes: 7,
    directAnswer: "Create a secure, updated index of your essential financial accounts, policies, loans, pensions, tax records, official support channels and trusted contacts. Store documents in a protected location and keep recovery codes and passwords in a separate secure password manager rather than an ordinary spreadsheet.",
    uniqueAngle: "DeepScreen FILE-SAFE combines a document inventory with a safe-access plan, so the goal is both findability and privacy.",
    keyTakeaways: [
      "Record account identifiers and official contact routes, not passwords or one-time codes.",
      "Keep policy schedules, loan statements, pension details and tax records in one indexed system.",
      "Separate sensitive authentication secrets from the document inventory.",
      "Tell a trusted person how to locate the file without giving them unnecessary access to every account.",
      "Review the file after major financial changes and at least once a year."
    ],
    sections: [
      {
        id: "what-to-include",
        heading: "What belongs in a financial emergency file?",
        answer: "Include enough information to locate records and contact providers, but do not turn the file into a list of credentials.",
        table: {
          caption: "DeepScreen emergency-file inventory",
          headers: ["Record group", "Useful items", "Privacy rule"],
          rows: [
            ["Banking", "Bank name, account nickname, last four digits, branch and official support route", "Never store PINs, passwords or OTPs in the index"],
            ["Loans and cards", "Lender, account reference, payment date, outstanding statement and complaint route", "Keep full account numbers in protected storage"],
            ["Insurance", "Insurer, policy number, policy schedule, premium due date and claim contact", "Use the insurer's official portal for sensitive updates"],
            ["Pension and employment", "EPF/UAN reference, employer contact and available pension records", "Keep identity documents access-controlled"],
            ["Tax and investments", "Tax-year records, broker or fund platform, statements and adviser contact if used", "Do not share recovery codes or trading credentials"],
            ["Trusted contacts", "Family contact, professional adviser and provider support channels", "Share only what each person needs to know"]
          ]
        }
      },
      {
        id: "file-safe",
        heading: "The DeepScreen FILE-SAFE framework",
        answer: "Use this checklist to make records findable without making them easy to steal.",
        table: {
          caption: "FILE-SAFE checklist",
          headers: ["Step", "Action"],
          rows: [
            ["F — Find", "List each provider and the records needed to contact it"],
            ["I — Index", "Use clear filenames, dates and a one-page contents list"],
            ["L — Limit", "Keep passwords, PINs and recovery codes out of the document index"],
            ["E — Encrypt", "Use device encryption and a reputable protected storage method"],
            ["S — Share carefully", "Tell a trusted person where the index is and what to do in an emergency"],
            ["A-F-E — Audit frequently", "Review after major changes, verify links and remove obsolete copies"]
          ]
        }
      },
      {
        id: "worked-example",
        heading: "Worked example: make a scattered-record problem manageable",
        answer: "A simple index can save time without exposing full credentials.",
        paragraphs: [
          { text: "Suppose a household has two bank accounts, one home loan, two insurance policies and an EPF account. Instead of writing every password in one spreadsheet, create six index entries with provider name, account nickname, document location, official support URL and the date last checked. Store statements and policy PDFs in encrypted storage; keep authentication secrets in a separate password manager." }
        ],
        table: {
          caption: "Example index entry",
          headers: ["Field", "Example"],
          rows: [
            ["Provider", "Example Bank"],
            ["Account label", "Household bills account"],
            ["Identifier", "Last four digits only in the index"],
            ["Documents", "Encrypted folder / Banking / Example Bank"],
            ["Support route", "Official bank website or app"],
            ["Last reviewed", "18 October 2026"]
          ]
        },
        note: "The provider and account details above are fictional. Do not publish your own account inventory or upload it to an untrusted service."
      },
      {
        id: "secure-access",
        heading: "Plan access without sharing passwords",
        answer: "A trusted person should know where records are and which official channel to contact, not receive all your credentials by default.",
        bullets: [
          "Use a reputable password manager and enable its available security protections.",
          "Keep device recovery and account-recovery instructions in a separate secure location.",
          "Use only official bank, insurer, EPFO and tax portals when updating details.",
          "Do not include PINs, CVVs, OTPs, full card numbers or recovery codes in an ordinary document.",
          "Check provider procedures for authorised representatives and claims rather than assuming a family member can transact on an account."
        ],
        paragraphs: [
          { text: "Official provider procedures differ. For example, EPFO publishes member services and e-nomination guidance through its own portal; insurance policyholders should use their insurer and IRDAI's official consumer-information channels for policy and grievance information.", sources: ["epfo-members", "irdai-policyholder"] }
        ]
      },
      {
        id: "maintenance",
        heading: "Review the file when life changes",
        answer: "An outdated emergency file can be as confusing as having no file at all.",
        bullets: [
          "After opening or closing a bank, investment or loan account.",
          "After changing an insurer, employer or pension arrangement.",
          "After a move, phone-number change or change in trusted contacts.",
          "After a major family or financial change.",
          "At least annually, verify the official support links and remove superseded documents."
        ]
      }
    ],
    faqs: [
      { q: "What is a family financial emergency file?", a: "It is a secure index of important financial records, provider contacts, due dates and instructions for finding documents during an emergency." },
      { q: "Should I put all my passwords in the file?", a: "No. Keep passwords, PINs, OTPs and recovery codes out of an ordinary document. Use a reputable password manager and protect the document index separately." },
      { q: "Which documents should I include first?", a: "Start with bank and loan statements, insurance schedules, pension or EPF information, tax records, provider support routes and trusted contacts." },
      { q: "Can I store the file in a cloud drive?", a: "Only if you understand the service's security settings and use strong account protection. Keep a protected backup and avoid sharing a public link." },
      { q: "How often should I update the file?", a: "Update it after important account or family changes and perform a full review at least once a year." }
    ],
    sources: [
      { id: "epfo-members", title: "Employees' Provident Fund Organisation — employee services", publisher: "EPFO, Government of India", date: "Official member portal; accessed October 18, 2026", href: "https://www.epfindia.gov.in/site_en/For_Employees.php" },
      { id: "irdai-policyholder", title: "Policyholder consumer information and grievance guidance", publisher: "Insurance Regulatory and Development Authority of India", date: "Official policyholder portal; accessed October 18, 2026", href: "https://policyholder.gov.in/irdai-connects" },
      { id: "rbi", title: "Reserve Bank of India — official banking and customer-service information", publisher: "Reserve Bank of India", date: "Official regulator portal; accessed October 18, 2026", href: "https://www.rbi.org.in/" }
    ],
    relatedLinks: [
      { label: "Protect your money", href: "/blog/how-to-protect-your-money-india" },
      { label: "Respond to suspected UPI or bank fraud", href: "/blog/what-to-do-after-upi-bank-fraud-india" },
      { label: "Dispute credit-report errors", href: "/blog/how-to-dispute-credit-report-errors-india" },
      { label: "DICGC bank-deposit insurance", href: "/blog/dicgc-bank-deposit-insurance-india" }
    ]
  }
];
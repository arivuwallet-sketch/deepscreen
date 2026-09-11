import { createFileRoute } from "@tanstack/react-router";

import { Shell } from "@/components/ds/Shell";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Terms of Service — DeepScreen" },
      {
        name: "description",
        content:
          "DeepScreen Terms of Service: educational use only, no financial advice, account and subscription rules, acceptable use and liability limits.",
      },
      { property: "og:title", content: "Terms of Service — DeepScreen" },
      {
        property: "og:description",
        content:
          "The terms governing your use of DeepScreen's screening tools, accounts and subscriptions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://deepscreen.online/terms" },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/terms" }],
  }),
  component: TermsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

function TermsPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="num mt-2 text-xs text-muted-foreground">Last Updated: September 2026</p>

        <div className="text-sm leading-relaxed text-muted-foreground">
          <p className="mt-6">
            Welcome to DeepScreen (deepscreen.online). By accessing or using our website and
            services, you agree to be bound by these Terms of Service. If you do not agree to these
            terms, please do not use our platform.
          </p>

          <Section title="1. Educational and Informational Purposes Only (No Financial Advice)">
            <p>
              DeepScreen provides quantitative financial data, historical metrics, and educational
              screening tools. We are not registered investment advisors, brokers, or dealers.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                None of the information, "tips," "traps," or data provided on our platform
                constitutes financial, investment, trading, or betting advice.
              </li>
              <li>We do not provide recommendations to buy, sell, or hold any securities.</li>
              <li>
                All data is historical and mathematical. You are solely responsible for your own
                investment decisions and should consult a licensed financial advisor before making
                any financial commitments.
              </li>
            </ul>
          </Section>

          <Section title="2. User Accounts and Subscriptions">
            <p>
              To access premium features, you must create an account and purchase a subscription
              (Weekly, Monthly, or Yearly).
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your password and account.</li>
              <li>
                Subscription fees are billed in advance. You may cancel your subscription at any
                time, and you will retain access to the Pro features until the end of your current
                billing cycle.
              </li>
            </ul>
          </Section>

          <Section title="3. Acceptable Use">
            <p>You agree not to misuse the DeepScreen platform. You shall not:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Scrape, extract, or automatically mine data from our website without written
                permission.
              </li>
              <li>
                Resell, reproduce, or distribute our proprietary screening frameworks or forensic
                badges as your own.
              </li>
              <li>Attempt to disrupt or compromise the security of our servers or networks.</li>
            </ul>
          </Section>

          <Section title="4. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, DeepScreen and its operators shall not be
              liable for any direct, indirect, incidental, or consequential damages resulting from
              the use or inability to use our services, or from any investment losses incurred by
              users relying on our data.
            </p>
          </Section>

          <Section title="5. Contact">
            <p>
              For any questions regarding these terms, please contact us at{" "}
              <a
                href="mailto:deepscreen.online@outlook.com"
                className="text-primary hover:underline"
              >
                deepscreen.online@outlook.com
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </Shell>
  );
}

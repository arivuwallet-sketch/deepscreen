import { createFileRoute } from "@tanstack/react-router";

import { Shell } from "@/components/ds/Shell";
import { metaKeywords, portfolioKeywords, screenerKeywords } from "@/lib/seo/keywords";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Privacy Policy — DeepScreen" },
      {
        name: "description",
        content:
          "How DeepScreen collects, uses and protects your account, payment and usage data, plus your rights over your personal information.",
      },
      { name: "keywords", content: metaKeywords(["DeepScreen privacy policy", "stock screener privacy", "financial platform data privacy", "account data protection"], screenerKeywords, portfolioKeywords) },
      { property: "og:title", content: "Privacy Policy — DeepScreen" },
      {
        property: "og:description",
        content: "Our commitments on data collection, cookies, sharing and your privacy rights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://deepscreen.online/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/privacy" }],
  }),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="num mt-2 text-xs text-muted-foreground">Last Updated: September 2026</p>

        <div className="text-sm leading-relaxed text-muted-foreground">
          <p className="mt-6">
            At DeepScreen (deepscreen.online), we take your privacy seriously. This policy explains
            how we collect, use, and protect your personal information when you use our platform.
          </p>

          <Section title="1. Information We Collect">
            <p>We only collect information that is necessary to provide and improve our services:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-foreground">Account Information:</span> When you
                register, we collect your name, email address, and password securely.
              </li>
              <li>
                <span className="font-medium text-foreground">Payment Information:</span> We do not
                store your credit card details. All transactions are processed securely by our
                third-party payment gateway providers.
              </li>
              <li>
                <span className="font-medium text-foreground">Usage Data:</span> We automatically
                collect standard diagnostic data, such as IP addresses, browser types, and
                interactions with our screening tools, to help us optimize the platform's
                performance.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use your data to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide, maintain, and secure your DeepScreen account.</li>
              <li>Process your subscription payments and send billing updates.</li>
              <li>Respond to your customer support inquiries.</li>
              <li>Improve our financial screening algorithms and user interface.</li>
            </ul>
          </Section>

          <Section title="3. Sharing Your Information">
            <p>
              We do not sell, rent, or trade your personal information to third parties. We only
              share information with trusted third-party service providers (such as payment
              processors and secure hosting servers) strictly for the purpose of operating our
              business.
            </p>
          </Section>

          <Section title="4. Cookies">
            <p>
              We use cookies to keep you logged in, remember your screening preferences, and
              understand how you interact with our website. You can manage or disable cookies
              through your browser settings, though some features of the site may not function
              properly without them.
            </p>
          </Section>

          <Section title="5. Your Rights">
            <p>
              You have the right to access, update, or delete your personal information at any time.
              To request data deletion or a copy of your data, please reach out to our support team.
            </p>
          </Section>

          <Section title="6. Contact Us">
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at:{" "}
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

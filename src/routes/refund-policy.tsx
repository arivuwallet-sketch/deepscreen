import { createFileRoute } from "@tanstack/react-router";

import { Shell } from "@/components/ds/Shell";
import { metaKeywords, portfolioKeywords, screenerKeywords } from "@/lib/seo/keywords";

export const Route = createFileRoute("/refund-policy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Refund Policy — DeepScreen" },
      {
        name: "description",
        content:
          "DeepScreen's five-day refund policy for subscription purchases, including eligibility, exclusions, cancellations and how to request a refund.",
      },
      {
        name: "keywords",
        content: metaKeywords(
          [
            "DeepScreen refund policy",
            "five day refund policy",
            "stock screener subscription refund",
            "DeepScreen subscription cancellation",
          ],
          screenerKeywords,
          portfolioKeywords,
        ),
      },
      { property: "og:title", content: "Refund Policy — DeepScreen" },
      {
        property: "og:description",
        content: "Eligibility, exclusions and instructions for requesting a DeepScreen refund within five days.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://deepscreen.online/refund-policy" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Refund Policy — DeepScreen" },
      {
        name: "twitter:description",
        content: "Eligibility, exclusions and instructions for requesting a DeepScreen refund within five days.",
      },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/refund-policy" }],
  }),
  component: RefundPolicyPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

function RefundPolicyPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
        <p className="num mt-2 text-xs text-muted-foreground">Last Updated: September 16, 2026</p>

        <div className="text-sm leading-relaxed text-muted-foreground">
          <p className="mt-6">
            DeepScreen offers eligible customers a five-day refund request window. You must contact
            us within five calendar days of the original subscription purchase date and provide the
            account and payment details needed to locate the transaction.
          </p>

          <Section title="1. Refund Eligibility">
            <p>A refund request may be eligible when all of the following apply:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>The request is submitted within five calendar days of the original purchase.</li>
              <li>The request relates to a first-time purchase or an accidental duplicate charge.</li>
              <li>You provide the email address used for the account and the payment reference.</li>
            </ul>
          </Section>

          <Section title="2. Exclusions">
            <p>Refunds are generally not available for:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Requests submitted more than five calendar days after purchase.</li>
              <li>Renewal charges where the subscription was not cancelled before renewal.</li>
              <li>Accounts suspended or terminated for misuse or a breach of our Terms of Service.</li>
              <li>Any period in which substantial Pro features or downloadable benefits were used.</li>
            </ul>
            <p>Nothing in this policy limits any refund rights that cannot be excluded by law.</p>
          </Section>

          <Section title="3. How to Request a Refund">
            <p>
              Email{" "}
              <a
                href="mailto:deepscreen.online@outlook.com?subject=Refund%20request"
                className="text-primary hover:underline"
              >
                deepscreen.online@outlook.com
              </a>{" "}
              with the subject “Refund request”. Include your account email, purchase date, payment
              reference and a brief reason for the request. Do not send card or bank-account details.
            </p>
          </Section>

          <Section title="4. Review and Processing">
            <p>
              We will review the request against this policy and confirm the outcome by email. An
              approved refund is returned to the original payment method. The time it takes to appear
              depends on the payment provider and your bank.
            </p>
          </Section>

          <Section title="5. Subscription Cancellation">
            <p>
              Cancelling stops future renewals but does not automatically refund a completed payment.
              Unless a refund is approved, Pro access continues until the end of the paid billing
              period.
            </p>
          </Section>

          <Section title="6. Contact">
            <p>
              For refund questions, email{" "}
              <a href="mailto:deepscreen.online@outlook.com" className="text-primary hover:underline">
                deepscreen.online@outlook.com
              </a>{" "}
              or call{" "}
              <a href="tel:+917200689491" className="text-primary hover:underline">
                +91 72006 89491
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </Shell>
  );
}

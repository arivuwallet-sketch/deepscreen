import { createFileRoute } from "@tanstack/react-router";

import { Shell } from "@/components/ds/Shell";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Contact DeepScreen — Support & Billing Help" },
      {
        name: "description",
        content:
          "Get in touch with the DeepScreen team for support, subscription and billing questions. Email replies typically within 24–48 hours.",
      },
      { property: "og:title", content: "Contact DeepScreen" },
      {
        property: "og:description",
        content: "Support and billing help for DeepScreen Pro users. Email deepscreen.online@outlook.com.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://deepscreen.online/contact" },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Get in Touch with DeepScreen</h1>
        <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            Have a question about our screening tools, need help with your subscription, or want to
            report an issue? We are here to help.
          </p>
          <p>
            The best way to reach us is via email. Our support team typically responds within 24 to
            48 hours.
          </p>
          <div className="rounded-lg border border-border bg-panel p-5 text-foreground">
            <p className="text-sm">
              <span className="font-semibold">Email Support: </span>
              <a
                href="mailto:deepscreen.online@outlook.com"
                className="text-primary hover:underline"
              >
                deepscreen.online@outlook.com
              </a>
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Business Hours: </span>
              Monday to Friday, 9:00 AM – 6:00 PM (IST)
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">For Billing Inquiries</h2>
            <p className="mt-2">
              If you are contacting us regarding a subscription or billing issue, please include the
              email address associated with your DeepScreen Pro account so we can resolve your
              request faster.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}

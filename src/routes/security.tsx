import { createFileRoute } from "@tanstack/react-router";

import { Shell } from "@/components/ds/Shell";

const URL = "https://deepscreen.online/security";

export const Route = createFileRoute("/security")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Security — DeepScreen" },
      {
        name: "description",
        content: "Security contact and responsible disclosure information for DeepScreen.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <Shell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Security</h1>
        <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            DeepScreen welcomes responsible disclosure of security issues that could
            affect users, data, payments, authentication or service availability.
          </p>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Report a vulnerability</h2>
            <p className="mt-2">
              Email <a className="text-primary underline" href="mailto:deepscreen.online@outlook.com">
                deepscreen.online@outlook.com
              </a>{" "}
              with the affected URL or component, reproduction steps, security impact
              and any relevant request/response evidence. Do not include passwords,
              access tokens, payment credentials or other users&apos; personal data.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Testing boundaries</h2>
            <p className="mt-2">
              Test only accounts and data you own or have explicit permission to test.
              Avoid denial-of-service traffic, destructive actions, social engineering,
              credential theft, privacy-invasive testing and actions that could affect
              other users or external providers.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Our disclosure goal</h2>
            <p className="mt-2">
              We will review credible reports, reproduce issues where possible and
              prioritize fixes based on impact and exploitability. This page describes
              a contact process and does not create a guarantee of a reward.
            </p>
          </section>
        </div>
      </main>
    </Shell>
  );
}

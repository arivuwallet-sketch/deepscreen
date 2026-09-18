import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { LeadForm } from "@/components/ds/LeadForm";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { resourceHead } from "@/lib/seo/discovery";
export const Route = createFileRoute("/press")({
  staticData: { sitemap: true },
  head: () =>
    resourceHead(
      "/press",
      "DeepScreen Press & Research Resources",
      "DeepScreen's factual product overview, market coverage, research resources and contact for journalists, educators and research partners.",
      ["DeepScreen press", "DeepScreen media contact", "stock research resources"],
    ),
  component: Press,
});
function Press() {
  return (
    <Shell>
      <article className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        <header>
          <p className="text-sm text-primary">For journalists, educators and research partners</p>
          <h1 className="mt-2 text-3xl font-bold">DeepScreen press and research resources</h1>
          <p className="mt-4 text-muted-foreground">
            DeepScreen is a stock screening and fundamental research website covering supported
            listings across India, the United States and the United Kingdom.
          </p>
        </header>
        <section>
          <h2 className="text-xl font-semibold">Product facts</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            {[
              ["Website", "deepscreen.online"],
              ["Exchange directories", EXCHANGES.map((e) => e.code).join(", ")],
              ["Research model", "13-factor valuation and quality methodology"],
              [
                "Data scope",
                "Provider-dependent inputs; directory coverage does not guarantee complete financial data",
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border p-4">
                <dt className="font-semibold">{label}</dt>
                <dd className="mt-2 text-muted-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Resources you can reference</h2>
          <ul className="mt-4 list-disc space-y-4 pl-5 text-sm">
            <li>
              <a className="text-primary underline" href="/research-checklist">
                Cross-market fundamental research checklist
              </a>{" "}
              — a practical workflow for checking sources, cash flow, financing and valuation
              assumptions.
            </li>
            <li>
              <a className="text-primary underline" href="/methodology">
                13-factor methodology
              </a>{" "}
              — the inputs and limitations behind the research model.
            </li>
            <li>
              <a className="text-primary underline" href="/data-sources">
                Data-quality guide
              </a>{" "}
              — how to distinguish provider inputs, illustrative values and missing information.
            </li>
            <li>
              <a className="text-primary underline" href="/developers">
                Public reference API
              </a>{" "}
              — structured exchange information, metric definitions and answers.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">How to describe DeepScreen accurately</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Describe DeepScreen as a research tool. Do not treat model scores as audited
            performance, personalized advice or guaranteed returns. Availability varies by company
            and input. We do not claim affiliation with exchanges or data providers. Please link to
            the relevant resource so readers can inspect its assumptions.
          </p>
        </section>
        <LeadForm
          heading="Media and research enquiries"
          intro="Contact the DeepScreen team about a resource, interview request, educational collaboration or factual correction."
          subject="DeepScreen media or research enquiry"
        />
      </article>
    </Shell>
  );
}

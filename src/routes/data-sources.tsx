import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { resourceHead } from "@/lib/seo/discovery";
export const Route = createFileRoute("/data-sources")({
  staticData: { sitemap: true },
  head: () =>
    resourceHead(
      "/data-sources",
      "Data Sources, Quality & Corrections | DeepScreen",
      "Understand DeepScreen's provider inputs, incomplete data, illustrative models, source verification and how to report a correction.",
      ["DeepScreen data sources", "stock data quality", "financial data verification"],
    ),
  component: Sources,
});
function Sources() {
  return (
    <Shell>
      <article className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        <header>
          <h1 className="text-3xl font-bold">Data sources, quality and corrections</h1>
          <p className="mt-4 text-muted-foreground">
            A useful research tool distinguishes reported facts, calculated results and unavailable
            information. Use this guide to interpret what DeepScreen can show.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            DeepScreen editorial team · Reviewed 18 September 2026
          </p>
        </header>
        <section>
          <h2 className="text-xl font-semibold">Where inputs come from</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Available Indian filing ratios may be obtained through Screener.in. Other supported
            exchange data may be obtained through Yahoo Finance. These are third-party sources;
            naming them does not imply partnership or endorsement. Availability and retrieval do not
            guarantee current or complete financial statements.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">What the labels mean</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold">Provider input</dt>
              <dd className="mt-1 text-muted-foreground">
                A value available from a supported provider. Confirm the period, definition, unit
                and currency against the company's disclosure.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Calculated or illustrative value</dt>
              <dd className="mt-1 text-muted-foreground">
                A model result can depend on assumptions. Some supplementary panels use illustrative
                data. These values are not company-reported facts and must not be cited as such.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Unavailable or insufficient data</dt>
              <dd className="mt-1 text-muted-foreground">
                Required inputs are missing or incomplete. Company tables withhold unavailable
                numbers and do not present a complete score when required inputs are missing.
                Missing data is not a zero value.
              </dd>
            </div>
          </dl>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Start with primary disclosures</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Use the company's investor relations site and the appropriate filing service to verify
            material facts. Match the entity, reporting period and consolidated or standalone basis.
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm">
            <li>
              <a className="text-primary underline" href="https://www.sec.gov/edgar/search/">
                SEC EDGAR — US company filings
              </a>
            </li>
            <li>
              <a
                className="text-primary underline"
                href="https://www.nseindia.com/companies-listing/corporate-filings-announcements"
              >
                NSE — corporate announcements
              </a>
            </li>
            <li>
              <a
                className="text-primary underline"
                href="https://www.bseindia.com/corporates/ann.html"
              >
                BSE — corporate announcements
              </a>
            </li>
            <li>
              <a
                className="text-primary underline"
                href="https://data.fca.org.uk/#/nsm/nationalstoragemechanism"
              >
                FCA National Storage Mechanism — UK regulated disclosures
              </a>
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Editorial responsibility and corrections</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            DeepScreen publishes its educational explanations and model documentation under the
            DeepScreen name. A reviewed date records a content review, not a quote timestamp or
            assurance that every financial figure is current.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            To report an error, send the page URL, the disputed statement or value, the relevant
            reporting period and a primary-source link to{" "}
            <a
              className="text-primary underline"
              href="mailto:deepscreen.online@outlook.com?subject=DeepScreen%20data%20correction"
            >
              deepscreen.online@outlook.com
            </a>
            . Do not include passwords or private portfolio information.
          </p>
        </section>
        <p className="text-sm">
          <a href="/methodology" className="text-primary underline">
            Scoring methodology
          </a>{" "}
          ·{" "}
          <a href="/research-checklist" className="text-primary underline">
            Research checklist
          </a>
        </p>
      </article>
    </Shell>
  );
}

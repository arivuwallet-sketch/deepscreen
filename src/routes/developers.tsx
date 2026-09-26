import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { resourceHead } from "@/lib/seo/discovery";
export const Route = createFileRoute("/developers")({
  staticData: { sitemap: true },
  head: () =>
    resourceHead(
      "/developers",
      "Public Reference API & Agent Documentation | DeepScreen",
      "Use DeepScreen's read-only API for exchange metadata, metric definitions and screening answers. OpenAPI 3.1 specification, examples and limitations.",
      ["DeepScreen API", "stock research API", "financial reference API", "financial metric definitions API", "financial metrics API", "OpenAPI financial API", "stock research reference API", "market metadata API"],
    ),
  component: Developers,
});
function Developers() {
  return (
    <Shell>
      <article className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        <header>
          <p className="text-sm text-primary">Public reference API · v1.0.0</p>
          <h1 className="mt-2 text-3xl font-bold">Build with DeepScreen reference content</h1>
          <p className="mt-4 text-muted-foreground">
            Retrieve exchange metadata, educational metric definitions and stock screening answers.
            These public GET endpoints require no API key and cannot trade, access accounts or
            retrieve personal data.
          </p>
        </header>
        <section>
          <h2 className="text-xl font-semibold">Endpoints</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3">GET endpoint</th>
                  <th className="p-3">Returns</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["exchanges", "Exchange code, name, country, currency and directory URL"],
                  ["metrics", "Metric names, definitions, formulas, cautions and guide URLs"],
                  ["answers", "Questions, answers, review date and reference URLs"],
                ].map(([path, label]) => (
                  <tr key={path} className="border-b border-border">
                    <td className="p-3">
                      <a className="text-primary underline" href={`/api/v1/${path}`}>
                        /api/v1/{path}
                      </a>
                    </td>
                    <td className="p-3 text-muted-foreground">{label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Example request</h2>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-panel p-4 text-sm">
            <code>{"curl --fail https://deepscreen.online/api/v1/exchanges"}</code>
          </pre>
          <p className="mt-3 text-sm text-muted-foreground">
            Each response includes version, resource, documentation, limitations and data. Answers
            also include reviewedAt, which is an editorial review date. No endpoint accepts query
            parameters or pagination. Cache responses for up to one hour. Handle errors and back off
            before retrying; never fill missing data with invented values.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Scope and attribution</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            This is educational reference content, not a live financial feed. It does not return
            quotes, company financial statements, forecasts, subscriptions or portfolio information.
            Link readers to the returned source URL and retain the cautions when quoting a
            definition. Do not send credentials or personal information to these endpoints.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Availability depends on the hosting service. There is no published service-level
            guarantee. Unsupported query parameters return 400; unknown resources return 404. Only
            GET is documented. Cross-origin GET requests are allowed.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Discovery formats</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-primary">
            <li>
              <a href="/openapi.json">OpenAPI 3.1 specification</a>
            </li>
            <li>
              <a href="/llms.txt">llms.txt resource index</a>
            </li>
            <li>
              <a href="/answers.ssml" download>
                SSML 1.1 answer script for compatible speech tools
              </a>
            </li>
            <li>
              <Link to="/data-sources">Source and quality guide</Link>
            </li>
          </ul>
        </section>
      </article>
    </Shell>
  );
}

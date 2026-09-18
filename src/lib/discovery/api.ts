import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { RATIOS } from "@/lib/seo/content";
import { ANSWERS, ANSWERS_REVIEWED } from "./answers";

const origin = "https://deepscreen.online";
export const API_RESOURCES = ["exchanges", "metrics", "answers"] as const;
export type Resource = (typeof API_RESOURCES)[number];
export const API_LIMITATIONS =
  "Educational reference content only. No live quotes, reported company financials, recommendations, account access or trading. Directory coverage does not imply financial-data availability.";
export function resourceData(resource: Resource) {
  switch (resource) {
    case "exchanges":
      return EXCHANGES.map((e) => ({
        code: e.code,
        name: e.name,
        country: e.country,
        currency: e.currency,
        url: `${origin}/exchange/${e.code}`,
      }));
    case "metrics":
      return RATIOS.map((r) => ({
        id: r.slug,
        name: r.name,
        abbreviation: r.shortName,
        formula: r.formula,
        definition: r.answer,
        cautions: r.cautions,
        url: `${origin}/learn/${r.slug}`,
      }));
    case "answers":
      return ANSWERS.map((a) => ({
        id: a.id,
        question: a.question,
        answer: a.answer,
        url: `${origin}/answers#${a.id}`,
        referenceUrl: `${origin}${a.href}`,
      }));
  }
}
export function referenceResponse(resource: string, request: Request) {
  const headers = {
    "Cache-Control": "public, max-age=3600",
    "Access-Control-Allow-Origin": "*",
    "X-Robots-Tag": "noindex",
    "X-Content-Type-Options": "nosniff",
  };
  if (!API_RESOURCES.includes(resource as Resource))
    return Response.json(
      { error: "Unknown resource", resources: API_RESOURCES },
      { status: 404, headers: { ...headers, "Cache-Control": "no-store" } },
    );
  if (new URL(request.url).search)
    return Response.json(
      { error: "This endpoint accepts no query parameters" },
      { status: 400, headers: { ...headers, "Cache-Control": "no-store" } },
    );
  return Response.json(
    {
      version: "1.0.0",
      resource,
      documentation: `${origin}/developers`,
      limitations: API_LIMITATIONS,
      ...(resource === "answers" ? { reviewedAt: ANSWERS_REVIEWED } : {}),
      data: resourceData(resource as Resource),
    },
    { headers },
  );
}
const string = { type: "string" };
const uri = { type: "string", format: "uri" };
const object = (properties: Record<string, unknown>) => ({
  type: "object",
  required: Object.keys(properties),
  additionalProperties: false,
  properties,
});
const itemSchemas = {
  exchanges: object({
    code: { type: "string", enum: EXCHANGES.map((e) => e.code) },
    name: string,
    country: string,
    currency: string,
    url: uri,
  }),
  metrics: object({
    id: string,
    name: string,
    abbreviation: string,
    formula: string,
    definition: string,
    cautions: { type: "array", items: string },
    url: uri,
  }),
  answers: object({ id: string, question: string, answer: string, url: uri, referenceUrl: uri }),
};
export const OPENAPI = {
  openapi: "3.1.0",
  info: {
    title: "DeepScreen Public Reference API",
    version: "1.0.0",
    description: `${API_LIMITATIONS} GET requests only; no authentication. Send no credentials or personal information. No query parameters or pagination; each response contains a small, complete reference list.`,
    contact: {
      name: "DeepScreen",
      url: `${origin}/contact`,
      email: "deepscreen.online@outlook.com",
    },
  },
  servers: [{ url: origin }],
  security: [],
  externalDocs: { description: "Usage and limitations", url: `${origin}/developers` },
  paths: Object.fromEntries(
    API_RESOURCES.map((resource) => [
      `/api/v1/${resource}`,
      {
        get: {
          operationId: `get${resource.charAt(0).toUpperCase()}${resource.slice(1)}`,
          summary: `Read DeepScreen ${resource}`,
          description:
            "Public read-only reference content. No query parameters. Cache for up to one hour and handle non-200 responses without inventing missing data.",
          responses: {
            "200": {
              description: "Complete reference list, not a live financial feed",
              content: {
                "application/json": {
                  schema: object({
                    version: { const: "1.0.0", type: "string" },
                    resource: { const: resource, type: "string" },
                    documentation: uri,
                    limitations: string,
                    ...(resource === "answers"
                      ? { reviewedAt: { type: "string", format: "date" } }
                      : {}),
                    data: { type: "array", items: itemSchemas[resource] },
                  }),
                  example: {
                    version: "1.0.0",
                    resource,
                    documentation: `${origin}/developers`,
                    limitations: API_LIMITATIONS,
                    ...(resource === "answers" ? { reviewedAt: ANSWERS_REVIEWED } : {}),
                    data: resourceData(resource),
                  },
                },
              },
            },
            "400": {
              description: "Query parameters are not supported",
              content: { "application/json": { schema: object({ error: string }) } },
            },
            "405": { description: "Method not allowed. Use GET." },
            default: {
              description:
                "Hosting or network error; retry later with backoff. Response may not be JSON.",
            },
          },
        },
      },
    ]),
  ),
};

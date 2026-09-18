import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
// ESLint already depends on Ajv. Use its compatible validator in this development-only check.
// No additional runtime dependency or optional form-resolver peer is introduced.
const require = createRequire(import.meta.url);
const Ajv = createRequire(require.resolve("eslint"))("ajv");
import { setTimeout as delay } from "node:timers/promises";

const origin = process.env.SEO_TEST_ORIGIN || "http://127.0.0.1:4175";
const server = process.env.SEO_TEST_ORIGIN
  ? null
  : spawn(
      process.execPath,
      ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4175"],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
let logs = "";
server?.stdout.on("data", (chunk) => {
  logs += chunk;
});
server?.stderr.on("data", (chunk) => {
  logs += chunk;
});
async function get(path, options = {}) {
  return fetch(new URL(path, origin), { signal: AbortSignal.timeout(45000), ...options });
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      await get("/robots.txt");
      ready = true;
      break;
    } catch {
      await delay(200);
    }
  }
  assert.ok(ready, `Server did not start: ${logs}`);
  const home = await get("/");
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /Global stock screening across five exchanges/);
  assert.ok(!html.includes("SearchAction"));
  assert.ok(html.includes("Highest-scoring companies globally"));
  const jsonScripts = [
    ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ];
  assert.ok(jsonScripts.length > 0);
  for (const match of jsonScripts) JSON.parse(match[1]);
  console.log("PASS home SSR, descriptive heading and valid JSON-LD");

  const index = await get("/sitemap.xml");
  assert.equal(index.status, 200);
  const sections = [...(await index.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname,
  );
  assert.ok(sections.length > 3);
  let urls = 0;
  for (const path of sections) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /xml/);
    const xml = await response.text();
    assert.ok(!xml.includes("/ratios/pe-ratio"));
    assert.ok(!xml.includes("/options-strategy/"));
    urls += [...xml.matchAll(/<url>/g)].length;
  }
  assert.ok(urls > 13000);
  assert.equal((await get("/sitemaps/unknown.xml")).status, 404);
  console.log(`PASS sitemap index, ${sections.length} child sitemaps and ${urls} URLs`);

  for (const [from, to] of [
    ["/ratios/pe-ratio", "/learn/pe-ratio"],
    ["/options-strategy/long-call", "/options/long-call"],
  ]) {
    const response = await get(from, { redirect: "manual" });
    assert.equal(response.status, 301, from);
    assert.equal(new URL(response.headers.get("location"), origin).pathname, to);
  }
  console.log("PASS permanent redirects for duplicate guides");
  const page = await get("/exchange/NSE?page=2");
  assert.equal(page.status, 200);
  const pageHtml = await page.text();
  assert.match(pageHtml, /href="https:\/\/deepscreen.online\/exchange\/NSE\?page=2"/);
  assert.match(pageHtml, /href="\/exchange\/NSE\?page=3"/);
  assert.equal((await get("/exchange/NSE?page=999")).status, 404);
  console.log("PASS crawlable pagination, self-canonical URLs and out-of-range 404");
  const auth = await get("/auth");
  assert.match(await auth.text(), /noindex, follow/);
  console.log("PASS account page noindex");

  const schemaNodes = (body) =>
    [
      ...body.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    ].flatMap((match) => {
      const node = JSON.parse(match[1]);
      return node["@graph"] || [node];
    });
  const homeNodes = schemaNodes(html);
  assert.equal(homeNodes.filter((n) => n["@type"] === "Organization").length, 1);
  assert.equal(homeNodes.filter((n) => n["@type"] === "WebSite").length, 1);
  assert.ok(homeNodes.find((n) => n["@type"] === "Organization")["@id"]);
  const coreMap = await (await get("/sitemaps/core.xml")).text();
  for (const path of [
    "/answers",
    "/research-checklist",
    "/data-sources",
    "/developers",
    "/press",
  ]) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    const body = await response.text();
    assert.equal([...body.matchAll(/<h1(?:\s|>)/g)].length, 1, path);
    assert.ok(body.includes(`href="https://deepscreen.online${path}"`), path);
    assert.ok(
      schemaNodes(body).some((n) => n["@type"] === "BreadcrumbList"),
      path,
    );
    assert.ok(coreMap.includes(`https://deepscreen.online${path}</loc>`), path);
  }
  assert.ok(!coreMap.includes("/api/v1/"));
  assert.ok(!coreMap.includes("/openapi.json"));
  console.log("PASS resource pages, entity identities, breadcrumbs and sitemap inclusion");

  const specResponse = await get("/openapi.json");
  assert.equal(specResponse.status, 200);
  const spec = await specResponse.json();
  assert.equal(spec.openapi, "3.1.0");
  assert.deepEqual(spec.security, []);
  const ajv = new Ajv({ allErrors: true });
  let answerData;
  for (const [path, methods] of Object.entries(spec.paths)) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get("access-control-allow-origin"), "*");
    assert.equal(response.headers.get("x-robots-tag"), "noindex");
    const payload = await response.json();
    const validate = ajv.compile(methods.get.responses["200"].content["application/json"].schema);
    assert.ok(validate(payload), `${path}: ${JSON.stringify(validate.errors)}`);
    assert.ok(payload.data.length > 0);
    if (payload.resource === "answers") answerData = payload.data;
    assert.equal((await get(`${path}?unsupported=1`)).status, 400);
    assert.equal((await get(path, { method: "POST" })).status, 405);
  }
  assert.equal((await get("/api/v1/unknown")).status, 404);
  const answersHtml = await (await get("/answers")).text();
  const visible = answersHtml
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
  const faq = schemaNodes(answersHtml).find((n) => n["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, answerData.length);
  for (const [index, answer] of answerData.entries()) {
    assert.equal(faq.mainEntity[index].name, answer.question);
    assert.equal(faq.mainEntity[index].acceptedAnswer.text, answer.answer);
    assert.ok(visible.includes(answer.question), answer.id);
    assert.ok(visible.includes(answer.answer), answer.id);
    assert.ok(answersHtml.includes(`id="${answer.id}"`));
  }
  const ssmlResponse = await get("/answers.ssml");
  assert.equal(ssmlResponse.status, 200);
  assert.match(ssmlResponse.headers.get("content-type"), /application\/ssml\+xml/);
  const ssml = await ssmlResponse.text();
  const parsedXml = spawnSync(
    "python",
    [
      "-c",
      'import json,sys,xml.etree.ElementTree as E; r=E.fromstring(sys.stdin.read()); assert r.tag=="{http://www.w3.org/2001/10/synthesis}speak"; print(json.dumps(["".join(p.itertext()) for p in r]))',
    ],
    { input: ssml, encoding: "utf8" },
  );
  assert.equal(parsedXml.status, 0, parsedXml.stderr);
  const spoken = JSON.parse(parsedXml.stdout);
  assert.deepEqual(
    spoken,
    answerData.map((a) => a.question + a.answer),
  );
  console.log(
    "PASS API responses against documented schemas, errors, visible FAQ parity and SSML XML",
  );

  const robots = await (await get("/robots.txt")).text();
  assert.ok(robots.includes("Allow: /api/v1/"));
  assert.ok(robots.includes("Disallow: /api/"));
  const llms = await (await get("/llms.txt")).text();
  assert.ok(llms.includes("https://deepscreen.online/openapi.json"));
  assert.ok(html.includes("Score and verdict remain visible while live fundamentals refresh."));
  assert.ok(!html.includes("usually within 24"));
  console.log("PASS crawler discovery and restored score display");
  const rankingPage = await (await get("/best/high-roce-stocks")).text();
  assert.ok(rankingPage.includes("High ROCE Stocks Across Global Markets | DeepScreen"));
  assert.ok(rankingPage.includes("Find companies with the highest return on capital employed across five exchanges."));
  assert.ok(rankingPage.includes("Rankings use available live data where possible and modeled estimates otherwise. They are not investment advice."));
  assert.ok(!rankingPage.includes("These companies have not been verified as matching this screen"));
  console.log("PASS restored ranking wording, metadata and original disclaimer");
  const stockPage = await (await get("/stock/NSE/DIGIDRIVE")).text();
  assert.ok(stockPage.includes("DeepScreen verdict"));
  assert.ok(stockPage.includes("Weighted 13-factor score"));
  assert.ok(stockPage.includes("Strengths"));
  assert.ok(stockPage.includes("Risks"));
  assert.ok(!stockPage.includes("Financial data currently unavailable"));
  console.log("PASS restored company verdict, score, strengths and risks panels");
} finally {
  server?.kill("SIGTERM");
}

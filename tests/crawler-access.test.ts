import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";

const robots = readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8");
type Group = { agents: string[]; rules: { allow: boolean; path: string }[] };
const groups: Group[] = [];
let group: Group | undefined;
for (const line of robots.split("\n")) {
  const match = line.match(/^(User-agent|Allow|Disallow):\s*(.+)$/i);
  if (!match) continue;
  const [, directive, value] = match;
  if (directive.toLowerCase() === "user-agent") {
    if (!group || group.rules.length) {
      group = { agents: [], rules: [] };
      groups.push(group);
    }
    group.agents.push(value.toLowerCase());
  } else {
    group?.rules.push({ allow: directive.toLowerCase() === "allow", path: value });
  }
}

function allowed(agent: string, path: string): boolean {
  const exact = groups.filter((item) => item.agents.includes(agent.toLowerCase()));
  const selected = exact.length ? exact : groups.filter((item) => item.agents.includes("*"));
  const rules = selected.flatMap((item) => item.rules).filter((rule) => {
    const pattern = rule.path.replace(/\$$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("^" + pattern + (rule.path.endsWith("$") ? "$" : "")).test(path);
  }).sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow));
  return rules[0]?.allow ?? true;
}

const agents = [...new Set(groups.flatMap((item) => item.agents)), "UnknownResearchBot"];
test("all named and unknown crawlers can fetch every public research family", () => {
  for (const agent of agents) {
    for (const path of ["/", "/chat", "/stock/NSE/RELIANCE", "/exchange/BSE?page=52", "/investment/BSE/ETF/ABSLBANETF", "/investments?page=405", "/mutual-funds", "/etfs", "/reits", "/answers", "/knowledge", "/learn/pe-ratio", "/methodology", "/commodities", "/gift-nifty", "/ipo-gmp", "/llms.txt", "/llms-full.txt", "/sitemap.xml"]) {
      expect(allowed(agent, path), `${agent}: ${path}`).toBe(true);
    }
  }
});

test("only private path boundaries are excluded, including query variants", () => {
  for (const agent of agents) {
    for (const prefix of ["api", "admin", "account", "auth", "portfolio", "research-desk"]) {
      for (const suffix of ["", "/", "/private", "?redirect=%2Fpricing"]) {
        expect(allowed(agent, `/${prefix}${suffix}`), `${agent}: /${prefix}${suffix}`).toBe(false);
      }
      expect(allowed(agent, `/${prefix}-public-guide`)).toBe(true);
    }
  }
});

test("explicit and fallback groups use identical private rules with no blanket bot denial", () => {
  expect(groups.length).toBe(2);
  expect(groups[0]?.rules).toEqual(groups[1]?.rules);
  expect(robots).not.toMatch(/^Disallow:\s*\/$/m);
});
import { useEffect, useMemo, useState } from "react";
import {
  allocations,
  DESK_KEY,
  exportCsv,
  HEADERS,
  importCsv,
  readBackup,
  validateEntry,
  type ResearchEntry,
} from "@/lib/research/desk";
const input = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
const button =
  "rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50";
const money = (n: number, c: string) =>
  `${c} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n)}`;
function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const blank = (): ResearchEntry => ({
  id: "",
  market: "NSE",
  symbol: "",
  name: "",
  list: "Research",
  quantity: 0,
  averageCost: 0,
  currency: "INR",
  thesis: "",
  risks: "",
  reviewDate: "",
  sources: [],
  updatedAt: "",
});
export function ResearchDesk() {
  const [entries, setEntries] = useState<ResearchEntry[]>([]),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState(""),
    [blocked, setBlocked] = useState(false);
  const [draft, setDraft] = useState<ResearchEntry>(blank),
    [links, setLinks] = useState(""),
    [tab, setTab] = useState("Watchlists"),
    [filter, setFilter] = useState(""),
    [list, setList] = useState("All");
  const [preview, setPreview] = useState<{ entries: ResearchEntry[]; kind: string } | null>(null);
  const [remove, setRemove] = useState<string | null>(null);
  const [today, setToday] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DESK_KEY);
      if (saved) setEntries(readBackup(saved));
    } catch {
      setBlocked(true);
      setMessage(
        "Existing storage could not be read. Editing is disabled to avoid overwriting it. Export the stored data for recovery.",
      );
    }
    setToday(new Date().toLocaleDateString("en-CA"));
    setReady(true);
  }, []);
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === DESK_KEY) {
        try {
          setEntries(event.newValue ? readBackup(event.newValue) : []);
          setMessage("Saved entries changed in another tab. Your unsaved form is still here.");
        } catch {
          setBlocked(true);
          setMessage("Another tab wrote unreadable data. Editing paused.");
        }
      }
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);
  function save(next: ResearchEntry[]) {
    if (!ready || blocked) return false;
    try {
      localStorage.setItem(DESK_KEY, JSON.stringify({ version: 1, entries: next }));
      setEntries(next);
      setMessage("Saved on this browser.");
      return true;
    } catch {
      setMessage(
        "Could not save: browser storage is full or unavailable. Export your existing research before clearing storage.",
      );
      return false;
    }
  }
  const shown = useMemo(
    () =>
      entries.filter(
        (e) =>
          (list === "All" || e.list === list) &&
          `${e.symbol} ${e.name} ${e.market} ${e.thesis}`
            .toLowerCase()
            .includes(filter.toLowerCase()),
      ),
    [entries, list, filter],
  );
  const groups = allocations(shown),
    due = entries.filter((e) => e.reviewDate && e.reviewDate <= today);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next = {
      ...draft,
      symbol: draft.symbol.trim().toUpperCase(),
      market: draft.market.trim().toUpperCase(),
      currency: draft.currency.trim().toUpperCase(),
      list: draft.list.trim(),
      id: draft.id || crypto.randomUUID(),
      sources: links
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    if (!validateEntry(next)) {
      setMessage(
        "Check required fields, non-negative quantities/costs, three-letter currency, review date and HTTP(S) source links (maximum 20).",
      );
      return;
    }
    if (!draft.id && entries.length >= 1000) {
      setMessage("Maximum 1,000 entries. Export or remove entries before adding more.");
      return;
    }
    if (save(draft.id ? entries.map((e) => (e.id === draft.id ? next : e)) : [...entries, next])) {
      setDraft(blank());
      setLinks("");
    }
  }
  async function load(file: File | undefined) {
    if (!file) return;
    setPreview(null);
    if (file.size > 5_000_000) {
      setMessage("Choose a CSV or JSON file smaller than 5 MB.");
      return;
    }
    try {
      const text = await file.text(),
        json = file.name.toLowerCase().endsWith(".json");
      setPreview({
        entries: json ? readBackup(text) : importCsv(text),
        kind: json ? "backup" : "CSV",
      });
      setMessage("Import preview ready. Nothing has been saved yet.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Import could not be read.");
    }
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
      <p className="font-mono text-xs uppercase text-primary">
        Your independent research workspace
      </p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Research Desk</h1>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Organize watchlists, record your thesis, keep original source links, and understand the cost
        allocation of holdings you enter. Saved only in this browser—not synced to your account.
        Export a backup before changing devices or clearing browser data.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Research entries", entries.length],
          ["Named lists", new Set(entries.map((e) => e.list)).size],
          ["Reviews due", due.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-panel p-5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 font-mono text-2xl">{ready ? value : "—"}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Research views">
        {["Watchlists", "Cost allocation", "Import & export"].map((t) => (
          <button
            type="button"
            key={t}
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
            className={`${button} ${tab === t ? "bg-primary text-primary-foreground" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className="mt-4 min-h-5 text-sm text-primary">
        {message || (!ready ? "Loading your research…" : "")}
      </p>
      {tab !== "Import & export" && (
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_200px]">
          <label className="text-xs">
            Search research
            <input
              className={input}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Symbol, name or thesis"
            />
          </label>
          <label className="text-xs">
            Watchlist
            <select className={input} value={list} onChange={(e) => setList(e.target.value)}>
              <option>All</option>
              {[...new Set(entries.map((e) => e.list))].sort().map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {tab === "Watchlists" && (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form onSubmit={submit} className="rounded-xl border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">
              {draft.id ? "Edit research entry" : "Add research entry"}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Enter quantity 0 for a watch-only idea. Costs are your inputs, not market quotes.
            </p>
            <fieldset disabled={!ready || blocked} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["Market", "market"],
                    ["Symbol", "symbol"],
                    ["Name", "name"],
                    ["List name", "list"],
                    ["Currency code", "currency"],
                  ] as const
                ).map(([label, key]) => (
                  <label className="text-xs" key={key}>
                    {label}
                    <input
                      required={key !== "name"}
                      maxLength={
                        key === "name"
                          ? 300
                          : key === "symbol"
                            ? 60
                            : key === "market"
                              ? 30
                              : key === "list"
                                ? 80
                                : 3
                      }
                      className={input}
                      value={draft[key]}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    />
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["Quantity", "quantity"],
                    ["Average purchase cost", "averageCost"],
                  ] as const
                ).map(([label, key]) => (
                  <label className="text-xs" key={key}>
                    {label}
                    <input
                      type="number"
                      required
                      min="0"
                      max="1000000000000"
                      step="any"
                      className={input}
                      value={Number.isFinite(draft[key]) ? draft[key] : ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          [key]: e.target.value === "" ? NaN : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <label className="block text-xs">
                Investment thesis
                <textarea
                  maxLength={10000}
                  rows={3}
                  className={input}
                  aria-label="Investment thesis"
                    value={draft.thesis}
                  onChange={(e) => setDraft({ ...draft, thesis: e.target.value })}
                  placeholder="Why are you researching this? What evidence supports your view?"
                />
              </label>
              <label className="block text-xs">
                Risks and evidence to check
                <textarea
                  maxLength={10000}
                  rows={3}
                  className={input}
                  aria-label="Risks and evidence to check"
                    value={draft.risks}
                  onChange={(e) => setDraft({ ...draft, risks: e.target.value })}
                  placeholder="What would change your mind? What is still missing?"
                />
              </label>
              <label className="block text-xs">
                Next review date
                <input
                  type="date"
                  className={input}
                  value={draft.reviewDate}
                  onChange={(e) => setDraft({ ...draft, reviewDate: e.target.value })}
                />
              </label>
              <label className="block text-xs">
                Source links (one per line)
                <textarea
                  rows={3}
                  className={input}
                  aria-label="Source links (one per line)"
                    value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="https://company.example/investor-relations/annual-report.pdf"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button className={`${button} bg-primary text-primary-foreground`} type="submit">
                  Save research
                </button>
                {draft.id && (
                  <button
                    type="button"
                    className={button}
                    onClick={() => {
                      setDraft(blank());
                      setLinks("");
                    }}
                  >
                    Cancel editing
                  </button>
                )}
              </div>
            </fieldset>
          </form>
          <section aria-label="Saved research" className="space-y-3">
            {!shown.length && (
              <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
                {entries.length
                  ? "No entries match this filter."
                  : "Your research starts here. Add an idea or import a holdings CSV. No sample investments are added."}
              </div>
            )}
            {shown.map((e) => (
              <article key={e.id} className="rounded-xl border border-border bg-panel p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <h2 className="font-semibold">
                    {e.symbol} <span className="text-xs text-muted-foreground">{e.market}</span>
                  </h2>
                  <span className="text-xs text-primary">{e.list}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{e.name}</p>
                <p className="mt-3 text-xs">
                  {e.quantity > 0
                    ? `${e.quantity} units · ${money(e.averageCost, e.currency)} average cost`
                    : "Watch-only idea"}
                </p>
                {e.thesis && (
                  <div className="mt-4">
                    <h3 className="text-xs font-semibold text-primary">Thesis</h3>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm">{e.thesis}</p>
                  </div>
                )}
                {e.risks && (
                  <div className="mt-3">
                    <h3 className="text-xs font-semibold text-primary">Risks / missing evidence</h3>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm">{e.risks}</p>
                  </div>
                )}
                {e.sources.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs">
                    {e.sources.map((url, i) => (
                      <li key={i}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-primary hover:underline"
                        >
                          Source {i + 1}: {new URL(url).hostname} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {e.reviewDate && (
                  <p className="mt-3 text-xs">
                    {e.reviewDate <= today ? "Review due" : "Review planned"} · {e.reviewDate}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Updated {e.updatedAt.slice(0, 10)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={button}
                    onClick={() => {
                      setDraft({ ...e });
                      setLinks(e.sources.join("\n"));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Edit {e.symbol}
                  </button>
                  {remove === e.id ? (
                    <>
                      <button
                        type="button"
                        className={button}
                        onClick={() => {
                          if (save(entries.filter((x) => x.id !== e.id))) {
                            setRemove(null);
                            if (draft.id === e.id) {
                              setDraft(blank());
                              setLinks("");
                            }
                          }
                        }}
                      >
                        Confirm removal
                      </button>
                      <button type="button" className={button} onClick={() => setRemove(null)}>
                        Keep entry
                      </button>
                    </>
                  ) : (
                    <button type="button" className={button} onClick={() => setRemove(e.id)}>
                      Remove
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        </div>
      )}
      {tab === "Cost allocation" && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Allocation of your entered purchase costs</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Uses quantity × average purchase cost for the current filters. Each currency is
            separate; no FX conversion, live valuation, profit/loss or stock score is calculated.
            Separate entries for the same symbol remain separate lots.
          </p>
          {!groups.length && (
            <p className="mt-6 rounded-xl border border-dashed border-border p-6 text-sm">
              Add positive quantities and purchase costs to see allocation.
            </p>
          )}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {groups.map((g) => (
              <div key={g.currency} className="rounded-xl border border-border bg-panel p-5">
                <h3 className="font-semibold">
                  {g.currency} cost basis · {money(g.total, g.currency)}
                </h3>
                <div className="mt-4 space-y-4">
                  {g.holdings.map((h) => (
                    <div key={h.entry.id}>
                      <div className="flex flex-wrap justify-between gap-2 text-sm">
                        <span>
                          {h.entry.symbol} · {h.entry.list}
                        </span>
                        <span>
                          {h.weight.toFixed(1)}% · {money(h.cost, g.currency)}
                        </span>
                      </div>
                      <progress
                        aria-label={`${h.entry.symbol} cost allocation`}
                        value={h.weight}
                        max={100}
                        className="mt-2 h-2 w-full accent-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {tab === "Import & export" && (
        <section className="mt-6 space-y-5">
          <div className="rounded-xl border border-border bg-panel p-5">
            <h2 className="text-xl font-semibold">Back up and move your research</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              JSON preserves every field. CSV works with spreadsheets. Imports append entries after
              preview; existing entries are never replaced. Importing the same file again creates
              additional entries.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                disabled={!ready}
                type="button"
                className={button}
                onClick={() =>
                  download(
                    "deepscreen-research.json",
                    JSON.stringify({ version: 1, entries }, null, 2),
                    "application/json",
                  )
                }
              >
                Export JSON backup
              </button>
              <button
                disabled={!ready}
                type="button"
                className={button}
                onClick={() =>
                  download("deepscreen-research.csv", exportCsv(entries), "text/csv;charset=utf-8")
                }
              >
                Export CSV
              </button>
              <button
                type="button"
                className={button}
                onClick={() =>
                  download(
                    "deepscreen-holdings-template.csv",
                    HEADERS.join(",") + "\r\n",
                    "text/csv",
                  )
                }
              >
                Download CSV template
              </button>
              {blocked && (
                <button
                  type="button"
                  className={button}
                  onClick={() => {
                    try {
                      download(
                        "research-storage-recovery.txt",
                        localStorage.getItem(DESK_KEY) ?? "",
                        "text/plain",
                      );
                    } catch {
                      setMessage("Browser storage cannot be accessed.");
                    }
                  }}
                >
                  Export stored data for recovery
                </button>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h2 className="text-lg font-semibold">Import holdings or research backup</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              CSV requires market, symbol, quantity, average_cost and currency. Use plain
              non-negative numbers. Optional sources are separated by |. Maximum 1,000 total entries
              and 5 MB per file.
            </p>
            <label className="mt-4 block text-sm">
              Choose CSV or JSON
              <input
                disabled={!ready || blocked}
                type="file"
                accept=".csv,.json"
                className="mt-2 block max-w-full text-xs"
                onChange={(e) => {
                  void load(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {preview && (
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
              <h2 className="font-semibold">
                Preview: {preview.entries.length} entries from {preview.kind}
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {preview.entries.slice(0, 5).map((e) => (
                  <li key={e.id}>
                    {e.market}: {e.symbol} · {e.quantity} units · {money(e.averageCost, e.currency)}
                  </li>
                ))}
              </ul>
              {preview.entries.length > 5 && (
                <p className="mt-2 text-xs">Plus {preview.entries.length - 5} more entries.</p>
              )}
              <div className="mt-4 flex gap-3">
                <button
                  className={button}
                  type="button"
                  disabled={blocked || entries.length + preview.entries.length > 1000}
                  onClick={() => {
                    const added = preview.entries.map((e) => ({ ...e, id: crypto.randomUUID() }));
                    if (save([...entries, ...added])) setPreview(null);
                  }}
                >
                  Import {preview.entries.length} entries
                </button>
                <button className={button} type="button" onClick={() => setPreview(null)}>
                  Cancel import
                </button>
              </div>
              {entries.length + preview.entries.length > 1000 && (
                <p className="mt-2 text-sm">Import exceeds the 1,000-entry limit.</p>
              )}
            </div>
          )}
        </section>
      )}
      <section className="mt-10 border-t border-border pt-6">
        <h2 className="font-semibold">Build your evidence trail</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Link the company’s investor-relations page, annual report, results filing or fund
          factsheet to each entry. Record the reporting period and what supports—or contradicts—your
          thesis. Source links are saved as references; documents are not downloaded or analyzed
          automatically.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-primary">
          <a
            href="https://www.nseindia.com/companies-listing/corporate-filings-announcements"
            target="_blank"
            rel="noopener noreferrer"
          >
            NSE announcements ↗
          </a>
          <a href="https://www.sec.gov/edgar/search/" target="_blank" rel="noopener noreferrer">
            SEC EDGAR ↗
          </a>
          <a href="/research-checklist">Research checklist →</a>
        </div>
      </section>
    </div>
  );
}

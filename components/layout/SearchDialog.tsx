"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, X } from "lucide-react";
import type { SearchEntry } from "@/lib/searchIndex";
import { cn } from "@/lib/utils";

const ACCENT: Record<string, string> = {
  sysdesign: "var(--concept)",
  algorithms: "var(--coding)",
  devops: "var(--devops)",
  backend: "var(--backend)",
  fde: "var(--fde)",
  languages: "var(--languages)",
  security: "var(--security)",
  ai: "var(--ai)",
};

interface Hit {
  entry: SearchEntry;
  /** The heading that matched, when the match was inside the page. */
  heading?: [string, string];
  score: number;
}

const MAX_RESULTS = 40;

/** Every query word must appear somewhere; titles count most, then headings, then summaries. */
function search(index: SearchEntry[], query: string): Hit[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const hits: Hit[] = [];
  for (const entry of index) {
    const title = entry.title.toLowerCase();
    const context = `${entry.parent ?? ""} ${entry.summary ?? ""}`.toLowerCase();
    const inTitle = words.every((w) => title.includes(w) || context.includes(w));
    if (inTitle) {
      const exact = words.every((w) => title.includes(w));
      hits.push({ entry, score: (exact ? 100 : 40) + (title.startsWith(words[0]) ? 20 : 0) - title.length / 100 });
      continue;
    }
    const heading = entry.headings.find(([text]) => {
      const t = text.toLowerCase();
      return words.every((w) => t.includes(w) || title.includes(w));
    });
    if (heading) hits.push({ entry, heading, score: 20 - heading[0].length / 100 });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);
}

/** Site-wide search over every track, opened from the top bar or with Ctrl/⌘ + K. */
export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Load the index the first time search opens.
  useEffect(() => {
    if (!open || index) return;
    fetch("/search-index.json")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: SearchEntry[]) => setIndex(data))
      .catch(() => setFailed(true));
  }, [open, index]);

  useEffect(() => {
    if (open) {
      setSelected(0);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [open]);

  const hits = useMemo(() => (index ? search(index, query) : []), [index, query]);
  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  function go(hit: Hit) {
    setOpen(false);
    setQuery("");
    router.push(hit.heading ? `${hit.entry.href}#${hit.heading[1]}` : hit.entry.href);
  }

  function onInputKey(event: React.KeyboardEvent) {
    if (event.key === "Escape") setOpen(false);
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((i) => Math.min(i + 1, hits.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && hits[selected]) {
      event.preventDefault();
      go(hits[selected]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Search everything  Ctrl K"
        className="flex h-8 items-center gap-2 rounded border border-rule px-2 text-small text-inkMuted transition-colors duration-fast hover:border-ruleStrong hover:text-ink sm:px-2.5"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="sr-only sm:not-sr-only">Search</span>
        <kbd className="hidden rounded border border-rule px-1 font-mono text-micro text-inkFaint md:inline">Ctrl K</kbd>
      </button>

      {/* Portalled to <body>: the top bar's backdrop-blur would otherwise trap a fixed overlay inside the bar. */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh]"
            onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              className="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-md border border-ruleStrong bg-surface shadow-xl"
            >
              <div className="flex items-center gap-2 border-b border-rule px-3">
                <Search className="h-4 w-4 shrink-0 text-inkFaint" aria-hidden />
                <input
                  ref={input}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onInputKey}
                  placeholder="Search every track: topics, modules, headings…"
                  aria-label="Search"
                  className="h-12 flex-1 bg-transparent text-small text-ink placeholder:text-inkFaint focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close search"
                  className="text-inkFaint hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ul ref={list} className="flex-1 overflow-y-auto p-1.5">
                {failed && <li className="px-3 py-6 text-center text-small text-inkFaint">Search couldn&rsquo;t load.</li>}
                {!failed && !index && <li className="px-3 py-6 text-center text-small text-inkFaint">Loading…</li>}
                {index && query.trim() && hits.length === 0 && (
                  <li className="px-3 py-6 text-center text-small text-inkFaint">No results for “{query}”.</li>
                )}
                {index && !query.trim() && (
                  <li className="px-3 py-6 text-center text-small text-inkFaint">
                    {index.length} pages across system design, algorithms, DevOps, backend, FDE and languages.
                  </li>
                )}
                {hits.map((hit, i) => (
                  <li key={`${hit.entry.href}#${hit.heading?.[1] ?? ""}`} data-index={i}>
                    <button
                      type="button"
                      onClick={() => go(hit)}
                      onMouseMove={() => setSelected(i)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded px-3 py-2 text-left",
                        i === selected ? "bg-raised" : "",
                      )}
                    >
                      <span
                        className="mt-0.5 w-20 shrink-0 font-mono text-micro"
                        style={{ color: ACCENT[hit.entry.track] }}
                      >
                        {hit.entry.track}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-small text-ink">
                          {hit.heading ? hit.heading[0] : hit.entry.title}
                        </span>
                        <span className="block truncate text-tiny text-inkFaint">
                          {[hit.entry.parent, hit.heading ? hit.entry.title : hit.entry.summary].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      {i === selected && <CornerDownLeft className="mt-1 h-3.5 w-3.5 shrink-0 text-inkFaint" aria-hidden />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { getDocsInTrack, toMeta } from "@/lib/content";
import { withRelated } from "@/lib/related";
import { accentVar, docHref } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "Backend",
  description:
    "How the web works, Node.js, async JavaScript, Express, HTTP APIs, TypeScript, cookies, sessions, JWT, security, SQL and data modeling, indexing, NestJS, FastAPI, Go and Gin — one module per topic, in order.",
  alternates: { canonical: "/backend" },
};

const CATEGORY_ORDER = ["Foundations", "Node.js & APIs", "Auth & Security", "Databases", "Frameworks", "Architecture"];

export default function BackendIndex() {
  const docs = getDocsInTrack("backend").map(toMeta);
  // Modules that already live in another track sit in course order and link out to that page.
  const items = withRelated(docs).map((item, i) => ({ ...item, number: i + 1 }));
  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => (item.kind === "doc" ? item.doc.category : item.link.category) === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div style={accentVar("backend")}>
      <TopBar />

      <div className="mx-auto max-w-shell px-4 pb-24 pt-12 sm:px-8">
        <header className="max-w-reading">
          <p className="font-mono text-micro uppercase tracking-wider text-[color:var(--accent)]">
            Backend development
          </p>
          <h1 className="mt-3 text-h1 font-semibold text-ink sm:text-display">
            From the first HTTP request to a production API.
          </h1>
          <p className="mt-4 text-lead text-inkMuted">
            How the web works and Node.js first, then APIs, auth and databases, then the frameworks (NestJS, FastAPI,
            Gin) and the practices that keep a service healthy in production. Modules marked with ↗ already have a page
            in another track and open there.
          </p>
        </header>

        {byCategory.map(({ category, items: groupItems }) => (
          <section key={category} className="mt-14">
            <div className="mb-4 flex items-baseline justify-between border-b border-rule pb-2">
              <h2 className="text-small font-semibold text-ink">{category}</h2>
              <span className="font-mono text-micro text-inkFaint">{groupItems.length} in order</span>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {groupItems.map((item) =>
                item.kind === "doc" ? (
                  <li key={item.doc.slug}>
                    <Link
                      href={docHref(item.doc)}
                      className="group flex h-full flex-col rounded border border-rule bg-surface p-4 transition-colors duration-fast hover:border-[color:var(--accent)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-micro tabular-nums text-[color:var(--accent)]">
                          {String(item.number).padStart(2, "0")}
                        </span>
                        <span className="ml-auto flex items-center gap-1.5 font-mono text-micro text-inkFaint">
                          <Clock className="h-3 w-3" aria-hidden />
                          {item.doc.readingMinutes} min
                        </span>
                      </div>
                      <h3 className="mt-2 text-h3 font-semibold text-ink group-hover:text-[color:var(--accent)]">
                        {item.doc.title}
                      </h3>
                      <p className="mt-2 flex-1 text-small text-inkMuted">{item.doc.summary}</p>
                      <span className="mt-4 flex items-center gap-1.5 font-mono text-micro text-inkFaint group-hover:text-[color:var(--accent)]">
                        Open
                        <ArrowRight className="h-3 w-3" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ) : (
                  <li key={item.link.href}>
                    <Link
                      href={item.link.href}
                      style={{ "--accent": item.link.accent } as React.CSSProperties}
                      className="group flex h-full flex-col rounded border border-dashed border-rule bg-surface p-4 transition-colors duration-fast hover:border-[color:var(--accent)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-micro tabular-nums text-[color:var(--accent)]">
                          {String(item.number).padStart(2, "0")}
                        </span>
                        <span className="ml-auto font-mono text-micro text-[color:var(--accent)]">
                          in {item.link.track}
                        </span>
                      </div>
                      <h3 className="mt-2 text-h3 font-semibold text-ink group-hover:text-[color:var(--accent)]">
                        {item.link.title}
                      </h3>
                      <p className="mt-2 flex-1 text-small text-inkMuted">{item.link.covers}</p>
                      <span className="mt-4 flex items-center gap-1.5 font-mono text-micro text-inkFaint group-hover:text-[color:var(--accent)]">
                        Open in {item.link.track}
                        <ArrowUpRight className="h-3 w-3" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

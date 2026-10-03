import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import { getDocsInTrack, toMeta } from "@/lib/content";
import { accentVar, docHref } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Visual interview prep: every topic opens with its costs, the Python structures to reach for, a brute-force-vs-optimized comparison, the math it assumes, a step-through and practice challenges.",
  alternates: { canonical: "/learn" },
};

const CATEGORY_ORDER = ["Data structures", "Algorithms", "Concepts"];

export default function LearnIndex() {
  const docs = getDocsInTrack("learn").map(toMeta);
  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    docs: docs.filter((doc) => doc.category === category),
  })).filter((group) => group.docs.length > 0);

  return (
    <div style={accentVar("learn")}>
      <TopBar />

      <div className="mx-auto max-w-shell px-4 pb-24 pt-12 sm:px-8">
        <header className="max-w-reading">
          <p className="font-mono text-micro uppercase tracking-wider text-[color:var(--accent)]">
            Visual interview prep
          </p>
          <h1 className="mt-3 text-h1 font-semibold text-ink sm:text-display">
            Sixteen topics, each one a complete loop.
          </h1>
          <p className="mt-4 text-lead text-inkMuted">
            Every page runs the same circle: the costs and what they mean, the Python you would actually
            type, a brute force you name out loud and its optimized answer, the math the topic assumes,
            a step through the code, and challenges with progressive hints.
          </p>
        </header>

        {byCategory.map(({ category, docs: groupDocs }) => (
          <section key={category} className="mt-14">
            <div className="mb-4 flex items-baseline justify-between border-b border-rule pb-2">
              <h2 className="text-small font-semibold text-ink">{category}</h2>
              <span className="font-mono text-micro text-inkFaint">{groupDocs.length} in order</span>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {groupDocs.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={docHref(doc)}
                    className="group flex h-full flex-col rounded border border-rule bg-surface p-4 transition-colors duration-fast hover:border-[color:var(--accent)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-micro tabular-nums text-[color:var(--accent)]">
                        {String(doc.order).padStart(2, "0")}
                      </span>
                      {doc.level && (
                        <span className="rounded-full bg-raised px-2 py-0.5 font-mono text-micro uppercase tracking-wide text-inkMuted">
                          {doc.level}
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-1.5 font-mono text-micro text-inkFaint">
                        <Clock className="h-3 w-3" aria-hidden />
                        {doc.readingMinutes} min
                      </span>
                    </div>
                    <h3 className="mt-2 text-h3 font-semibold text-ink group-hover:text-[color:var(--accent)]">
                      {doc.title}
                    </h3>
                    <p className="mt-2 flex-1 text-small text-inkMuted">{doc.summary}</p>
                    <span className="mt-4 flex items-center gap-1.5 font-mono text-micro text-inkFaint group-hover:text-[color:var(--accent)]">
                      Open
                      <ArrowRight className="h-3 w-3" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

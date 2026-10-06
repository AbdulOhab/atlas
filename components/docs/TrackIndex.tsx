import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { trackSequence, type HostTrack } from "@/lib/trackDocs";
import { accentVar } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";

interface TrackIndexProps {
  host: HostTrack;
  kicker: string;
  title: string;
  lead: string;
}

/** The index of a course-ordered track: its modules in order, with topic counts. */
export function TrackIndex({ host, kicker, title, lead }: TrackIndexProps) {
  const docs = trackSequence(host);

  return (
    <div style={accentVar(host)}>
      <TopBar />

      <div className="mx-auto max-w-shell px-4 pb-24 pt-12 sm:px-8">
        <header className="max-w-reading">
          <p className="font-mono text-micro uppercase tracking-wider text-[color:var(--accent)]">{kicker}</p>
          <h1 className="mt-3 text-h1 font-semibold text-ink sm:text-display">{title}</h1>
          <p className="mt-4 text-lead text-inkMuted">{lead}</p>
        </header>

        <section className="mt-14">
          <div className="mb-4 flex items-baseline justify-between border-b border-rule pb-2">
            <h2 className="text-small font-semibold text-ink">Modules</h2>
            <span className="font-mono text-micro text-inkFaint">{docs.length} in order</span>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {docs.map((doc, i) => (
              <li key={doc.slug}>
                <Link
                  href={`/${host}/${doc.slug}`}
                  className="group flex h-full flex-col rounded border border-rule bg-surface p-4 transition-colors duration-fast hover:border-[color:var(--accent)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-micro tabular-nums text-[color:var(--accent)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 font-mono text-micro text-inkFaint">
                      <Clock className="h-3 w-3" aria-hidden />
                      {doc.readingMinutes} min
                    </span>
                  </div>
                  <h3 className="mt-2 text-h3 font-semibold text-ink group-hover:text-[color:var(--accent)]">
                    {doc.title}
                  </h3>
                  <p className="mt-2 flex-1 text-small text-inkMuted">{doc.summary}</p>
                  {doc.parts && <p className="mt-3 font-mono text-micro text-inkFaint">{doc.parts.length} topics</p>}
                  <span className="mt-4 flex items-center gap-1.5 font-mono text-micro text-inkFaint group-hover:text-[color:var(--accent)]">
                    Open
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

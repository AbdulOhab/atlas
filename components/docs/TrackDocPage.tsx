import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { buildToc, designToc, getAllMeta, techToc, toMeta } from "@/lib/content";
import { originalHref } from "@/lib/related";
import { resolveTrackPage, trackSiblings, type HostTrack } from "@/lib/trackDocs";
import { splitTabs } from "@/lib/tabs";
import { accentVar } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";
import { DocHeader } from "./DocHeader";
import { Markdown } from "./Markdown";
import { ContentTabs } from "./ContentTabs";
import { DesignDeepDives, DesignOverview } from "./DesignPanels";
import { TechOverview } from "./TechPanels";
import { DocTitlesProvider } from "./diagram/DocTitles";
import { PrevNext } from "./PrevNext";
import { Toc } from "./Toc";
import { ReadingProgress } from "./ReadingProgress";

const TRACK_NAME: Record<string, string> = { devops: "DevOps", sysdesign: "System Design" };

/**
 * A page of a course-ordered track (devops, backend, fde, languages). Shared modules
 * render their original content under the host route, and long docs render
 * as a parent page (main text plus a list of child pages) and child pages
 * at /host/slug/part, so the sidebar and prev/next never leave the track.
 */
export function TrackDocPage({ host, slug, part: partSlug }: { host: HostTrack; slug: string; part?: string }) {
  const { doc, link, split, part } = resolveTrackPage(host, slug, partSlug)!;
  const base = `/${host}/${slug}`;

  const body = part ? part.content : split ? split.lead : doc.content;
  const showPanels = !part;
  const panels =
    showPanels && doc.design ? designToc(doc.design) : showPanels && doc.tech ? techToc(doc.tech) : { opening: [], closing: [] };
  const toc = [...panels.opening, ...buildToc(body), ...panels.closing];
  const { prev, next } = trackSiblings(host, slug, partSlug);
  const titles = Object.fromEntries(getAllMeta().map((meta) => [meta.slug, meta.title]));
  const title = link ? link.title : doc.title;
  const progressSlug = part ? `${slug}/${part.slug}` : slug;

  // Module topic words aren't system design tags; keep the tag registry out of it.
  // Progress is tracked under the host path, so a page completes in this track.
  const meta = part
    ? { ...toMeta(doc), slug: progressSlug, title: part.title, summary: `Part of ${title}.`, readingMinutes: part.readingMinutes, tags: [] }
    : { ...toMeta(doc), slug, title, tags: [] };

  return (
    <div style={accentVar(host)}>
      <TopBar crumb={part ? `${title} / ${part.title}` : title} />

      <div className="mx-auto flex max-w-shell gap-12 px-4 pb-24 pt-10 sm:px-8">
        <main id="doc-main" className="min-w-0 flex-1">
          {part && (
            <Link
              href={base}
              className="mb-4 inline-flex items-center gap-1 font-mono text-micro text-inkFaint hover:text-[color:var(--accent)]"
            >
              ← {title}
            </Link>
          )}
          {link && !part && (
            <p className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 rounded border border-dashed border-rule px-3 py-2 text-small text-inkMuted">
              <span>
                {link.covers}. This module is shared with the {TRACK_NAME[link.track]} track.
              </span>
              <Link
                href={originalHref(link)}
                className="ml-auto inline-flex items-center gap-1 font-mono text-micro hover:text-ink"
                style={{ color: link.accent }}
              >
                Open in {link.track}
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </Link>
            </p>
          )}
          <DocHeader doc={meta} showHardPart={!doc.design && !part} />
          <DocTitlesProvider titles={titles}>
            <article className="doc doc-wide">
              {showPanels && doc.design && <DesignOverview design={doc.design} />}
              {showPanels && doc.tech && <TechOverview tech={doc.tech} />}
              {splitTabs(body).map((segment, i) =>
                segment.kind === "tabs" ? (
                  <ContentTabs key={i} tabs={segment.tabs} />
                ) : (
                  <Markdown key={i} content={segment.content} />
                ),
              )}
              {showPanels && doc.design && <DesignDeepDives design={doc.design} />}
            </article>
          </DocTitlesProvider>

          {split && !part && (
            <section className="mt-12">
              <h2 className="mb-4 border-b border-rule pb-2 text-small font-semibold text-ink">
                In this module · {split.parts.length} pages
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {split.parts.map((child, i) => (
                  <li key={child.slug}>
                    <Link
                      href={`${base}/${child.slug}`}
                      className="group flex h-full flex-col rounded border border-rule bg-surface p-4 transition-colors duration-fast hover:border-[color:var(--accent)]"
                    >
                      <span className="flex items-center gap-2 font-mono text-micro text-inkFaint">
                        <span className="tabular-nums text-[color:var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
                        <span className="ml-auto flex items-center gap-1.5">
                          <Clock className="h-3 w-3" aria-hidden />
                          {child.readingMinutes} min
                        </span>
                      </span>
                      <span className="mt-2 flex-1 text-small font-semibold text-ink group-hover:text-[color:var(--accent)]">
                        {child.title}
                      </span>
                      <span className="mt-3 flex items-center gap-1.5 font-mono text-micro text-inkFaint group-hover:text-[color:var(--accent)]">
                        Open
                        <ArrowRight className="h-3 w-3" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <PrevNext prev={prev} next={next} />
        </main>

        <div className="hidden w-toc shrink-0 xl:block">
          <div className="sticky top-20 space-y-8">
            <ReadingProgress targetId="doc-main" slug={progressSlug} />
            <Toc entries={toc} />
          </div>
        </div>
      </div>
    </div>
  );
}

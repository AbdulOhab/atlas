import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buildToc, designToc, getAllMeta, techToc, toMeta } from "@/lib/content";
import { originalHref } from "@/lib/related";
import { resolveTrackDoc, trackSiblings, type HostTrack } from "@/lib/trackDocs";
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

const TRACK_NAME = { devops: "DevOps", sysdesign: "System Design" } as const;

/**
 * A page of a course-ordered track (backend, fde). Borrowed modules render
 * their original content here, under the host route, so the sidebar and
 * prev/next never leave the track.
 */
export function TrackDocPage({ host, slug }: { host: HostTrack; slug: string }) {
  const found = resolveTrackDoc(host, slug)!;
  const { doc, link } = found;

  const panels = doc.design ? designToc(doc.design) : doc.tech ? techToc(doc.tech) : { opening: [], closing: [] };
  const toc = [...panels.opening, ...buildToc(doc.content), ...panels.closing];
  const { prev, next } = trackSiblings(host, slug);
  const titles = Object.fromEntries(getAllMeta().map((meta) => [meta.slug, meta.title]));
  // Module topic words aren't system design tags; keep the tag registry out of it.
  // Progress is tracked under the host slug, so a borrowed module completes in this track.
  const meta = { ...toMeta(doc), slug, tags: [] };

  return (
    <div style={accentVar(host)}>
      <TopBar crumb={link ? link.title : doc.title} />

      <div className="mx-auto flex max-w-shell gap-12 px-4 pb-24 pt-10 sm:px-8">
        <main id="doc-main" className="min-w-0 flex-1">
          {link && (
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
          <DocHeader doc={meta} showHardPart={!doc.design} />
          <DocTitlesProvider titles={titles}>
            <article className="doc doc-wide">
              {doc.design && <DesignOverview design={doc.design} />}
              {doc.tech && <TechOverview tech={doc.tech} />}
              {splitTabs(doc.content).map((segment, i) =>
                segment.kind === "tabs" ? (
                  <ContentTabs key={i} tabs={segment.tabs} />
                ) : (
                  <Markdown key={i} content={segment.content} />
                ),
              )}
              {doc.design && <DesignDeepDives design={doc.design} />}
            </article>
          </DocTitlesProvider>
          <PrevNext prev={prev} next={next} />
        </main>

        <div className="hidden w-toc shrink-0 xl:block">
          <div className="sticky top-20 space-y-8">
            <ReadingProgress targetId="doc-main" slug={slug} />
            <Toc entries={toc} />
          </div>
        </div>
      </div>
    </div>
  );
}

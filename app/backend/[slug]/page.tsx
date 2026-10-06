import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildToc, getDoc, getDocsInTrack, getSiblings, toMeta } from "@/lib/content";
import { splitTabs } from "@/lib/tabs";
import { accentVar } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";
import { DocHeader } from "@/components/docs/DocHeader";
import { Markdown } from "@/components/docs/Markdown";
import { ContentTabs } from "@/components/docs/ContentTabs";
import { PrevNext } from "@/components/docs/PrevNext";
import { Toc } from "@/components/docs/Toc";
import { ReadingProgress } from "@/components/docs/ReadingProgress";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getDocsInTrack("backend").map((doc) => ({ slug: doc.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const doc = getDoc(params.slug, "backend");
  if (!doc) return { title: "Not found" };
  return {
    title: doc.title,
    description: doc.summary,
    openGraph: {
      type: "article",
      title: doc.title,
      description: doc.summary,
      url: `/backend/${doc.slug}`,
    },
    twitter: { card: "summary_large_image", title: doc.title, description: doc.summary },
    alternates: { canonical: `/backend/${doc.slug}` },
  };
}

export default function BackendPage({ params }: PageProps) {
  const doc = getDoc(params.slug, "backend");
  if (!doc) notFound();

  const toc = buildToc(doc.content);
  const { prev, next } = getSiblings(doc.slug, "backend");

  // Backend tags are module topic words, not entries in the system design tag
  // registry, which would warn on them and link them into the wrong library.
  const meta = { ...toMeta(doc), tags: [] };

  return (
    <div style={accentVar(doc.group)}>
      <TopBar crumb={doc.title} />

      <div className="mx-auto flex max-w-shell gap-12 px-4 pb-24 pt-10 sm:px-8">
        <main id="doc-main" className="min-w-0 flex-1">
          <DocHeader doc={meta} />
          <article className="doc doc-wide">
            {splitTabs(doc.content).map((segment, i) =>
              segment.kind === "tabs" ? (
                <ContentTabs key={i} tabs={segment.tabs} />
              ) : (
                <Markdown key={i} content={segment.content} />
              ),
            )}
          </article>
          <PrevNext prev={prev} next={next} />
        </main>

        <div className="hidden w-toc shrink-0 xl:block">
          <div className="sticky top-20 space-y-8">
            <ReadingProgress targetId="doc-main" slug={doc.slug} />
            <Toc entries={toc} />
          </div>
        </div>
      </div>
    </div>
  );
}

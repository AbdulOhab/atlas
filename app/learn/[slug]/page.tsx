import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildToc, getDoc, getDocsInTrack, getSiblings, learnToc, LEARN_TITLES, slugifyHeading, toMeta } from "@/lib/content";
import { accentVar } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";
import { DocHeader } from "@/components/docs/DocHeader";
import { Markdown } from "@/components/docs/Markdown";
import {
  LearnBrutePanel,
  LearnChallengesPanel,
  LearnMathPanel,
  LearnOverview,
  LearnStructures,
  LearnWalkthroughPanel,
} from "@/components/docs/LearnPanels";
import { PrevNext } from "@/components/docs/PrevNext";
import { Toc } from "@/components/docs/Toc";
import { ReadingProgress } from "@/components/docs/ReadingProgress";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getDocsInTrack("learn").map((doc) => ({ slug: doc.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const doc = getDoc(params.slug, "learn");
  if (!doc) return { title: "Not found" };
  return {
    title: doc.title,
    description: doc.summary,
    openGraph: {
      type: "article",
      title: doc.title,
      description: doc.summary,
      url: `/learn/${doc.slug}`,
    },
    twitter: { card: "summary_large_image", title: doc.title, description: doc.summary },
    alternates: { canonical: `/learn/${doc.slug}` },
  };
}

export default function LearnPage({ params }: PageProps) {
  const doc = getDoc(params.slug, "learn");
  if (!doc) notFound();

  const learn = doc.learn;
  const panels = learn ? learnToc(learn) : { opening: [], closing: [] };
  const toc = [...panels.opening, ...buildToc(doc.content), ...panels.closing];
  const { prev, next } = getSiblings(doc.slug, "learn");

  // Learn tags are topic words from the source site, not entries in the system
  // design tag registry, which would warn on them and link them into the wrong
  // library.
  const meta = { ...toMeta(doc), tags: [] };

  return (
    <div style={accentVar(doc.group)}>
      <TopBar crumb={doc.title} />

      <div className="mx-auto flex max-w-shell gap-12 px-4 pb-24 pt-10 sm:px-8">
        <main id="doc-main" className="min-w-0 flex-1">
          <DocHeader doc={meta} />
          <article className="doc doc-wide">
            {learn && <LearnOverview learn={learn} />}
            {learn && learn.structures.length > 0 && <LearnStructures structures={learn.structures} />}
            <Markdown content={doc.content} />
            {learn?.brute && <LearnBrutePanel brute={learn.brute} />}
            {learn?.walkthrough && (
              <>
                <h2 id={slugifyHeading(LEARN_TITLES.walkthrough)}>{LEARN_TITLES.walkthrough}</h2>
                <LearnWalkthroughPanel walkthrough={learn.walkthrough} />
              </>
            )}
            {learn && learn.math.length > 0 && (
              <>
                <h2 id={slugifyHeading(LEARN_TITLES.math)}>{LEARN_TITLES.math}</h2>
                <LearnMathPanel concepts={learn.math} />
              </>
            )}
            {learn && learn.challenges.length > 0 && (
              <>
                <h2 id={slugifyHeading(LEARN_TITLES.challenges)}>{LEARN_TITLES.challenges}</h2>
                <LearnChallengesPanel challenges={learn.challenges} />
              </>
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

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { originalHref } from "@/lib/related";
import { resolveTrackPage, trackSlugs } from "@/lib/trackDocs";
import { TrackDocPage } from "@/components/docs/TrackDocPage";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return trackSlugs("craft");
}

export function generateMetadata({ params }: PageProps): Metadata {
  const found = resolveTrackPage("craft", params.slug);
  if (!found) return { title: "Not found" };
  const { doc, link } = found;
  const title = link ? link.title : doc.title;
  return {
    title,
    description: doc.summary,
    openGraph: { type: "article", title, description: doc.summary, url: `/craft/${params.slug}` },
    twitter: { card: "summary_large_image", title, description: doc.summary },
    // A shared module's canonical page is the original one.
    alternates: { canonical: link ? originalHref(link) : `/craft/${params.slug}` },
  };
}

export default function Page({ params }: PageProps) {
  if (!resolveTrackPage("craft", params.slug)) notFound();
  return <TrackDocPage host="craft" slug={params.slug} />;
}

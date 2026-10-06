import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { originalHref } from "@/lib/related";
import { resolveTrackDoc, trackSlugs } from "@/lib/trackDocs";
import { TrackDocPage } from "@/components/docs/TrackDocPage";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return trackSlugs("fde");
}

export function generateMetadata({ params }: PageProps): Metadata {
  const found = resolveTrackDoc("fde", params.slug);
  if (!found) return { title: "Not found" };
  const { doc, link } = found;
  const title = link ? link.title : doc.title;
  return {
    title,
    description: doc.summary,
    openGraph: { type: "article", title, description: doc.summary, url: `/fde/${params.slug}` },
    twitter: { card: "summary_large_image", title, description: doc.summary },
    // A borrowed module's canonical page is the original one.
    alternates: { canonical: link ? originalHref(link) : `/fde/${params.slug}` },
  };
}

export default function Page({ params }: PageProps) {
  if (!resolveTrackDoc("fde", params.slug)) notFound();
  return <TrackDocPage host="fde" slug={params.slug} />;
}

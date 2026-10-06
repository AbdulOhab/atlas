import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveTrackPage, trackPartParams } from "@/lib/trackDocs";
import { TrackDocPage } from "@/components/docs/TrackDocPage";

interface PageProps {
  params: { slug: string; part: string };
}

/** Child pages of long modules: labs, reference sections and per-source parts. */
export function generateStaticParams() {
  return trackPartParams("security");
}

export function generateMetadata({ params }: PageProps): Metadata {
  const found = resolveTrackPage("security", params.slug, params.part);
  if (!found?.part) return { title: "Not found" };
  const parent = found.link ? found.link.title : found.doc.title;
  const title = `${found.part.title} · ${parent}`;
  const url = `/security/${params.slug}/${params.part}`;
  return {
    title,
    description: found.doc.summary,
    openGraph: { type: "article", title, description: found.doc.summary, url },
    twitter: { card: "summary_large_image", title, description: found.doc.summary },
    alternates: { canonical: url },
  };
}

export default function Page({ params }: PageProps) {
  if (!resolveTrackPage("security", params.slug, params.part)) notFound();
  return <TrackDocPage host="security" slug={params.slug} part={params.part} />;
}

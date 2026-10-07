import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveTrackPage, trackPartParams } from "@/lib/trackDocs";
import { TrackDocPage } from "@/components/docs/TrackDocPage";

interface PageProps {
  params: { slug: string; part: string };
}

/** Child pages of long modules: one page per topic. */
export function generateStaticParams() {
  return trackPartParams("uidesign");
}

export function generateMetadata({ params }: PageProps): Metadata {
  const found = resolveTrackPage("uidesign", params.slug, params.part);
  if (!found?.part) return { title: "Not found" };
  const parent = found.link ? found.link.title : found.doc.title;
  const title = `${found.part.title} · ${parent}`;
  const url = `/uidesign/${params.slug}/${params.part}`;
  return {
    title,
    description: found.doc.summary,
    openGraph: { type: "article", title, description: found.doc.summary, url },
    twitter: { card: "summary_large_image", title, description: found.doc.summary },
    alternates: { canonical: url },
  };
}

export default function Page({ params }: PageProps) {
  if (!resolveTrackPage("uidesign", params.slug, params.part)) notFound();
  return <TrackDocPage host="uidesign" slug={params.slug} part={params.part} />;
}

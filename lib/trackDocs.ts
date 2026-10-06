import { getDoc, getDocSplit, getDocsInTrack, toMeta } from "@/lib/content";
import { RELATED, withRelated, type RelatedLink } from "@/lib/related";
import type { Doc, DocMeta } from "@/lib/types";
import type { SplitDoc } from "@/lib/parts";

/** Tracks served by the course-ordered page: own docs, shared modules and child pages. */
export type HostTrack = keyof typeof RELATED;

/** A shared module dressed as a doc of the host track, so links and progress stay on the host route. */
function linkMeta(link: RelatedLink, host: HostTrack): DocMeta {
  const source = getDoc(link.source.slug, link.source.track);
  return {
    slug: link.slug,
    group: host,
    order: 0,
    title: link.title,
    summary: link.covers,
    tags: [],
    readingMinutes: source?.readingMinutes ?? 0,
    parts: source ? toMeta(source).parts : undefined,
    sharedFrom: link.track,
  };
}

/** The host track's list in course order: its own docs plus shared modules. */
export function trackSequence(host: HostTrack): DocMeta[] {
  const docs = getDocsInTrack(host).map(toMeta);
  return withRelated(docs, RELATED[host]).map((item) => (item.kind === "doc" ? item.doc : linkMeta(item.link, host)));
}

export function trackSlugs(host: HostTrack) {
  return trackSequence(host).map((doc) => ({ slug: doc.slug }));
}

export function trackPartParams(host: HostTrack) {
  return trackSequence(host).flatMap((doc) => (doc.parts ?? []).map((part) => ({ slug: doc.slug, part: part.slug })));
}

export interface TrackPage {
  doc: Doc;
  link?: RelatedLink;
  split: SplitDoc | null;
  /** The child page being shown, when the URL names one. */
  part?: SplitDoc["parts"][number];
}

/** What to render at /host/slug or /host/slug/part, or undefined for a 404. */
export function resolveTrackPage(host: HostTrack, slug: string, partSlug?: string): TrackPage | undefined {
  const link = RELATED[host].find((l) => l.slug === slug);
  const doc = getDoc(slug, host) ?? (link ? getDoc(link.source.slug, link.source.track) : undefined);
  if (!doc) return undefined;
  const split = getDocSplit(doc);
  if (!partSlug) return { doc, link: getDoc(slug, host) ? undefined : link, split };
  const part = split?.parts.find((p) => p.slug === partSlug);
  return part ? { doc, link: getDoc(slug, host) ? undefined : link, split, part } : undefined;
}

/** Previous and next across the track: each parent, then its child pages, then the next doc. */
export function trackSiblings(host: HostTrack, slug: string, partSlug?: string): { prev?: DocMeta; next?: DocMeta } {
  const pages = trackSequence(host).flatMap((doc) => [
    doc,
    ...(doc.parts ?? []).map(
      (part): DocMeta => ({ ...doc, slug: `${doc.slug}/${part.slug}`, title: part.title, parts: undefined }),
    ),
  ]);
  const key = partSlug ? `${slug}/${partSlug}` : slug;
  const i = pages.findIndex((page) => page.slug === key);
  return i < 0 ? {} : { prev: pages[i - 1], next: pages[i + 1] };
}

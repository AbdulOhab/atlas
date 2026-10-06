import { getDoc, getDocsInTrack, toMeta } from "@/lib/content";
import { RELATED, withRelated, type RelatedLink } from "@/lib/related";
import type { Doc, DocMeta } from "@/lib/types";

/** Tracks whose lists include modules borrowed from other tracks. */
export type HostTrack = keyof typeof RELATED;

/** A borrowed module dressed as a doc of the host track, so links and progress stay on the host route. */
export function linkMeta(link: RelatedLink, host: HostTrack): DocMeta {
  return { slug: link.slug, group: host, order: 0, title: link.title, summary: link.covers, tags: [], readingMinutes: 0 };
}

/** The host track's full list in course order: its own docs plus borrowed modules. */
export function trackSequence(host: HostTrack): DocMeta[] {
  const docs = getDocsInTrack(host).map(toMeta);
  return withRelated(docs, RELATED[host]).map((item) => (item.kind === "doc" ? item.doc : linkMeta(item.link, host)));
}

/** Every slug the host route serves. */
export function trackSlugs(host: HostTrack) {
  return trackSequence(host).map((doc) => ({ slug: doc.slug }));
}

/** The doc to render at /host/slug: the host's own, or the borrowed one with its link. */
export function resolveTrackDoc(host: HostTrack, slug: string): { doc: Doc; link?: RelatedLink } | undefined {
  const own = getDoc(slug, host);
  if (own) return { doc: own };
  const link = RELATED[host].find((l) => l.slug === slug);
  const doc = link && getDoc(link.source.slug, link.source.track);
  return link && doc ? { doc, link } : undefined;
}

/** Previous and next in the host's course order, borrowed modules included. */
export function trackSiblings(host: HostTrack, slug: string): { prev?: DocMeta; next?: DocMeta } {
  const seq = trackSequence(host);
  const i = seq.findIndex((doc) => doc.slug === slug);
  return i < 0 ? {} : { prev: seq[i - 1], next: seq[i + 1] };
}

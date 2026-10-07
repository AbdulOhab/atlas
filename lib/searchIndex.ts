import { buildToc, getAllDocs, getDocSplit } from "@/lib/content";
import { trackSequence, type HostTrack } from "@/lib/trackDocs";
import { docHref } from "@/lib/utils";
import type { DocGroup } from "@/lib/types";

/** One searchable page: titles, summary and headings, not the full text, to keep the index small. */
export interface SearchEntry {
  title: string;
  href: string;
  /** Track label shown on the result, e.g. "devops". */
  track: string;
  /** Parent module, for child pages. */
  parent?: string;
  summary?: string;
  /** [heading text, anchor id] pairs. */
  headings: [string, string][];
}

const TRACK_OF: Record<DocGroup, string> = {
  concept: "sysdesign",
  tech: "sysdesign",
  design: "sysdesign",
  coding: "algorithms",
  learn: "algorithms",
  devops: "devops",
  backend: "backend",
  fde: "fde",
  languages: "languages",
  security: "security",
  interview: "algorithms",
  ai: "ai",
  uidesign: "uidesign",
  craft: "craft",
};

const headings = (content: string): [string, string][] => buildToc(content).map((e) => [e.text, e.id]);

const HOSTS: HostTrack[] = ["devops", "backend", "fde", "languages", "security", "interview", "ai", "uidesign", "craft"];

export function buildSearchIndex(): SearchEntry[] {
  const docs = getAllDocs();
  const entries: SearchEntry[] = [];

  // System design and algorithms pages live at one route each.
  for (const doc of docs) {
    if ((HOSTS as string[]).includes(doc.group)) continue;
    entries.push({
      title: doc.title,
      href: docHref(doc),
      track: TRACK_OF[doc.group],
      summary: doc.summary,
      headings: headings(doc.content),
    });
  }

  // Course-ordered tracks: each module, then its child pages. Shared modules are
  // indexed once, where they live, so results don't repeat.
  for (const host of HOSTS) {
    for (const meta of trackSequence(host)) {
      if (meta.sharedFrom) continue;
      const doc = docs.find((d) => d.group === host && d.slug === meta.slug);
      if (!doc) continue;
      const split = getDocSplit(doc);
      const base = `/${host}/${doc.slug}`;
      entries.push({
        title: doc.title,
        href: base,
        track: host,
        summary: doc.summary,
        headings: headings(split ? split.lead : doc.content),
      });
      for (const part of split?.parts ?? []) {
        entries.push({
          title: part.title,
          href: `${base}/${part.slug}`,
          track: host,
          parent: doc.title,
          headings: headings(part.content),
        });
      }
    }
  }
  return entries;
}

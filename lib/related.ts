import type { ContentTrack } from "@/lib/types";

/**
 * Outline modules a track would otherwise repeat: they already have a page in
 * another track. The track lists them in course order under its own route
 * (e.g. /backend/git), rendering the original page in place so the reader
 * never leaves the track or its sidebar.
 */
export interface RelatedLink {
  title: string;
  /** Slug under the host track's route, e.g. "git" for /backend/git. */
  slug: string;
  /** Where the content actually lives. */
  source: { track: ContentTrack; slug: string };
  /** The source track, shown as a small label. */
  track: "devops" | "sysdesign";
  accent: string;
  /** Which outline module(s) it stands in for. */
  covers: string;
  /** Doc slug it follows in the list. */
  after: string;
  /** Category on the track's index page. */
  category: string;
}

/** The original page, for a "read it in its own track" link. */
export function originalHref(link: RelatedLink) {
  return link.source.track === "sysdesign" ? `/docs/${link.source.slug}` : `/${link.source.track}/${link.source.slug}`;
}

export const BACKEND_ELSEWHERE: RelatedLink[] = [
  {
    title: "APIs and Communication",
    slug: "apis-and-communication",
    source: { track: "sysdesign", slug: "07-apis-and-communication" },
    track: "sysdesign",
    accent: "var(--concept)",
    covers: "Module 3: API design patterns",
    after: "backend-architecture",
    category: "Foundations",
  },
  {
    title: "Linux",
    slug: "linux",
    source: { track: "devops", slug: "linux" },
    track: "devops",
    accent: "var(--devops)",
    covers: "Linux, from the course's technology list",
    after: "backend-architecture",
    category: "Foundations",
  },
  {
    title: "PostgreSQL",
    slug: "postgresql",
    source: { track: "sysdesign", slug: "01-postgres" },
    track: "sysdesign",
    accent: "var(--tech)",
    covers: "Modules 15-21: Postgres in production",
    after: "sql",
    category: "Databases",
  },
  {
    title: "Caching",
    slug: "caching",
    source: { track: "sysdesign", slug: "04-caching" },
    track: "sysdesign",
    accent: "var(--concept)",
    covers: "Module 20: caching for performance",
    after: "indexing-and-performance",
    category: "Databases",
  },
  {
    title: "Redis",
    slug: "redis",
    source: { track: "sysdesign", slug: "02-redis" },
    track: "sysdesign",
    accent: "var(--tech)",
    covers: "Module 28: caching and in-memory data",
    after: "indexing-and-performance",
    category: "Databases",
  },
  {
    title: "Git & GitHub",
    slug: "git",
    source: { track: "devops", slug: "git" },
    track: "devops",
    accent: "var(--devops)",
    covers: "Module 24: Git and GitHub Fundamentals",
    after: "database-integration",
    category: "Frameworks",
  },
  {
    title: "CI/CD",
    slug: "ci-cd",
    source: { track: "devops", slug: "ci-cd" },
    track: "devops",
    accent: "var(--devops)",
    covers: "CI/CD, from the course's technology list",
    after: "node-best-practices",
    category: "Architecture",
  },
];


/** Docs in order, with each linked-out module placed after the doc it follows. */
export function withRelated<T extends { slug: string }>(
  docs: T[],
  links: RelatedLink[],
): ({ kind: "doc"; doc: T } | { kind: "link"; link: RelatedLink })[] {
  return docs.flatMap((doc) => [
    { kind: "doc" as const, doc },
    ...links.filter((link) => link.after === doc.slug).map((link) => ({ kind: "link" as const, link })),
  ]);
}

export const FDE_ELSEWHERE: RelatedLink[] = [
  {
    title: "Infrastructure Provisioning",
    slug: "infrastructure-provisioning",
    source: { track: "devops", slug: "terraform" },
    track: "devops",
    accent: "var(--devops)",
    covers: "Milestone 4, module 1: provisioning infrastructure as code with Terraform",
    after: "capstone-agentic-sre-platform",
    category: "Platform Engineering",
  },
];

/** Linked-out modules per track that lists them. */
export const RELATED: Record<"devops" | "backend" | "fde" | "languages", RelatedLink[]> = {
  devops: [],
  backend: BACKEND_ELSEWHERE,
  fde: FDE_ELSEWHERE,
  languages: [],
};

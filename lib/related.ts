/**
 * Outline modules the backend track would otherwise repeat: they already have
 * a page in another track, so the backend list includes them in course order
 * and links out to that page instead of duplicating the content.
 */
export interface RelatedLink {
  title: string;
  href: string;
  /** The track the page lives in, shown as a small label. */
  track: "devops" | "sysdesign";
  accent: string;
  /** Which outline module(s) it stands in for. */
  covers: string;
  /** Backend doc slug it follows in the list. */
  after: string;
  /** Category on the /backend index. */
  category: string;
}

export const BACKEND_ELSEWHERE: RelatedLink[] = [
  {
    title: "APIs and Communication",
    href: "/docs/07-apis-and-communication",
    track: "sysdesign",
    accent: "var(--concept)",
    covers: "Module 3: API design patterns",
    after: "backend-architecture",
    category: "Foundations",
  },
  {
    title: "Linux",
    href: "/devops/linux",
    track: "devops",
    accent: "var(--devops)",
    covers: "Linux, from the course's technology list",
    after: "backend-architecture",
    category: "Foundations",
  },
  {
    title: "PostgreSQL",
    href: "/docs/01-postgres",
    track: "sysdesign",
    accent: "var(--tech)",
    covers: "Modules 15-21: Postgres in production",
    after: "sql",
    category: "Databases",
  },
  {
    title: "Caching",
    href: "/docs/04-caching",
    track: "sysdesign",
    accent: "var(--concept)",
    covers: "Module 20: caching for performance",
    after: "indexing-and-performance",
    category: "Databases",
  },
  {
    title: "Redis",
    href: "/docs/02-redis",
    track: "sysdesign",
    accent: "var(--tech)",
    covers: "Module 28: caching and in-memory data",
    after: "indexing-and-performance",
    category: "Databases",
  },
  {
    title: "Git & GitHub",
    href: "/devops/git",
    track: "devops",
    accent: "var(--devops)",
    covers: "Module 24: Git and GitHub Fundamentals",
    after: "database-integration",
    category: "Frameworks",
  },
  {
    title: "CI/CD",
    href: "/devops/ci-cd",
    track: "devops",
    accent: "var(--devops)",
    covers: "CI/CD, from the course's technology list",
    after: "node-best-practices",
    category: "Architecture",
  },
];


/** Backend docs in order, with each linked-out module placed after the doc it follows. */
export function withRelated<T extends { slug: string }>(docs: T[]): ({ kind: "doc"; doc: T } | { kind: "link"; link: RelatedLink })[] {
  return docs.flatMap((doc) => [
    { kind: "doc" as const, doc },
    ...BACKEND_ELSEWHERE.filter((link) => link.after === doc.slug).map((link) => ({ kind: "link" as const, link })),
  ]);
}

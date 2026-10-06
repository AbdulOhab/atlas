import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { LEARN_TITLES, slugifyHeading } from "./headings";
import { parseScript } from "./script";
import type {
  CodingDetails,
  ComplexityRow,
  DesignDetails,
  DesignTradeoff,
  Doc,
  DocGroup,
  DocMeta,
  FollowUp,
  InterviewScript,
  LearnChallenge,
  LearnDetails,
  LearnMathConcept,
  LearnStructure,
  LearnWalkthrough,
  TechDetails,
  TechFact,
  TocEntry,
  ContentTrack,
} from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const GROUP_DIR: Record<DocGroup, string> = {
  concept: "concepts",
  design: "designs",
  tech: "tech",
  coding: "coding",
  learn: "learn",
  devops: "devops",
};

/**
 * Reading order of the groups: the ideas, then the tools, then the problems.
 * Coding, learn and devops sit last because they are separate tracks with
 * their own routes, not steps in the system design sequence.
 */
const GROUP_ORDER: DocGroup[] = ["concept", "tech", "design", "coding", "learn", "devops"];

const WORDS_PER_MINUTE = 200;

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

/** A list of objects, keeping only entries `pick` can turn into a complete record. */
function records<T>(value: unknown, pick: (item: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const picked = item && typeof item === "object" ? pick(item as Record<string, unknown>) : null;
    return picked ? [picked] : [];
  });
}

/**
 * Design docs keep their opening sections (concepts, hard part, requirements,
 * scale) in frontmatter. Missing pieces are reported rather than silently
 * rendering an empty panel.
 */
function readDesign(slug: string, data: Record<string, unknown>): DesignDetails | undefined {
  const requirements = (data.requirements ?? {}) as Record<string, unknown>;
  const scale = (data.scale ?? {}) as Record<string, unknown>;

  const design: DesignDetails = {
    hardPart: String(data.hardPartDetail ?? data.hardPart ?? ""),
    concepts: strings(data.concepts),
    requirements: {
      functional: strings(requirements.functional),
      nonFunctional: strings(requirements.nonFunctional),
      outOfScope: strings(requirements.outOfScope),
    },
    scale: scale.numbers
      ? {
          numbers: String(scale.numbers).replace(/\n+$/, ""),
          conclusion: scale.conclusion ? String(scale.conclusion) : undefined,
        }
      : undefined,
    tradeoffs: records<DesignTradeoff>(data.tradeoffs, (item) =>
      item.title && item.body ? { title: String(item.title), body: String(item.body) } : null,
    ),
    followUps: records<FollowUp>(data.followUps, (item) =>
      item.question && item.answer ? { question: String(item.question), answer: String(item.answer) } : null,
    ),
  };

  const missing = [
    !data.hardPartDetail && "hardPartDetail",
    design.concepts.length === 0 && "concepts",
    design.requirements.functional.length === 0 && "requirements.functional",
    design.requirements.nonFunctional.length === 0 && "requirements.nonFunctional",
    !design.scale && "scale.numbers",
    design.tradeoffs.length === 0 && "tradeoffs",
    design.followUps.length === 0 && "followUps",
  ].filter(Boolean);
  if (missing.length > 0) {
    console.warn(`[content] ${slug}: design frontmatter is missing ${missing.join(", ")}`);
  }

  const hasPanels = design.concepts.length > 0 || design.requirements.functional.length > 0;
  return hasPanels ? design : undefined;
}

/**
 * Technology docs open with two panels read from frontmatter: the facts strip
 * and the concept bullets. The body is the use cases, each with its diagram.
 */
function readTech(slug: string, data: Record<string, unknown>): TechDetails | undefined {
  const tech: TechDetails = {
    role: String(data.role ?? ""),
    facts: records<TechFact>(data.facts, (item) =>
      item.label && item.value ? { label: String(item.label), value: String(item.value) } : null,
    ),
    concepts: strings(data.concepts),
  };

  const missing = [!tech.role && "role", tech.facts.length === 0 && "facts", tech.concepts.length === 0 && "concepts"]
    .filter(Boolean);
  if (missing.length > 0) {
    console.warn(`[content] ${slug}: tech frontmatter is missing ${missing.join(", ")}`);
  }

  return tech.facts.length > 0 || tech.concepts.length > 0 ? tech : undefined;
}

/**
 * Coding docs keep their cost table, the signals that call for the structure,
 * the pitfalls and the follow-ups in frontmatter, so those sections stay
 * uniform across concepts and can be scanned without reading the body.
 */
function readCoding(slug: string, data: Record<string, unknown>): CodingDetails | undefined {
  const coding: CodingDetails = {
    complexity: records<ComplexityRow>(data.complexity, (item) =>
      item.op && item.time
        ? {
            op: String(item.op),
            time: String(item.time),
            space: item.space ? String(item.space) : undefined,
            note: item.note ? String(item.note) : undefined,
          }
        : null,
    ),
    reachFor: strings(data.reachFor),
    pitfalls: strings(data.pitfalls),
    followUps: records<FollowUp>(data.followUps, (item) =>
      item.question && item.answer ? { question: String(item.question), answer: String(item.answer) } : null,
    ),
  };

  const missing = [
    coding.complexity.length === 0 && "complexity",
    coding.reachFor.length === 0 && "reachFor",
    coding.pitfalls.length === 0 && "pitfalls",
    coding.followUps.length === 0 && "followUps",
  ].filter(Boolean);
  // Imported topics carry no panels at all; only a partly filled set is a mistake.
  if (missing.length > 0 && missing.length < 4) {
    console.warn(`[content] ${slug}: coding frontmatter is missing ${missing.join(", ")}`);
  }

  return coding.complexity.length > 0 || coding.reachFor.length > 0 ? coding : undefined;
}

/** Words shown in the coding panels, counted for the same reason. */
function codingWordCount(coding: CodingDetails | undefined): number {
  if (!coding) return 0;
  const text = [
    ...coding.complexity.flatMap((row) => [row.op, row.note ?? ""]),
    ...coding.reachFor,
    ...coding.pitfalls,
    ...coding.followUps.flatMap((f) => [f.question, f.answer]),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** Words shown in the learn panels, counted for the same reason. */
function learnWordCount(learn: LearnDetails | undefined): number {
  if (!learn) return 0;
  const e = learn.explained;
  const text = [
    Object.values(learn.complexity).join(" "),
    e ? Object.values(e).join(" ") : "",
    ...learn.structures.flatMap((s) => [s.concept, s.python, s.declaration, ...s.aliases, ...s.ops.flatMap((o) => [o.op, o.code, o.cost])]),
    learn.brute
      ? [
          learn.brute.title,
          learn.brute.strategy,
          learn.brute.quote,
          learn.brute.tradeoff,
          learn.brute.tip,
          ...[learn.brute.brute, learn.brute.optimized].flatMap((a) => [a.name, a.time, a.space, a.quote, ...a.pros, ...a.cons]),
        ].join(" ")
      : "",
    ...learn.math.flatMap((m) => [m.title, m.plain, m.visual, m.analogy]),
    learn.walkthrough
      ? [learn.walkthrough.problem, learn.walkthrough.tagline, learn.walkthrough.code, ...learn.walkthrough.steps.flatMap((s) => [s.title, s.detail, s.math ?? "", s.cost ?? ""])].join(" ")
      : "",
    ...learn.challenges.flatMap((c) => [c.title, c.description, ...c.hints, c.optimal ?? ""]),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Learn docs keep the scraped study material in frontmatter: the big-O strip,
 * the Python structures, the brute-force comparison, the math prerequisites,
 * the walkthrough and the practice challenges.
 */
function readLearn(slug: string, data: Record<string, unknown>): LearnDetails | undefined {
  const bigO = (data.bigO ?? {}) as Record<string, unknown>;
  const explained = (data.explained ?? {}) as Record<string, unknown>;
  const bruteRaw = (data.brute ?? {}) as Record<string, unknown>;

  const approach = (value: unknown) => {
    const a = (value ?? {}) as Record<string, unknown>;
    return {
      name: String(a.name ?? ""),
      time: String(a.time ?? ""),
      space: String(a.space ?? ""),
      quote: String(a.quote ?? ""),
      pros: strings(a.pros),
      cons: strings(a.cons),
    };
  };

  const learn: LearnDetails = {
    complexity: {
      best: String(bigO.best ?? ""),
      average: String(bigO.average ?? ""),
      worst: String(bigO.worst ?? ""),
      space: String(bigO.space ?? ""),
    },
    explained:
      explained.time || explained.space || explained.visual
        ? {
            time: explained.time ? String(explained.time) : undefined,
            space: explained.space ? String(explained.space) : undefined,
            visual: explained.visual ? String(explained.visual) : undefined,
          }
        : undefined,
    structures: records<LearnStructure>(data.structures, (item) =>
      item.concept && item.python
        ? {
            concept: String(item.concept),
            python: String(item.python),
            aliases: strings(item.aliases),
            declaration: String(item.declaration ?? ""),
            ops: records(item.ops, (op) =>
              op.op && op.code ? { op: String(op.op), code: String(op.code), cost: String(op.cost ?? "") } : null,
            ),
          }
        : null,
    ),
    brute:
      bruteRaw.brute && bruteRaw.optimized
        ? {
            title: String(bruteRaw.title ?? ""),
            strategy: String(bruteRaw.strategy ?? ""),
            quote: String(bruteRaw.quote ?? ""),
            brute: approach(bruteRaw.brute),
            optimized: approach(bruteRaw.optimized),
            tradeoff: String(bruteRaw.tradeoff ?? ""),
            tip: String(bruteRaw.tip ?? ""),
            atN: bruteRaw.atN ? String(bruteRaw.atN) : undefined,
          }
        : undefined,
    math: records<LearnMathConcept>(data.math, (item) =>
      item.title && item.plain
        ? {
            id: String(item.id ?? ""),
            title: String(item.title),
            plain: String(item.plain),
            visual: String(item.visual ?? ""),
            analogy: String(item.analogy ?? ""),
            why: item.why ? String(item.why) : undefined,
          }
        : null,
    ),
    walkthrough: records<LearnWalkthrough>(data.walkthrough ? [data.walkthrough] : [], (item) =>
      item.problem && item.code
        ? {
            problem: String(item.problem),
            tagline: String(item.tagline ?? ""),
            time: String(item.time ?? ""),
            space: String(item.space ?? ""),
            code: String(item.code),
            steps: records(item.steps, (step) =>
              step.title
                ? {
                    title: String(step.title),
                    detail: String(step.detail ?? ""),
                    math: step.math ? String(step.math) : undefined,
                    cost: step.cost ? String(step.cost) : undefined,
                    lines: Array.isArray(step.lines) ? step.lines.map(Number).filter(Number.isFinite) : [],
                  }
                : null,
            ),
          }
        : null,
    ).at(0),
    challenges: records<LearnChallenge>(data.challenges, (item) =>
      item.title && item.description
        ? {
            title: String(item.title),
            difficulty: String(item.difficulty ?? ""),
            description: String(item.description),
            starter: item.starter ? String(item.starter) : undefined,
            tests: records(item.tests, (tc) =>
              tc.input !== undefined && tc.expected !== undefined
                ? { input: String(tc.input), expected: String(tc.expected) }
                : null,
            ),
            hints: strings(item.hints),
            tags: strings(item.tags),
            optimal: item.optimal ? String(item.optimal) : undefined,
          }
        : null,
    ),
  };

  const missing = [
    !learn.complexity.average && "bigO",
    learn.structures.length === 0 && "structures",
    learn.math.length === 0 && "math",
    learn.challenges.length === 0 && "challenges",
  ].filter(Boolean);
  if (missing.length > 0) {
    console.warn(`[content] ${slug}: learn frontmatter is missing ${missing.join(", ")}`);
  }

  return learn;
}

/** Words shown in the design panels, so reading time still counts them. */
function designWordCount(design: DesignDetails | undefined): number {
  if (!design) return 0;
  const text = [
    design.hardPart,
    ...design.concepts,
    ...design.requirements.functional,
    ...design.requirements.nonFunctional,
    ...design.requirements.outOfScope,
    design.scale?.numbers ?? "",
    design.scale?.conclusion ?? "",
    ...design.tradeoffs.flatMap((t) => [t.title, t.body]),
    ...design.followUps.flatMap((f) => [f.question, f.answer]),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** Words shown in the technology panels, counted for the same reason. */
function techWordCount(tech: TechDetails | undefined): number {
  if (!tech) return 0;
  const text = [...tech.facts.flatMap((fact) => [fact.label, fact.value]), ...tech.concepts].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

function readGroup(group: DocGroup): Doc[] {
  const dir = path.join(CONTENT_ROOT, GROUP_DIR[group]);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .flatMap((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content: body } = matter(raw);
      const slug = file.replace(/\.md$/, "");
      // `hidden: true` parks a finished doc: it stays on disk but leaves the
      // sidebar, the home page, search and the routes until the flag is removed.
      if (data.hidden === true) return [];
      // DocHeader renders the title, so drop the body's leading H1.
      const content = body.replace(/^\s*#\s+.*\n+/, "");
      const design = group === "design" ? readDesign(slug, data) : undefined;
      const tech = group === "tech" ? readTech(slug, data) : undefined;
      const coding = group === "coding" ? readCoding(slug, data) : undefined;
      const learn = group === "learn" ? readLearn(slug, data) : undefined;
      const words =
        content.split(/\s+/).length +
        designWordCount(design) +
        techWordCount(tech) +
        codingWordCount(coding) +
        learnWordCount(learn);

      const doc = {
        slug,
        group,
        order: Number(data.order ?? 0),
        title: String(data.title ?? slug),
        summary: String(data.summary ?? ""),
        hardPart: data.hardPart ? String(data.hardPart) : undefined,
        role: data.role ? String(data.role) : undefined,
        category: data.category ? String(data.category) : undefined,
        level: data.level ? String(data.level) : undefined,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        viz: data.viz ? String(data.viz) : undefined,
        readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
        content,
        design,
        tech,
        coding,
        learn,
      } satisfies Doc;

      return [doc];
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Read once per process. Content is static on disk, so caching here keeps
 * repeated calls across pages and layouts from re-parsing every file.
 */
let builtCache: Doc[] | null = null;

function readAllGroups(): Doc[] {
  return GROUP_ORDER.flatMap(readGroup);
}

// In dev, re-read so markdown edits show up without restarting the server —
// but only once per request. Without this, AppShell's five getDocsByGroup
// calls plus a doc page's getDoc/getDocsInTrack/getSiblings each re-parse
// every file in every group from scratch, turning one sidebar click into
// ~8 full directory reads.
const readAllGroupsOncePerRequest = cache(readAllGroups);

export function getAllDocs(): Doc[] {
  if (process.env.NODE_ENV !== "production") return readAllGroupsOncePerRequest();
  if (!builtCache) builtCache = readAllGroups();
  return builtCache;
}

export function getDocsByGroup(group: DocGroup): Doc[] {
  return getAllDocs().filter((doc) => doc.group === group);
}

/**
 * The atlas has four tracks with their own routes: system design under /docs,
 * coding under /coding, learn under /learn and devops under /devops. Lookups
 * name the track, so a slug that happens to exist in two tracks can never
 * resolve to the wrong page.
 */
const inTrack = (doc: DocMeta, track: ContentTrack) =>
  track === "sysdesign"
    ? doc.group !== "coding" && doc.group !== "learn" && doc.group !== "devops"
    : doc.group === track;

export function getDocsInTrack(track: ContentTrack): Doc[] {
  return getAllDocs().filter((doc) => inTrack(doc, track));
}

export function getDoc(slug: string, track: ContentTrack = "sysdesign"): Doc | undefined {
  return getDocsInTrack(track).find((doc) => doc.slug === slug);
}

/**
 * The worked interview script for a design, if one has been written. Scripts
 * are optional: a design without `content/scripts/<slug>.md` simply doesn't
 * offer the button.
 */
export function getScript(slug: string): InterviewScript | undefined {
  const file = path.join(CONTENT_ROOT, "scripts", `${slug}.md`);
  if (!fs.existsSync(file)) return undefined;
  const script = parseScript(fs.readFileSync(file, "utf8"));
  if (script.phases.length === 0) {
    console.warn(`[content] ${slug}: script file has no phases`);
    return undefined;
  }
  return script;
}

/** Strip content so client components receive only what they render. */
export function toMeta(doc: Doc): DocMeta {
  const { content: _content, design: _design, tech: _tech, coding: _coding, learn: _learn, ...meta } = doc;
  return meta;
}

export function getAllMeta(): DocMeta[] {
  return getAllDocs().map(toMeta);
}

/** Previous/next within the same group, for sequential reading. */
export function getSiblings(slug: string, track: ContentTrack = "sysdesign"): { prev?: DocMeta; next?: DocMeta } {
  const doc = getDoc(slug, track);
  if (!doc) return {};
  const siblings = getDocsByGroup(doc.group);
  const index = siblings.findIndex((d) => d.slug === slug);
  return {
    prev: index > 0 ? toMeta(siblings[index - 1]) : undefined,
    next: index < siblings.length - 1 ? toMeta(siblings[index + 1]) : undefined,
  };
}

const HEADING = /^(#{2,3})\s+(.+)$/gm;
const FENCE = /```[\s\S]*?```/g;

export { LEARN_TITLES, slugifyHeading };

/** Headings rendered by the design panels, which don't exist in the markdown body. */
export const DESIGN_OPENING_TITLES = ["Primary concepts and the hard part", "Requirements"] as const;
export const DESIGN_CLOSING_TITLES = ["Trade-offs and deep dives", "Possible follow-up questions"] as const;

const tocEntry = (text: string): TocEntry => ({ id: slugifyHeading(text), text, depth: 2 });

/** Table-of-contents entries for the panels before and after the markdown body. */
export function designToc(design: DesignDetails): { opening: TocEntry[]; closing: TocEntry[] } {
  const [tradeoffsTitle, followUpsTitle] = DESIGN_CLOSING_TITLES;
  return {
    opening: DESIGN_OPENING_TITLES.map(tocEntry),
    closing: [
      ...(design.tradeoffs.length > 0 ? [tocEntry(tradeoffsTitle)] : []),
      ...(design.followUps.length > 0 ? [tocEntry(followUpsTitle)] : []),
    ],
  };
}

/** Headings rendered by the technology panels, ahead of the markdown body. */
export const TECH_OPENING_TITLES = ["At a glance", "Key concepts and capabilities"] as const;

export function techToc(tech: TechDetails): { opening: TocEntry[]; closing: TocEntry[] } {
  const [glanceTitle, conceptsTitle] = TECH_OPENING_TITLES;
  return {
    opening: [
      ...(tech.facts.length > 0 ? [tocEntry(glanceTitle)] : []),
      ...(tech.concepts.length > 0 ? [tocEntry(conceptsTitle)] : []),
    ],
    closing: [],
  };
}

/** Headings rendered by the coding panels, which bracket the markdown body. */
export const CODING_TITLES = {
  cost: "Cost",
  reachFor: "Reach for it when",
  pitfalls: "Where candidates slip",
  followUps: "Possible follow-up questions",
} as const;

export function codingToc(coding: CodingDetails): { opening: TocEntry[]; closing: TocEntry[] } {
  return {
    opening: [
      ...(coding.complexity.length > 0 ? [tocEntry(CODING_TITLES.cost)] : []),
      ...(coding.reachFor.length > 0 ? [tocEntry(CODING_TITLES.reachFor)] : []),
    ],
    closing: [
      ...(coding.pitfalls.length > 0 ? [tocEntry(CODING_TITLES.pitfalls)] : []),
      ...(coding.followUps.length > 0 ? [tocEntry(CODING_TITLES.followUps)] : []),
    ],
  };
}

/** Headings rendered by the learn panels, which bracket the markdown body. */

export function learnToc(learn: LearnDetails): { opening: TocEntry[]; closing: TocEntry[] } {
  return {
    opening: [
      ...(learn.complexity.average ? [tocEntry(LEARN_TITLES.cost)] : []),
      ...(learn.structures.length > 0 ? [tocEntry(LEARN_TITLES.structures)] : []),
    ],
    closing: [
      ...(learn.brute ? [tocEntry(LEARN_TITLES.brute)] : []),
      ...(learn.walkthrough ? [tocEntry(LEARN_TITLES.walkthrough)] : []),
      ...(learn.math.length > 0 ? [tocEntry(LEARN_TITLES.math)] : []),
      ...(learn.challenges.length > 0 ? [tocEntry(LEARN_TITLES.challenges)] : []),
    ],
  };
}

export function buildToc(content: string): TocEntry[] {
  // Blank out fenced code first so `## comments` inside samples aren't headings.
  const prose = content.replace(FENCE, "");
  const entries: TocEntry[] = [];
  const pattern = new RegExp(HEADING.source, "gm");

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(prose)) !== null) {
    const text = match[2].replace(/[`*]/g, "").trim();
    entries.push({
      id: slugifyHeading(text),
      text,
      depth: match[1].length === 2 ? 2 : 3,
    });
  }
  return entries;
}

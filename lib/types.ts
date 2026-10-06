export type DocGroup = "concept" | "design" | "tech" | "coding" | "learn" | "devops" | "backend" | "fde";

/**
 * The halves of the atlas the switcher offers. Coding and learn share one
 * "Algorithms" entry — each keeps its own sidebar section (and its own
 * /coding and /learn routes), the way sysdesign splits into Concepts, Designs
 * and Tech sections under a single track. DevOps is its own track with its
 * own route, /devops, so is Backend, /backend, and Forward
 * Deployed Engineering, /fde.
 */
export type Track = "sysdesign" | "algorithms" | "devops" | "backend" | "fde";

/**
 * Scope for content lookups: finer-grained than `Track` so a slug that exists
 * in both /coding and /learn (or /devops) can never resolve to the wrong page.
 */
export type ContentTrack = "sysdesign" | "coding" | "learn" | "devops" | "backend" | "fde";

/** Facets used by the filter bar. Kept as a union so new facets fail loudly. */
export type TagKind = "concept" | "tech" | "pattern";

export interface Tag {
  id: string;
  label: string;
  kind: TagKind;
  /** One short line shown in the tag's hover tooltip. */
  description?: string;
  /** Technology tags only: the core traits that make it the right pick. */
  features?: string[];
  /** Technology tags only: situations where it is the natural choice. */
  useWhen?: string[];
}

export interface DocMeta {
  slug: string;
  group: DocGroup;
  /** Position within its group. Designs are ranked by interview frequency. */
  order: number;
  title: string;
  /** One line shown on the card and in search results. */
  summary: string;
  /** Designs only: the thing the interviewer is actually testing. */
  hardPart?: string;
  /** Technology pages only: the two-word role, e.g. "Event log". */
  role?: string;
  /** Learn docs only: which family the topic belongs to. */
  category?: string;
  /** Learn docs only: the source site's difficulty badge. */
  level?: string;
  tags: string[];
  /** Coding docs only: id of the animated visualisation above the body. */
  viz?: string;
  readingMinutes: number;
}

export interface DesignTradeoff {
  title: string;
  /** Markdown: may contain code blocks, tables and lists. */
  body: string;
}

/** A question a reader should try to answer before revealing the answer. */
export interface FollowUp {
  question: string;
  answer: string;
}

/** The structured sections of a design doc, read from frontmatter. */
export interface DesignDetails {
  /** Full version of the short `hardPart` used on cards; shown on the doc page. */
  hardPart: string;
  concepts: string[];
  requirements: {
    functional: string[];
    nonFunctional: string[];
    outOfScope: string[];
  };
  scale?: {
    numbers: string;
    conclusion?: string;
  };
  tradeoffs: DesignTradeoff[];
  followUps: FollowUp[];
}

export interface TechFact {
  label: string;
  value: string;
}

/** One row of a coding doc's cost table. */
export interface ComplexityRow {
  op: string;
  time: string;
  space?: string;
  /** Why it costs that — the part candidates get asked to justify. */
  note?: string;
}

/** The structured sections of a coding doc, read from frontmatter. */
export interface CodingDetails {
  complexity: ComplexityRow[];
  /** Signals in a problem statement that point at this structure. */
  reachFor: string[];
  pitfalls: string[];
  followUps: FollowUp[];
}

/** One row of a learn doc's Python structures table. */
export interface LearnStructureOp {
  op: string;
  code: string;
  cost: string;
}

export interface LearnStructure {
  concept: string;
  /** What you actually reach for in Python. */
  python: string;
  /** Other names the interviewer might use. */
  aliases: string[];
  declaration: string;
  ops: LearnStructureOp[];
}

/** One side of a learn doc's brute-force vs optimized comparison. */
export interface LearnApproach {
  name: string;
  time: string;
  space: string;
  quote: string;
  pros: string[];
  cons: string[];
}

/** The brute-force-vs-optimized panel of a learn doc. */
export interface LearnBrute {
  title: string;
  strategy: string;
  quote: string;
  brute: LearnApproach;
  optimized: LearnApproach;
  tradeoff: string;
  tip: string;
  /** The input size the ops comparison is drawn at. */
  atN?: string;
}

/** One math idea a learn doc assumes. */
export interface LearnMathConcept {
  id: string;
  title: string;
  plain: string;
  visual: string;
  analogy: string;
  /** Why it matters for interviews, when the source says so. */
  why?: string;
}

/** One step of a learn doc's code walkthrough. */
export interface LearnWalkthroughStep {
  title: string;
  detail: string;
  math?: string;
  cost?: string;
  /** 1-indexed lines of the walkthrough code this step touches. */
  lines: number[];
}

export interface LearnWalkthrough {
  problem: string;
  tagline: string;
  time: string;
  space: string;
  code: string;
  steps: LearnWalkthroughStep[];
}

/** One input/expected pair of a learn doc's challenge. */
export interface LearnTestCase {
  input: string;
  expected: string;
}

/** A practice challenge attached to a learn doc. */
export interface LearnChallenge {
  title: string;
  difficulty: string;
  description: string;
  /** The starting skeleton the source site opens in its editor. */
  starter?: string;
  tests: LearnTestCase[];
  hints: string[];
  tags: string[];
  optimal?: string;
}

/** The structured sections of a learn doc, read from frontmatter. */
export interface LearnDetails {
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
  /** The same costs, explained in words. */
  explained?: {
    time?: string;
    space?: string;
    visual?: string;
  };
  structures: LearnStructure[];
  brute?: LearnBrute;
  math: LearnMathConcept[];
  walkthrough?: LearnWalkthrough;
  challenges: LearnChallenge[];
}

/** The structured sections of a technology doc, read from frontmatter. */
export interface TechDetails {
  /** The two-word role, repeated from `DocMeta` so the panels are self-contained. */
  role: string;
  facts: TechFact[];
  /** One line each; the use cases in the body carry the detail. */
  concepts: string[];
}

/** Who is speaking in an interview script. `note` is a coaching aside, not a voice. */
export type ScriptSpeaker = "you" | "interviewer" | "note";

export interface ScriptTurn {
  speaker: ScriptSpeaker;
  /** Optional stage direction: "drawing", "pushing on scope". */
  cue?: string;
  /** Markdown: may contain lists, tables and inline code. */
  body: string;
}

/** One phase of the Module 10.1 framework. */
export interface ScriptPhase {
  title: string;
  minutes?: number;
  goal?: string;
  turns: ScriptTurn[];
}

export interface InterviewScript {
  phases: ScriptPhase[];
  /** Budgeted total, summed from the phases. */
  minutes: number;
  /** Spoken turns, notes excluded. */
  turns: number;
}

export interface Doc extends DocMeta {
  content: string;
  /** Design docs only. Kept off DocMeta so sidebar and card payloads stay small. */
  design?: DesignDetails;
  /** Technology docs only, for the same reason. */
  tech?: TechDetails;
  /** Coding docs only, for the same reason. */
  coding?: CodingDetails;
  /** Learn docs only, for the same reason. */
  learn?: LearnDetails;
}

export interface TocEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

export type SortKey = "order" | "title" | "length";

import type { DocGroup, DocPartMeta } from "./types";
import { slugifyHeading } from "./headings";

/**
 * Long docs read better as a parent page plus child pages. The split is done
 * here, when content is read, so the markdown files stay whole:
 *
 * - DevOps modules split at their top-level parts: the module text stays on
 *   the parent, then the Reference cheat sheet, each Lab and the Project
 *   become children. The question bank stays whole: its topics are tiny.
 * - Backend and FDE modules split at their `##` sections, each of which is
 *   adapted from one source.
 *
 * Only docs long enough to need it are split.
 */
const MIN_MINUTES = 25;
const WORDS_PER_MINUTE = 200;
const MERGE_BELOW_WORDS = 250;

export interface DocPart extends DocPartMeta {
  content: string;
}

export interface SplitDoc {
  lead: string;
  parts: DocPart[];
}

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
const minutes = (text: string) => Math.max(1, Math.round(words(text) / WORDS_PER_MINUTE));

function boundary(group: DocGroup, line: string): string | null {
  if (group === "devops") {
    const h1 = /^# (.+)$/.exec(line);
    if (h1) return h1[1].trim();
    const ref = /^## ((?:Reference|Cheat ?sheet)\b.*)$/i.exec(line);
    return ref ? ref[1].trim() : null;
  }
  const h2 = /^## (.+)$/.exec(line);
  return h2 ? h2[1].trim() : null;
}

/** Lift a part's headings so its first level renders as `##`, the page's top level. */
function promote(text: string): string {
  let inCode = false;
  const levels: number[] = [];
  for (const line of text.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inCode = !inCode;
    const m = !inCode && /^(#{1,6}) /.exec(line);
    if (m) levels.push(m[1].length);
  }
  if (levels.length === 0) return text;
  const shift = Math.min(...levels) - 2;
  if (shift <= 0) return text;
  inCode = false;
  return text
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) inCode = !inCode;
      return inCode ? line : line.replace(/^(#{1,6}) /, (_, h: string) => "#".repeat(h.length - shift) + " ");
    })
    .join("\n");
}

const partSlug = (title: string) =>
  slugifyHeading(title).replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "part";

export function splitDoc(group: DocGroup, slug: string, content: string): SplitDoc | null {
  if (group !== "devops" && group !== "backend" && group !== "fde") return null;
  if (slug === "interview-questions") return null;
  if (minutes(content) < MIN_MINUTES) return null;

  const chunks: { title: string | null; lines: string[] }[] = [{ title: null, lines: [] }];
  let inCode = false;
  for (const line of content.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inCode = !inCode;
    const title = inCode ? null : boundary(group, line);
    if (title) chunks.push({ title, lines: [] });
    else chunks[chunks.length - 1].lines.push(line);
  }

  let lead = chunks[0].lines.join("\n").trim();
  let rest = chunks.slice(1);
  // DevOps modules open with their own "# Module NN" heading: that part is the parent's body.
  if (group === "devops" && rest.length > 0 && words(lead) < 60 && /^Module\b/i.test(rest[0].title ?? "")) {
    lead = `${lead}\n\n${rest[0].lines.join("\n")}`.trim();
    rest = rest.slice(1);
  }

  const parts: DocPart[] = [];
  const used = new Set<string>();
  for (const chunk of rest) {
    const body = chunk.lines.join("\n").trim();
    const prev = parts[parts.length - 1];
    // A stub section (a short link list, say) isn't worth its own page: it
    // joins the part before it, or the parent if it comes first.
    if (words(body) < MERGE_BELOW_WORDS) {
      if (prev) {
        prev.content = `${prev.content}\n\n## ${chunk.title}\n\n${body}`;
        prev.readingMinutes = minutes(prev.content);
      } else {
        lead = `${lead}\n\n## ${chunk.title}\n\n${body}`.trim();
      }
      continue;
    }
    let s = partSlug(chunk.title!);
    for (let n = 2; used.has(s); n++) s = `${partSlug(chunk.title!)}-${n}`;
    used.add(s);
    const text = promote(body);
    parts.push({ slug: s, title: chunk.title!, content: text, readingMinutes: minutes(text) });
  }

  return parts.length >= 2 ? { lead, parts } : null;
}

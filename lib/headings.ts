/**
 * Client-safe heading helpers. The panel components render their own section
 * headings, so they need the slug logic and the panel titles without pulling
 * `lib/content`'s filesystem imports into the browser bundle.
 */

/**
 * Mirrors github-slugger (what rehype-slug uses) so anchors generated here
 * match rendered heading ids. Each space becomes its own hyphen, so
 * "API / Model" is `api--model`, not `api-model`.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*~]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/ /g, "-");
}

/** Headings rendered by the learn panels, which bracket the markdown body. */
export const LEARN_TITLES = {
  cost: "At a glance",
  structures: "Reach for these in Python",
  brute: "Brute force vs optimized",
  walkthrough: "Step-by-step walkthrough",
  math: "The math you need",
  challenges: "Practice challenges",
} as const;

---
title: "Designing Text"
order: 4
summary: "Typography as a system: a hand-picked type scale in px or rem, a quality font chosen without agonizing, 45–75 character lines, baseline alignment, proportional line-height and restrained links."
category: "Refactoring UI"
level: All levels
---

# Designing Text

Most interfaces are mostly text, so text decisions are interface decisions. This chapter turns the usual suspects — sizes, fonts, measure, line-height, alignment, letter-spacing — into small systems with clear defaults.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Refactoring UI is a commercial book by Adam Wathan and Steve Schoger — buy it at [refactoringui.com](https://www.refactoringui.com). Each section below distills one idea from the book's *Designing Text* chapter.

## Establish a Type Scale

Without a system, an interface quietly accumulates every pixel value from 10 to 24 px. That means inconsistency today and slow decisions tomorrow. Two bad options present themselves first:

- **A linear scale** (every value a multiple of 4) — doesn't help choose between 44 and 48 px.
- **A modular scale** built on a ratio (4:5, 2:3, the golden ratio) — mathematically alluring, but it yields fractional sizes (31.25 px, 39.063 px…) that browsers round differently, and for UI work the jumps are either too limiting or so tight you're reverse-engineering a ratio to justify sizes you already wanted.

The practical answer for interfaces is to pick the sizes by hand — whole pixels, exactly the steps you need. A scale that works for most projects and lines up with the spacing scale from the previous module:

```js
// tailwind.config.js
module.exports = {
  theme: {
    fontSize: {
      xs:   ["12px", { lineHeight: "16px" }],
      sm:   ["14px", { lineHeight: "20px" }],
      base: ["16px", { lineHeight: "24px" }],
      lg:   ["18px", { lineHeight: "28px" }],
      xl:   ["20px", { lineHeight: "28px" }],
      "2xl":["24px", { lineHeight: "32px" }],
      "3xl":["30px", { lineHeight: "36px" }],
      "4xl":["36px", { lineHeight: "40px" }],
      "5xl":["48px", { lineHeight: "1" }],
    },
  },
};
```

Define sizes in `px` or `rem`, never `em`: inside an element sized `1.25em`, a nested `.875em` computes to 17.5 px — a value that isn't in your scale at all. Only `rem` (or `px`) guarantees the system is real.

**The norm:** a fixed, hand-picked ladder of sizes in px/rem; anything else is the system leaking.

## Use Good Fonts

You don't need years of typographic training to stop picking bad typefaces — a few filters do most of the work:

- **Play it safe.** For UI, a neutral sans serif (Helvetica-ish) is nearly always acceptable; the system font stack (`-apple-system, Segoe UI, Roboto, …`) is the zero-risk floor and users are already used to it.
- **Filter by number of styles.** Typefaces shipped in many weights tend to be crafted with more care. On Google Fonts, filtering to 10+ styles (weights × italics) cuts ~85% of the catalog — fewer bad options to get lost in.
- **Optimize for legibility.** Fonts are designed for a purpose: display faces have tight spacing and short x-heights, text faces the opposite. Don't use condensed, short-x-height faces for main UI text.
- **Trust popularity.** Sorting a directory by popularity is crowdsourced curation — especially useful for personality faces like serifs, where taste is hardest to fake.
- **Steal from people who care.** Inspect sites you admire and use what their teams agonized over.

Pay attention long enough and you'll develop the eye; until then these filters keep you out of trouble.

**The norm:** safe neutral for UI text, chosen by styles-count and popularity; personality faces only where personality is the point.

## Keep Your Line Length in Check

Fitting text to the layout instead of to the reader produces lines that are too long to track comfortably. Aim for **45–75 characters per line** — on the web, roughly `20–35em` of width:

```css
.prose p {
  max-width: 65ch; /* or 30em: same ballpark, tied to font size */
}
```

Going somewhat past 75 characters occasionally works, but you're in risky territory.

The rule also applies *within* a wider container: when paragraphs sit next to images or wide components, constrain the paragraph width anyway even though the content area must be wider. Mixed widths in one content area feel counterintuitive and look more polished.

**The norm:** the measure serves reading, not layout — cap paragraph width even inside wide sections.

## Baseline, Not Center

Mixing font sizes on one line — a large card title on the left, a smaller actions list on the right — tempts you to vertically center them. With generous gaps that passes; when the texts sit close, the floating misalignment becomes obvious.

Align mixed sizes by their **baselines**, the invisible line the letters rest on. It's the reference your eye already uses, so the pairing reads as intentional:

```css
.card-header {
  display: flex;
  align-items: baseline;      /* not center */
  justify-content: space-between;
  gap: 1rem;
}
.card-header h3 { font-size: 20px; }
.card-header nav { font-size: 12px; }
```

**The norm:** when sizes mix on a line, align baselines.

## Line-Height Is Proportional

"A line-height of about 1.5" is a fine starting point, but the right value depends on two variables, not one constant:

- **Line length:** spacing exists so the eye can find the next line. The longer the jump back to the left edge, the more help it needs — narrow text is fine at 1.5, full-width text may want 2.
- **Font size:** small text needs more leading because the eye needs help locating the next line; large headlines need none at all. Line-height and font size are inversely proportional — small text gets taller ratios, display text sits at `1`.

```css
.caption  { font-size: 12px; line-height: 1.5; }  /* more help */
.body     { font-size: 16px; line-height: 1.6; }
.headline { font-size: 48px; line-height: 1.1; }  /* almost none */
```

Ever reread the same line twice, or skip one? The leading was too short for that measure.

**The norm:** scale line-height with measure and inverse of size; 1.5 is a data point, not a law.

## Not Every Link Needs a Color

The colored-and-underlined link treatment exists to make links stand out *in paragraph text*. In navigation and other link-dense UI, that treatment applied to everything is overbearing — a page of shouting blue.

Reserve the "loud" treatment for links inside prose. For the rest:

- Emphasize with **weight** or **darker color** instead.
- Truly ancillary links — outside the user's main path — can look like plain text and reveal themselves only on hover (underline or color change). Discoverable by anyone who tries; silent for everyone else.

**The norm:** link styling scales with scarcity — the more links on screen, the quieter each one gets.

## Align With Readability in Mind

Text should follow the language's reading direction — for English and most languages, that means left-aligned by default. Other alignments are tools with fine print:

- **Centering** works for headlines and short independent blocks (2–3 lines at most). Longer centered text should be left-aligned — or better, rewritten shorter, which fixes the alignment and tightens the message.
- **Numbers in tables get right-aligned.** With the decimal always in the same place, columns of figures can be compared at a glance.
- **Justified text** suits print-flavored designs (online magazines), but on the web it opens ugly rivers between words unless hyphenation is enabled too:

```css
.newspaper p {
  text-align: justify;
  hyphens: auto;
}
```

Even then it's preference, not obligation — left-aligned works everywhere.

**The norm:** default left; center only short blocks; right-align numerals; justify only with hyphenation.

## Use Letter-Spacing Effectively

Most of the time, trust the typeface designer and leave tracking alone. Two situations justify intervention:

- **Tightening headlines.** Families built for small sizes (Open Sans) carry wider spacing than a headline wants. Pulling it in slightly mimics purpose-built display faces (Oswald). The reverse doesn't work — headline fonts don't become body fonts when you loosen them.
- **Loosening all-caps.** Default spacing is tuned for sentence case, where ascenders, descenders and x-height letters give words shape. Caps are a wall of same-height letters, so a touch of extra tracking restores distinguishability:

```css
h1        { letter-spacing: -0.02em; }
.eyebrow  {                 /* "SECTION LABEL" */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

**The norm:** tighten display text slightly, widen small caps slightly, and otherwise leave it to the font.

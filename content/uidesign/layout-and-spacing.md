---
title: "Layout and Spacing"
order: 3
summary: "Give elements room to breathe, define a spacing scale instead of pixel-nudging, stop filling every pixel of screen width, and make spacing unambiguous about what belongs together."
category: "Refactoring UI"
level: All levels
---

# Layout and Spacing

The cheapest way to make a design feel better is to change nothing except the space: more of it, from a scale, arranged so grouping is obvious.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Refactoring UI is a commercial book by Adam Wathan and Steve Schoger — buy it at [refactoringui.com](https://www.refactoringui.com). Each section below distills one idea from the book's *Layout and Spacing* chapter.

## Start With Too Much White Space

Adding white space only until a layout stops looking cramped gives every element the *minimum* room to not look bad — and "not bad" is the ceiling. The reverse approach works better: give a section wildly too much space, then remove until it looks right. What felt like "a little too much" while staring at one element usually lands as "just enough" in the full interface.

Dense UIs still have a place — a dashboard that must fit on one screen is allowed to be busy — but that should be a deliberate decision, not the default. It's much easier to notice you need to *remove* space than to notice you need to add it.

**The norm:** overshoot the white space, then trim; density is a choice you make, not a habit you fall into.

## Establish a Spacing and Sizing System

Nudging values one pixel at a time — 120 px or 125 px? — is slow and produces inconsistent designs. "Everything is a multiple of 4" doesn't help either: it still leaves 120 and 124 as options.

A useful scale respects *relative* differences. At the small end (icon sizes, button padding) a few pixels is a big change — 12 → 16 px is a 33% jump — so steps must be tight. At the large end (card widths, hero spacing) 500 → 520 px is a 4% change nobody perceives, so steps get wider. Keep any two adjacent values at least ~25% apart and the elimination trick from *Limit Your Choices* works: try a value, compare its neighbors, keep the winner.

Build the scale from a base — 16 px divides cleanly and is the browser default — packing values tightly at the bottom and spacing them further apart up top, for example:

```js
// tailwind.config.js — a practical spacing/sizing scale
module.exports = {
  theme: {
    spacing: {
      0: "0px",
      1: "4px",   2: "8px",   3: "12px",  4: "16px",
      5: "20px",  6: "24px",  8: "32px",  10: "40px",
      12: "48px", 16: "64px", 20: "80px", 24: "96px", 32: "128px",
    },
  },
};
```

Need space under an element? Take a value from the scale. Not quite enough? The next one up is probably right. Besides speed, designs quietly gain a consistency they never had when every value was bespoke.

**The norm:** never invent a size at point of use — pull it from a predefined, perceptually spaced scale.

## You Don't Have to Fill the Whole Screen

Modern displays offer 1200–1400 px and up, and it's tempting to use all of it. But spreading or widening content past what it needs makes an interface harder to interpret. If 600 px is right, use 600 px; extra breathing room at the edges has never hurt anyone.

The same applies to sections: not everything has to be full-width just because the navigation is. Give each element the width it needs — don't degrade one thing to match another.

Related tactics:

- **Shrink the canvas.** Designing something small on a huge artboard is hard; constraints help. For responsive apps, start at a ~400 px mobile layout, then widen and fix only what felt like a compromise. You'll change less than you expect.
- **Think in columns.** If a narrow form feels lost in a wide UI, break its supporting text into a second column instead of stretching the form. Balance without compromise.
- **Don't force smallness either.** If you genuinely need the space, take it.

**The norm:** width is earned by content, not granted by the viewport.

## Grids Are Overrated

A 12-column grid simplifies layout decisions and brings order — but outsourcing *every* decision to it does harm, because a grid is fundamentally fluid percentage widths, and not everything should be fluid:

- **Fixed-side, fluid-center layouts.** A sidebar at 3 of 12 columns (25%) gets uselessly wide on large screens and wraps awkwardly on small ones. Give the sidebar a fixed width tuned to its content and let the main area flex to fill the rest.
- **Don't shrink until necessary.** A login card at "6 columns" ends up *wider* on some medium screens than on large ones — nonsense. If 500 px is the card's best size, set `max-width: 500px` and let it only shrink when the viewport is smaller than that.
- **Inside components too.** Percentages are for things that should scale; everything else keeps its own dimensions.

**The norm:** give each element the size it needs; use `max-width` plus shrinking, not fluid columns, for one-off containers.

## Relative Sizing Doesn't Scale

Encoding proportions in relative units feels tidy — headlines at `2.5em`, button padding defined against the button's font size — but proportions that work at one size rarely work at another:

- **Across screens:** 18 px body with 45 px headlines is right on desktop. Shrink body to 14 px on mobile and `2.5em` headlines render at 35 px — far too big, when 20–24 px is the correct mobile size. That's a ratio of ~1.6, not 2.5: the relationship didn't survive the context change, so there was no relationship to encode.
- **Within components:** a button whose padding scales with its font size just looks like the same button zoomed. Buttons where padding grows *more* than proportionally at large sizes and tightens at small ones feel genuinely large and genuinely small.

As a rule, elements that are large on large screens need to shrink *faster* than small elements — the gap between small and large compresses as the screen narrows.

**The norm:** tune sizes per breakpoint (and per variant) instead of chaining them with `em` multipliers.

## Avoid Ambiguous Spacing

When groups are visibly separated — a border, a background — membership is obvious. When separation comes only from spacing, equal spacing is a trap: if the gap below a label equals the gap below its input, the label looks like it belongs to the previous field. At best the user works harder to parse the form; at worst they type into the wrong field.

The same ambiguity appears when section headings sit as close to the content above as below, when list item gaps equal line height so bullets blur together, and in horizontal arrangements too.

The rule is proximity: **more space around a group than within it.**

```css
/* label hugs its input; the pair separates from the next pair */
.field { margin-bottom: 2.5rem; }        /* between groups  */
.field label { margin-bottom: 0.25rem; } /* within a group  */
```

**The norm:** spacing is grouping — make the inside of a group visibly tighter than the outside.

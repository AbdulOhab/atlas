---
title: "Hierarchy Is Everything"
order: 2
summary: "The single biggest lever for making UI feel designed: decide what matters, then use weight, color, labels and button styles to rank elements — instead of letting everything shout at once."
category: "Refactoring UI"
level: All levels
---

# Hierarchy Is Everything

Visual hierarchy — how important each element *looks* relative to the others — is the most effective tool in interface design. The same layout, font and colors feel chaotic when everything competes for attention and polished when the important things win.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Refactoring UI is a commercial book by Adam Wathan and Steve Schoger — buy it at [refactoringui.com](https://www.refactoringui.com). Each section below distills one idea from the book's *Hierarchy is Everything* chapter.

## Not All Elements Are Equal

When every element in an interface gets the same visual treatment, the result reads as one noisy wall of content: it's unclear what matters, and the design feels accidental. Deliberately de-emphasizing secondary and tertiary information while highlighting what's important makes a design feel intentional — even with an unchanged color scheme, font and layout.

Before styling any screen, answer one question: on this screen, what is the user actually here to do or read? That element gets the emphasis; everything else is supporting cast. The rest of this module is the toolkit for expressing that ranking.

**The norm:** rank the elements first; style expresses the ranking, not personal taste per element.

## Size Isn't Everything

Font size is the default hierarchy tool, but leaning on it alone produces headlines that are too big and secondary text too small to read. Weight and color usually do the job better:

- **Color** — stick to two or three: a dark color for primary content, a mid grey for secondary, a lighter grey for tertiary (like a footer copyright line).
- **Weight** — two are usually enough for UI work: a normal weight (400–500 depending on the font) for most text, and 600–700 for emphasis.

Avoid weights under 400 in UI: at small sizes they're hard to read, and light weights read as broken rather than de-emphasized. If text needs to recede, use a lighter color or smaller size instead.

**The norm:** reach for weight and color before size; three text colors and two weights cover most interfaces.

## Don't Use Grey Text on Colored Backgrounds

Lighter grey de-emphasizes text on white because it reduces contrast. On a colored background, grey text looks like a mistake — and white text with reduced opacity (the tempting shortcut) looks washed out, sometimes disabled, and lets the background show through on images or patterns.

What actually creates the hierarchy is *lower contrast against that specific background*, not greyness. So hand-pick a new color for the text:

- Keep the background's hue.
- Adjust saturation and lightness until the text sits clearly below the primary text but doesn't look faded.

```css
/* Secondary text on a blue panel: same hue, tuned lightness — not grey, not opacity */
.panel--blue        { background: hsl(212 100% 37%); }
.panel--blue .title { color: hsl(0 0% 100%); }
.panel--blue .meta  { color: hsl(211 65% 78%); }
```

**The norm:** on color, de-emphasize with a hand-picked tint of the background hue — never grey at reduced opacity.

## Emphasize by De-emphasizing

When an element won't stand out no matter what you add to it, the problem is usually its competition. The classic case: a highlighted nav item that still doesn't pop, because the inactive items are just as strong. Soften the inactive items' color and the active one wins without touching it.

The same move works at every scale — if a sidebar competes with the main content, don't frame the sidebar, just let it sit on the page background. Emphasis is relative: subtracting weight from the surroundings often beats adding weight to the target.

**The norm:** when something won't stand out, quiet its neighbors instead of shouting louder.

## Labels Are a Last Resort

Showing data as `label: value` pairs gives every field equal weight, which flattens the hierarchy and makes the interface feel like a database dump. Often the label isn't needed at all:

- **The format gives it away** — `janedoe@example.com` is an email, `(555) 765-4321` is a phone, `$19.99` is a price.
- **The context gives it away** — "Customer Support" under a name in a directory needs no "Department" label.
- **Fold the label into the value** — "12 left in stock" instead of "In stock: 12"; "3 bedrooms" instead of "Bedrooms: 3". One unit, stylable as a whole.

When you truly need labels — say, a dashboard of similar fields that must scan quickly — treat the label as supporting content: smaller, lower contrast, or lighter weight than the data.

Invert this only when the user is scanning *for the label*: on a spec sheet, someone looking for a phone's depth is hunting the word "depth", not "7.6 mm". Even then, a darker label with a slightly lighter value is enough — don't bury the data.

**The norm:** drop labels when format or context carries the meaning; otherwise style them as secondary text.

## Separate Visual Hierarchy from Document Hierarchy

Semantic markup (an `h1` for "Manage Account") is right, but the browser's default heading sizes are built for documents, and it's easy to fall into "it's an `h1`, so it must be huge". In application UIs, section titles often behave as labels — supporting content that shouldn't compete with the content it introduces. Frequently the right style for a section title is *small*.

Pick elements for semantics, style them for hierarchy:

```html
<section>
  <!-- an h1 that renders like a label, not a billboard -->
  <h1 class="text-small font-semibold uppercase tracking-wide text-ink-muted">Manage account</h1>
  <!-- the content is the hero, not the title -->
  ...
</section>
```

At the extreme, a title can exist in the markup for screen readers and be visually hidden because the content speaks for itself.

**The norm:** semantics choose the tag; hierarchy chooses the style.

## Balance Weight and Contrast

Bold text emphasizes because it covers more surface area — more pixels per unit of space. That relationship between surface area and perceived importance applies beyond text:

- **Heavy things next to text** — solid icons are visually heavy, so an icon next to a label tends to dominate. You can't change an icon's weight, so lower its contrast instead: a softer color restores the balance.
- **Light things that need emphasis** — a 1 px border in a soft color can be too subtle, but darkening it makes the whole design harsher. Increase the width instead: a slightly heavier border at the same soft color reads clearly without the noise.

Contrast and weight are interchangeable currencies: spend contrast to quiet heavy elements, spend weight to strengthen quiet ones.

**The norm:** when something feels too loud, lower its contrast; when it's too faint, add weight — before touching color.

## Semantics Are Secondary

Styling actions by their semantic category — every "danger" button red, every button a button — ignores that actions sit in a pyramid of importance: one true primary action, a few secondary ones, rarely-used tertiary ones. Design the level, not the type:

| Level | Treatment | Example |
| --- | --- | --- |
| Primary | Solid, high-contrast background | "Save" |
| Secondary | Outline, or lower-contrast fill | "Cancel", "Save as draft" |
| Tertiary | Styled like a link | "Reset", "Learn more" |

Destructive doesn't automatically mean big-red-bold. If delete isn't the primary action on the page, give it a secondary treatment — then make it primary *inside its confirmation dialog*, where it genuinely is the one action.

**The norm:** one primary action per view; semantics adjust the flavor, hierarchy sets the size.

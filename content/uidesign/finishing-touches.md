---
title: "Finishing Touches"
order: 8
summary: "The last 10% that reads as polish: supercharge default elements, add color with accent borders, decorate empty backgrounds, design the empty state, replace borders with shadow/color/space, and rethink stock components."
category: "Refactoring UI"
level: All levels
---

# Finishing Touches

A functional design becomes a finished one through small, deliberate moves — none requiring graphic-design talent, all of them compounding.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Refactoring UI is a commercial book by Adam Wathan and Steve Schoger — buy it at [refactoringui.com](https://www.refactoringui.com). Each section below distills one idea from the book's *Finishing Touches* chapter.

## Supercharge the Defaults

You don't need new elements to add flair — restyle the ones the platform gives you for free:

- **Bulleted lists → icons.** Replace the bullet with a checkmark or arrow, or something content-specific — a padlock on a list of security features.
- **Testimonial quotes → elements.** Promote the quotation mark: big, colored, typographic instead of punctuational.
- **Links → branded.** A thicker custom underline in your accent color that partially overlaps the text does far more than `color: blue`.
- **Checkboxes and radios → brand moments.** Custom-styled selected states in a brand color turn the most boring controls in the form into polish. That alone moves a design from "default" to "designed".

```css
ul.features { list-style: none; padding: 0; }
ul.features li::before {
  content: "✓";
  margin-right: 0.5rem;
  color: var(--brand-500);
  font-weight: 700;
}
```

**The norm:** before adding anything, upgrade what's already on the page.

## Add Color with Accent Borders

The dash of flair other designs get from photography or illustration, a developer can get from a colored rectangle. Accent borders — a solid strip of brand color — cost nothing and lift bland surfaces:

- Across the **top of a card**, turning a grey box into a branded one.
- Along the **side of an alert**, giving the semantic color a physical anchor.
- Under an **active nav item**, replacing heavy background fills with a crisp signal.
- As a **short underline beneath a headline**, like a highlighter stroke.
- Across the **top of the entire layout**, framing the whole page in the brand.

```css
.card--accent { border-top: 4px solid var(--brand-500); }
.nav-link.active::after {
  content: "";
  display: block;
  height: 2px;
  background: var(--brand-500);
}
```

**The norm:** when a surface needs personality, try a strip of accent color before anything fancier.

## Decorate Your Backgrounds

Even with hierarchy, spacing and typography done well, a design can still feel plain — usually because every background is the same flat field. Break the monotony *behind* the content, where it can't interfere:

- **Change the background color** of one panel or one page section. For more energy, a slight gradient — two hues no more than ~30° apart keeps it tasteful.
- **Add a repeating pattern** (Hero Patterns-style SVG tiles). It doesn't have to fill the whole area: a pattern repeating along a single edge reads as deliberate trim. Keep pattern-to-background contrast low so text stays comfortable.
- **Place a simple graphic or two** — geometric shapes or a chunk of the pattern — at specific positions beside the content. It can be complex (a simplified world map) as long as contrast stays low and it never competes with real content.

```css
.section--alt {
  background:
    linear-gradient(hsl(212 60% 98%), hsl(190 60% 97%)); /* 20-ish° apart */
}
```

**The norm:** one or two decorated backgrounds per page, always quieter than the content on them.

## Don't Overlook Empty States

You design the screen with perfect sample data — usernames, avatars, the works — ship it, and the excited first user clicks the nav item to see... an empty void. For anything that depends on user-generated content, the **empty state is the first screen**, not an edge case:

- Lead with an image or illustration to catch the eye.
- Make the call-to-action prominent — creating the first piece of content is *the* action.
- Hide supporting UI (tabs, filters) that does nothing until content exists; dead controls teach users your interface lies.

An empty state is a first impression and a product tour in one. Interesting and exciting beats a default-ridden stub every time.

**The norm:** design the zero-data screen with the same care as the full one.

## Use Fewer Borders

Borders are the reflex answer to "these two things need separating", but stacking them up makes a design busy and cluttered. Reach for the alternatives first:

- **A box shadow** outlines an element like a border, more subtly, and doesn't need the element's color to differ from the background the way pure spacing does.
- **Two different background colors** — adjacent surfaces with slightly different fills need nothing between them. If you're already varying the background *and* have a border, try deleting the border; it's often redundant.
- **Extra spacing** — the most honest separator: increase the actual distance between groups.

```css
/* instead of border-top on every section */
.stack > * + * { margin-top: 2.5rem; }
.panel { box-shadow: 0 1px 2px rgb(0 0 0 / 0.08); }
```

**The norm:** separation = shadow, contrast or space; a border is the last resort, not the first.

## Think Outside the Box

Convention says a dropdown is a white box of stacked links; a table is uniform single-data columns; radio buttons are labels with tiny circles. These are habits, not laws — the component is just a floating box (or a grid of cells, or a choice control), and you can do anything with it:

- **Dropdowns** can break into sections, spread multiple columns, carry supporting text and colored icons — a menu, not a list.
- **Tables** can merge related columns that don't need independent sorting, and introduce hierarchy *within* a row. Cells can hold images and color, not just text.
- **Radio groups** that matter to the UI can become **selectable cards** — the same single-choice semantics, at a size and richness the decision deserves.

Constraints are powerful, but sometimes the next level is the freedom to ignore the default shape of a component.

**The norm:** when a stock component feels like the bottleneck, redesign the component — the semantics will survive.

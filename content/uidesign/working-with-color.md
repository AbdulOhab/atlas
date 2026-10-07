---
title: "Working with Color"
order: 5
summary: "Build the palette in HSL, expect to need ten colors with many shades each, define those shades up front, keep saturation alive at the edges, warm up your greys — and never let color carry meaning alone."
category: "Refactoring UI"
level: All levels
---

# Working with Color

Color goes wrong at the system level far more often than at the individual-pick level: hex codes that hide relationships, palettes too small to build with, shades invented on the fly. Fix the system and individual picks get easy.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Refactoring UI is a commercial book by Adam Wathan and Steve Schoger — buy it at [refactoringui.com](https://www.refactoringui.com). Each section below distills one idea from the book's *Working with Color* chapter.

## Ditch Hex for HSL

In hex or RGB, colors that are visually related look unrelated in code — `#52ad51` next to `#a3d9a2` shares nothing readable with it. HSL describes colors the way the eye already judges them:

- **Hue** — position on the color wheel, in degrees: 0° red, 120° green, 240° blue. It's what makes two different blues both "blue".
- **Saturation** — how colorful: 0% is grey, 100% is full intensity. At 0% saturation, hue is irrelevant.
- **Lightness** — distance from black (0%) to white (100%); 50% is the pure hue.

```css
:root {
  /* same button, one readable palette */
  --brand-500: hsl(212 100% 37%);
  --brand-700: hsl(212 100% 25%);
  --brand-100: hsl(212 60% 95%);
}
```

One caution: don't confuse HSL with HSB (what most design software shows). In HSB, 100% *brightness* is only white at 0% saturation — at full saturation it equals HSL's 50% lightness. Design tools speak HSB; browsers only understand HSL, so HSL is the web's working format.

**The norm:** author colors in HSL so families and adjustments stay legible in the code.

## You Need More Colors Than You Think

Palette generators that hand you "the five perfect colors" produce sites that look like they used a palette generator. Real interfaces need a broader kit, in three categories:

| Category | What it covers | How many shades |
| --- | --- | --- |
| **Greys** | Text, backgrounds, panels, form controls — nearly everything | 8–10 |
| **Primary** | The brand color(s) behind primary actions and active states | 5–10 each |
| **Accents** | Highlights, plus semantic states: red destructive, yellow warning, green success | 5–10 each, used sparingly |

Greys run from a very dark grey (true black looks unnatural) up to white in steady increments — three or four is never enough. Primary colors need light shades for tinted alert backgrounds and dark shades for text on light backgrounds. Accents multiply if color must distinguish data series, calendar events or tags; a complex UI can legitimately reach ~10 colors × up to 10 shades.

**The norm:** build greys + primary + semantic accents, each as a multi-step ramp — not five swatches.

## Define Your Shades Up Front

Generating shades on the fly with preprocessor `lighten()`/`darken()` is how a codebase ends up with 35 indistinguishable blues. Instead, fix a ramp of shades per color once, then only ever pick from it.

A reliable procedure for one color:

1. **Base** — pick the middle shade. A good rule of thumb: the one that works as a button background. No formula decides this; eyes do.
2. **Edges** — pick the darkest and lightest with their jobs in mind: darkest usually serves as text (try it in an alert's title), lightest tints a background. An alert component exercises both at once, making it a good place to calibrate.
3. **Gaps** — fill in between. Nine steps is a nice count: label them 100–900 with base at 500. Choose 700 and 300 first as the midpoints of each half, then fill 800, 600, 400 and 200 the same way.

For greys the base matters less; start from the darkest text color and a subtle off-white background and fill the middle.

Treat the result as a strong draft, not scripture: once real designs use the ramp, tweak a saturation here and lightness there as needed — trust your eyes over the numbers. Just resist *adding* new shades; a palette without discipline is no system at all.

```js
// tailwind.config.js — one ramp, picked up front
colors: {
  brand: {
    100: "hsl(212 60% 95%)",
    300: "hsl(212 75% 80%)",
    500: "hsl(212 100% 37%)",
    700: "hsl(212 100% 25%)",
    900: "hsl(212 100% 14%)",
  },
}
```

**The norm:** hand-pick 100–900 ramps per color; adjust the ramp, never fork it.

## Don't Let Lightness Kill Your Saturation

In HSL, moving lightness away from 50% weakens what saturation delivers — the same 80% saturation reads far more colorful at 50% lightness than at 90%. Left alone, light and dark shades wash out. Compensate by **raising saturation as lightness leaves 50%** in either direction.

When the base is already near 100% saturation, use perceived brightness instead. Every hue has an inherent brightness to the eye: yellow, cyan and magenta read bright; red, green and blue read dark. So beyond adjusting lightness, you can change how bright a color *feels* by rotating hue — toward 60°, 180° or 300° to brighten; toward 0°, 120° or 240° to darken.

This is the trick that keeps yellow ramps from collapsing into dirty brown: as lightness drops, rotate the hue gradually toward orange and the dark shades stay warm and rich. Combine hue rotation with lightness adjustment as needed, but in small doses — beyond 20–30° of rotation it's a different color, not a lighter one.

**The norm:** saturation climbs toward both ends of a ramp; hue can drift a little toward bright or dark neighbors to keep intensity.

## Greys Don't Have to Be Grey

True grey is 0% saturation, but many greys you'd swear are grey carry real saturation — that's what makes some feel cool and others warm. Treat grey saturation as temperature control:

- **Cool greys**: saturate with blue.
- **Warm greys**: saturate with yellow or orange.

Whatever direction you choose, keep it consistent across the ramp — and remember to boost saturation on the lighter and darker shades (per the previous section) or the ends will look washed out next to the middle. How far to push is taste: a little tips the temperature, a lot leans the whole interface that way.

**The norm:** pick a grey temperature once and saturate the whole ramp consistently.

## Accessible Doesn't Have to Mean Ugly

The Web Content Accessibility Guidelines (WCAG) call for a 4.5:1 contrast ratio for normal text (roughly under 18 px) and 3:1 for large text. Dark-on-light usually clears this without drama; color-on-color is where it bites — white text on a brand background often needs a much darker background than expected, and a too-dark element grabs attention it shouldn't.

Two escape hatches keep both accessibility and hierarchy:

- **Flip the contrast.** Instead of white text on a dark colored fill, use dark colored text on a light tinted background. The color still identifies the element, but as support rather than spotlight.
- **Rotate the hue.** For secondary text *inside* a dark colored panel, adjusting lightness/saturation alone forces you near pure white to hit 4.5:1 — at which point primary and secondary text are indistinguishable. Since some hues read brighter than others, rotating the secondary text toward cyan, magenta or yellow buys contrast while staying colorful.

**The norm:** when contrast targets fight the hierarchy, invert the fill or bend the hue before you sacrifice either one.

## Don't Rely on Color Alone

Color enhances information; it must never be its only carrier. A red-green colorblind user can't read a dashboard where "better" is green and "worse" is red. Pair every color-coded meaning with a second signal:

- **Add an icon** — an up/down arrow next to each metric makes the direction legible without any color vision.
- **Use contrast instead of different hues** — on a multi-line chart, light vs dark versions of one hue are distinguishable where red vs green is not.

**The norm:** color supports a meaning that shape, label or contrast already carries.

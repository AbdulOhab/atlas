---
title: "Working with Images"
order: 7
summary: "Photography quality is non-negotiable, text over photos needs the image tamed first (overlay, contrast, colorize or glow), everything has a size it was drawn for, and user uploads need framing you control."
category: "Refactoring UI"
level: All levels
---

# Working with Images

Images are where "almost done" designs fall apart: a bad photo sinks an otherwise good layout, and a good photo with unreadable text on it does the same. Four norms cover the territory.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Refactoring UI is a commercial book by Adam Wathan and Steve Schoger — buy it at [refactoringui.com](https://www.refactoringui.com). Each section below distills one idea from the book's *Working with Images* chapter.

## Use Good Photos

A bad photograph ruins a design that did everything else right — there is no CSS that fixes a poorly lit, badly composed picture. If your product needs photography and nobody on the team takes great photos:

- **Hire a professional** when the photos must be specific to the project. Good photos are lighting, composition and color — years-deep skills, not camera-price skills.
- **Buy or source quality stock** when needs are generic. Paid libraries exist, and Unsplash-grade free options cover a lot of ground.

The one thing that never works: shipping placeholder images and planning to "swap in real photos later" taken on a phone. Plan the swap, and the design ends up built around images that never come.

**The norm:** treat photography as a first-class asset — professional or professional-grade stock, never "temporary" placeholders.

## Text Needs Consistent Contrast

White headline over a hero photo: readable in the photo's dark areas, swallowed in the light ones. Dark text, same problem mirrored. **The problem isn't the text — it's that the image's dynamics exceed any single text color.** Tame the image, in increasing order of invasiveness:

1. **Add an overlay.** A semi-transparent black overlay tames the light areas (helping light text); white tames the darks (helping dark text). Simple, but it moves the whole image one direction.
2. **Lower the image contrast.** Compresses the dynamic range rather than shifting it — more surgical than an overlay. Lowering contrast changes apparent brightness, so compensate with a brightness tweak.
3. **Colorize with one color.** The strongest treatment, and a way to tie hero imagery to brand colors: reduce contrast, desaturate fully, then add a solid fill with a `multiply` blend mode.
4. **Add a text glow.** Keep more of the image's life by giving the text a shadow with **no offset and a large blur** — contrast added exactly where it's needed, reading as a glow rather than a drop shadow. Pair with a mild contrast reduction of the image itself.

```css
.hero {
  background: linear-gradient(rgb(0 0 0 / 0.35), rgb(0 0 0 / 0.35)), url("hero.jpg");
}
.hero h1 {
  text-shadow: 0 0 24px rgb(0 0 0 / 0.6);
}
```

**The norm:** before styling text on a photo, compress the photo's dynamic range — overlay, de-contrast, colorize or glow.

## Everything Has an Intended Size

Bitmaps get fuzzy when scaled up — everyone knows that rule, and then breaks its subtler cousins:

- **Don't scale icons up.** SVG icons stay crisp at any size, but an icon *drawn* for 16–24 px has no detail budget for 3–4×. Blown up it reads chunky and amateur. If small icons are all you have, put each one inside a colored shape and let the shape fill the space — the icon stays near its intended size.
- **Don't scale screenshots down.** Shrinking a full-size screenshot by 70% turns your app's 16 px text into 4 px mush nobody can read. Take the screenshot at a smaller viewport (the tablet layout), give it generous space so it needs less shrinking, or show a **partial** screenshot instead of the whole app. In truly tight spots, draw a simplified mock — lines instead of text — that suggests the layout without begging to be read.
- **Don't scale icons down either.** Big icons shrunk to small turn to noise; favicons are the extreme case. A 128 px logo crushed into a 16 px tab becomes mush. Redraw a simplified mark *at* the target size so you choose the compromises instead of the browser's downsampler.

**The norm:** every asset has a design size — re-render or reframe at that size; scaling is not adaptation.

## Beware User-Uploaded Content

With user uploads you can't fine-tune contrast, crop the perfect frame or fix the colors — but you can frame them so they can't break the layout:

- **Control shape and size.** Displayed at their intrinsic aspect ratios, user images throw grids into chaos. Center each image in a **fixed container** and crop the overflow. As a background image this is one property:

```css
.avatar {
  width: 100%;
  aspect-ratio: 1;
  background-size: cover; /* fills the frame, crops the rest */
  background-position: center;
}
```

- **Prevent background bleed.** An image whose background nearly matches your page background loses its shape entirely. A visible border fights the image's own colors; a subtle **inset box shadow** does the same job invisibly:

```css
.card img {
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.06);
}
```

  If even that slight inset look is unwanted, a semi-transparent inner border works too.

**The norm:** user images live inside containers you own — fixed ratios, cover-cropping, and an invisible edge so they never dissolve into the page.

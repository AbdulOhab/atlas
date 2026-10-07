---
title: "Creating Depth"
order: 6
summary: "Make elements feel raised or inset by simulating a light source from above, use shadow size as a z-axis with an elevation system, layer two shadows per element, and fake depth in flat designs with color and overlap."
category: "Refactoring UI"
level: All levels
---

# Creating Depth

Some surfaces feel raised off the page, others pressed into it — and that reading isn't decoration. Depth tells the user what's above what, which thing will accept a drag, which layer is modal. This chapter is the physics of faking it.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Refactoring UI is a commercial book by Adam Wathan and Steve Schoger — buy it at [refactoringui.com](https://www.refactoringui.com). Each section below distills one idea from the book's *Creating Depth* chapter.

## Emulate a Light Source

The whole trick rests on one physical habit: **light comes from above**, and your brain decodes edges accordingly. Look at a raised door panel — its top edge is lighter (angled toward the sky), its bottom edge darker (angled away). An inset cabinet panel is the mirror image: dark at the top (the lip above blocks light), light at the bottom. Only a raised or recessed shape can produce those orientations, so that's what you see — even in a flat rectangle.

To apply it, decide the profile an element should have, then paint the light a real object with that profile would catch. Since people look slightly down at screens, show a little of the top edge and hide the bottom.

**A raised button** (flat top and bottom faces):

1. Lighten the top edge — a top border or an inset shadow with a small positive vertical offset. Hand-pick the lighter color rather than overlaying translucent white, which leaches saturation.
2. Block the light below — a small, *sharp-edged* dark shadow with a slight downward offset and only a couple of pixels of blur. Real raised edges cast crisp shadows; look at the bottom of a wall outlet.

```css
.btn-raised {
  background: hsl(212 100% 37%);
  box-shadow:
    inset 0 1px 0 hsl(212 100% 45%),   /* lit top edge    */
    0 2px 2px hsl(212 100% 12% / 0.4); /* occlusion below */
}
```

**An inset well** (a recessed area, like a text input):

1. Lighten the *bottom* edge — the only lip visible from above — via a bottom border or an inset shadow with negative vertical offset.
2. Darken the top inside — a small dark inset shadow with slight positive offset, so the shadow above doesn't bleed out the bottom.

```css
.well {
  background: hsl(212 20% 96%);
  box-shadow:
    inset 0 -1px 0 hsl(0 0% 100%),    /* lit bottom lip  */
    inset 0 2px 2px hsl(212 30% 40% / 0.15); /* shade from above */
}
```

Resist photorealism: borrow enough cues to place the element, and stop. Over-simulated interfaces turn busy and unclear.

**The norm:** light from above — raised things are light on top and shadowed below; inset things the reverse.

## Use Shadows to Convey Elevation

Beyond any single effect, shadows position elements on a virtual z-axis. A small, tight-blurred shadow lifts an element slightly; a large, soft one floats it near the user — and the closer something feels, the more attention it draws. Map shadow size to the role:

| Elevation | Shadow | Fits |
| --- | --- | --- |
| Low | Small, tight | Buttons, cards at rest |
| Medium | Larger, softer | Dropdowns, popovers |
| High | Large, very soft | Modals — maximum focus |

Define an **elevation system** like any other: fix the smallest and largest, fill the middle with roughly linear steps. Five options is usually plenty.

Shadows also narrate interaction. A list item that gains a shadow on click pops forward — suddenly it reads as *held*, which is exactly what draggable wants. A button that drops to a smaller (or zero) shadow on `:active` feels pressed into the page:

```css
.drag-item:active { box-shadow: 0 8px 16px rgb(0 0 0 / 0.2); }
.btn:active       { box-shadow: 0 1px 1px rgb(0 0 0 / 0.2); }
```

Don't ask "what shadow looks nice here" — ask "where on the z-axis does this sit", and assign the shadow that answers it.

**The norm:** shadow = altitude. Assign it by role in the interface, from a fixed scale.

## Shadows Can Have Two Parts

Well-crafted shadows on polished sites are usually **two shadows doing two jobs**:

1. **Ambient** — larger and softer, with a considerable vertical offset and blur. The shadow the object casts behind itself from a direct light source.
2. **Contact** — tighter and darker, small offset and blur. The shadowed zone directly under the object where even ambient light barely reaches.

```css
.card {
  box-shadow:
    0 1px 2px  rgb(0 0 0 / 0.35),  /* contact: crisp, close  */
    0 8px 24px rgb(0 0 0 / 0.15);  /* ambient: soft, distant */
}
```

Splitting them gives control a single shadow can't: the ambient shadow stays subtle while the contact shadow keeps the edges defined.

Physics adds one more rule: lift an object off your desk and the contact shadow disappears while the ambient one persists. So in your elevation scale, keep the contact shadow **distinct at the lowest elevations and nearly (or fully) invisible at the highest**.

**The norm:** two shadows per elevated element — crisp contact plus soft ambient — with contact fading out as elevation rises.

## Even Flat Designs Can Have Depth

Flat design drops shadows, gradients and other light simulation, but the best flat designs still convey depth — through color and geometry:

- **Color as altitude.** Lighter tones feel closer, darker tones further. Make a surface lighter than the page background to raise it, darker to sink it — no effects needed. This works in non-flat designs too; color is just another depth tool.
- **Solid offset shadows.** A short, vertically-offset shadow with **zero blur** lifts a card or button off the page while staying unmistakably flat:

```css
.card-flat {
  background: white;
  box-shadow: 0 4px 0 hsl(212 50% 20%); /* hard edge, no blur */
}
```

**The norm:** flat is a rendering style, not a ban on depth — tone and hard offsets carry the z-axis.

## Overlap Elements to Create Layers

The strongest depth cue is simple overlap — elements crossing a boundary implies layers that continue behind each other:

- Offset a card so it straddles the transition between two backgrounds instead of sitting inside one.
- Make an element taller than its parent so it pokes out on both sides.
- Overlap at component scale too — carousel controls half-over the slides read as floating above them.

**Overlapping images** clash easily where they meet. Give each one an "invisible border" matching the background color, and every overlap shows a clean gap instead of a collision — layers, without the fight.

**The norm:** let elements cross boundaries (with a background-colored seam for images) and the layers assemble themselves.

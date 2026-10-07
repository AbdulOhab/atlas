---
title: "Starting from Scratch"
order: 1
summary: "How to begin a design without getting stuck: build one real feature before the shell, defer detail, work in short design-build cycles, pick a personality, and constrain every decision with systems."
category: "Refactoring UI"
level: All levels
---

# Starting from Scratch

The opening chapter of Refactoring UI is about process, not pixels: what to design first, how much detail to invest in before building, and how to stop low-level decisions from paralyzing you.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Refactoring UI is a commercial book by Adam Wathan and Steve Schoger — buy it at [refactoringui.com](https://www.refactoringui.com). Each section below distills one idea from the book's *Starting from Scratch* chapter.

## Start With a Feature, Not a Layout

The fastest way to get stuck on a new design is to start with the app's shell: top nav or sidebar, left or right items, where the logo goes. An app is a collection of features, and until a few features exist you don't have the information those shell decisions need. The shell follows from the content, not the other way round.

Start with one piece of real functionality instead. For a flight booking service, that means the search form: departure city, destination, dates, and a search button. Design that, then let the navigation and layout grow around what the features turn out to need. Google shipped for years as little more than a logo and one input — the shell was never the point.

**The norm:** when starting out, design the smallest concrete feature, not the chrome around it.

## Detail Comes Later

In the earliest stage of a design, low-level decisions — typeface, shadows, icons — don't matter yet, and obsessing over them slows you down. Two tactics keep the detail out until it's wanted:

- **Design with a thick marker.** Jason Fried's trick: sketch on paper with a Sharpie. Fine detail is physically impossible, so you explore layouts instead of kerning.
- **Hold the color.** Even at higher fidelity, design in grayscale first. Without color to lean on, spacing, contrast and size have to carry the hierarchy — and the result is a stronger skeleton that color later enhances rather than rescues.

Wireframes and sketches are disposable. Users can't do anything with a static mockup; use them to decide, then build the real thing as early as possible.

**The norm:** explore structure in grayscale and low fidelity; earn the detail by building.

## Don't Design Too Much

Trying to design every feature and every edge case up front — 2,000 contacts, where the error goes, two calendar events in one slot — is guesswork in the abstract, and the guesses are usually wrong.

Instead, work in short cycles: design a simple version of the next feature, build it, hit the real complexity in a working interface where it's cheap to fix, iterate, then move to the next feature. Design problems are far easier to solve in something you can actually click than in imagination.

Be a pessimist about scope: don't imply functionality you aren't ready to build. If file attachments on comments turn out to be expensive, a comments feature that ships without them beats a designed-but-unfinished one that ships nothing. Design the smallest useful version; nice-to-haves get designed when they're actually next.

**The norm:** design one simple version, build it, then iterate — and never design a feature you can't ship.

## Choose a Personality

Every design has a personality — a bank wants to read as secure and professional, a trendy startup as playful — and it comes from a handful of concrete, chooseable factors:

| Factor | Serious / classic | Playful | Neutral |
| --- | --- | --- | --- |
| Typeface | A serif | A rounded sans serif | A neutral sans serif |
| Color | Blue (safe, familiar) | Pink | Gold reads expensive |
| Border radius | None (formal) | Large | Small |
| Language | Official tone | Casual, friendly | — |

Consistency matters more than the specific choice: mixing square and rounded corners in one interface almost always looks worse than committing to either. Words count as much as visuals here — the copy's tone is part of the design.

If you don't have a gut feel, look at the sites your target users already visit and aim nearby — but don't borrow so directly from competitors that you look like a second-rate copy of them.

**The norm:** pick the personality once — font, color, radius, tone — and apply it consistently everywhere.

## Limit Your Choices

Unlimited options turn every minor decision into torture: 12px or 13px, 10% or 15% shadow opacity, 24px or 25px avatars. When two choices are both fine, confidence is impossible — and many near-identical blues are indistinguishable anyway.

The fix is to define systems in advance and decide by elimination:

- Pick 8–10 shades of each color up front instead of opening the color picker per decision.
- Define a type scale instead of nudging font sizes one pixel at a time.
- To choose a value (say an icon size) from a constrained scale like 12/16/24/32: guess (16), compare the neighbors (12 and 24), and the outsiders usually eliminate themselves. If an outer option wins, re-center on it and compare once more.

Systematize everything that repeatedly costs you a decision: font size, font weight, line height, color, margin, padding, width, height, shadows, border radius, border width, opacity. You don't need all of them on day one — build them as the decisions recur, and never make the same minor decision twice.

**The norm:** decide once, in advance, as a scale — then pick from the menu.

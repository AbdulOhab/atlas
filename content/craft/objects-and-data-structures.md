---
title: "Objects and Data Structures"
order: 6
summary: "Objects hide data and expose behavior; data structures expose data — the anti-symmetry between them, the Law of Demeter, and when to choose which."
category: "Clean Code"
level: All levels
---

# Objects and Data Structures

Chapter 6 of *Clean Code* draws a line most code blurs: objects and data structures are opposites, and knowing which you're writing decides how change reaches you.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Clean Code is a commercial book by Robert C. Martin — buy it at [cleancoder.com](https://cleancoder.com). Each topic below distills one idea from the book's sixth chapter.

## Data Abstraction Is Not Getters and Setters

Hiding implementation is about *abstraction*, not accessors. A class should expose an interface that lets you manipulate the *essence* of the data — a fuel level as a percentage, a point in whichever representation fits — without revealing its representation. Slapping getters and setters on every field is the worst of both worlds: the data is effectively public, and no abstraction was added.

**The norm:** expose behavior over the essence; never expose the representation.

## The Data/Object Anti-Symmetry

- **Objects** hide their data behind abstractions and expose functions that operate on that data. Easy to add new kinds; hard to add new functions (every class changes).
- **Data structures** expose their data and have no meaningful behavior. Easy to add new functions; hard to add new kinds (every structure changes).

The two are virtual opposites, and every design decision bends around this symmetry. "Everything must be an object" is a myth: procedural code over plain structures is the right tool when new functions will keep arriving; objects are right when new types will keep arriving. Mature developers pick per situation.

**The norm:** name which side of the anti-symmetry you're on, and why.

## The Law of Demeter

A method may call methods of: its own class, objects it created, objects passed as arguments, and objects held in its class's instance variables — and nothing else. Talk to friends, not strangers. The classic violation is the train wreck:

```js
// reaching through three strangers
const path = context.getOptions().getScratchDir().getAbsolutePath();
```

Whether a chain of accessors actually violates Demeter is subtler: if the things traversed are *data structures* with no behavior, the chain is just navigation; if they're objects, each link pries into internals. The clean fix is to hide structure — tell the object to *do* something (`context.createScratchFileStream(fileName)`) instead of asking it for its internals to manipulate.

**The norm:** one dot is a habit; a chain of dots is a design question.

## Hybrids, DTOs and Active Records

**Hybrids** — structures with both meaningful functions and exposed variables — have the worst of both worlds: hard to add functions *and* hard to add data structures. Avoid them; they exist because authors hoped for both safety and convenience and got neither.

**DTOs** (classes with public variables and no functions) are honest and useful for database rows and wire formats. Bean-style private-variables-plus-getters adds quasi-encapsulation and little else. **Active records** — DTOs with `save` and `find` — should stay data structures: don't hang business rules on them; create separate objects that hold the rules.

**The norm:** pick a side per type — behavior-hiding object or honest data holder — and don't breed hybrids.

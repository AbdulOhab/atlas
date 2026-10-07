---
title: "Error Handling and Boundaries"
order: 7
summary: "Handle errors without obscuring logic: try/catch first, unchecked exceptions, no nulls — then keep third-party code behind boundaries you control."
category: "Clean Code"
level: All levels
---

# Error Handling and Boundaries

Chapters 7 and 8 of *Clean Code* cover the two places code meets the uncontrolled: failures inside, and other people's APIs outside.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Clean Code is a commercial book by Robert C. Martin — buy it at [cleancoder.com](https://cleancoder.com). Each topic distills ideas from the book's seventh and eighth chapters.

## Use Exceptions Rather Than Return Codes

Error handling is important, but if it obscures the logic, it's wrong. Return codes and error flags force every caller to check-and-branch immediately, burying the happy path. Exceptions let the algorithm read cleanly and the failure handling sit separately, where it can be understood on its own.

**The norm:** the happy path stays happy; failures live apart.

## Write Try/Catch First, and Use Unchecked Exceptions

A `try` block is a transaction: the `catch` must leave the program in a consistent state. So write the try-catch-finally *first* — a test that forces the exception, then the scope — and implement the rest as if nothing can go wrong. If a function contains `try`, error handling is its one thing: nothing after the `catch`.

Prefer unchecked exceptions. Checked ones violate open-closed: a change deep in the stack cascades signature changes up every caller and breaks encapsulation — the dependency costs more than the safety in application code.

**The norm:** scope the failure first; let exceptions travel unchecked.

## Context, Exception Classes and the Normal Flow

- **Provide context:** an informative message naming the operation that failed and the failure type turns a stack trace into a diagnosis.
- **Define exception classes by how they're caught:** wrap a third-party API in one class that translates its many exceptions into one of yours — fewer dependencies, easy mocking, and vendor design choices stay contained. Often one exception class with distinguishing fields is enough.
- **Define the normal flow:** special cases belong in their own objects (the special case pattern) so client code never litters itself with `if (expense.isMeal())` — it just works with a per-diem.

**The norm:** exceptions answer a caller's need, not a vendor's taxonomy.

## Don't Return Null, Don't Pass Null

One missed null check can spin an application out of control — so return an exception, a special-case object, or an **empty collection** instead of `null` (and wrap third-party calls that return it). Passing `null` into an API is worse: there is no good response to it, so treat a null argument as a bug and forbid it by default.

**The norm:** empty, not absent; a null in an argument list is a defect.

## Boundaries: Third-Party Code Wants Something Different

Library providers design for broad applicability; you want a focused interface — `Map` offers far more than any application wants, forcing casts and surprises everywhere. So keep boundary interfaces (maps, vendor types) *inside* the class or small family of classes where they're used, hidden behind an interface you designed (a `Sensors` wrapper around a raw telemetry map). The boundary can then change with almost no blast radius.

**The norm:** your code depends on your interface; the vendor code exists behind it.

## Learning Tests and the Adapter Seam

Instead of experimenting inside production code, write **learning tests** — small tests that call the third-party API the way you expect to use it. They cost nothing extra (you had to learn the API anyway), and when a new library release lands, running them immediately detects behavior changes. Keep those outbound tests around: they're the reason you can upgrade.

When you must write code against something that doesn't exist yet, define your own interface — the one you *wish* you had — keep the client code clean against it, and bridge with an adapter later. The adapter also gives you a seam for testing with a fake. Interesting things happen at boundaries, chiefly change: depend on what you control, or it will control you.

**The norm:** learning tests guard every boundary; never code against a vendor type directly.

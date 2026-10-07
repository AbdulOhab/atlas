---
title: "Unit Tests"
order: 8
summary: "Tests are code too: the three laws of TDD, the build-operate-check structure, one concept per test, and the F.I.R.S.T. properties that keep the suite alive."
category: "Clean Code"
level: All levels
---

# Unit Tests

Chapter 9 of *Clean Code*: test code deserves the same care as production code, because without clean tests everything rots.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Clean Code is a commercial book by Robert C. Martin — buy it at [cleancoder.com](https://cleancoder.com). Each topic below distills one idea from the book's ninth chapter.

## The Three Laws of TDD

1. **Don't write any production code except to pass a failing test.**
2. **Don't write more of a test than is sufficient to fail** — and not compiling is failing.
3. **Don't write more production code than is sufficient to pass the currently failing test.**

Run together, they lock development into a ~30-second cycle: test a little, code a little, test a little. The discipline feels restrictive and is precisely what keeps every line of production code covered from birth.

**The norm:** no red test, no production code — in that order.

## Dirty Tests Are Worse Than No Tests

Test code is as important as production code: it takes thought, design and care. As production code evolves, dirty tests fall behind, get "temporarily" disabled, and are finally deleted — and then the production code has no safety net, so nobody dares change it, and it rots.

Clean tests *enable* the -ilities: with a trustworthy suite you lose the fear of change, which is what makes code flexible, maintainable and reusable in practice.

**The norm:** the suite is the reason change is cheap; guard it like production code.

## Readable Tests: Build, Operate, Check

What makes a clean test? Readability, readability, readability — more than anything else. The classic structure: **build** the test data, **operate** on it, **check** the result, with the three phases clearly separated and every obfuscating detail (path parsing, response casting) pushed into helpers.

Build a **domain-specific testing language**: a thin layer of well-named functions over the system API that test code refactors into, so tests say what they mean. Tests also get a **dual standard**: they may trade memory and CPU for simplicity (string concatenation, cryptic-but-short state strings) — that's a convenience choice, never a license for dirt.

**The norm:** each test reads in three beats and says what it means.

## One Assert, One Concept

Keep the number of asserts per test minimal so each test comes to a single conclusion — given-when-then naming expresses it. The *real* rule behind the guideline is **one concept per test**: a long test that checks three unrelated behaviors is three tests in a trench coat. Multiple asserts on one concept are fine; splitting when artificial is noise.

**The norm:** one test, one concept, one conclusion.

## F.I.R.S.T.

Clean tests are:

| Property | Meaning |
| --- | --- |
| **Fast** | Run quickly, or you won't run them — and unrun tests rot. |
| **Independent** | No ordering, no cascading failures; each test stands alone. |
| **Repeatable** | In any environment: production, QA, your laptop. |
| **Self-validating** | Boolean pass or fail — nobody reads logs to decide. |
| **Timely** | Written just before the production code, or the code turns out untestable. |

Let the tests rot and the code will follow. Keep them clean and they preserve the design's flexibility forever.

**The norm:** F.I.R.S.T. is the checklist; readability is the point.

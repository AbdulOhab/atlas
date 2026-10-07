---
title: "Functions"
order: 3
summary: "The heart of clean code: small functions that do one thing, few arguments, no side effects, exceptions over error codes — and writing them in two passes."
category: "Clean Code"
level: All levels
---

# Functions

Chapter 3 of *Clean Code* is the longest, because functions are where good and bad code visibly separate.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Clean Code is a commercial book by Robert C. Martin — buy it at [cleancoder.com](https://cleancoder.com). Each topic below distills one idea from the book's third chapter.

## Small!

Functions should hardly ever be 20 lines; two to four is the ideal. Blocks inside `if`/`else`/`while` should be one line long — a function call — which keeps nesting shallow and the enclosing function honest. An indent level of more than one or two per function is a smell.

Small functions fall out of this naturally: a function that fits on a screen tells its whole story at once.

**The norm:** default to tiny; grow a function only when splitting would obscure, not clarify.

## Do One Thing

**Functions should do one thing. They should do it well. They should do it only.** "One thing" means steps one level below the function's name — no more. The test: can you extract another function with a name that isn't just a restatement of the current one? Then the current function was doing more than one thing. Sections inside a function (declarations, then a loop, then a sieve) are the same smell wearing sections.

Read top-to-bottom, each function reads like a paragraph: "To render a page, we check the test suite, and if it passes we include the setup; in either case we render the HTML." That's the stepdown rule — every function followed by the functions one level below it, so a file reads as descending detail.

**The norm:** one function, one level of abstraction, one paragraph of story.

## Switch Statements

A `switch` is hard to make small: it does N things and every new type forces edits everywhere. Tolerate one only when it appears once, creates polymorphic objects, and hides behind an inheritance relationship (an abstract factory) — so the rest of the system never sees branching and adding a type touches one file.

**The norm:** bury the switch once; polymorphism handles the rest.

## Descriptive Names and Few Arguments

Long descriptive names beat long descriptive comments, and consistent phraseology makes function sequences read like sentences. Arguments cost the most: the ideal is zero, then one, then two — avoid three, and never more without special justification. Each argument is a concept the reader must hold and a test combination to cover.

- **Flag arguments are ugly:** passing `true` proclaims the function does two things. Split it in two.
- **Dyadic pain:** `assertEquals(expected, actual)` invites order mix-ups; reduce two arguments via member variables, methods on the argument, or a new class.
- **Wrap co-occurring arguments** into an object: `makeCircle(Point center, double radius)` instead of four coordinates.
- **Verb and keyword:** function names should pair with their arguments (`writeField(name)`), and keyword-style names (`assertExpectedEqualsActual`) make order self-enforcing.

**The norm:** count the arguments before shipping; every one needs a reason.

## No Side Effects

A side effect is a lie: the function promises one thing (check the password) and secretly does another (initialize the session) — creating temporal coupling where callers must remember the hidden order. Likewise, **output arguments** make readers double-take; in an object-oriented language `this` is the output argument, so if a function must change state, it changes the state of its owning object.

Follow command–query separation: a function either *does* something or *answers* something — never both. `set("username", "unclebob")` inside an `if` is ambiguous: is it setting, or asking?

**The norm:** the name is the contract; hidden state changes break it.

## Prefer Exceptions, and Don't Repeat Yourself

Error codes force immediate handling at every call site and nest the happy path inside checks. Exceptions separate error processing from the happy path: extract the `try`/`catch` bodies into their own functions, and let error handling be *one thing* — if a function contains `try`, it should be the first word and nothing should follow the `catch`. Error-code enums are dependency magnets: every module imports them, and adding one recompiles the world. Exceptions (derivatives of a base type) can be added without redeploying anything else.

Duplication is the root of all evil in software — most design practices (structured programming, object-orientation, database normal forms) are strategies for eliminating it. And don't cling to Dijkstra's one-entry-one-exit rule for small functions: multiple returns and `break` are fine once functions are tiny; `goto` remains unacceptable.

**The norm:** exceptions for errors, `this` for output, zero duplication.

## Nobody Writes Clean Functions First Time

The real workflow: write the rough draft — long, messy, nested. Then pass a suite of unit tests while you whittle it: extract functions, rename, collapse duplication, re-order. Each pass leaves behavior identical and the function smaller. Master programmers write functions as the verbs and classes as the nouns of a domain-specific language everyone else reads.

**The norm:** draft, then refine under tests — clean is an edit, not a first attempt.

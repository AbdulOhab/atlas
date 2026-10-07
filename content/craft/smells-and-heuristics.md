---
title: "Smells and Heuristics"
order: 11
summary: "The book's closing checklist: every smell by category — comments, environment, functions, general, Java, names, tests — as a code-review reference."
category: "Clean Code"
level: Advanced
---

# Smells and Heuristics

Chapter 17 of *Clean Code* is the book as a checklist: one annotated list of smells and heuristics, organized by category. This module is that reference — the taxonomy to keep open during a code review.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Clean Code is a commercial book by Robert C. Martin — buy it at [cleancoder.com](https://cleancoder.com). The list below condenses the book's final chapter.

## Comments and Environment

**Comments:** C1 inappropriate information (changelogs and authorship belong to source control, not files) · C2 obsolete comment (drifts into misdirection — update or delete) · C3 redundant comment (restates the code, less precisely) · C4 poorly written comment (worth writing means worth writing well) · C5 commented-out code (delete it; source control remembers).

**Environment:** E1 build requires more than one step (one command to build) · E2 tests require more than one step (one button to run them all).

## Functions

F1 too many arguments (zero best; more than three, with prejudice) · F2 output arguments (change the owning object's state instead) · F3 flag arguments (the function does two things — split it) · F4 dead function (never called — delete).

## General, Part One: Structure

G1 multiple languages in one source file · G2 obvious behavior unimplemented (least surprise) · G3 incorrect behavior at the boundaries (test every edge; don't trust intuition) · G4 overridden safeties (disabled warnings and tests are Chernobyl packaging) · G5 duplication (methods for identical code, polymorphism for repeated switches, template method for similar algorithms) · G6 code at wrong abstraction level · G7 base classes depending on their derivatives · G8 too much information (small, tight interfaces) · G9 dead code (burial, not preservation).

G10 vertical separation (declare where used) · G11 inconsistency (do similar things the same way) · G12 clutter (empty constructors, unused variables, uninformative comments) · G13 artificial coupling (things that don't depend on each other, coupled for convenience) · G14 feature envy (methods belong with the data they envy) · G15 selector arguments (many functions pretending to be one) · G16 obscured intent (run-on expressions, Hungarian, magic numbers) · G17 misplaced responsibility (code goes where a reader expects it) · G18 inappropriate static (static only if it never needs polymorphism).

## General, Part Two: Discipline

G19 use explanatory variables · G20 function names should say what they do · G21 understand the algorithm (passing tests isn't enough — refactor until it's obvious) · G22 make logical dependencies physical (ask the collaborator for its constant, don't hard-code it) · G23 prefer polymorphism to if/else or switch/case (the one-switch rule) · G24 follow standard conventions (team standard, industry-based) · G25 replace magic numbers with named constants · G26 be precise (floats for currency, assumed-unique matches and skipped null checks are all imprecision) · G27 structure over convention (enforce with abstract methods, not naming promises).

G28 encapsulate conditionals (`shouldBeDeleted(timer)` reads; the raw boolean doesn't) · G29 avoid negative conditionals · G30 functions should do one thing · G31 hidden temporal couplings (make call order structural) · G32 don't be arbitrary (every structure has a stated reason) · G33 encapsulate boundary conditions (the +1s and −1s live in one place) · G34 functions should descend only one level of abstraction (the hardest rule — and the one that catches real bugs) · G35 keep configurable data at high levels · G36 avoid transitive navigation (law of Demeter; write shy code).

## Java, Names and Tests

**Java:** J1 avoid long import lists by using wildcards · J2 don't inherit constants · J3 constants versus enums (enums win — they can carry methods, so meaning can't detach).

**Names:** N1 choose descriptive names (90% of readability) · N2 choose names at the appropriate level of abstraction (don't communicate implementation) · N3 use standard nomenclature where possible · N4 unambiguous names · N5 use long names for long scopes · N6 avoid encodings (`m_`, `f_`) · N7 names should describe side effects (`createOrReturnOos`, not `create`).

**Tests:** T1 insufficient tests (test everything that could possibly break) · T2 use a coverage tool · T3 don't skip trivial tests (cheap, documentary) · T4 an ignored test is a question about an ambiguity · T5 test boundary conditions (the middle is easy; edges lie) · T6 exhaustively test near bugs (bugs congregate) · T7 patterns of failure are revealing (how cases fail diagnoses the code) · T8 test coverage patterns can be revealing · T9 tests should be fast (slow tests get dropped first).

## The List Is Not the Point

The book closes on the warning that matters: clean code is not produced by following rules. This checklist detects smells; eliminating them requires the value system behind the rules — professionalism and craftsmanship, applied continuously. The wristband, once earned, you can't morally take off.

**The norm:** use the list to name what you feel is wrong; use the discipline to fix it.

---
title: "Formatting"
order: 5
summary: "Formatting is communication: the newspaper metaphor, vertical rules (distance, density, ordering), horizontal rules, and why the team's style beats yours."
category: "Clean Code"
level: All levels
---

# Formatting

Chapter 5 of *Clean Code*: code formatting is not aesthetics — it's how the structure of a system is communicated to the next reader.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Clean Code is a commercial book by Robert C. Martin — buy it at [cleancoder.com](https://cleancoder.com). Each topic below distills one idea from the book's fifth chapter.

## The Purpose of Formatting

Formatting is about communication, and communication is the professional developer's first order of business. Today's style sets a precedent that outlives the code it styled: a file reformatted wholesale in a future change buries the real diff. Choose deliberately, once, as a team.

**The norm:** format for the reader and the diff, not for yourself.

## Vertical Formatting: The Newspaper Metaphor

Keep source files small — real systems have been built from files mostly around 200 lines, max about 500. A file should read like a newspaper article: the name tells you whether you're in the right place, the top holds the highest-level concepts and algorithms, and detail increases as you scroll down until the lowest-level functions at the bottom.

**The norm:** headline at the top, details below; nobody starts a story mid-sentence.

## Vertical Density and Distance

Blank lines separate concepts; tightly related lines should sit densely together. Distance is the rule with teeth: **concepts that are closely related belong vertically close** —

- Local variables appear as close to their first use as possible.
- Control variables live in the loop statement itself.
- Instance variables sit in one well-known place at the top of the class, so everyone knows where to look.
- Dependent functions sit close together, with the caller above the callee.
- Conceptually affine code (shared naming, similar operations) wants closeness too.

Every hop the reader makes to another file or screenful costs understanding — that's also a good reason to avoid `protected` variables, which scatter a class's state across its derivatives.

**The norm:** related code is near code; declare on first use.

## Vertical Ordering and Horizontal Style

Call dependencies should point downward: a called function sits *below* its caller, so the file reads top-down from important to detail.

Horizontally, keep lines short (around 120 characters at most). Use white space to associate what belongs together — no space between a function name and its opening parenthesis — and to disassociate what doesn't — spaces around assignment and binary operators. Don't align assignments and declarations into columns: alignment emphasizes the wrong thing, and a long enough list to need alignment means the class should split. Indentation makes scope visible; never collapse an `if` body onto the same line, and brace dummy scopes with the semicolon on its own line.

**The norm:** callers above callees; white space shows the structure the syntax hides.

## Team Rules

On a team, a single agreed style beats every individual preference — a codebase whose files read differently is a codebase nobody can skim. The team decides once (the book's example took ten minutes) and a formatter enforces it forever. The best coding-standard document is a well-written source file itself: point at it instead of a rulebook.

**The norm:** one style per repository, machine-enforced; the code is the standard.

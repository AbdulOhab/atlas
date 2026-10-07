---
title: "Meaningful Names"
order: 2
summary: "Names are 90% of readability: reveal intent, avoid disinformation and encodings, pick one word per concept, and never make the reader translate."
category: "Clean Code"
level: All levels
---

# Meaningful Names

Chapter 2 of *Clean Code*: every variable, function and class is named, so naming discipline is the cheapest code-quality lever there is.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Clean Code is a commercial book by Robert C. Martin — buy it at [cleancoder.com](https://cleancoder.com). Each topic below distills one idea from the book's second chapter.

## Use Intention-Revealing Names

A name should answer three questions: why it exists, what it does, and how it is used. If a name needs a comment to explain it, the name failed. `int d` means nothing; `elapsedTimeInDays` means everything. `theList` becomes `gameBoard` once the name says what the thing is, and suddenly the code explains its own game.

Renaming is the cheapest refactoring there is, and it pays off on the very next read.

**The norm:** if a name needs explanation, change the name — not the reader.

## Avoid Disinformation

Some names actively lie: calling a group `accountList` when it is not a `List` sends readers hunting for the wrong type; `hp`, `aix` and `sco` read as platform names; `l` and `O` are indistinguishable from `1` and `0`. Names that differ by one character invite wrong-file edits. Noise words are softer lies — `ProductInfo` versus `ProductData` distinguishes nothing; `moneyAmount` adds nothing to `money`.

**The norm:** say exactly what the thing is; never borrow vocabulary that implies something else.

## Make Meaningful Distinctions

When two things must differ, their names must say *how*. Number-series names (`a1`, `a2`) and noise-word pairs (`customer`/`customerInfo`, `theMessage`/`message`) dodge the question instead of answering it — the reader can't tell which to use without reading both. If the difference is real, name the difference; if it isn't, delete one.

**The norm:** replace noise words and numbering with the actual distinction.

## Pronounceable and Searchable

Programming is a social activity: `genymdhms` ("gen why em dee aych em ess") makes conversation absurd, while `generationTimestamp` speaks. Searchability matters just as much — a name like `WORK_DAYS_PER_WEEK` can be grepped across a codebase; the literal `5` cannot, and a single-letter name matches everywhere.

Single-letter names are acceptable only as locals in very short methods, and name length should grow with scope: `i` is fine in a five-line loop.

**The norm:** sayable in conversation, findable with grep, sized to its scope.

## Avoid Encodings and Mental Mapping

Hungarian notation, `m_` and `f_` member prefixes are leftovers from compilers that forgot types — modern environments highlight members and infer types, so the encodings are pure clutter. Interfaces don't need an `I` prefix either; if you must mark the implementation, put the suffix there (`ShapeFactoryImp`), leaving the interface with the clean name.

Readers should never have to translate names into something else in their heads: a loop over coordinates named `x`/`y` is fine by convention, but a variable called `r` that secretly holds the URL with an adjective stripped is mental mapping.

**The norm:** spell it out; the compiler forgot Hungarian decades ago.

## Classes, Methods and One Word per Concept

Class names are noun phrases — `Customer`, `AddressParser` — never verbs, and suspicious if they need weasel words like `Manager`, `Processor`, `Data` or `Info`. Method names are verb phrases — `postPayment`, `deletePage` — with accessors, mutators and predicates prefixed `get`, `set`, `is`; overloaded constructors get replaced by descriptive static factory names.

Pick **one word per concept**: `fetch`, `retrieve` and `get` for the same operation across classes forces dictionary lookup. And don't pun: `add` must mean "adds" in the same sense everywhere — a method that inserts a value or appends a line needs `insert` or `append`, because two different operations sharing one verb is how bugs get invited.

Reach for solution-domain names programmers know (`AccountVisitor`, `JobQueue`) first, problem-domain names when computer science has no term. Add context where it clarifies (`addrFirstName`, or better an `Address` class) but skip gratuitous prefixes on every name in a project.

**The norm:** consistent verbs per concept, precise nouns for things; precision beats cleverness.

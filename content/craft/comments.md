---
title: "Comments"
order: 4
summary: "Comments are a failure to express yourself in code: the good ones (intent, warnings, consequences), the bad ones (noise, journals, commented-out code), and the only good comment."
category: "Clean Code"
level: All levels
---

# Comments

Chapter 4 of *Clean Code* takes a hard line: comments are, at best, a necessary evil — code that *doesn't need* them is the goal.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Clean Code is a commercial book by Robert C. Martin — buy it at [cleancoder.com](https://cleancoder.com). Each topic below distills one idea from the book's fourth chapter.

## Comments Do Not Make Up for Bad Code

The older a comment, the more likely it is wrong — code changes, comments can't follow. Inaccurate comments are far worse than none, because the only source of truth in software is the code. So the first instinct when tempted to comment is not to write a better comment: it's to write better code.

```js
// Before: comment propping up an expression
// Check whether the employee is eligible for full benefits
if ((employee.flags & HOURLY_FLAG) && employee.age > 65)

// After: explain yourself in code
if (employee.isEligibleForFullBenefits())
```

**The norm:** before writing a comment, try renaming or extracting instead.

## Good Comments

A short list of comments that earn their place:

- **Legal** — copyright and license headers where policy requires them.
- **Informative** — the format of a regexp value or a note about the unit; though renaming often beats this too.
- **Explanation of intent** — *why* a decision was made, when the code can't say.
- **Clarification** — translating an obscure return value of code you can't change (risky: verify it stays true).
- **Warning of consequences** — "this test takes an hour"; "this formatter isn't thread-safe".
- **TODO** — a job the programmer knows should be done; not an excuse for bad code, and worth scanning and clearing regularly.
- **Amplification** — stressing that something inconsequential-looking really matters.
- **Javadoc in public APIs** — genuinely helpful for library consumers, still subject to every rule on this page.

**The norm:** a good comment carries information code cannot.

## Bad Comments

The rogues' gallery, most of which you've seen this week:

- **Mumbling** — the author talking to themselves; any comment that forces you elsewhere for meaning has failed.
- **Redundant** — restating what the code already says, only less precisely.
- **Misleading** — a subtly wrong claim sends the next reader debugging in the wrong direction.
- **Mandated** — house rules demanding a doc comment on every function produce boilerplate, not documentation.
- **Journal and noise** — change logs at the top of files (source control owns history); "default constructor" captions; copy-pasted doc blocks with the wrong names ("scary noise").
- **Position markers and closing-brace comments** — banner lines and `} // while`; shorten the function instead.
- **Commented-out code** — odious: the next reader won't dare delete it, so it rots forever. Delete it; source control remembers.
- **HTML and nonlocal information** — markup belongs to the doc tool; a comment describing a distant part of the system doesn't belong here.
- **Function headers** — a good short name beats a header.

**The norm:** if the comment repeats, decorates or apologizes for code, delete it.

## The Only Good Comment Is the One You Didn't Write

The chapter's summary of itself: every comment is a failure to express the idea in code — some failures are unavoidable (legal text, intent, warnings), most are not. Express the idea in a name, a function, a type; write the comment only when the code genuinely cannot carry it.

**The norm:** treat every comment as a debt you must justify.

---
title: "Big O for Interviews"
order: 15
summary: "The interview version of complexity: industry conventions, add-versus-multiply, amortized time, recursive runtimes, and the worked-example traps candidates fall into."
category: "Interviews"
level: All levels
---

# Big O for Interviews

Section VI of *Cracking the Coding Interview*: what "big O" means in a hiring loop — which is not quite what academia means by it.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Cracking the Coding Interview is a commercial book by Gayle Laakmann McDowell — buy it at [careercup.com](https://www.careercup.com/book). Each topic below distills one idea from the book's sixth section.

## What Big O Means in Industry

Big O describes the **rate of increase**, not the speed: a linear algorithm eventually beats a constant one, but constants decide real-world wins — electronic transfer is O(s) in file size; flying a drive across the country is O(1). Runtimes can hold multiple variables: painting a w×h fence with p layers is O(whp).

Industry merges academia's O, Ω and Θ into one "big O" meaning the **tight description**. Separately, best/worst/expected cases describe behavior on particular inputs (quicksort: O(N) best, O(N²) worst, O(N log N) expected) — and the two concepts have no relationship to each other. Best case is rarely useful to state.

**The norm:** in interviews, give the tight bound; mention best/expected only when it's the point.

## Drop Constants and Non-Dominant Terms — Correctly

O(2N) is O(N); O(N² + N) is O(N²); O(N + log N) is O(N). But this is description, not algebra you may apply blindly: O(B² + A) cannot be reduced without knowing the relationship between A and B, and O(2^N) is not O(N) — the base of an exponent matters (8^N ≠ 2^N), while the base of a *log* doesn't (different log bases differ by a constant).

**The norm:** simplify only what's genuinely dominated; keep exponents, keep independent variables.

## Add Versus Multiply

The workhorse rule for composed algorithms:

- **"Do this, then when you're all done, do that"** → the runtimes **add**: O(A + B).
- **"Do this for each time you do that"** (nested loops) → they **multiply**: O(A × B).

Two sequential loops over one array: O(N). A nested loop pairing every element: O(N²) — derivable four ways (n(n−1)/2 pairs, "about half an N×N matrix", average N/2 work per pass). Two *different* arrays a and b nested: O(ab), not O(N²) — and never reuse the variable N for two different sizes.

**The norm:** sequence adds, nesting multiplies; different inputs get different letters.

## Amortized and Log N

A dynamic array doubling at capacities 1, 2, 4 … X copies about 2X elements total across X insertions — so insertion is **amortized O(1)** despite occasional O(N) inserts. Amortized time is what lets you say `ArrayList.add` is constant-time with a straight face.

O(log N) appears whenever the problem space **halves each step** — binary search, balanced-tree lookup. The halving is the definition; the base is a constant and disappears.

**The norm:** doubling capacity means amortized O(1); halving space means log.

## Recursive Runtimes

A recursive function that makes multiple calls per level runs in **O(branches^depth)**. The classic: two-call Fibonacci is a binary tree of depth N — 2^N − 1 nodes, O(2^N) (really closer to O(1.6^N) since right subtrees shrink — a bonus-point observation), with O(N) stack space. Printing fib(0..n) with that function is still O(2^N) — the sum 2¹+2²+…+2ⁿ is 2^(n+1) — but the **memoized** version is O(n), and bottom-up with two variables is O(n) time and O(1) space. Generating all permutations is bounded by O(n² · n!).

Space counts the stack: recursion to depth n needs O(n) space even when the total *number* of calls is small — calls that don't coexist on the stack don't stack up.

**The norm:** branches^depth for branching recursion; memoization flattens the exponent.

## The Worked-Example Traps

The section's exercises teach habits more than facts: a BST traversal touching each node once is **O(N)** — balanced doesn't put a log in everything (2^(log N) = N); primality testing to √n is **O(√n)**; sorting a strings then an array of them is **O(a·s(log a + log s))**; balanced trees give O(log N) per lookup, so N lookups are O(N log N). And the meta-rule: **runtime is not multiple choice** — derive it from the structure of the algorithm, never guess by elimination.

**The norm:** derive from the loop and recursion structure; check what each variable counts.

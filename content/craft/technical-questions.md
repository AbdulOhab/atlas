---
title: "Technical Questions"
order: 16
summary: "The method for the room: listen, example, brute force, optimize — then the five optimization tactics, the BCR compass, and what good code looks like on a whiteboard."
category: "Interviews"
level: All levels
---

# Technical Questions

Section VII of *Cracking the Coding Interview* is the book's core: a repeatable method for technical questions, and the optimization tactics to reach a good solution out loud.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Cracking the Coding Interview is a commercial book by Gayle Laakmann McDowell — buy it at [careercup.com](https://www.careercup.com/book). Each topic below distills one idea from the book's seventh section.

## Prepare by Solving, Not Reading

The practice method: solve each problem yourself with minimal help, thinking about time and space; write the code **on paper**; test it on paper (general case, base case, error case); then type the paper code in as-is and keep a list of your mistakes. Do as many mock interviews as possible. Reading solutions without first solving is learning calculus by reading answer keys.

Know cold: linked lists; trees, tries and graphs; stacks and queues; heaps; hash tables (especially); BFS and DFS; binary search; merge and quick sort; bit manipulation; memory (stack vs. heap); recursion; dynamic programming; Big O. Have the powers-of-2 table memorized for scalability estimates — a bit vector over all 32-bit integers is about half a gigabyte.

**The norm:** solve on paper, test on paper, catalog your mistakes.

## The Flow: Listen, Example, Brute Force, Optimize, Walk Through, Implement, Test

- **Listen** — record every unique detail ("sorted", "runs repeatedly on a server"); information you haven't used is a hint you've missed something.
- **Draw an example** — specific and sufficiently large (most candidates draw them ~50% too small), never a special case.
- **State a brute force** — with its runtime, even if terrible: it's a baseline and proves you're not missing the obvious.
- **Optimize** — see the tactics below.
- **Walk through** — solidify the algorithm and how variables move before writing; flowchart, not English pseudocode.
- **Implement** — start in the top-left corner, avoid line creep, write modular code with good names, and pretend helper functions exist (define them later if needed).
- **Test** — as a code review first (conceptual pass, weird-looking code, hot spots: arithmetic, null nodes, base cases), then small cases, then special cases. Fix bugs carefully, not with the first plausible patch.

**The norm:** the seven steps in order; most premature coding dies at step five.

## Optimize: Look for BUD

Walk the brute force looking for **BUD** — the three things dragging it down:

- **Bottleneck** — the slowest step that caps the runtime (the O(N) inner scan inside the O(N) loop).
- **Unnecessary work** — computing something you could derive directly.
- **Duplicated work** — solving the same subproblem repeatedly (build the c+d sum table once and the a³+b³=c³+d³ question drops from O(N⁴) to O(N²)).

Also: look for unused information in the problem statement, try a fresh example, solve it "incorrectly" and study why it fails, make time–space tradeoffs, precompute, and reach for a hash table.

**The norm:** name the bottleneck out loud before optimizing anything.

## The Other Four Tactics

- **DIY (do it yourself)** — solve the problem manually on a big real example, then reverse-engineer your own thought process into an algorithm; your brain usually invents a sliding window where your first answer was "generate all permutations".
- **Simplify and generalize** — relax a constraint (words → characters), solve the easier version, then adapt the solution back.
- **Base case and build** — solve n = 1, then build n = 2, 3, 4 from previous solutions; often reveals the recursion.
- **Data structure brainstorm** — run the problem through linked list, array, tree, heap, hash table… ("two heaps give the running median").

**The norm:** when stuck, run the five tactics in order until one clicks.

## The BCR: Your Optimizing Compass

The **best conceivable runtime** is a property of the *problem*, not of any algorithm: if you must at least glance at every element of two arrays, O(A + B) is conceivable and nothing is faster. It may not be achievable — that's fine; it's a compass. If your brute force is O(N²) and the BCR is O(N), look for the O(log N) step (binary search) that bridges the gap, then the O(1) step (hash table). Work already within the BCR is "free"; once you hit the BCR with O(1) extra space, stop optimizing — if the runtime is already optimal, switch to space.

**The norm:** state the BCR, then measure every idea against it.

## Good Code, Wrong Answers, and Don't Give Up

Responses aren't binary: optimality, time taken, hints needed and code quality all count — most good questions take strong candidates 20–30 minutes, and a "flawless" packet is rare enough to be remembered. If you've heard the question before, say so; honesty earns points and dishonesty gets caught.

Good coding is **correct, efficient, simple, readable, maintainable** — demonstrated by designing real data structures instead of parallel arrays, reusing code (one `convertFromBase` for binary and hex), modularity, generality (N×N tic-tac-toe, not hardcoded 3×3), and error checking (validate input; if it's tedious, leave space and say you'd add it). And when the problem is hard: that's the test. Stepping up to it, visibly, is itself the signal they came to see.

**The norm:** style counts as much as the algorithm; quitting is the only unrecoverable move.

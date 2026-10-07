---
title: "Approach Cheat Sheets"
order: 17
summary: "The how-to-approach methods from the question chapters: object-oriented design, system design and scalability, testing, recursion and dynamic programming, sorting, threads — plus handling the offer."
category: "Interviews"
level: Advanced
---

# Approach Cheat Sheets

The per-chapter "how to approach" advice from *Cracking the Coding Interview*'s question section, collected into one page of methods.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Cracking the Coding Interview is a commercial book by Gayle Laakmann McDowell — buy it at [careercup.com](https://www.careercup.com/book). Each topic distills the intro guidance of one or two question chapters.

## Object-Oriented Design: The Four-Step Walk

1. **Handle ambiguity** — ask who will use it and how; walk the six Ws (who, what, where, when, how, why). A coffee maker for a busy restaurant is a different design than one for elderly home users.
2. **Define the core objects** — a restaurant: `Table`, `Guest`, `Party`, `Order`, `Meal`, `Employee`, `Server`, `Host`.
3. **Analyze relationships** — membership, inheritance, one-to-many vs. many-to-many — while questioning assumptions (communal tables change everything) and deciding how general-purpose to be.
4. **Investigate actions** — walk the key object interactions and update the design as missing objects appear.

Patterns beyond Singleton and Factory Method are mostly out of interview scope — and don't hunt for the "right" pattern; design what works.

**The norm:** ambiguity first, objects second, relationships third, actions last.

## System Design: Go Broad Before Deep

These questions have no gotcha — they test how you work: communicate, use the whiteboard from the start, state assumptions explicitly, and stay in the driver's seat. The five steps: **(1) scope the problem** (define exactly what to build; list major features); **(2) make reasonable assumptions** (a million new URLs a day is fine; a hundred is not; infinite memory is not); **(3) draw the major components** and walk an end-to-end request, ignoring scale at first; **(4) identify the bottlenecks** (the viral-link spike); **(5) redesign for those issues**, updating the diagram and admitting limitations.

For scaling one algorithm: ask questions → "make believe" with infinite memory → "get real" by splitting data and locating it → solve the problems that creates, iteratively. Know the vocabulary: load balancers over clones, denormalization and NoSQL, sharding schemes (vertical by feature; key/mod — hard to reshard; directory — a lookup-table SPOF), caching, queues and async processing, bandwidth vs. throughput vs. latency, MapReduce. There is no perfect system — only tradeoffs you can name.

**The norm:** scope, assume, draw, find the bottleneck, redesign — while talking.

## Testing: Object, Software, Function

For a **real-world object** (a pen, a laundry machine): who uses it and why; the use cases; the bounds of use; stress and failure conditions (and what failure *should* mean — a machine dying, not flooding); how you'd test it. For **software**: first decide black-box vs. white-box, then the same ladder, plus a structured test plan organized by component — never a stream of consciousness. For a **function**: define cases (normal, extremes — empty/tiny/huge, nulls and illegal input, strange input like already-sorted data); define expected results including side effects; write the test code.

Troubleshooting questions ("the browser crashes on launch"): understand the scenario (versions, frequency, who reported it), break the problem into testable units, create specific tests a real user could perform.

**The norm:** organize by component and priority — payments before image placement.

## Recursion, Dynamic Programming and Bit Tricks

Problems built off subproblems ("compute the nth…", "list the first n…", "compute all…") smell recursive — your instinct is ~50% accurate, useful but stay open. Three design routes: **bottom-up** (solve case 1, build case 2 from it), **top-down** (divide case N into subproblems, watching for overlap), **half-and-half** (binary search, merge sort). Recursion to depth n costs at least O(n) stack; everything recursive can be made iterative, so discuss the tradeoff.

Dynamic programming = a recursive algorithm whose overlapping subproblems you **cache** — top-down memoization or bottom-up tabulation are both "DP". The Fibonacci ladder: naive O(2^N) → memoized O(n) → bottom-up with two variables, O(n) time and O(1) space. For bit manipulation: know the XOR/AND/OR facts by understanding, not memorization; two's complement (flip and add one); arithmetic `>>` fills with the sign bit while logical `>>>` fills with zero; and derive get/set/clear/update recipes from `1 << i` masks.

**The norm:** subproblems → recursion; overlap → cache; halves → divide and conquer.

## Sorting, Searching and Threading

Most sorting/searching questions are tweaks of the classics — scan the repertoire for a fit: sorting a million people by age (tiny value range, huge array) points straight to bucket or radix sort in O(n). Know the runtimes: bubble and selection O(n²), merge sort O(n log n) with O(n) space, quicksort O(n log n) average with O(log n) memory, radix O(kn). Binary search is concept-easy, detail-hard — the ±1s are where candidates fail. And "search" may mean a tree or hash table, not binary search.

Threading questions probe general understanding: `Runnable` over extending `Thread`; `synchronized` locks per instance (static methods lock the class); explicit `Lock` objects for finer control; and deadlocks, which need all four conditions — mutual exclusion, hold-and-wait, no preemption, circular wait — so prevention means breaking one, usually circular wait.

**The norm:** fit the classic first; in threads, name the four deadlock conditions.

## The Offer: Evaluate, Then Negotiate

Deadlines run one to four weeks and extensions are routinely granted; decline on good terms with an inarguable reason, and after a rejection, thank the recruiter and ask when you can re-apply. Evaluate beyond salary: amortize signing bonus, relocation and equity over ~3 years; weigh cost of living; look at resume name value, learning, promotion path and what else is nearby.

Negotiate — offers aren't revoked for it: have a viable alternative, make a *specific* ask ("+$7,000", not "more"), overshoot slightly, negotiate equity and signing bonus too, and use the medium you'll actually use (phone ideally). Big companies have levels: a big bump means convincing them you fit a higher one. On the job: set a 10-year timeline, build relationships, ask for the work you want — and interview at least once a year even when you're not looking.

**The norm:** the offer is another interview — specific, cheerful, unafraid.

---
title: Learning path
order: 0
summary: The site's full 28-concept dependency graph — what to learn first, what it unlocks, and which
  pages here cover it.
category: Concepts
level: Beginner
bigO:
  best: —
  average: —
  worst: —
  space: —
structures:
- concept: Reading order
  python: topological
  aliases:
  - prerequisite DAG
  declaration: learn(x) requires every node in x.prerequisites
  ops:
  - op: ready to learn
    code: all(p done for p in prereq)
    cost: —
  - op: unlocks
    code: nodes listing x in their prereq
    cost: —
  - op: suggested next
    code: a ready node you have not done
    cost: —
---

# Learning path

Twenty-eight concepts in dependency order — the site's full learning path, including nodes it teaches in passing (two pointers, sliding window, BSTs, Dijkstra) rather than as their own page. Each row lists what it builds on, so you can tell at a glance what is safe to learn next.

## Foundation

| Concept | Builds on | Learn page |
| --- | --- | --- |
| Big-O Notation | — | [Big-O Notation](/learn/big-o-notation) |
| Variables & Types | — | — |

## Data structure

| Concept | Builds on | Learn page |
| --- | --- | --- |
| Arrays & Strings | Big-O Notation, Variables & Types | [Arrays & Strings](/learn/arrays-strings) |
| Hash Tables | Big-O Notation, Variables & Types | [Hash Tables](/learn/hash-tables) |
| Linked Lists | Arrays & Strings | [Linked Lists](/learn/linked-lists) |
| Stacks | Arrays & Strings | [Stacks & Queues](/learn/stacks-queues) |
| Queues | Arrays & Strings | [Stacks & Queues](/learn/stacks-queues) |
| Binary Trees | Linked Lists, Recursion | [Binary Trees](/learn/binary-trees) |
| Binary Search Trees | Binary Trees, Binary Search | [Binary Trees](/learn/binary-trees) |
| Heaps / Priority Queues | Binary Trees, Arrays & Strings | [Heaps / Priority Queues](/learn/heaps) |
| Graphs | Hash Tables, Linked Lists | [Graphs](/learn/graphs) |
| Tries | Binary Trees, Hash Tables | [Tries](/learn/tries) |

## Algorithm

| Concept | Builds on | Learn page |
| --- | --- | --- |
| Two Pointers | Arrays & Strings | — |
| Sliding Window | Arrays & Strings, Hash Tables | — |
| Sorting Algorithms | Arrays & Strings | [Sorting](/learn/sorting) |
| Binary Search | Arrays & Strings, Sorting Algorithms | [Binary Search](/learn/binary-search) |
| Recursion | Stacks | [Recursion & Backtracking](/learn/recursion-backtracking) |
| Backtracking | Recursion | [Recursion & Backtracking](/learn/recursion-backtracking) |
| BFS | Graphs, Queues | [BFS & DFS](/learn/bfs-dfs) |
| DFS | Graphs, Stacks, Recursion | [BFS & DFS](/learn/bfs-dfs) |
| Dynamic Programming | Recursion, Hash Tables | [Dynamic Programming](/learn/dynamic-programming) |

## Advanced

| Concept | Builds on | Learn page |
| --- | --- | --- |
| Balanced BSTs | Binary Search Trees | — |
| Dijkstra's Algorithm | BFS, Heaps / Priority Queues | — |
| Topological Sort | DFS, Graphs | — |
| Greedy Algorithms | Sorting Algorithms, Dynamic Programming | [Greedy Algorithms](/learn/greedy) |

## Mastery

| Concept | Builds on | Learn page |
| --- | --- | --- |
| System Design | Hash Tables, Graphs, Heaps / Priority Queues | [System Design Basics](/learn/system-design-basics) |
| Advanced DP | Dynamic Programming, Binary Search | — |
| Advanced Graphs | Dijkstra's Algorithm, Topological Sort | — |


---
title: Recursion & Backtracking
order: 12
summary: Backtracking systematically explores all possibilities by building candidates incrementally and
  abandoning (pruning) paths that cannot lead to a solution. Essential for permutations, subsets, and
  constraint satisfaction.
category: Algorithms
level: Intermediate
bigO:
  best: O(n!)
  average: O(2^n)
  worst: O(n!)
  space: O(n)
explained:
  time: 'O(k^n) in the worst case where k is the branching factor and n is the depth. For subsets (k=2):
    O(2ⁿ). For permutations: O(n!). Pruning reduces this dramatically in practice.'
  space: O(n) for the call stack and current path being explored (just one path at a time, not all paths
    simultaneously).
  visual: A maze where you try every path. When you hit a dead end you backtrack to the last fork and
    try a different direction. Stack space = how deep you are in the maze, not the total number of paths.
structures:
- concept: Array
  python: list
  aliases:
  - List
  - Dynamic Array
  - Vector
  declaration: nums = [1, 2, 3]
  ops:
  - op: append(x)
    code: nums.append(x)
    cost: O(1)
  - op: pop()
    code: nums.pop()
    cost: O(1)
  - op: index access
    code: nums[i]
    cost: O(1)
  - op: insert(i, x)
    code: nums.insert(i, x)
    cost: O(n)
  - op: membership test
    code: x in nums
    cost: O(n)
  - op: sort()
    code: nums.sort()
    cost: O(n log n)
  - op: length
    code: len(nums)
    cost: O(1)
- concept: Set
  python: set
  aliases:
  - Hash Set
  - Unordered Set
  declaration: 'visited = set()  # or visited = {1, 2, 3}'
  ops:
  - op: add(x)
    code: visited.add(x)
    cost: O(1)
  - op: membership test
    code: x in visited
    cost: O(1)
  - op: remove(x)
    code: visited.remove(x)
    cost: O(1)
  - op: discard(x)
    code: visited.discard(x)
    cost: O(1)
  - op: union / intersection
    code: a | b  /  a & b
    cost: O(n)
math:
- id: recursion-call-stack
  title: Recursion - functions that call themselves
  plain: A recursive function solves a big problem by solving a slightly smaller version of the same problem,
    and keeps going until it hits a base case small enough to answer directly. Think of it as Russian
    nesting dolls - each doll contains a smaller version of itself, until you reach the tiny solid doll
    at the center.
  visual: A vertical stack of boxes. Each box represents one function call. When the function calls itself,
    a new box gets stacked on top. When it returns, that box gets removed. The depth of the stack at any
    moment is how many nested calls are active.
  analogy: To find the total weight of a stack of boxes, you pick up the top box, weigh it, then ask someone
    to tell you the total weight of the remaining stack. They do the same thing. Eventually the last person
    just says "zero, there are no boxes left."
- id: exponential-growth
  title: Exponents - doubling chains
  plain: 2ⁿ means you start with 1 and double it n times. n=10 gives you 1,024. n=20 gives you 1,048,576.
    n=30 gives you over a billion. It grows terrifyingly fast.
  visual: A curve that looks almost flat near zero, then bends upward so steeply it nearly goes straight
    up. Compare it side by side with a straight line (linear) and the difference is shocking.
  analogy: A chain letter. You send it to 2 friends. Each of them sends it to 2 friends. After 30 rounds,
    over a billion letters have been sent.
- id: decision-tree
  title: Decision trees - branching choices
  plain: Backtracking builds a tree of decisions. At each step you have some number of choices (say, k
    choices). Each choice leads to another set of k choices, and so on. The total number of paths through
    this tree is k^depth. For k=2 and depth=n, that is 2ⁿ paths.
  visual: 'A tree where each node has multiple branches. At depth 0: 1 node. At depth 1: k nodes. At depth
    2: k² nodes. At depth 3: k³ nodes. The tree widens rapidly.'
  analogy: A menu with 3 courses and 5 choices per course. Total possible meals = 5×5×5 = 125. The decision
    tree has 3 levels and branches 5 ways at each level.
challenges:
- title: Combination Sum
  difficulty: medium
  description: Given an array of distinct integers `candidates` and a target integer `target`, return
    all unique combinations of candidates where the chosen numbers sum to target. The same number may
    be used multiple times.
  hints:
  - Use backtracking with a remaining sum.
  - Pass the current index (not index+1) to allow reuse of the same element.
  - Sort candidates first to enable early termination when candidates[i] > remaining.
  optimal: O(n^(t/m)) time, O(t/m) space
---

# Recursion & Backtracking

Backtracking systematically explores all possibilities by building candidates incrementally and abandoning (pruning) paths that cannot lead to a solution. Essential for permutations, subsets, and constraint satisfaction.

## Key points

- Backtracking template: choose, explore, unchoose
- Subsets: at each element, decide to include or exclude
- Permutations: swap elements with remaining positions
- Pruning early is critical for performance
- State must be fully restored after each recursive call

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
# --- Subsets (power set) ---
def subsets(nums):
    result = []
    def backtrack(start, current):
        result.append(current[:])
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()
    backtrack(0, [])
    return result

# --- Permutations ---
def permutations(nums):
    result = []
    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        for i, n in enumerate(remaining):
            path.append(n)
            backtrack(path, remaining[:i] + remaining[i+1:])
            path.pop()
    backtrack([], nums)
    return result

# --- N-Queens ---
def solve_n_queens(n):
    results = []
    cols = set()
    diag1 = set()  # row - col
    diag2 = set()  # row + col

    def backtrack(row, board):
        if row == n:
            results.append(["".join(r) for r in board])
            return
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            cols.add(col); diag1.add(row - col); diag2.add(row + col)
            board[row][col] = 'Q'
            backtrack(row + 1, board)
            board[row][col] = '.'
            cols.discard(col); diag1.discard(row - col); diag2.discard(row + col)

    backtrack(0, [['.' for _ in range(n)] for _ in range(n)])
    return results

print(subsets([1, 2, 3]))
print(len(permutations([1, 2, 3])))  # 6
print(len(solve_n_queens(4)))        # 2
```

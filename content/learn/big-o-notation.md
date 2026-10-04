---
title: Big-O Notation
order: 1
summary: Big-O is the language of algorithm analysis. Every Google solution you present must come with
  a complexity analysis. This is non-negotiable. Understand how to derive it, not just memorize it.
category: Concepts
level: Beginner
bigO:
  best: N/A
  average: N/A
  worst: N/A
  space: N/A
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
- concept: Hash Map
  python: dict
  aliases:
  - Hash Table
  - Dictionary
  - Map
  - Associative Array
  declaration: 'seen = {}  # or seen = dict()'
  ops:
  - op: set value
    code: seen[key] = val
    cost: O(1)
  - op: membership test
    code: key in seen
    cost: O(1)
  - op: safe get
    code: seen.get(key, default)
    cost: O(1)
  - op: delete
    code: del seen[key]
    cost: O(1)
  - op: keys()
    code: seen.keys()
    cost: O(n)
  - op: items()
    code: seen.items()
    cost: O(n)
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
- id: constant-complexity
  title: Constant time - O(1)
  plain: No matter how large the input is, this operation always takes the same amount of time. The size
    of n simply does not matter.
  visual: A perfectly flat horizontal line on a graph. The line never rises no matter how far right you
    go.
  analogy: Looking up a word in a dictionary if you already know the exact page number. It does not matter
    how thick the dictionary is.
  why: 'Accessing array[3] is O(1) because the computer calculates the memory address directly: start
    + 3 * item_size. One calculation, done.'
- id: linear-complexity
  title: Linear growth - O(n)
  plain: If you have 10 items to check, you do 10 steps. 1,000 items? 1,000 steps. The work grows at exactly
    the same rate as the input.
  visual: A straight diagonal line on a graph. Double the input, double the time. No surprises.
  analogy: Reading every page of a book. If the book is twice as long, it takes twice as long to read.
  why: O(n) is usually the target for one-pass algorithms like simple array traversals.
- id: logarithm-halving
  title: Logarithms - "how many times can you cut in half?"
  plain: 'log₂(n) answers this question: if you start with n things and keep cutting the group in half,
    how many cuts until you reach 1? For 1,024 items that is only 10 cuts. For a million items it is about
    20. The number barely grows even as n explodes.'
  visual: Picture a tree branching downward. The top level is all n items. Each level below is half the
    size. The number of levels in that tree is log₂(n).
  analogy: A phone book with 1,024 names. Flip to the middle - is your name before or after? Flip to the
    middle of the surviving half. Repeat. You find any name in at most 10 flips, not 1,024.
  why: Any algorithm that cuts its remaining work in half each step runs in O(log n). Binary search, balanced
    tree lookups, and heap operations all work this way.
- id: quadratic-growth
  title: Quadratic growth - n²
  plain: n² means n multiplied by itself. If n is 10, that is 100. If n is 100, that is 10,000. If n is
    1,000, that is 1,000,000. The work grows as a square.
  visual: Picture a grid of tiles. If one side has n tiles, the whole floor has n × n = n² tiles. A 10×10
    grid has 100 tiles. A 100×100 grid has 10,000.
  analogy: Comparing every person in a room to every other person for a secret handshake. 10 people =
    100 handshakes. 100 people = 10,000 handshakes.
  why: Nested loops typically mean O(n²). Two-pointer techniques and hash maps exist specifically to avoid
    this.
- id: exponential-growth
  title: Exponents - doubling chains
  plain: 2ⁿ means you start with 1 and double it n times. n=10 gives you 1,024. n=20 gives you 1,048,576.
    n=30 gives you over a billion. It grows terrifyingly fast.
  visual: A curve that looks almost flat near zero, then bends upward so steeply it nearly goes straight
    up. Compare it side by side with a straight line (linear) and the difference is shocking.
  analogy: A chain letter. You send it to 2 friends. Each of them sends it to 2 friends. After 30 rounds,
    over a billion letters have been sent.
  why: Brute-force recursive solutions that branch into 2 sub-problems at every step hit O(2ⁿ). That is
    why memoization and dynamic programming matter so much.
- id: summation-series
  title: Summation - adding up a series
  plain: 1 + 2 + 3 + ... + n always equals n×(n+1)/2. For n=10 that is 55. For n=100 that is 5,050. This
    is approximately n²/2 - which Big-O rounds to O(n²).
  visual: Stack bars of height 1, 2, 3, 4... They form a triangle. A triangle is half a square (n×n),
    so the total is roughly n²/2.
  analogy: Stacking cannon balls in a triangle. The bottom row has n balls, the next has n-1, the next
    has n-2. Total balls = n(n+1)/2.
  why: 'When an outer loop runs n times and an inner loop runs 1 time on the first pass, 2 on the second,
    3 on the third... the total work is this triangle sum: O(n²).'
- id: big-o-definition
  title: What Big-O actually means
  plain: Big-O describes how the number of operations grows as input size n grows. It ignores constants
    and lower-order terms because for large n they become irrelevant. O(2n) and O(n) are the same class.
    O(n² + n) simplifies to O(n²). We only care about the dominant term.
  visual: A graph with n on the x-axis and "operations" on the y-axis. Multiple curves. As n grows large,
    O(n²) dwarfs O(n log n) which dwarfs O(n). The constants (2n vs 5n) are invisible at large scale.
  analogy: Long-term salary comparison. A job paying $50k + $1k/year raise versus a job paying $30k +
    10% compound raise. Early on $50k is better. After ~10 years, the percentage-growth job overtakes
    it and keeps growing faster. Big-O is like asking "which job pays more after 20 years?" - the initial
    salary becomes irrelevant.
  why: Big-O is the universal language interviewers use to compare solutions. A solution might be faster
    for small inputs but worse for large ones. Big-O captures the long-term behavior.
challenges:
- title: Complexity Analysis Practice
  difficulty: easy
  description: 'Implement three functions with specific complexity targets, then verify by counting operations.
    Goal: understand why complexity classes matter in practice.'
  starter: "# Part 1: Implement a function that is O(n log n)\ndef find_duplicates_n_log_n(nums):\n  \
    \  # Sort first, then scan for adjacent duplicates\n    pass\n\n# Part 2: Improve it to O(n) using\
    \ a hash set\ndef find_duplicates_linear(nums):\n    pass\n\n# Part 3: O(n) time and O(1) space\n\
    # if nums contains values in range [1, n]\ndef find_duplicates_constant_space(nums):\n    # Use the\
    \ array itself as a hash map by negating visited indices\n    pass\n\ntest = [4, 3, 2, 7, 8, 2, 3,\
    \ 1]\nprint(find_duplicates_n_log_n(test))\nprint(find_duplicates_linear(test))\nprint(find_duplicates_constant_space(test))\n"
  tests:
  - input: find_duplicates_linear([4,3,2,7,8,2,3,1])
    expected: '[2,3]'
  - input: find_duplicates_constant_space([4,3,2,7,8,2,3,1])
    expected: '[2,3]'
  hints:
  - 'O(n log n): sort the array, then scan for adjacent equal elements.'
  - 'O(n): use a set to track seen numbers. If num already in set, it is a duplicate.'
  - 'O(1) space trick: for each num, negate nums[abs(num)-1]. If it''s already negative, it''s a duplicate.'
  tags:
  - complexity-analysis
  - google-favorite
  optimal: O(n) time, O(1) space
---

# Big-O Notation

Big-O is the language of algorithm analysis. Every Google solution you present must come with a complexity analysis. This is non-negotiable. Understand how to derive it, not just memorize it.

## Key points

- Drop constants and lower-order terms: O(2n + 5) = O(n)
- Nested loops multiply: two nested O(n) loops = O(n^2)
- Recursive calls: T(n) = aT(n/b) + f(n) - Master Theorem
- Space complexity counts both explicit storage AND call stack depth
- Amortized analysis: dynamic array append is O(1) amortized despite O(n) resizes

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
import time

def time_fn(fn, *args):
    start = time.perf_counter()
    result = fn(*args)
    elapsed = (time.perf_counter() - start) * 1000
    return result, elapsed

# O(1) - constant
def get_first(lst):
    return lst[0] if lst else None

# O(log n) - binary search
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    steps = 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return steps
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return steps

# O(n) - linear scan
def linear_search(arr, target):
    for i, x in enumerate(arr):
        if x == target:
            return i
    return -1

# O(n^2) - bubble sort
def bubble_sort(arr):
    arr = arr[:]
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

n = 1000000
arr = list(range(n))
bs_steps = binary_search(arr, n - 1)
print(f"Binary search steps for n={n}: {bs_steps}")
print(f"Linear search would need: {n} steps")
print(f"Ratio: {n // bs_steps}x faster")
```

## Big-O reference table

The cost of every structure on one card, the way the source site shows it before a phone screen.

| Structure | Operation | Cost |
| --- | --- | --- |
| **Array** | Access | `O(1)` |
|  | Search | `O(n)` |
|  | Insert end | `O(1)*` |
|  | Insert mid | `O(n)` |
| **Hash Map** | Get/Set | `O(1)*` |
|  | Delete | `O(1)*` |
|  | Search value | `O(n)` |
|  | Iterate | `O(n)` |
| **Linked List** | Access | `O(n)` |
|  | Search | `O(n)` |
|  | Insert head | `O(1)` |
|  | Delete known | `O(1)` |
| **Binary Search** | Search | `O(log n)` |
|  | Insert | `O(log n)` |
| **Balanced BST** | Search | `O(log n)` |
|  | Insert | `O(log n)` |
|  | Delete | `O(log n)` |
| **Heap** | Peek min/max | `O(1)` |
|  | Push | `O(log n)` |
|  | Pop | `O(log n)` |
|  | Heapify | `O(n)` |
| **Graph (BFS/DFS)** | Traversal | `O(V+E)` |
|  | Dijkstra (heap) | `O((V+E) log V)` |
| **Merge / Quick Sort** | Sort | `O(n log n)` |
|  | Space (merge) | `O(n)` |
|  | Space (quick) | `O(log n)` |

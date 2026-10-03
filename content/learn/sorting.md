---
title: Sorting
order: 10
summary: Sorting underpins many algorithmic techniques. Beyond knowing the standard algorithms, interviewers
  want you to recognize when counting sort beats comparison sort and when merge sort is preferable to
  quicksort.
category: Algorithms
level: Beginner
bigO:
  best: O(n log n)
  average: O(n log n)
  worst: O(n^2)
  space: O(log n)
explained:
  time: O(n log n) for efficient sorts (merge sort, heap sort). O(n²) for naive sorts (bubble, insertion,
    selection). O(n) for special-case sorts when keys are bounded integers (counting sort, radix sort).
  space: O(n) for merge sort (needs a temporary array). O(log n) for quicksort (call stack). O(1) for
    heapsort (in-place).
  visual: 'Merge sort: split a deck of 16 cards into halves, then quarters, then singles (log₂(16)=4 splits).
    Merge the singles into sorted pairs - 8 merges. Merge pairs into fours - 4 merges. Each round does
    n total work across 4 rounds = 4n = n log n.'
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
brute:
  brute:
    pros:
    - Extremely simple to code
    - In-place - no extra memory
    - Good for nearly-sorted data
    cons:
    - Quadratic time - unusable for large inputs
    - Never use in an interview unless asked
    name: Bubble Sort
    time: O(n^2)
    space: O(1)
    quote: Compare adjacent elements, swap if out of order. Repeat until sorted.
  optimized:
    pros:
    - Guaranteed O(n log n) - no worst case
    - Stable sort
    - Divide-and-conquer pattern
    cons:
    - O(n) extra space for merging
    - More complex to implement
    name: Merge Sort
    time: O(n log n)
    space: O(n)
    quote: Divide array in half recursively, merge sorted halves back together.
  title: Sort an Array
  strategy: Start brute force, explain it, then optimize.
  quote: I can see a straightforward approach. Let me start there, then we can optimize.
  tradeoff: 'Trading O(n) space to go from O(n^2) to O(n log n). For n=10,000: bubble sort does 100,000,000
    comparisons. Merge sort does 130,000.'
  atN: 10,000
  tip: O(n log n) is the theoretical lower bound for comparison-based sorting. Merge sort guarantees this.
    Quick sort achieves it on average with better constants.
math:
- id: logarithm-halving
  title: Logarithms - "how many times can you cut in half?"
  plain: 'log₂(n) answers this question: if you start with n things and keep cutting the group in half,
    how many cuts until you reach 1? For 1,024 items that is only 10 cuts. For a million items it is about
    20. The number barely grows even as n explodes.'
  visual: Picture a tree branching downward. The top level is all n items. Each level below is half the
    size. The number of levels in that tree is log₂(n).
  analogy: A phone book with 1,024 names. Flip to the middle - is your name before or after? Flip to the
    middle of the surviving half. Repeat. You find any name in at most 10 flips, not 1,024.
- id: quadratic-growth
  title: Quadratic growth - n²
  plain: n² means n multiplied by itself. If n is 10, that is 100. If n is 100, that is 10,000. If n is
    1,000, that is 1,000,000. The work grows as a square.
  visual: Picture a grid of tiles. If one side has n tiles, the whole floor has n × n = n² tiles. A 10×10
    grid has 100 tiles. A 100×100 grid has 10,000.
  analogy: Comparing every person in a room to every other person for a secret handshake. 10 people =
    100 handshakes. 100 people = 10,000 handshakes.
- id: summation-series
  title: Summation - adding up a series
  plain: 1 + 2 + 3 + ... + n always equals n×(n+1)/2. For n=10 that is 55. For n=100 that is 5,050. This
    is approximately n²/2 - which Big-O rounds to O(n²).
  visual: Stack bars of height 1, 2, 3, 4... They form a triangle. A triangle is half a square (n×n),
    so the total is roughly n²/2.
  analogy: Stacking cannon balls in a triangle. The bottom row has n balls, the next has n-1, the next
    has n-2. Total balls = n(n+1)/2.
- id: nlogn-complexity
  title: n log n - the sweet spot
  plain: 'n log n sits between n (linear) and n² (quadratic). For n=1000: n=1000, n log n≈10,000, n²=1,000,000.
    Merge sort achieves n log n by dividing the array in half log(n) times and doing n work at each level.'
  visual: Three curves on the same graph. n is a gentle diagonal. n log n is slightly steeper but still
    gentle. n² curves upward steeply. For large inputs the gap between n log n and n² is enormous.
  analogy: Sorting a deck of cards by splitting it in half, sorting each half, then merging. Each split
    takes constant work per card. Because you only split log(n) times, the total is n log n.
walkthrough:
  problem: Merge Sort
  tagline: Divide into halves, sort each half, then merge them back together.
  time: O(n log n)
  space: O(n)
  code: "def merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n\n    mid = len(arr) // 2\n\
    \    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\
    \ndef merge(left, right):\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n\
    \        if left[i] <= right[j]:\n            result.append(left[i]); i += 1\n        else:\n    \
    \        result.append(right[j]); j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n\
    \    return result"
  steps:
  - title: The Input Array
    detail: 'We want to sort [8, 3, 1, 5, 2, 7]. Merge sort follows "divide and conquer": split the problem
      into smaller pieces, solve each piece, combine the results. We''ll split until each piece has 1
      element (which is already sorted by definition).'
    math: null
    cost: O(n log n)
    lines:
    - 1
    - 2
  - title: First Split - Two Halves
    detail: 'Split [8, 3, 1, 5, 2, 7] at the middle (index 3). Left half: [8, 3, 1]. Right half: [5, 2,
      7]. Each half will be recursively sorted.'
    math: We split log2(6) ≈ 3 times before reaching single elements. For n elements, we always split
      log(n) times. This is where the "log n" in O(n log n) comes from.
    cost: 'Depth: 1 of 3'
    lines:
    - 4
    - 5
    - 6
  - title: Split Again - Four Pieces
    detail: Each half splits again. [8, 3, 1] becomes [8] and [3, 1]. [5, 2, 7] becomes [5, 2] and [7].
      We keep splitting until every piece is a single element.
    math: null
    cost: 'Depth: 2 of 3'
    lines:
    - 4
    - 5
    - 6
  - title: Bottom of Recursion - Single Elements
    detail: '[3, 1] splits into [3] and [1]. [5, 2] splits into [5] and [2]. Now every piece is a single
      element. A single element is already sorted! Now we start merging back up.'
    math: null
    cost: 'Depth: 3 of 3'
    lines:
    - 2
    - 3
  - title: Merge Phase - Combine Sorted Halves
    detail: 'Now merge [3] and [1]: compare 3 vs 1. 1 is smaller, so 1 goes first. Then 3. Result: [1,
      3]. Merge [5] and [2]: 2 is smaller. Result: [2, 5]. Merge [8] (alone) and [7] (alone): result [7,
      8].'
    math: null
    cost: O(n) work at this level
    lines:
    - 10
    - 11
    - 12
    - 13
    - 14
    - 15
    - 16
  - title: Final Merge - Sorted!
    detail: 'Merge [1, 3, 8] with [2, 5, 7]: Compare heads (1 vs 2), take 1. Then 2 vs 3, take 2. Then
      3 vs 5, take 3. Then 5 vs 8, take 5. Then 7 vs 8, take 7. Then 8. Final result: [1, 2, 3, 5, 7,
      8].'
    math: 'Each merge level does O(n) total work (we touch each element once). We have log(n) levels.
      Total: O(n) per level x O(log n) levels = O(n log n). This is provably optimal for comparison-based
      sorting.'
    cost: O(n log n) total
    lines:
    - 10
    - 11
    - 12
    - 13
    - 14
    - 15
    - 16
    - 17
    - 18
    - 19
challenges:
- title: Sort Colors (Dutch National Flag)
  difficulty: medium
  description: Given an array with values 0, 1, and 2 (representing red, white, blue), sort them in-place
    in a single pass without using Python's built-in sort.
  hints:
  - 'Maintain three pointers: low (boundary of 0s), mid (current), high (boundary of 2s).'
  - 'If nums[mid] == 0: swap with nums[low], advance both.'
  - 'If nums[mid] == 1: just advance mid.'
  - 'If nums[mid] == 2: swap with nums[high], decrement high (don''t advance mid).'
  optimal: O(n) time, O(1) space
---

# Sorting

Sorting underpins many algorithmic techniques. Beyond knowing the standard algorithms, interviewers want you to recognize when counting sort beats comparison sort and when merge sort is preferable to quicksort.

## Key points

- Quicksort: O(n log n) average, O(n^2) worst, O(log n) space - fast in practice
- Mergesort: O(n log n) guaranteed, O(n) space - stable sort
- Heapsort: O(n log n) guaranteed, O(1) space - not cache-friendly
- Counting/Radix sort: O(n+k) for bounded integers - beats comparison lower bound
- Python sorted() uses Timsort: O(n log n) worst, exploits natural runs

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
# --- Quicksort (Lomuto partition) ---
def quicksort(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo < hi:
        pivot_idx = partition(arr, lo, hi)
        quicksort(arr, lo, pivot_idx - 1)
        quicksort(arr, pivot_idx + 1, hi)
    return arr

def partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo - 1
    for j in range(lo, hi):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[hi] = arr[hi], arr[i + 1]
    return i + 1

# --- Merge Sort ---
def mergesort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = mergesort(arr[:mid])
    right = mergesort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]

# --- Counting Sort (for bounded non-negative integers) ---
def counting_sort(arr, max_val):
    counts = [0] * (max_val + 1)
    for n in arr:
        counts[n] += 1
    result = []
    for val, cnt in enumerate(counts):
        result.extend([val] * cnt)
    return result

data = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(data[:]))          # [1,1,2,3,6,8,10]
print(mergesort(data[:]))          # [1,1,2,3,6,8,10]
print(counting_sort(data[:], 10))  # [1,1,2,3,6,8,10]
```

---
title: Binary Search
order: 11
viz: binary-search
summary: 'Binary search is deceptively tricky: off-by-one errors are everywhere. Beyond sorted array search,
  master the generalized template for searching over a monotonic answer space.'
category: Algorithms
level: Beginner
bigO:
  best: O(1)
  average: O(log n)
  worst: O(log n)
  space: O(1)
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
- concept: Sorted Container
  python: bisect (built-in) or sortedcontainers.SortedList (external)
  aliases:
  - Sorted Set
  - Sorted List
  declaration: 'arr = []

    insort(arr, x)'
  ops:
  - op: insert sorted
    code: insort(arr, x)
    cost: O(n)
  - op: find insertion point
    code: bisect_left(arr, x)
    cost: O(log n)
  - op: find index
    code: bisect_left(arr, target)
    cost: O(log n)
brute:
  brute:
    pros:
    - Works on unsorted arrays too
    - Simple to implement
    cons:
    - Does not take advantage of sorted order
    - Slow for large arrays
    name: Linear Scan
    time: O(n)
    space: O(1)
    quote: Check every element one by one until you find the target.
  optimized:
    pros:
    - Extremely fast - log(1,000,000) = only 20 steps
    - No extra space needed
    - Classic interview pattern
    cons:
    - Only works if data is sorted
    - Off-by-one errors are common
    name: Binary Search
    time: O(log n)
    space: O(1)
    quote: Cut the search space in half each step. Only works on sorted data.
  title: Search in Sorted Array
  strategy: Start brute force, explain it, then optimize.
  quote: I can see a straightforward approach. Let me start there, then we can optimize.
  tradeoff: No space tradeoff here - both are O(1) space. The optimization comes from exploiting the sorted
    property. This is free performance.
  atN: 1,000,000
  tip: Since the array is sorted, we can use binary search to cut the problem in half each step, going
    from O(n) to O(log n).
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
  why: Any algorithm that cuts its remaining work in half each step runs in O(log n). Binary search, balanced
    tree lookups, and heap operations all work this way.
- id: sorted-invariant
  title: The sorted order guarantee
  plain: Binary search only works because the array is sorted. Sorted order is the invariant - the thing
    that is always true - that lets you safely discard half the remaining elements after each comparison.
    If the array were unsorted, you could not know which half to keep.
  visual: A sorted array with a midpoint highlighted. An arrow points left ("smaller side") and right
    ("larger side"). Pick a target. Is the target bigger or smaller than mid? One entire side can be safely
    ignored.
  analogy: A guessing game where I say "higher" or "lower." With 100 numbers, you can always find mine
    in at most 7 guesses by guessing the midpoint each time. Because log₂(100) is about 7.
  why: The sorted order invariant is the heart of binary search. Recognizing when you can binary search
    on a problem (not just arrays - can also binary search on answer values) is a key interview skill.
walkthrough:
  problem: Binary Search
  tagline: Cut the problem in half every step. Like finding a word in a dictionary.
  time: O(log n)
  space: O(1)
  code: "def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n\n    while left <= right:\n\
    \        mid = (left + right) // 2\n\n        if nums[mid] == target:\n            return mid\n  \
    \      elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid\
    \ - 1\n\n    return -1"
  steps:
  - title: The Setup - Sorted Array Required
    detail: 'Binary search only works on a *sorted* array. We have [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
      and we''re looking for 13. We start with two pointers: left at index 0, right at the last index
      (9).'
    math: null
    cost: O(1) setup
    lines:
    - 1
    - 2
  - title: Calculate the Middle
    detail: 'Find the middle index: (0 + 9) // 2 = 4. The element at index 4 is 9. Is 9 our target 13?
      No. Is 9 less than 13? Yes - so our target must be to the right of the middle.'
    math: The // operator is integer division - it rounds down. (0+9)//2 = 9//2 = 4 (not 4.5). This ensures
      we always get a valid array index.
    cost: O(1) - first check
    lines:
    - 4
    - 5
    - 6
  - title: Eliminate the Left Half
    detail: 9 < 13, so 13 must be somewhere to the right. We move left to mid + 1 = 5. We just eliminated
      5 elements from consideration! We now only search [11, 13, 15, 17, 19].
    math: 'This is the magic of binary search: every step halves the remaining search space. Start with
      10 items, step 1 leaves 5, step 2 leaves ~2-3, step 3 likely finds it. For 1,000 items: only ~10
      steps needed.'
    cost: 'Remaining: 5 items'
    lines:
    - 8
    - 9
  - title: Second Middle - Closer!
    detail: 'New middle: (5 + 9) // 2 = 7. Element at index 7 is 15. Is 15 our target 13? No. Is 15 greater
      than 13? Yes - so 13 must be to the left. Move right to mid - 1 = 6.'
    math: null
    cost: 'Remaining: 2 items'
    lines:
    - 4
    - 5
    - 6
    - 10
    - 11
  - title: Third Middle - Found It!
    detail: 'New middle: (5 + 6) // 2 = 5. Element at index 5 is 11. Not 13. 11 < 13, so move left to
      6.'
    math: null
    cost: 'Remaining: 1 item'
    lines:
    - 4
    - 5
    - 8
    - 9
  - title: Target Found!
    detail: 'Middle: (6 + 6) // 2 = 6. Element at index 6 is 13. That''s our target! Return 6. We found
      it in just 4 steps out of 10 elements.'
    math: 'log2(10) ≈ 3.32, so about 4 steps. For 1,000 items: log2(1000) ≈ 10 steps. For 1,000,000 items:
      log2(1,000,000) = 20 steps. This is what O(log n) means - doubling the input size only adds one
      more step.'
    cost: O(log n) - done in 4 steps!
    lines:
    - 6
    - 7
challenges:
- title: Search in Rotated Sorted Array
  difficulty: medium
  description: An integer array of unique elements was sorted then rotated at an unknown pivot. Given
    the array and a target, return the index of the target or -1 if not present. Must be O(log n).
  starter: "def search(nums, target):\n    # Determine which half is sorted, then decide where to search\n\
    \    pass\n\nprint(search([4, 5, 6, 7, 0, 1, 2], 0))  # 4\nprint(search([4, 5, 6, 7, 0, 1, 2], 3))\
    \  # -1\nprint(search([1], 0))                      # -1\n"
  tests:
  - input: search([4,5,6,7,0,1,2], 0)
    expected: '4'
  - input: search([4,5,6,7,0,1,2], 3)
    expected: '-1'
  - input: search([1], 0)
    expected: '-1'
  hints:
  - At least one half of the array is always fully sorted after rotation.
  - Compare nums[lo] with nums[mid] to determine which half is sorted.
  - If the left half is sorted and target is in [nums[lo], nums[mid]), search left.
  - Otherwise search right. Symmetric logic for right half sorted case.
  tags:
  - binary-search
  - google-favorite
  - common-pattern
  optimal: O(log n) time, O(1) space
- title: Find Minimum in Rotated Sorted Array
  difficulty: medium
  description: Given a rotated sorted array of unique elements, find the minimum element in O(log n) time.
  starter: "def find_min(nums):\n    # Binary search for the pivot/inflection point\n    pass\n\nprint(find_min([3,\
    \ 4, 5, 1, 2]))        # 1\nprint(find_min([4, 5, 6, 7, 0, 1, 2]))  # 0\nprint(find_min([11, 13, 15,\
    \ 17]))        # 11\n"
  tests:
  - input: find_min([3,4,5,1,2])
    expected: '1'
  - input: find_min([4,5,6,7,0,1,2])
    expected: '0'
  - input: find_min([11,13,15,17])
    expected: '11'
  hints:
  - The minimum is at the rotation point.
  - If nums[mid] > nums[hi], the minimum is in the right half.
  - If nums[mid] <= nums[hi], the minimum is in the left half (including mid).
  - 'Loop condition: lo < hi (not lo <= hi).'
  tags:
  - binary-search
  - common-pattern
  optimal: O(log n) time, O(1) space
---

# Binary Search

Binary search is deceptively tricky: off-by-one errors are everywhere. Beyond sorted array search, master the generalized template for searching over a monotonic answer space.

## Key points

- Template: lo=0, hi=len-1, while lo<=hi, mid=(lo+hi)//2
- Rotated array: determine which half is sorted, then check target
- Search space reduction: binary search works on any monotonic predicate
- Find first/last occurrence: don't return immediately, keep shrinking
- "Leftmost" vs "rightmost" insertion point changes the boundary update

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
# --- Classic binary search ---
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

# --- Search in Rotated Sorted Array ---
def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:  # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:  # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

# --- Binary search on answer space: Minimum eating speed ---
def min_eating_speed(piles, h):
    def can_eat(speed):
        return sum((p + speed - 1) // speed for p in piles) <= h
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_eat(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

print(binary_search([1, 3, 5, 7, 9, 11], 7))            # 3
print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))         # 4
print(min_eating_speed([3, 6, 7, 11], 8))                # 4
```

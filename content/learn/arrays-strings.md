---
title: Arrays & Strings
order: 2
summary: The foundation of all interview problems. Master two-pointer techniques, sliding window patterns,
  and in-place manipulation to solve the majority of Google array questions.
category: Data structures
level: Beginner
bigO:
  best: O(1)
  average: O(n)
  worst: O(n)
  space: O(1)
explained:
  time: O(n) for most traversals - you visit each element once. Two-pointer is also O(n) because even
    though you have two pointers, they each move at most n total steps together, never backwards.
  space: O(1) for in-place operations - you are just moving two index variables around, not creating new
    arrays. No extra data structures needed.
  visual: Imagine scanning a hallway of n lockers. O(n) = open each locker once. O(1) space = you just
    use your two hands as pointers, no backpack.
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
brute:
  brute:
    pros:
    - Easy to understand
    - No extra memory needed
    - Good starting point in interview
    cons:
    - Too slow for large arrays (n=10,000 means 100 million checks)
    - Interviewer will ask you to optimize
    name: Brute Force - Nested Loops
    time: O(n^2)
    space: O(1)
    quote: Check every pair of numbers. Two nested loops.
  optimized:
    pros:
    - Fast - single pass through array
    - Each lookup is O(1)
    - This is what Google wants to see
    cons:
    - Uses O(n) extra memory for the hash map
    name: Hash Map - Single Pass
    time: O(n)
    space: O(n)
    quote: Store each number in a hash map. Check if complement exists in O(1).
  title: Two Sum
  strategy: Start brute force, explain it, then optimize.
  quote: I can see a straightforward approach. Let me start there, then we can optimize.
  tradeoff: Trading O(n) extra space to reduce time from O(n^2) to O(n). For n=10,000 that is 100,000,000
    operations down to 10,000.
  atN: 1,000
  tip: The brute force checks every pair in O(n^2). We can do better by using a hash map to remember what
    we have seen, giving us O(n) time with O(n) space.
math:
- id: constant-complexity
  title: Constant time - O(1)
  plain: No matter how large the input is, this operation always takes the same amount of time. The size
    of n simply does not matter.
  visual: A perfectly flat horizontal line on a graph. The line never rises no matter how far right you
    go.
  analogy: Looking up a word in a dictionary if you already know the exact page number. It does not matter
    how thick the dictionary is.
- id: index-arithmetic
  title: Index arithmetic - pointers as numbers
  plain: An array index is just a number pointing to a position. "left + right" divided by 2 gives the
    middle position. Moving a pointer means adding or subtracting 1 from that number. Two-pointer technique
    is literally just two variables holding index numbers.
  visual: A row of numbered boxes (0, 1, 2, 3...). Two highlighted arrows sit under two of the boxes.
    They move toward each other as you click through the algorithm.
  analogy: Two people walking toward each other on a straight road. Each person is an index. They meet
    somewhere in the middle.
- id: summation-series
  title: Summation - adding up a series
  plain: 1 + 2 + 3 + ... + n always equals n×(n+1)/2. For n=10 that is 55. For n=100 that is 5,050. This
    is approximately n²/2 - which Big-O rounds to O(n²).
  visual: Stack bars of height 1, 2, 3, 4... They form a triangle. A triangle is half a square (n×n),
    so the total is roughly n²/2.
  analogy: Stacking cannon balls in a triangle. The bottom row has n balls, the next has n-1, the next
    has n-2. Total balls = n(n+1)/2.
walkthrough:
  problem: Two Sum - Hash Map
  tagline: Find two numbers that add up to a target. One pass with a hash map.
  time: O(n)
  space: O(n)
  code: "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement\
    \ = target - num\n        if complement in seen:\n            return [seen[complement], i]\n     \
    \   seen[num] = i\n    return []"
  steps:
  - title: The Setup
    detail: 'We have an array of numbers and a target. We need to find two numbers that add up to the
      target and return their positions (indices). Our example: find two numbers in [2, 7, 11, 15] that
      add up to 9.'
    math: null
    cost: Starting...
    lines:
    - 1
  - title: Create an Empty "Memory" - the Hash Map
    detail: We create an empty dictionary called "seen". This will act as our memory - we'll store every
      number we've looked at so far, along with its index. Think of it like a sticky note where we write
      down "I saw the number 7 at position 1".
    math: A hash map (dictionary) lets you look up any value in O(1) - constant time. It's like a perfectly
      organized filing cabinet where you can jump directly to any drawer without searching.
    cost: O(1) so far
    lines:
    - 2
  - title: 'First Number: 2 at index 0'
    detail: 'We look at the first number: 2 (at index 0). We calculate the complement: target minus this
      number = 9 - 2 = 7. We''re asking: "Is 7 already in our memory?" Not yet - we haven''t seen anything.
      So we save 2 in our memory.'
    math: null
    cost: O(1) - looked up in hash map
    lines:
    - 3
    - 4
    - 5
    - 6
  - title: Save 2 in Memory
    detail: 'Since 7 (the complement we need) isn''t in our memory yet, we save what we just saw: "I saw
      number 2 at index 0." Now our hash map has one entry.'
    math: Writing to a hash map is also O(1). No matter how many items are already in it, writing a new
      one takes the same tiny amount of time.
    cost: O(1)
    lines:
    - 7
  - title: 'Second Number: 7 at index 1'
    detail: 'Now we look at 7 (at index 1). Complement = 9 - 7 = 2. We ask: "Is 2 in our memory?" Yes!
      We recorded "2 is at index 0" in the last step!'
    math: null
    cost: O(1) - lookup found it!
    lines:
    - 3
    - 4
    - 5
  - title: Found the Answer!
    detail: We found 2 in our memory at index 0, and we're currently at index 1. So the answer is [0,
      1] - positions 0 and 1. The numbers at those positions are 2 + 7 = 9. That's our target!
    math: 'Total time: O(n) because we look at each number once. Each lookup/write is O(1). So n numbers
      x O(1) per number = O(n). Compared to a brute-force double loop which is O(n^2).'
    cost: O(n) total - done!
    lines:
    - 6
  - title: Why This Works
    detail: 'For each number, we ask: "Have I already seen its partner?" If yes - done! If no - remember
      this number for later. Because we remember everything in a hash map, each lookup is instant. We
      only walk through the array once.'
    math: 'Brute force: check every pair - O(n^2). Hash map: check each number once with O(1) lookup -
      O(n). For 1 million numbers: brute force = 1 trillion operations. Hash map = 1 million operations.
      This is why hash maps are powerful.'
    cost: O(n) time, O(n) space
    lines:
    - 1
    - 2
    - 3
    - 4
    - 5
    - 6
    - 7
challenges:
- title: Two Sum
  difficulty: easy
  description: Given an array of integers `nums` and an integer `target`, return the indices of the two
    numbers that add up to `target`. Each input has exactly one solution. You may not use the same element
    twice.
  hints:
  - A brute-force O(n^2) solution checks every pair. Can you do better?
  - Store each number's index in a hash map as you iterate.
  - For each element x, check if (target - x) is already in the map.
  optimal: O(n) time, O(n) space
- title: Maximum Subarray
  difficulty: medium
  description: Given an integer array `nums`, find the contiguous subarray (containing at least one element)
    which has the largest sum and return its sum.
  hints:
  - Track the current running sum and the global maximum.
  - If adding the next element makes the sum smaller than starting fresh, reset.
  - current = max(nums[i], current + nums[i])
  optimal: O(n) time, O(1) space
- title: Minimum Window Substring
  difficulty: hard
  description: Given strings `s` and `t`, return the minimum window substring of `s` such that every character
    in `t` (including duplicates) is included. Return empty string if no such window exists.
  hints:
  - Use two pointers (left, right) to expand and contract the window.
  - Keep a frequency count of required characters vs. characters currently in window.
  - Track how many unique characters from t are satisfied in the current window.
  - Shrink from the left once all characters are satisfied to minimize window.
  optimal: O(|s| + |t|) time, O(|s| + |t|) space
---

# Arrays & Strings

The foundation of all interview problems. Master two-pointer techniques, sliding window patterns, and in-place manipulation to solve the majority of Google array questions.

## Key points

- Two-pointer technique for sorted arrays and palindrome checks
- Sliding window for substring/subarray problems with a constraint
- Prefix sums for range query optimizations
- In-place reversal and rotation without extra space
- Kadane's algorithm for maximum subarray

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
# --- Two Pointers: Container With Most Water ---
def max_water(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        area = min(height[left], height[right]) * (right - left)
        best = max(best, area)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best

# --- Sliding Window: Longest substring without repeating chars ---
def length_of_longest_substring(s):
    char_index = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in char_index and char_index[ch] >= left:
            left = char_index[ch] + 1
        char_index[ch] = right
        best = max(best, right - left + 1)
    return best

# --- Prefix Sum: Range sum queries ---
def range_sum_query(nums, queries):
    prefix = [0] * (len(nums) + 1)
    for i, n in enumerate(nums):
        prefix[i + 1] = prefix[i] + n
    return [prefix[r + 1] - prefix[l] for l, r in queries]

print(max_water([1, 8, 6, 2, 5, 4, 8, 3, 7]))   # 49
print(length_of_longest_substring("abcabcbb"))    # 3
print(range_sum_query([1, 2, 3, 4, 5], [(1, 3)]))  # [9]
```

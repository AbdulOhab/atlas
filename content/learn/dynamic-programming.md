---
title: Dynamic Programming
order: 13
summary: 'DP is the hardest category but appears in ~30% of Google hard problems. The key insight: optimal
  substructure + overlapping subproblems. Master the pattern recognition across 1D, 2D, and interval DP.'
category: Algorithms
level: Expert
bigO:
  best: O(n)
  average: O(n^2)
  worst: O(n^2)
  space: O(n)
explained:
  time: O(n × m) for 2D DP problems where n and m are the table dimensions. Each cell is computed once
    in O(1) or O(k) time (where k is some factor per cell, like coin denominations). Much better than
    the O(2ⁿ) naive recursion.
  space: O(n × m) for full table. Often reducible to O(n) or O(1) if only the previous row is needed.
  visual: A crossword grid. You fill in cells from the top-left. Each cell's answer depends on its neighbors
    to the top and left (already filled). The final answer is in the bottom-right corner. Fill time =
    number of cells = n×m.
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
brute:
  brute:
    pros:
    - Directly mirrors the mathematical definition
    - Easy to write
    cons:
    - Exponentially slow - fib(40) takes over a billion calls
    - Massive duplicated work
    name: Naive Recursion
    time: O(2^n)
    space: O(n)
    quote: Recursively compute fib(n-1) + fib(n-2). Recomputes the same values over and over.
  optimized:
    pros:
    - Linear time
    - Constant space with the two-variable trick
    - No recursion overhead
    cons:
    - Less intuitive than recursion for some people
    name: Bottom-Up DP (Tabulation)
    time: O(n)
    space: O(1)
    quote: Build answer from the bottom. Only need the last two values at each step.
  title: Fibonacci / Climbing Stairs
  strategy: Start brute force, explain it, then optimize.
  quote: I can see a straightforward approach. Let me start there, then we can optimize.
  tradeoff: 'From O(2^n) to O(n) - exponential to linear. For n=40: recursion makes 1,073,741,824 calls.
    DP does 40 iterations. This is the biggest speedup you will ever see.'
  atN: '40'
  tip: The recursive solution has overlapping subproblems - fib(3) gets computed many times. By storing
    results bottom-up, we eliminate all duplicate work.
math:
- id: exponential-growth
  title: Exponents - doubling chains
  plain: 2ⁿ means you start with 1 and double it n times. n=10 gives you 1,024. n=20 gives you 1,048,576.
    n=30 gives you over a billion. It grows terrifyingly fast.
  visual: A curve that looks almost flat near zero, then bends upward so steeply it nearly goes straight
    up. Compare it side by side with a straight line (linear) and the difference is shocking.
  analogy: A chain letter. You send it to 2 friends. Each of them sends it to 2 friends. After 30 rounds,
    over a billion letters have been sent.
- id: memoization-math
  title: Memoization - trading space for time
  plain: 'The key insight: if you have already computed a result, store it. If you see the same subproblem
    again, look up the answer instead of recomputing. The number of unique subproblems is usually polynomial
    (like n², much smaller than the exponential number of total recursive calls).'
  visual: 'Two trees side by side. Left: naive recursion, the same nodes appear many times (shaded in
    red = duplicated work). Right: memoized version, duplicated nodes are replaced by a single cached
    result (green = lookup).'
  analogy: Doing your taxes every year. The first year is hard. But if you kept last year's return, you
    can copy and adjust instead of starting from scratch. Memoization is the filing cabinet.
- id: dp-table-filling
  title: DP tables - filling a grid
  plain: Bottom-up DP builds a table where each cell depends only on cells you have already filled. You
    fill the table from small subproblems to large ones. The answer is usually in the last cell. The table
    size determines the space and time complexity.
  visual: A grid with rows and columns. Cells fill in from top-left to bottom-right. Arrows show which
    earlier cells each new cell depends on. The bottom-right corner holds the final answer.
  analogy: Building a staircase from the ground up. You cannot place the 10th step until the 9th is stable.
    Each step depends on the ones below it.
walkthrough:
  problem: Dynamic Programming - Climbing Stairs
  tagline: Build up the answer from tiny known answers. Never recalculate the same thing twice.
  time: O(n)
  space: O(n)
  code: "def climb_stairs(n):\n    # DP approach: build up from base cases\n    if n <= 2:\n        return\
    \ n\n\n    dp = [0] * (n + 1)\n    dp[1] = 1  # 1 way to reach step 1\n    dp[2] = 2  # 2 ways to\
    \ reach step 2\n\n    for i in range(3, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n\n    return dp[n]"
  steps:
  - title: The Problem
    detail: 'You''re climbing stairs. Each step you can go 1 stair or 2 stairs. How many different ways
      can you reach stair N? For N=5: there are 8 ways. Let''s find a pattern by solving smaller cases
      first.'
    math: null
    cost: Building DP table...
    lines:
    - 1
    - 2
    - 3
    - 4
  - title: Why Not Brute Force?
    detail: 'A naive approach tries every possible path recursively. The problem: you recalculate the
      same sub-problems over and over. climb(3) gets computed multiple times. For N=10, you''d make over
      100 calls. For N=40, over 1 billion calls. This is O(2^n) - catastrophically slow.'
    math: 'O(2^n) means doubling the input squares the work: N=10 needs ~1,024 calls, N=20 needs ~1,000,000,
      N=40 needs ~1 trillion. This is why DP exists - to avoid this explosion.'
    cost: 'Brute force: O(2^n)'
    lines:
    - 1
  - title: The DP Insight - Save Your Work
    detail: 'Key insight: the number of ways to reach stair i = (ways to reach stair i-1) + (ways to reach
      stair i-2). Why? Because you can only arrive at stair i from stair i-1 (took 1 step) or stair i-2
      (took 2 steps). So we build a table and save each answer.'
    math: 'This is called a recurrence relation: dp[i] = dp[i-1] + dp[i-2]. You might recognize this -
      it''s the Fibonacci sequence! Many DP problems reduce to Fibonacci-like patterns.'
    cost: O(1) per cell
    lines:
    - 5
    - 6
    - 7
  - title: Fill dp[3] - 3 Ways
    detail: 'dp[3] = dp[2] + dp[1] = 2 + 1 = 3. The 3 ways to reach stair 3: (1+1+1), (1+2), (2+1). We
      just looked up two already-computed values - no recalculation needed!'
    math: null
    cost: O(1) this step
    lines:
    - 9
    - 10
  - title: Fill dp[4] - 5 Ways
    detail: dp[4] = dp[3] + dp[2] = 3 + 2 = 5. Five ways to reach stair 4. Each calculation is O(1) -
      just add two numbers we already know!
    math: null
    cost: O(1) this step
    lines:
    - 9
    - 10
  - title: Fill dp[5] - Answer!
    detail: dp[5] = dp[4] + dp[3] = 5 + 3 = 8. There are 8 ways to climb 5 stairs! We return dp[5] = 8.
    math: 'Total time: O(n) - we fill n cells, each in O(1). Compare to brute force O(2^n). For n=40:
      DP does 40 operations vs brute force doing 1 trillion. This is the power of dynamic programming.'
    cost: O(n) total - done!
    lines:
    - 9
    - 10
    - 12
challenges:
- title: Coin Change
  difficulty: medium
  description: Given an integer array `coins` representing coin denominations and an integer `amount`,
    return the fewest number of coins needed to make up that amount. If not possible, return -1.
  hints:
  - dp[i] = minimum coins to make amount i.
  - dp[0] = 0 (base case), dp[i] = infinity initially.
  - 'For each amount, try each coin: dp[amt] = min(dp[amt], dp[amt-coin] + 1).'
  - The bottom-up approach processes amounts from 1 to target.
  optimal: O(n * amount) time, O(amount) space
- title: Longest Common Subsequence
  difficulty: medium
  description: Given two strings `text1` and `text2`, return the length of their longest common subsequence.
    A subsequence is a sequence derived by deleting some characters without changing the relative order.
  hints:
  - dp[i][j] = LCS of text1[:i] and text2[:j].
  - 'If text1[i-1] == text2[j-1]: dp[i][j] = dp[i-1][j-1] + 1'
  - 'Otherwise: dp[i][j] = max(dp[i-1][j], dp[i][j-1])'
  - Build the table iterating both strings.
  optimal: O(m*n) time, O(m*n) space
---

# Dynamic Programming

DP is the hardest category but appears in ~30% of Google hard problems. The key insight: optimal substructure + overlapping subproblems. Master the pattern recognition across 1D, 2D, and interval DP.

## Key points

- 1D DP: Fibonacci, climbing stairs, house robber, longest increasing subsequence
- 2D DP: Unique paths, edit distance, longest common subsequence
- State definition is 80% of solving a DP problem
- Top-down (memoization) is easier to write; bottom-up avoids recursion overhead
- Space optimization: many 2D DPs can use O(n) space with rolling array

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
import bisect

# --- Longest Increasing Subsequence (LIS) - O(n log n) ---
def lis_length(nums):
    tails = []
    for n in nums:
        pos = bisect.bisect_left(tails, n)
        if pos == len(tails):
            tails.append(n)
        else:
            tails[pos] = n
    return len(tails)

# --- Edit Distance (Levenshtein) ---
def edit_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev = dp[:]
        dp[0] = i
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[j] = prev[j-1]
            else:
                dp[j] = 1 + min(prev[j-1], prev[j], dp[j-1])
    return dp[n]

# --- Coin Change (unbounded knapsack pattern) ---
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for amt in range(coin, amount + 1):
            dp[amt] = min(dp[amt], dp[amt - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

# --- Longest Common Subsequence ---
def lcs(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

print(lis_length([10, 9, 2, 5, 3, 7, 101, 18]))  # 4
print(edit_distance("horse", "ros"))               # 3
print(coin_change([1, 5, 11], 15))                 # 3
print(lcs("abcde", "ace"))                         # 3
```

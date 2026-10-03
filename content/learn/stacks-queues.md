---
title: Stacks & Queues
order: 4
summary: Essential for parsing, BFS/DFS, and monotonic problems. The monotonic stack pattern solves a
  family of "next greater element" problems elegantly. Queues are the backbone of BFS.
category: Data structures
level: Beginner
bigO:
  best: O(1)
  average: O(1)
  worst: O(n)
  space: O(n)
explained:
  time: O(1) for push, pop, peek on a stack; O(1) for enqueue and dequeue on a queue. These are constant
    time because you always operate on one specific end - no searching required.
  space: O(n) where n is the number of items currently stored. The space grows with what you put in it.
  visual: A can of Pringles (stack) or a roll of toilet paper dispenser (queue). Adding or removing one
    chip/sheet is always one action, regardless of how many are in there.
structures:
- concept: Queue
  python: collections.deque
  aliases:
  - FIFO Queue
  declaration: queue = deque()
  ops:
  - op: enqueue
    code: queue.append(x)
    cost: O(1)
  - op: dequeue
    code: queue.popleft()
    cost: O(1)
  - op: length
    code: len(queue)
    cost: O(1)
- concept: Stack
  python: list
  aliases:
  - LIFO Stack
  - Call Stack
  declaration: stack = []
  ops:
  - op: push
    code: stack.append(x)
    cost: O(1)
  - op: pop
    code: stack.pop()
    cost: O(1)
  - op: peek
    code: stack[-1]
    cost: O(1)
- concept: Deque
  python: collections.deque
  aliases:
  - Double-ended Queue
  declaration: dq = deque()
  ops:
  - op: append right
    code: dq.append(x)
    cost: O(1)
  - op: append left
    code: dq.appendleft(x)
    cost: O(1)
  - op: pop right
    code: dq.pop()
    cost: O(1)
  - op: pop left
    code: dq.popleft()
    cost: O(1)
math:
- id: constant-complexity
  title: Constant time - O(1)
  plain: No matter how large the input is, this operation always takes the same amount of time. The size
    of n simply does not matter.
  visual: A perfectly flat horizontal line on a graph. The line never rises no matter how far right you
    go.
  analogy: Looking up a word in a dictionary if you already know the exact page number. It does not matter
    how thick the dictionary is.
- id: lifo-fifo-ordering
  title: Order matters - LIFO vs FIFO
  plain: 'LIFO: Last In, First Out. The most recently added item is the first to leave. FIFO: First In,
    First Out. The oldest item is the first to leave. This is pure ordering logic - no complex math, just
    "which item goes next?"'
  visual: 'Two animated structures side by side. Stack (LIFO): a vertical pile where items can only be
    added or removed from the top. Queue (FIFO): a horizontal tube where items enter on the right and
    exit on the left.'
  analogy: 'Stack: a pile of plates. You put a plate on top, you take a plate from the top. Queue: a line
    at a coffee shop. First person in line gets served first.'
challenges:
- title: Valid Parentheses
  difficulty: easy
  description: Given a string containing just the characters `(`, `)`, `{`, `}`, `[`, `]`, determine if
    the input string is valid. Open brackets must be closed by the same type and in the correct order.
  hints:
  - Push opening brackets onto the stack.
  - For closing brackets, check if the top of the stack is the matching opener.
  - At the end, the stack should be empty for a valid string.
  optimal: O(n) time, O(n) space
- title: Daily Temperatures
  difficulty: medium
  description: Given an array `temperatures`, return an array `answer` where `answer[i]` is the number
    of days you have to wait after the ith day to get a warmer temperature. If there is no future day
    with a warmer temperature, set `answer[i] = 0`.
  hints:
  - Maintain a stack of indices where temperatures are decreasing.
  - When you find a warmer temp, pop indices from the stack and compute the wait.
  - answer[stack.pop()] = current_index - popped_index
  optimal: O(n) time, O(n) space
---

# Stacks & Queues

Essential for parsing, BFS/DFS, and monotonic problems. The monotonic stack pattern solves a family of "next greater element" problems elegantly. Queues are the backbone of BFS.

## Key points

- Monotonic stack maintains elements in sorted order by popping
- Use deque (collections.deque) for O(1) both ends in Python
- Stack for DFS, queue for BFS - the fundamental distinction
- Valid parentheses and nested structure problems are classic stack use cases
- Sliding window maximum uses a monotonic deque (O(n) total)

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
from collections import deque

# --- Valid Parentheses ---
def is_valid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for ch in s:
        if ch in '({[':
            stack.append(ch)
        elif not stack or stack[-1] != pairs[ch]:
            return False
        else:
            stack.pop()
    return not stack

# --- Monotonic Stack: Next Greater Element ---
def next_greater(nums):
    result = [-1] * len(nums)
    stack = []  # stores indices
    for i, n in enumerate(nums):
        while stack and nums[stack[-1]] < n:
            result[stack.pop()] = n
        stack.append(i)
    return result

# --- Sliding Window Maximum (monotonic deque) ---
def max_sliding_window(nums, k):
    dq = deque()  # stores indices, front = max
    result = []
    for i, n in enumerate(nums):
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        while dq and nums[dq[-1]] < n:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result

print(is_valid("()[]{}"))             # True
print(is_valid("([)]"))               # False
print(next_greater([2, 1, 2, 4, 3]))  # [4, 2, 4, -1, -1]
print(max_sliding_window([1,3,-1,-3,5,3,6,7], 3))  # [3,3,5,5,6,7]
```

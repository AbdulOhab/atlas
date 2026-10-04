---
title: Greedy Algorithms
order: 15
viz: intervals
summary: Greedy algorithms make the locally optimal choice at each step. Proving a greedy works requires
  showing the greedy choice property and optimal substructure. Interval problems are the classic greedy
  domain.
category: Algorithms
level: Intermediate
bigO:
  best: O(n log n)
  average: O(n log n)
  worst: O(n log n)
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
- concept: Heap
  python: heapq
  aliases:
  - Priority Queue
  - Min Heap
  - Max Heap
  declaration: 'h = []

    heapq.heapify(h)'
  ops:
  - op: push
    code: heapq.heappush(h, x)
    cost: O(log n)
  - op: pop min
    code: heapq.heappop(h)
    cost: O(log n)
  - op: peek min
    code: h[0]
    cost: O(1)
  - op: heapify list
    code: heapq.heapify(lst)
    cost: O(n)
math:
- id: local-vs-global-optimum
  title: Local vs global optimum
  plain: A local optimum is the best choice right now. A global optimum is the best choice for the entire
    problem. Greedy algorithms always pick the local optimum at each step and hope (or can prove) this
    leads to the global optimum. Sometimes it works, sometimes it does not.
  visual: A landscape of hills. The global maximum is the tallest peak. A local maximum is any peak where
    the ground slopes down in all directions - but it might be a small hill with a bigger mountain nearby.
    Greedy always climbs the steepest nearby slope.
  analogy: Hiking to the tallest mountain. If you always walk uphill, you might reach the top of a small
    hill and get stuck. To find the tallest peak, sometimes you have to go downhill first (which greedy
    never does).
  why: Knowing when greedy works (interval scheduling, Huffman coding, Dijkstra) vs when it fails (coin
    change with arbitrary denominations, general knapsack) is the key insight for this category.
challenges:
- title: Jump Game
  difficulty: medium
  description: Given an integer array `nums` where `nums[i]` is the maximum jump length from position
    i, return true if you can reach the last index from index 0.
  starter: "def can_jump(nums):\n    # Track the farthest index reachable\n    pass\n\nprint(can_jump([2,\
    \ 3, 1, 1, 4]))  # True\nprint(can_jump([3, 2, 1, 0, 4]))  # False\nprint(can_jump([0]))         \
    \     # True\n"
  tests:
  - input: can_jump([2,3,1,1,4])
    expected: 'True'
  - input: can_jump([3,2,1,0,4])
    expected: 'False'
  hints:
  - Iterate forward, tracking the farthest index reachable so far.
  - If your current index exceeds the farthest reachable, you are stuck.
  - max_reach = max(max_reach, i + nums[i])
  - If i <= max_reach at every step and max_reach >= last_index, return True.
  tags:
  - greedy
  - google-favorite
  optimal: O(n) time, O(1) space
---

# Greedy Algorithms

Greedy algorithms make the locally optimal choice at each step. Proving a greedy works requires showing the greedy choice property and optimal substructure. Interval problems are the classic greedy domain.

## Key points

- Interval scheduling: sort by end time, always pick earliest-ending compatible interval
- Activity selection: greedy works because delayed choices cannot improve the solution
- Jump game: track the farthest position reachable
- Gas station: if total gas >= total cost, a solution exists (proof by invariant)
- Proof technique: exchange argument - show swapping to greedy choice never worsens result

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
# --- Interval Scheduling (Maximum Non-Overlapping Intervals) ---
def erase_overlap_intervals(intervals):
    if not intervals:
        return 0
    intervals.sort(key=lambda x: x[1])  # sort by end time
    count = 0
    last_end = intervals[0][1]
    for start, end in intervals[1:]:
        if start < last_end:
            count += 1  # remove this overlapping interval
        else:
            last_end = end
    return count

# --- Jump Game II (minimum jumps) ---
def jump(nums):
    jumps = 0
    current_end = 0
    farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:
            jumps += 1
            current_end = farthest
    return jumps

# --- Meeting Rooms II (minimum meeting rooms) ---
import heapq

def min_meeting_rooms(intervals):
    if not intervals:
        return 0
    intervals.sort()
    heap = []  # stores end times of ongoing meetings
    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heapreplace(heap, end)
        else:
            heapq.heappush(heap, end)
    return len(heap)

print(erase_overlap_intervals([[1,2],[2,3],[3,4],[1,3]]))  # 1
print(jump([2, 3, 1, 1, 4]))                                # 2
print(min_meeting_rooms([[0,30],[5,10],[15,20]]))           # 2
```

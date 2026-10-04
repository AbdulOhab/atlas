---
title: Heaps / Priority Queues
order: 8
viz: heap
summary: Heaps efficiently maintain the max or min element. Python's heapq is a min-heap. The top-K pattern
  and merge-K-sorted-lists are classic Google questions.
category: Data structures
level: Intermediate
bigO:
  best: O(1)
  average: O(log n)
  worst: O(log n)
  space: O(n)
structures:
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
- id: heap-array-indexing
  title: Array indexing for trees
  plain: 'A heap looks like a tree but is actually stored as a flat array. The math that makes this work:
    if a node is at index i, its left child is at index 2i+1, its right child is at index 2i+2, and its
    parent is at index (i-1)/2 (rounded down). These simple formulas replace the need for actual pointers.'
  visual: The tree visualization on the left, the array on the right. Click a node in the tree and the
    corresponding array index highlights. Move to a child - see the 2i+1 formula compute live.
  analogy: A tournament bracket stored as a list. The champion is position 1. Their two finalists are
    positions 2 and 3. The semi-finalists are positions 4, 5, 6, 7. Each level doubles.
  why: Because a heap is a complete binary tree, its height is always log(n). Bubble-up and sink-down
    operations travel at most log(n) steps, giving O(log n) insert and extract.
challenges:
- title: Kth Largest Element in Array
  difficulty: medium
  description: Given an integer array `nums` and an integer `k`, return the kth largest element. Note
    that it is the kth largest in sorted order, not the kth distinct element.
  starter: "import heapq\n\ndef find_kth_largest(nums, k):\n    # Use a min-heap of size k\n    pass\n\
    \nprint(find_kth_largest([3, 2, 1, 5, 6, 4], 2))  # 5\nprint(find_kth_largest([3, 2, 3, 1, 2, 4, 5,\
    \ 5, 6], 4))  # 4\n"
  tests:
  - input: find_kth_largest([3,2,1,5,6,4], 2)
    expected: '5'
  - input: find_kth_largest([3,2,3,1,2,4,5,5,6], 4)
    expected: '4'
  hints:
  - Sorting is O(n log n). Can you do O(n log k)?
  - Maintain a min-heap of exactly k elements.
  - If a new element is larger than the heap's minimum, replace it.
  - The heap minimum at the end is the kth largest.
  tags:
  - heap
  - top-k
  - google-favorite
  optimal: O(n log k) time, O(k) space
---

# Heaps / Priority Queues

Heaps efficiently maintain the max or min element. Python's heapq is a min-heap. The top-K pattern and merge-K-sorted-lists are classic Google questions.

## Key points

- Python heapq is min-heap; negate values for max-heap behavior
- Top-K elements: maintain heap of size K, O(n log k)
- heapq.heapify() builds heap from list in O(n)
- heapq.nlargest/nsmallest for one-off queries
- Merge K sorted lists: push (val, list_idx, element_idx) tuples

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
import heapq
from collections import Counter

# --- Top K Frequent Elements using heap ---
def top_k_frequent(nums, k):
    count = Counter(nums)
    heap = []
    for num, freq in count.items():
        heapq.heappush(heap, (freq, num))
        if len(heap) > k:
            heapq.heappop(heap)
    return [num for freq, num in heap]

# --- Kth Largest Element ---
def find_kth_largest(nums, k):
    heap = nums[:k]
    heapq.heapify(heap)
    for n in nums[k:]:
        if n > heap[0]:
            heapq.heapreplace(heap, n)
    return heap[0]

# --- Merge K Sorted Lists ---
def merge_k_sorted(lists):
    heap = []
    result = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], i, 0))
    while heap:
        val, li, idx = heapq.heappop(heap)
        result.append(val)
        if idx + 1 < len(lists[li]):
            heapq.heappush(heap, (lists[li][idx + 1], li, idx + 1))
    return result

print(top_k_frequent([1,1,1,2,2,3], 2))       # [1, 2]
print(find_kth_largest([3,2,1,5,6,4], 2))      # 5
print(merge_k_sorted([[1,4,5],[1,3,4],[2,6]])) # [1,1,2,3,4,4,5,6]
```

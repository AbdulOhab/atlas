---
title: Linked Lists
order: 3
summary: Pointer manipulation mastery. Google loves linked list problems because they test careful thinking
  about references and edge cases. Learn reversal, cycle detection with Floyd's algorithm, and merge patterns.
category: Data structures
level: Beginner
bigO:
  best: O(1)
  average: O(n)
  worst: O(n)
  space: O(1)
explained:
  time: O(n) to traverse or search - you follow pointers one at a time from head to tail. O(1) to insert
    or delete once you already have the node - just redirect a couple of arrows.
  space: O(1) for iterative traversal. O(n) for recursive traversal because each recursive call sits on
    the call stack.
  visual: A chain of paper clips. To find clip number 50, you count through 50 clips one by one. But to
    add a clip in the middle, you just unhook one link and reattach.
structures:
- concept: Linked List
  python: class ListNode (no built-in)
  aliases:
  - Singly Linked List
  - Doubly Linked List
  declaration: "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n \
    \       self.next = next"
  ops:
  - op: pointer traversal
    code: curr = curr.next
    cost: O(n)
  - op: insert after node
    code: node.next = new_node
    cost: O(1)
  - op: delete next node
    code: node.next = node.next.next
    cost: O(1)
brute:
  brute:
    pros:
    - Easy to understand
    - Works on first try
    cons:
    - Uses O(n) extra space for the set
    name: Hash Set - Track Visited
    time: O(n)
    space: O(n)
    quote: Store every visited node in a set. If we see a node twice, there is a cycle.
  optimized:
    pros:
    - O(1) space - no extra memory at all
    - Elegant - shows deep understanding
    - Google loves this
    cons:
    - Harder to understand why it works
    - Need to prove correctness
    name: Floyd's Tortoise and Hare
    time: O(n)
    space: O(1)
    quote: Two pointers at different speeds. If they meet, there is a cycle.
  title: Detect Cycle in Linked List
  strategy: Start brute force, explain it, then optimize.
  quote: I can see a straightforward approach. Let me start there, then we can optimize.
  tradeoff: Same time complexity, but the optimized version uses O(1) space instead of O(n). This matters
    when the list has millions of nodes.
  atN: 1,000
  tip: I can detect the cycle with a hash set in O(n) time and space. But we can do O(1) space using the
    fast/slow pointer technique.
math:
- id: pointer-following
  title: Pointer following - arrows in memory
  plain: A pointer is just a number that tells you where something else is in memory. "Node.next" means
    "here is the address of the next node." Following a linked list means jumping from address to address,
    one hop at a time.
  visual: Boxes scattered around the screen with arrows connecting them. Each box has a value and an arrow
    pointing to the next box. The last box has an arrow pointing to "null" (nothing).
  analogy: A scavenger hunt where each clue tells you where the next clue is hidden. You cannot skip to
    the end - you have to follow each clue in order.
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
walkthrough:
  problem: Linked List Reversal
  tagline: Reverse a chain of nodes by redirecting each arrow. No extra memory needed.
  time: O(n)
  space: O(1)
  code: "def reverse_linked_list(head):\n    prev = None\n    curr = head\n\n    while curr is not None:\n\
    \        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n\
    \n    return prev"
  steps:
  - title: The Starting List
    detail: 'We have a linked list: 1 -> 2 -> 3 -> 4 -> 5 -> None. We want to make it: 5 -> 4 -> 3 ->
      2 -> 1 -> None. We''ll use three pointers: prev, curr, and next_node.'
    math: null
    cost: O(1) setup
    lines:
    - 1
    - 2
    - 3
  - title: Save the Next Node
    detail: curr is at node 1. First, we *must* save curr.next (which is node 2) before we break the connection.
      If we don't save it, we lose access to the rest of the list! This is like saving your place in a
      book before tearing out a page.
    math: null
    cost: O(1)
    lines:
    - 5
  - title: Flip the Arrow
    detail: 'Now flip: make node 1''s "next" point to prev (which is None). Node 1 used to point forward
      to 2. Now it points backward to None. The first node of the reversed list points to nothing.'
    math: null
    cost: O(1)
    lines:
    - 6
  - title: Advance the Pointers
    detail: 'Move both pointers forward: prev becomes curr (node 1), curr becomes next_node (node 2).
      Now we''re ready to process node 2.'
    math: null
    cost: O(1)
    lines:
    - 7
    - 8
  - title: 'Repeat: Flip Node 2'
    detail: 'Same process for node 2: save next_node = node 3, then flip node 2''s arrow to point at node
      1 (prev). Now: None <- 1 <- 2, and 3 -> 4 -> 5 is still intact.'
    math: null
    cost: O(1) per step
    lines:
    - 5
    - 6
    - 7
    - 8
  - title: Continue Through the List
    detail: 'We keep going: flip node 3 to point at node 2, flip node 4 to point at node 3. Each flip
      takes O(1) time. We''re doing this n times (once per node).'
    math: null
    cost: O(1) per node, O(n) total
    lines:
    - 5
    - 6
    - 7
    - 8
  - title: Final Node - Last Flip
    detail: 'Node 5 is the last node. next_node = None (nothing after it). Flip node 5''s pointer to point
      at node 4. Advance: prev = node 5, curr = None.'
    math: null
    cost: O(n) total
    lines:
    - 5
    - 6
    - 7
    - 8
  - title: Return the New Head
    detail: 'The loop ends because curr is None. We return prev - which is node 5, the new head of our
      reversed list: 5 -> 4 -> 3 -> 2 -> 1 -> None. We only used 3 extra variables regardless of list
      length - that''s O(1) space!'
    math: 'O(n) time: we touched each of the n nodes exactly once. O(1) space: we only used 3 pointer
      variables (prev, curr, next_node) no matter how long the list is. This is an in-place reversal.'
    cost: O(n) time, O(1) space
    lines:
    - 10
challenges:
- title: Reverse Linked List
  difficulty: easy
  description: Reverse a singly linked list iteratively. Given the head of a linked list, return the head
    of the reversed list.
  hints:
  - 'You need three pointers: prev (starts None), curr, and next.'
  - 'At each step: save curr.next, point curr.next to prev, advance both prev and curr.'
  - After the loop, prev is the new head.
  optimal: O(n) time, O(1) space
- title: Linked List Cycle II
  difficulty: medium
  description: Given a linked list, return the node where the cycle begins. If there is no cycle, return
    None. Floyd's algorithm can detect the cycle AND find the entry point.
  hints:
  - 'Phase 1: use slow (1 step) and fast (2 steps). If they meet, a cycle exists.'
  - 'Phase 2: when they meet, reset one pointer to head.'
  - Advance both one step at a time - they'll meet at the cycle entry.
  - 'Mathematical proof: distance from head to entry == distance from meeting point to entry.'
  optimal: O(n) time, O(1) space
---

# Linked Lists

Pointer manipulation mastery. Google loves linked list problems because they test careful thinking about references and edge cases. Learn reversal, cycle detection with Floyd's algorithm, and merge patterns.

## Key points

- Dummy/sentinel head node eliminates edge case handling
- Floyd's two-pointer cycle detection (slow/fast pointers)
- Iterative reversal is O(1) space vs recursive O(n) stack space
- Merge two sorted lists with a dummy head pointer pattern
- Finding middle node: slow advances 1, fast advances 2

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def make_list(values):
    dummy = ListNode(0)
    cur = dummy
    for v in values:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next

def to_list(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

# --- Iterative reversal ---
def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

# --- Floyd's cycle detection ---
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

# --- Merge two sorted lists ---
def merge_sorted(l1, l2):
    dummy = ListNode(0)
    cur = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            cur.next, l1 = l1, l1.next
        else:
            cur.next, l2 = l2, l2.next
        cur = cur.next
    cur.next = l1 or l2
    return dummy.next

h = make_list([1, 2, 3, 4, 5])
print(to_list(reverse_list(h)))                             # [5,4,3,2,1]
print(to_list(merge_sorted(make_list([1,3,5]), make_list([2,4,6]))))  # [1,2,3,4,5,6]
```

---
title: Binary Trees
order: 6
summary: Trees underlie databases, file systems, and compilers. Google frequently tests tree traversals,
  LCA, serialization, and BST properties. Master both recursive and iterative approaches.
category: Data structures
level: Intermediate
bigO:
  best: O(log n)
  average: O(log n)
  worst: O(n)
  space: O(h)
explained:
  time: O(log n) for search/insert/delete on a balanced BST because each comparison cuts the remaining
    nodes in half. O(n) worst case if the tree is unbalanced (all nodes in one long line).
  space: O(h) where h is the height - that is the maximum call stack depth during recursion. O(log n)
    for balanced trees, O(n) for skewed trees.
  visual: Imagine a "yes/no" game. Is the answer bigger or smaller than 50? Bigger. Bigger or smaller
    than 75? Smaller. Each question eliminates half the remaining possibilities.
structures:
- concept: Binary Tree
  python: class TreeNode (no built-in)
  aliases:
  - BST
  - Binary Search Tree
  declaration: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val\
    \ = val\n        self.left = left\n        self.right = right"
  ops:
  - op: visit left
    code: node.left
    cost: O(1)
  - op: visit right
    code: node.right
    cost: O(1)
  - op: check leaf
    code: not node.left and not node.right
    cost: O(1)
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
- id: tree-levels
  title: Tree levels and node counts
  plain: A balanced binary tree with n levels has about 2ⁿ nodes total. Conversely, if you have n nodes
    arranged as a balanced tree, the height (number of levels) is log₂(n). This relationship - height
    equals log(n) - is why balanced tree operations are so fast.
  visual: A tree diagram. Level 0 has 1 node (root). Level 1 has 2 nodes. Level 2 has 4 nodes. Level 3
    has 8 nodes. Total nodes = 1+2+4+8 = 15 = 2⁴-1. Height is 3 = log₂(15) rounded.
  analogy: An org chart. The CEO is at the top. Each manager has two direct reports. With 10 levels, there
    are over 1,000 employees - but you can reach any employee with at most 10 steps down the hierarchy.
challenges:
- title: Maximum Depth of Binary Tree
  difficulty: easy
  description: Given the root of a binary tree, return its maximum depth. The maximum depth is the number
    of nodes along the longest path from the root down to the farthest leaf.
  hints:
  - 'Think recursively: the depth of a tree is 1 + max depth of its subtrees.'
  - 'Base case: if root is None, return 0.'
  - Alternatively, use BFS and count levels.
  optimal: O(n) time, O(h) space
- title: Validate Binary Search Tree
  difficulty: medium
  description: Given the root of a binary tree, determine if it is a valid binary search tree (BST). A
    BST requires that for every node, all left descendants are strictly less and all right descendants
    are strictly greater.
  hints:
  - A naive check (left.val < root.val) is insufficient - think about the full subtree.
  - Pass a valid range (min_val, max_val) down to each recursive call.
  - Left child must be < root.val AND within inherited upper bound.
  - Right child must be > root.val AND within inherited lower bound.
  optimal: O(n) time, O(h) space
---

# Binary Trees

Trees underlie databases, file systems, and compilers. Google frequently tests tree traversals, LCA, serialization, and BST properties. Master both recursive and iterative approaches.

## Key points

- Inorder traversal of BST yields sorted sequence
- DFS with recursion is elegant; iterative uses explicit stack
- LCA (Lowest Common Ancestor): recurse, look for two target nodes
- Tree height/depth: max(left, right) + 1
- Level-order (BFS) uses a queue, processes nodes layer by layer

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# --- Build from list (LeetCode format) ---
def build(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    q = deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            q.append(node.right)
        i += 1
    return root

# --- All four traversals ---
def inorder(root):
    return inorder(root.left) + [root.val] + inorder(root.right) if root else []

def level_order(root):
    if not root:
        return []
    result, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        result.append(level)
    return result

# --- Maximum depth ---
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

# --- Lowest Common Ancestor (BST) ---
def lca_bst(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root

tree = build([3, 9, 20, None, None, 15, 7])
print(inorder(tree))        # [9, 3, 15, 20, 7]
print(level_order(tree))    # [[3], [9, 20], [15, 7]]
print(max_depth(tree))      # 3
```

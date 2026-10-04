---
title: BFS & DFS
order: 14
viz: graph-bfs
summary: The two fundamental graph traversal strategies. BFS explores level by level (shortest path in
  unweighted graphs). DFS dives deep first (connectivity, cycle detection, topological sort).
category: Algorithms
level: Intermediate
bigO:
  best: O(V + E)
  average: O(V + E)
  worst: O(V + E)
  space: O(V)
structures:
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
brute:
  brute:
    pros:
    - Guarantees finding shortest if you explore all paths
    - Uses DFS which is simpler to code
    cons:
    - Exponentially slow on dense graphs
    - Explores many unnecessary paths
    name: DFS - Try All Paths
    time: O(V! or 2^V)
    space: O(V)
    quote: Explore every possible path from source to destination. Track the shortest one found.
  optimized:
    pros:
    - Guaranteed shortest path in unweighted graphs
    - Visits each node at most once
    - Standard interview approach
    cons:
    - Queue can grow large for wide graphs
    - Only works for unweighted graphs
    name: BFS - Level by Level
    time: O(V + E)
    space: O(V)
    quote: Explore all nodes at distance 1, then distance 2, etc. First time you reach the target is the
      shortest path.
  title: Shortest Path (Unweighted)
  strategy: Start brute force, explain it, then optimize.
  quote: I can see a straightforward approach. Let me start there, then we can optimize.
  tradeoff: BFS naturally finds shortest paths because it explores level by level. DFS would need to try
    all paths to find the shortest. For a grid graph, that is the difference between seconds and years.
  atN: '100'
  tip: For shortest path in an unweighted graph, BFS is the right tool because it explores nodes in order
    of distance from the source.
math:
- id: graph-theory-basics
  title: Graph theory - dots and lines
  plain: 'A graph is just dots (called nodes or vertices) connected by lines (called edges). That is it.
    A social network is a graph: people are nodes, friendships are edges. A city map is a graph: intersections
    are nodes, roads are edges.'
  visual: Five circles on screen connected by lines between some pairs. Each circle is a node. Each line
    is an edge. If the lines have arrows, it is a directed graph (one-way streets). Without arrows it
    is undirected (two-way).
  analogy: 'Any network you can think of: power grid, airline routes, the internet, your friend group.
    All graphs.'
  why: Graph algorithms (BFS, DFS) work on any of these structures. Understanding what a graph is makes
    the traversal algorithms click immediately.
- id: queue-vs-stack-traversal
  title: Queue vs stack - the one choice that changes everything
  plain: BFS uses a queue (FIFO). It processes nodes in the order they were discovered. This naturally
    explores all nodes at distance 1 before any at distance 2 - hence "breadth first." DFS uses a stack
    (LIFO) - either an explicit stack or the function call stack. It dives as deep as possible before
    backtracking.
  visual: 'Same graph, two traversal animations. BFS: nodes light up level by level, expanding outward
    like ripples. DFS: one path highlights down to a dead end, backtracks, another path goes deep.'
  analogy: 'BFS: finding the nearest coffee shop - check your block first, then neighboring blocks, expanding
    outward. DFS: exploring a cave system - go as far down one tunnel as possible, then backtrack and
    try the next tunnel.'
  why: BFS finds the shortest path in unweighted graphs. DFS is better for detecting cycles, topological
    sort, and exhaustive exploration. The right choice depends on what you are looking for.
walkthrough:
  problem: Breadth-First Search (BFS)
  tagline: Explore a graph level by level - like ripples spreading in water.
  time: O(V + E)
  space: O(V)
  code: "def bfs(graph, start):\n    visited = set()\n    queue = [start]\n    visited.add(start)\n  \
    \  result = []\n\n    while queue:\n        node = queue.pop(0)\n        result.append(node)\n\n \
    \       for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n\
    \                queue.append(neighbor)\n\n    return result"
  steps:
  - title: The Graph
    detail: 'We have a graph: A connects to B and C. B connects to D and E. C connects to F. We start
      at A and want to visit all nodes. BFS explores all neighbors at the current level before going deeper.'
    math: null
    cost: O(1) setup
    lines:
    - 1
    - 2
    - 3
    - 4
    - 5
  - title: Process A - Visit Its Neighbors
    detail: 'Pop A from the queue. Add A to result. Now look at A''s neighbors: B and C. Neither is in
      visited yet, so add both to the queue AND mark them visited. Why mark when we add (not when we process)?
      To avoid adding duplicates to the queue.'
    math: 'A queue is FIFO - First In, First Out. Like a line at a store: first person in line is first
      served. This is what makes BFS explore level by level.'
    cost: O(V + E)
    lines:
    - 7
    - 8
    - 9
    - 10
    - 11
    - 12
    - 13
  - title: Process B - Level 2 Begins
    detail: 'Pop B from the queue (it was added first). Add B to result. Check B''s neighbors: D and E.
      Both are new - add them to queue and mark visited. Queue now has [C, D, E].'
    math: null
    cost: O(V + E)
    lines:
    - 7
    - 8
    - 9
    - 10
    - 11
    - 12
    - 13
  - title: Process C - Still Level 2
    detail: 'Pop C from the queue. Add C to result. Check C''s neighbors: F. F is new - add to queue.
      Notice: we''re still processing level 2 (B and C) before moving to level 3 (D, E, F). That''s the
      BFS guarantee!'
    math: null
    cost: O(V + E)
    lines:
    - 7
    - 8
    - 9
    - 10
    - 11
    - 12
    - 13
  - title: Process D, E, F - Level 3
    detail: Pop D, E, F one by one. They have no unvisited neighbors, so nothing gets added to the queue.
      Result becomes [A, B, C, D, E, F]. The queue is empty, so the loop ends.
    math: null
    cost: O(V + E)
    lines:
    - 7
    - 8
    - 9
    - 10
    - 11
  - title: BFS is Done
    detail: 'We visited every node level by level: A (level 0), then B and C (level 1), then D, E, F (level
      2). BFS guarantees you find the shortest path because you always explore closer nodes first.'
    math: 'Time: O(V + E) - we process each vertex (V) once and each edge (E) once. Space: O(V) for the
      visited set and queue, which could hold all vertices at most. V = vertices (nodes), E = edges (connections).'
    cost: O(V + E) time, O(V) space
    lines:
    - 15
challenges:
- title: Word Ladder
  difficulty: hard
  description: Given two words `beginWord` and `endWord` and a word list, return the length of the shortest
    transformation sequence from beginWord to endWord where each step changes exactly one letter and all
    intermediate words are in the word list.
  starter: "from collections import deque\n\ndef ladder_length(beginWord, endWord, wordList):\n    word_set\
    \ = set(wordList)\n    if endWord not in word_set:\n        return 0\n    queue = deque([(beginWord,\
    \ 1)])\n    visited = {beginWord}\n    while queue:\n        word, length = queue.popleft()\n    \
    \    for i in range(len(word)):\n            for c in 'abcdefghijklmnopqrstuvwxyz':\n            \
    \    new_word = word[:i] + c + word[i+1:]\n                if new_word == endWord:\n             \
    \       return length + 1\n                if new_word in word_set and new_word not in visited:\n\
    \                    visited.add(new_word)\n                    queue.append((new_word, length + 1))\n\
    \    return 0\n\nprint(ladder_length(\"hit\", \"cog\", [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"\
    cog\"]))  # 5\nprint(ladder_length(\"hit\", \"cog\", [\"hot\",\"dot\",\"dog\",\"lot\",\"log\"])) \
    \        # 0\n"
  tests:
  - input: ladder_length("hit","cog",["hot","dot","dog","lot","log","cog"])
    expected: '5'
  - input: ladder_length("hit","cog",["hot","dot","dog","lot","log"])
    expected: '0'
  hints:
  - BFS from beginWord, each level = one transformation.
  - For each word position, try all 26 letters to generate neighbors.
  - Store neighbors in a set for O(1) lookup.
  - Mark words as visited when added to the queue, not when dequeued.
  tags:
  - bfs
  - hard-pattern
  - google-favorite
  optimal: O(m^2 * n) time, O(m^2 * n) space
---

# BFS & DFS

The two fundamental graph traversal strategies. BFS explores level by level (shortest path in unweighted graphs). DFS dives deep first (connectivity, cycle detection, topological sort).

## Key points

- BFS uses a queue (FIFO); DFS uses a stack (LIFO) or recursion
- BFS guarantees shortest path in unweighted graphs
- Multi-source BFS: start from all sources simultaneously
- Bidirectional BFS halves the search space for shortest path
- DFS tree/back/cross edges reveal graph structure

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
from collections import deque

# --- BFS: Shortest path in grid ---
def shortest_path_grid(grid):
    rows, cols = len(grid), len(grid[0])
    if grid[0][0] == 1 or grid[rows-1][cols-1] == 1:
        return -1
    queue = deque([(0, 0, 1)])
    visited = {(0, 0)}
    dirs = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
    while queue:
        r, c, dist = queue.popleft()
        if r == rows - 1 and c == cols - 1:
            return dist
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr,nc) not in visited and grid[nr][nc] == 0:
                visited.add((nr, nc))
                queue.append((nr, nc, dist + 1))
    return -1

# --- Multi-source BFS: Rotting Oranges ---
def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c, 0))
            elif grid[r][c] == 1:
                fresh += 1
    if fresh == 0:
        return 0
    dirs = [(0,1),(0,-1),(1,0),(-1,0)]
    minutes = 0
    while queue:
        r, c, t = queue.popleft()
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                fresh -= 1
                minutes = t + 1
                queue.append((nr, nc, t + 1))
    return minutes if fresh == 0 else -1

print(shortest_path_grid([[0,0,0],[1,1,0],[1,1,0]]))  # 4
print(oranges_rotting([[2,1,1],[1,1,0],[0,1,1]]))      # 4
```

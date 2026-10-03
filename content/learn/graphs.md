---
title: Graphs
order: 7
summary: 'Graphs model networks, dependencies, and relationships. Google interviews heavily feature graph
  problems: BFS for shortest paths, DFS for connectivity, topological sort for dependencies, and union-find
  for components.'
category: Data structures
level: Advanced
bigO:
  best: O(1)
  average: O(V + E)
  worst: O(V + E)
  space: O(V + E)
explained:
  time: O(V+E) for BFS and DFS - you visit each vertex once and examine each edge once. V is the number
    of nodes, E is the number of connections.
  space: O(V) for the visited set and the BFS queue or DFS stack (at most V nodes waiting at once).
  visual: Exploring a building. V = number of rooms. E = number of doorways. BFS explores all rooms on
    one floor before going to the next. DFS dives as deep as possible before backtracking.
structures:
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
- concept: Default Dictionary
  python: collections.defaultdict
  aliases:
  - defaultdict
  declaration: graph = defaultdict(list)
  ops:
  - op: append to list
    code: graph[node].append(neighbor)
    cost: O(1)
  - op: increment count
    code: counts[x] += 1
    cost: O(1)
  - op: access missing key
    code: 'graph[new_key]  # auto-creates'
    cost: O(1)
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
- id: graph-representation-math
  title: Vertices, edges, and adjacency
  plain: 'Graph complexity uses two variables: V (vertices = nodes) and E (edges = connections). A graph
    with V nodes can have anywhere from 0 edges (isolated nodes) to V×(V-1)/2 edges (every node connected
    to every other). This is why graph complexity is written as O(V+E).'
  visual: 'Two graphs side by side. Sparse graph: 10 nodes, few connections, looks like a sparse constellation.
    Dense graph: 10 nodes, almost every pair connected, looks like a tangled web.'
  analogy: A road network. V = number of cities. E = number of roads connecting them. Driving from city
    to city, you might visit V cities and travel E roads total.
challenges:
- title: Number of Islands
  difficulty: medium
  description: Given a 2D grid of '1's (land) and '0's (water), count the number of islands. An island
    is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.
  hints:
  - Iterate through every cell. When you find a '1', start a DFS/BFS.
  - Mark visited cells as '0' (or use a visited set) to avoid re-counting.
  - Each DFS/BFS call from an unvisited '1' counts as one island.
  - The 4 directions are up, down, left, right.
  optimal: O(m*n) time, O(m*n) space
- title: Course Schedule
  difficulty: medium
  description: There are `n` courses labeled 0 to n-1. Given `prerequisites` pairs [a,b] meaning you must
    take b before a, return true if you can finish all courses (i.e., no cycle exists).
  hints:
  - This is a cycle detection problem in a directed graph.
  - 'Use Kahn''s algorithm: compute in-degrees, BFS from zero-indegree nodes.'
  - If the topological order includes all n nodes, no cycle exists.
  - 'Alternatively, DFS with coloring: white (unvisited), gray (in-progress), black (done).'
  optimal: O(V + E) time, O(V + E) space
---

# Graphs

Graphs model networks, dependencies, and relationships. Google interviews heavily feature graph problems: BFS for shortest paths, DFS for connectivity, topological sort for dependencies, and union-find for components.

## Key points

- Adjacency list is O(V+E) space; adjacency matrix is O(V^2)
- BFS finds shortest paths in unweighted graphs
- DFS identifies connected components and detects cycles
- Topological sort (Kahn's or DFS) for dependency ordering
- Union-Find (disjoint set) for dynamic connectivity queries

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
from collections import deque, defaultdict

# --- Build adjacency list from edges ---
def build_graph(n, edges):
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    return graph

# --- BFS shortest path ---
def bfs_shortest(graph, start, end):
    visited = {start}
    queue = deque([(start, [start])])
    while queue:
        node, path = queue.popleft()
        if node == end:
            return path
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return []

# --- DFS: count connected components ---
def count_components(n, edges):
    graph = build_graph(n, edges)
    visited = set()
    count = 0
    def dfs(node):
        visited.add(node)
        for nb in graph[node]:
            if nb not in visited:
                dfs(nb)
    for i in range(n):
        if i not in visited:
            dfs(i)
            count += 1
    return count

# --- Topological sort (Kahn's BFS) ---
def topo_sort(n, prereqs):
    indegree = [0] * n
    graph = defaultdict(list)
    for course, pre in prereqs:
        graph[pre].append(course)
        indegree[course] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nb in graph[node]:
            indegree[nb] -= 1
            if indegree[nb] == 0:
                queue.append(nb)
    return order if len(order) == n else []

g = build_graph(5, [(0,1),(1,2),(2,3),(3,4)])
print(bfs_shortest(g, 0, 4))        # [0, 1, 2, 3, 4]
print(count_components(5, [(0,1),(1,2),(3,4)]))  # 2
print(topo_sort(4, [(1,0),(2,0),(3,1),(3,2)]))   # valid topological order
```

---
title: "Topological Sort"
order: 17
category: Algorithms
summary: "In the field of computer science, a topological sort or topological ordering of a directed graph is a linear ordering of its vertices such that for every directed edge uv from vertex u to vertex v, u comes before v in the ordering."
---

# Topological Sort

> **Source:** [topological-sorting](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/graph/topological-sorting) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

In the field of computer science, a topological sort or 
topological ordering of a directed graph is a linear ordering 
of its vertices such that for every directed edge `uv` from 
vertex `u` to vertex `v`, `u` comes before `v` in the ordering.

For instance, the vertices of the graph may represent tasks to 
be performed, and the edges may represent constraints that one 
task must be performed before another; in this application, a 
topological ordering is just a valid sequence for the tasks.

A topological ordering is possible if and only if the graph has
no directed cycles, that is, if it is a [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) 
(DAG). Any DAG has at least one topological ordering, and algorithms are 
known for constructing a topological ordering of any DAG in linear time.

![Directed Acyclic Graph](https://upload.wikimedia.org/wikipedia/commons/c/c6/Topological_Ordering.svg)

A topological ordering of a directed acyclic graph: every edge goes from 
earlier in the ordering (upper left) to later in the ordering (lower right). 
A directed graph is acyclic if and only if it has a topological ordering.

## Example

![Topologic Sorting](https://upload.wikimedia.org/wikipedia/commons/0/03/Directed_acyclic_graph_2.svg)

The graph shown above has many valid topological sorts, including:

- `5, 7, 3, 11, 8, 2, 9, 10` (visual left-to-right, top-to-bottom)
- `3, 5, 7, 8, 11, 2, 9, 10` (smallest-numbered available vertex first)
- `5, 7, 3, 8, 11, 10, 9, 2` (fewest edges first)
- `7, 5, 11, 3, 10, 8, 9, 2` (largest-numbered available vertex first)
- `5, 7, 11, 2, 3, 8, 9, 10` (attempting top-to-bottom, left-to-right)
- `3, 7, 8, 5, 11, 10, 2, 9` (arbitrary)

## Application

The canonical application of topological sorting is in 
**scheduling a sequence of jobs** or tasks based on their dependencies. The jobs 
are represented by vertices, and there is an edge from `x` to `y` if 
job `x` must be completed before job `y` can be started (for 
example, when washing clothes, the washing machine must finish 
before we put the clothes in the dryer). Then, a topological sort 
gives an order in which to perform the jobs.

Other application is **dependency resolution**. Each vertex is a package
and each edge is a dependency of package `a` on package 'b'. Then topological
sorting will provide a sequence of installing dependencies in a way that every
next dependency has its dependent packages to be installed in prior.

## References

- [Wikipedia](https://en.wikipedia.org/wiki/Topological_sorting)
- [Topological Sorting on YouTube by Tushar Roy](https://www.youtube.com/watch?v=ddTC4Zovtbc&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)

## JavaScript implementation

From [`topologicalSort.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/graph/topological-sorting/topologicalSort.js):

```js
import Stack from '../../../data-structures/stack/Stack';
import depthFirstSearch from '../depth-first-search/depthFirstSearch';

/**
 * @param {Graph} graph
 */
export default function topologicalSort(graph) {
  // Create a set of all vertices we want to visit.
  const unvisitedSet = {};
  graph.getAllVertices().forEach((vertex) => {
    unvisitedSet[vertex.getKey()] = vertex;
  });

  // Create a set for all vertices that we've already visited.
  const visitedSet = {};

  // Create a stack of already ordered vertices.
  const sortedStack = new Stack();

  const dfsCallbacks = {
    enterVertex: ({ currentVertex }) => {
      // Add vertex to visited set in case if all its children has been explored.
      visitedSet[currentVertex.getKey()] = currentVertex;

      // Remove this vertex from unvisited set.
      delete unvisitedSet[currentVertex.getKey()];
    },
    leaveVertex: ({ currentVertex }) => {
      // If the vertex has been totally explored then we may push it to stack.
      sortedStack.push(currentVertex);
    },
    allowTraversal: ({ nextVertex }) => {
      return !visitedSet[nextVertex.getKey()];
    },
  };

  // Let's go and do DFS for all unvisited nodes.
  while (Object.keys(unvisitedSet).length) {
    const currentVertexKey = Object.keys(unvisitedSet)[0];
    const currentVertex = unvisitedSet[currentVertexKey];

    // Do DFS for current node.
    depthFirstSearch(graph, currentVertex, dfsCallbacks);
  }

  return sortedStack.toArray();
}
```

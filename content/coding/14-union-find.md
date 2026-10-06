---
title: "Union-Find (Disjoint Set)"
order: 14
category: Data structures
summary: "After some operations of Union, some sets are grouped together."
---

# Union-Find (Disjoint Set)

> **Source:** [disjoint-set](https://github.com/trekhleb/javascript-algorithms/tree/master/src/data-structures/disjoint-set) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

**Disjoint-set** data structure (also called a union–find data structure or merge–find set) is a data
structure that tracks a set of elements partitioned into a number of disjoint (non-overlapping) subsets.
It provides near-constant-time operations (bounded by the inverse Ackermann function) to _add new sets_,
to _merge existing sets_, and to _determine whether elements are in the same set_.
In addition to many other uses (see the Applications section), disjoint-sets play a key role in Kruskal's algorithm for finding the minimum spanning tree of a graph.

![disjoint set](https://upload.wikimedia.org/wikipedia/commons/6/67/Dsu_disjoint_sets_init.svg)

_MakeSet_ creates 8 singletons.

![disjoint set](https://upload.wikimedia.org/wikipedia/commons/a/ac/Dsu_disjoint_sets_final.svg)

After some operations of _Union_, some sets are grouped together.

## Implementation

- [DisjointSet.js](https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/disjoint-set/DisjointSet.js)
- [DisjointSetAdhoc.js](https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/disjoint-set/DisjointSetAdhoc.js) - The minimalistic (ad hoc) version of a DisjointSet (or a UnionFind) data structure that doesn't have external dependencies and that is easy to copy-paste and use during the coding interview if allowed by the interviewer (since many data structures in JS are missing).

## References

- [Wikipedia](https://en.wikipedia.org/wiki/Disjoint-set_data_structure)
- [By Abdul Bari on YouTube](https://www.youtube.com/watch?v=wU6udHRIkcc&index=14&t=0s&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)

## JavaScript implementation

From [`DisjointSet.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/disjoint-set/DisjointSet.js):

```js
import DisjointSetItem from './DisjointSetItem';

export default class DisjointSet {
  /**
   * @param {function(value: *)} [keyCallback]
   */
  constructor(keyCallback) {
    this.keyCallback = keyCallback;
    this.items = {};
  }

  /**
   * @param {*} itemValue
   * @return {DisjointSet}
   */
  makeSet(itemValue) {
    const disjointSetItem = new DisjointSetItem(itemValue, this.keyCallback);

    if (!this.items[disjointSetItem.getKey()]) {
      // Add new item only in case if it not presented yet.
      this.items[disjointSetItem.getKey()] = disjointSetItem;
    }

    return this;
  }

  /**
   * Find set representation node.
   *
   * @param {*} itemValue
   * @return {(string|null)}
   */
  find(itemValue) {
    const templateDisjointItem = new DisjointSetItem(itemValue, this.keyCallback);

    // Try to find item itself;
    const requiredDisjointItem = this.items[templateDisjointItem.getKey()];

    if (!requiredDisjointItem) {
      return null;
    }

    return requiredDisjointItem.getRoot().getKey();
  }

  /**
   * Union by rank.
   *
   * @param {*} valueA
   * @param {*} valueB
   * @return {DisjointSet}
   */
  union(valueA, valueB) {
    const rootKeyA = this.find(valueA);
    const rootKeyB = this.find(valueB);

    if (rootKeyA === null || rootKeyB === null) {
      throw new Error('One or two values are not in sets');
    }

    if (rootKeyA === rootKeyB) {
      // In case if both elements are already in the same set then just return its key.
      return this;
    }

    const rootA = this.items[rootKeyA];
    const rootB = this.items[rootKeyB];

    if (rootA.getRank() < rootB.getRank()) {
      // If rootB's tree is bigger then make rootB to be a new root.
      rootB.addChild(rootA);

      return this;
    }

    // If rootA's tree is bigger then make rootA to be a new root.
    rootA.addChild(rootB);

    return this;
  }

  /**
   * @param {*} valueA
   * @param {*} valueB
   * @return {boolean}
   */
  inSameSet(valueA, valueB) {
    const rootKeyA = this.find(valueA);
    const rootKeyB = this.find(valueB);

    if (rootKeyA === null || rootKeyB === null) {
      throw new Error('One or two values are not in sets');
    }

    return rootKeyA === rootKeyB;
  }
}
```

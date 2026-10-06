---
title: "LRU Cache"
order: 15
category: Data structures
summary: "A Least Recently Used (LRU) Cache organizes items in order of use, allowing you to quickly identify which item hasn't been used for the longest amount of time."
---

# LRU Cache

> **Source:** [lru-cache](https://github.com/trekhleb/javascript-algorithms/tree/master/src/data-structures/lru-cache) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

A **Least Recently Used (LRU) Cache** organizes items in order of use, allowing you to quickly identify which item hasn't been used for the longest amount of time.

Picture a clothes rack, where clothes are always hung up on one side. To find the least-recently used item, look at the item on the other end of the rack.

## The problem statement

Implement the LRUCache class:

- `LRUCache(int capacity)` Initialize the LRU cache with **positive** size `capacity`.
- `int get(int key)` Return the value of the `key` if the `key` exists, otherwise return `undefined`.
- `void set(int key, int value)` Update the value of the `key` if the `key` exists. Otherwise, add the `key-value` pair to the cache. If the number of keys exceeds the `capacity` from this operation, **evict** the least recently used key.

The functions `get()` and `set()` must each run in `O(1)` average time complexity.

## Implementation

### Version 1: Doubly Linked List + Hash Map

See the `LRUCache` implementation example in [LRUCache.js](https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/lru-cache/LRUCache.js). The solution uses a `HashMap` for fast `O(1)` (in average) cache items access, and a `DoublyLinkedList` for fast `O(1)` (in average) cache items promotions and eviction (to keep the maximum allowed cache capacity).

![Linked List](https://raw.githubusercontent.com/trekhleb/javascript-algorithms/master/src/data-structures/lru-cache/images/lru-cache.jpg)

_Made with [okso.app](https://okso.app)_

You may also find more test-case examples of how the LRU Cache works in [LRUCache.test.js](https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/lru-cache/__test__/LRUCache.test.js) file.

### Version 2: Ordered Map

The first implementation that uses doubly linked list is good for learning purposes and for better understanding of how the average `O(1)` time complexity is achievable while doing `set()` and `get()`.

However, the simpler approach might be to use a JavaScript [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object. The `Map` object holds key-value pairs and **remembers the original insertion order** of the keys. We can use this fact in order to keep the recently-used items in the "end" of the map by removing and re-adding items. The item at the beginning of the `Map` is the first one to be evicted if cache capacity overflows. The order of the items may checked by using the `IterableIterator` like `map.keys()`.

See the `LRUCacheOnMap` implementation example in [LRUCacheOnMap.js](https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/lru-cache/LRUCacheOnMap.js).

You may also find more test-case examples of how the LRU Cache works in [LRUCacheOnMap.test.js](https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/lru-cache/__test__/LRUCacheOnMap.test.js) file.

## Complexities

|          | Average |
| -------- | ------- |
| Space    | `O(n)`  |
| Get item | `O(1)`  |
| Set item | `O(1)`  |

## References

- [LRU Cache on LeetCode](https://leetcode.com/problems/lru-cache/solutions/244744/lru-cache/)
- [LRU Cache on InterviewCake](https://www.interviewcake.com/concept/java/lru-cache)
- [LRU Cache on Wiki](https://en.wikipedia.org/wiki/Cache_replacement_policies)

## JavaScript implementation

From [`LRUCache.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/lru-cache/LRUCache.js):

```js
/* eslint-disable no-param-reassign, max-classes-per-file */

/**
 * Simple implementation of the Doubly-Linked List Node
 * that is used in LRUCache class below.
 */
class LinkedListNode {
  /**
   * Creates a doubly-linked list node.
   * @param {string} key
   * @param {any} val
   * @param {LinkedListNode} prev
   * @param {LinkedListNode} next
   */
  constructor(key, val, prev = null, next = null) {
    this.key = key;
    this.val = val;
    this.prev = prev;
    this.next = next;
  }
}

/**
 * Implementation of the LRU (Least Recently Used) Cache
 * based on the HashMap and Doubly Linked List data-structures.
 *
 * Current implementation allows to have fast O(1) (in average) read and write operations.
 *
 * At any moment in time the LRU Cache holds not more that "capacity" number of items in it.
 */
class LRUCache {
  /**
   * Creates a cache instance of a specific capacity.
   * @param {number} capacity
   */
  constructor(capacity) {
    this.capacity = capacity; // How many items to store in cache at max.
    this.nodesMap = {}; // The quick links to each linked list node in cache.
    this.size = 0; // The number of items that is currently stored in the cache.
    this.head = new LinkedListNode(); // The Head (first) linked list node.
    this.tail = new LinkedListNode(); // The Tail (last) linked list node.
  }

  /**
   * Returns the cached value by its key.
   * Time complexity: O(1) in average.
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    if (this.nodesMap[key] === undefined) return undefined;
    const node = this.nodesMap[key];
    this.promote(node);
    return node.val;
  }

  /**
   * Sets the value to cache by its key.
   * Time complexity: O(1) in average.
   * @param {string} key
   * @param {any} val
   */
  set(key, val) {
    if (this.nodesMap[key]) {
      const node = this.nodesMap[key];
      node.val = val;
      this.promote(node);
    } else {
      const node = new LinkedListNode(key, val);
      this.append(node);
    }
  }

  /**
   * Promotes the node to the end of the linked list.
   * It means that the node is most frequently used.
   * It also reduces the chance for such node to get evicted from cache.
   * @param {LinkedListNode} node
   */
  promote(node) {
    this.evict(node);
    this.append(node);
  }

  /**
   * Appends a new node to the end of the cache linked list.
   * @param {LinkedListNode} node
   */
  append(node) {
    this.nodesMap[node.key] = node;

    if (!this.head.next) {
      // First node to append.
      this.head.next = node;
      this.tail.prev = node;
      node.prev = this.head;
      node.next = this.tail;
    } else {
      // Append to an existing tail.
      const oldTail = this.tail.prev;
      oldTail.next = node;
      node.prev = oldTail;
      node.next = this.tail;
      this.tail.prev = node;
    }

    this.size += 1;

    if (this.size > this.capacity) {
      this.evict(this.head.next);
    }
  }

  /**
   * Evicts (removes) the node from cache linked list.
   * @param {LinkedListNode} node
   */
  evict(node) {
    delete this.nodesMap[node.key];
    this.size -= 1;

    const prevNode = node.prev;
    const nextNode = node.next;

    // If one and only node.
    if (prevNode === this.head && nextNode === this.tail) {
      this.head.next = null;
      this.tail.prev = null;
      this.size = 0;
      return;
    }

    // If this is a Head node.
    if (prevNode === this.head) {
      nextNode.prev = this.head;
      this.head.next = nextNode;
      return;
    }

    // If this is a Tail node.
    if (nextNode === this.tail) {
      prevNode.next = this.tail;
      this.tail.prev = prevNode;
      return;
    }

    // If the node is in the middle.
    prevNode.next = nextNode;
    nextNode.prev = prevNode;
  }
}

export default LRUCache;
```

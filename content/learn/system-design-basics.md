---
title: System Design Basics
order: 16
summary: Google senior interviews always include system design. You need to design scalable distributed
  systems covering load balancing, caching, databases, and consistency tradeoffs. Know how Google-scale
  systems work.
category: Concepts
level: Advanced
bigO:
  best: O(1)
  average: O(1)
  worst: O(n)
  space: O(n)
explained:
  time: System design does not use Big-O notation directly. Instead we talk about latency (milliseconds
    per request) and throughput (requests per second). A hash map lookup is O(1) - roughly 100 nanoseconds.
    A database query might be O(log n) - roughly 1-10 milliseconds. A full table scan is O(n) - potentially
    seconds.
  space: 'Storage is measured in bytes: KB (10³), MB (10⁶), GB (10⁹), TB (10¹²). A tweet is ~140 bytes.
    1 billion tweets = 140 GB. Knowing rough byte sizes for common data types lets you estimate storage
    needs.'
  visual: 'A latency number cheat sheet: L1 cache = 1ns, main memory = 100ns, SSD = 100µs, disk = 10ms,
    network round trip = 100ms. These numbers differ by orders of magnitude and determine system architecture.'
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
- id: order-of-magnitude
  title: Orders of magnitude - powers of 10
  plain: Each "order of magnitude" is 10x bigger. A system handling 1,000 requests/second versus 100,000
    requests/second is two orders of magnitude different - not 100 units, but 100x. System design constantly
    compares numbers at different orders of magnitude.
  visual: A number line that is exponential, not linear. Each tick mark is 10x bigger than the previous.
    1, 10, 100, 1,000, 10,000, 100,000, 1,000,000. The visual distance between 1 and 10 looks the same
    as between 1,000 and 10,000.
  analogy: The difference between a lemonade stand and a restaurant and a fast food chain and a global
    food company. Same product, but each order of magnitude in scale requires fundamentally different
    systems.
- id: modular-arithmetic
  title: Modulo - the remainder operation
  plain: The % symbol means "what is left over after dividing?" 7 % 3 = 1 because 7 = 2×3 + 1. 10 % 4
    = 2 because 10 = 2×4 + 2. The result is always between 0 and (divisor - 1).
  visual: 'Imagine 7 items being sorted into 3 boxes. Fill each box one at a time: box 0 gets item 0,
    box 1 gets item 1, box 2 gets item 2, box 0 gets item 3... The last item lands in box (7 % 3) = box
    1.'
  analogy: A clock with 12 positions. If it is 10 o'clock and 5 hours pass, the hand lands at (10 + 5)
    % 12 = 3. The clock "wraps around" just like modulo does.
challenges:
- title: LRU Cache
  difficulty: hard
  description: Design a data structure that follows the LRU (Least Recently Used) cache constraint. Implement
    `get(key)` and `put(key, value)` both in O(1) time. When capacity is exceeded, evict the least recently
    used key.
  hints:
  - Hash map gives O(1) key lookup. Doubly linked list gives O(1) insertions and deletions.
  - 'Combine them: map stores key -> node, linked list maintains usage order.'
  - 'On access: remove node from its position, re-insert at the front (most recent).'
  - 'On eviction: remove node from the back (least recent), delete from map.'
  - Python's OrderedDict wraps this pattern cleanly.
  optimal: O(1) time, O(capacity) space
---

# System Design Basics

Google senior interviews always include system design. You need to design scalable distributed systems covering load balancing, caching, databases, and consistency tradeoffs. Know how Google-scale systems work.

## Key points

- Start with requirements: QPS, data size, read/write ratio, latency SLAs
- CAP theorem: Consistency, Availability, Partition tolerance - pick 2
- Horizontal scaling + load balancing for stateless services
- Caching layers: CDN, application cache (Redis), database query cache
- Database sharding strategies: range-based, hash-based, directory-based

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
# Simulating key system design concepts in Python

# --- LRU Cache (OrderedDict implementation) ---
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)

# --- Consistent Hashing simulation ---
import hashlib
import bisect

class ConsistentHash:
    def __init__(self, nodes, replicas=100):
        self.replicas = replicas
        self.ring = {}
        self.sorted_keys = []
        for node in nodes:
            self.add_node(node)

    def add_node(self, node):
        for i in range(self.replicas):
            key = int(hashlib.md5(f"{node}:{i}".encode()).hexdigest(), 16)
            self.ring[key] = node
            bisect.insort(self.sorted_keys, key)

    def get_node(self, data_key):
        key = int(hashlib.md5(data_key.encode()).hexdigest(), 16)
        idx = bisect.bisect_right(self.sorted_keys, key) % len(self.sorted_keys)
        return self.ring[self.sorted_keys[idx]]

# --- Rate Limiter (Token Bucket) ---
import time

class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()

    def allow_request(self):
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

lru = LRUCache(2)
lru.put(1, 1); lru.put(2, 2)
print(lru.get(1))    # 1
lru.put(3, 3)
print(lru.get(2))    # -1 (evicted)

ch = ConsistentHash(["server1", "server2", "server3"])
for key in ["user_123", "user_456", "user_789", "user_abc"]:
    print(f"{key} -> {ch.get_node(key)}")
```

---
group: "tech"
order: 3
title: "Memcached"
role: "Cache"
summary: "A cache that does nothing but get and set — fewer features than Redis, and that is the argument for it."
tags: ["memcached", "caching", "consistent-hashing"]
facts:
  - label: "Model"
    value: "One opaque blob under a string key, with an expiry"
  - label: "Threads"
    value: "Multithreaded: more raw ops per second per box than Redis"
  - label: "Memory"
    value: "Slab allocator, fixed size classes, no fragmentation"
  - label: "Cluster"
    value: "None — the client picks a node by consistent hashing"
  - label: "Durability"
    value: "None, and no replication: a dead node is a cold node"
  - label: "Value size"
    value: "1 MB by default; anything bigger belongs in object storage"
concepts:
  - "**The whole API** — `get`, `set`, `add`, `delete`, `incr`/`decr` and `cas`, and nothing else"
  - "**`cas`** returns a version with each read and rejects a stale write — the one primitive for safe read-modify-write"
  - "**No replication** — losing a node loses its keys, which for a look-aside cache is latency, not correctness"
  - "**Client-side consistent hashing** — adding a node moves only its share of keys instead of reshuffling everything"
  - "**Slab allocator** — items go into fixed size classes, so memory can be stranded when item sizes drift"
  - "**Leases** — on a miss, one client gets the token to refill while the rest briefly serve stale (the memcache paper)"
  - "**Multithreaded** — one box uses all its cores, which is the per-byte and per-core cost argument"
  - "**Versus Redis** — no data structures, no persistence, no replication, no cluster; that simplicity *is* the pitch"
---

# Memcached

## Fundamentals

### The problem

In 2003 LiveJournal's database servers were overwhelmed by reads of the same data, while the web servers had spare RAM. Brad Fitzpatrick wrote Memcached to pool that spare memory into one large, distributed cache, so repeated reads never reached the database.

### Goals

- **Do one thing:** store bytes under a key, in memory, and give them back fast.
- **Scale horizontally by adding nodes,** with no coordination between servers.
- **Predictable performance:** O(1) operations, multithreaded, with no persistence to slow it down.

### Design decisions

- **Servers don't know about each other.** The *client* hashes each key to pick a server, usually by consistent hashing, so adding a node remaps only a fraction of keys. There's no replication and no cluster protocol.
- **Values are opaque blobs** (1 MB default limit). There are no data structures and no server-side logic beyond `incr`/`decr` and compare-and-swap.
- **Slab allocator plus LRU.** Memory is pre-divided into size classes to avoid fragmentation, and the least recently used item in a class is evicted when it's full.
- **Multithreaded,** so one node uses all its cores.

### Trade-offs

Nothing survives a restart, and a lost node means a burst of cache misses hitting the database. There are no sorted sets, no pub/sub and no Lua. The argument for it is the same as its limits: a smaller feature set is simpler to run and scales very predictably across cores. If you need anything beyond get and set, use Redis.

## Use cases

### A look-aside cache for rendered fragments

The shape Memcached exists for: an opaque blob under a key, read far more often
than it is written, cheap enough per byte that a huge fleet of cache nodes is
affordable. A rendered HTML fragment, a serialized API response, a query result.

```mermaid
flowchart TB
    App([App fleet]) -- "1 · get frag:home:v7" --> MC["memcached<br/>opaque blob + TTL"]
    MC -- "hit · serve" --> App
    MC -. "miss" .-> App
    App -- "2 · render or query" --> DB[("Database")]
    App -- "3 · set frag:home:v7, 60s" --> MC
    App -. "no invalidation:<br/>change the key" .-> MC

    classDef db fill:#34526e,stroke:#6cb2ee,color:#d7dee8
    classDef hot stroke:#e8a33d,stroke-width:2px
    class DB db
    class MC hot
```

### Surviving a dead node

There is no cluster: the client holds the server list and picks a node by
consistent hashing. A node dying costs you its share of the keys and nothing
else — provided the database behind it can absorb that share of misses, which is
the question you will be asked.

```mermaid
flowchart TB
    App(["App fleet<br/>holds the server list"]) -- "hash(key) → ring position" --> Ring{"Consistent hash ring"}
    Ring --> N1["memcached #1<br/>its share of keys"]
    Ring --> N2["memcached #2<br/>its share of keys"]
    Ring --> N3["memcached #3<br/>dies → only its share is cold"]
    N3 -. "those keys miss" .-> DB[("Database<br/>must absorb the extra load")]

    classDef db fill:#34526e,stroke:#6cb2ee,color:#d7dee8
    classDef hot stroke:#e8a33d,stroke-width:2px
    class DB db
    class N3 hot
```

### Stopping a stampede with leases

A popular key expires and every request misses at once. The lease is the named
technique: exactly one client is handed the token to recompute, and the rest
serve the stale value for the moment it takes.

```mermaid
flowchart TB
    R1([Request 1]) -- "miss" --> MC["memcached"]
    MC -- "lease token granted" --> R1
    R1 -- "recompute, then set" --> DB[("Database<br/>one query, not a thousand")]
    R2([Requests 2…n]) -- "miss" --> MC
    MC -. "no token: serve the stale value<br/>or wait briefly" .-> R2
    R1 --> MC

    classDef db fill:#34526e,stroke:#6cb2ee,color:#d7dee8
    classDef hot stroke:#e8a33d,stroke-width:2px
    class DB db
    class MC hot
```

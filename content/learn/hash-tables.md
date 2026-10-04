---
title: Hash Tables
order: 5
viz: hash-table
summary: Hash tables trade space for time, turning O(n) searches into O(1). They appear in almost every
  interview problem. Master frequency counting, two-sum patterns, and grouping.
category: Data structures
level: Beginner
bigO:
  best: O(1)
  average: O(1)
  worst: O(n)
  space: O(n)
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
- concept: Frequency Counter
  python: collections.Counter
  aliases:
  - Character Count
  - Frequency Map
  declaration: counts = Counter(s)
  ops:
  - op: get count
    code: counts[x]
    cost: O(1)
  - op: top-k elements
    code: counts.most_common(k)
    cost: O(n log k)
  - op: add counts
    code: counts + other_counter
    cost: O(n)
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
- id: constant-complexity
  title: Constant time - O(1)
  plain: No matter how large the input is, this operation always takes the same amount of time. The size
    of n simply does not matter.
  visual: A perfectly flat horizontal line on a graph. The line never rises no matter how far right you
    go.
  analogy: Looking up a word in a dictionary if you already know the exact page number. It does not matter
    how thick the dictionary is.
  why: 'Accessing array[3] is O(1) because the computer calculates the memory address directly: start
    + 3 * item_size. One calculation, done.'
- id: modular-arithmetic
  title: Modulo - the remainder operation
  plain: The % symbol means "what is left over after dividing?" 7 % 3 = 1 because 7 = 2×3 + 1. 10 % 4
    = 2 because 10 = 2×4 + 2. The result is always between 0 and (divisor - 1).
  visual: 'Imagine 7 items being sorted into 3 boxes. Fill each box one at a time: box 0 gets item 0,
    box 1 gets item 1, box 2 gets item 2, box 0 gets item 3... The last item lands in box (7 % 3) = box
    1.'
  analogy: A clock with 12 positions. If it is 10 o'clock and 5 hours pass, the hand lands at (10 + 5)
    % 12 = 3. The clock "wraps around" just like modulo does.
  why: Hash tables use modulo to turn any key (even a huge number from hashing a string) into a valid
    index. myKey.hashCode() % tableSize = which slot to use.
- id: hash-function-concept
  title: Hash functions - turning anything into a number
  plain: A hash function takes any input (a string, an object, anything) and converts it into a number.
    The same input always produces the same number. Think of it as a recipe that takes ingredients and
    always produces the same dish. The number produced is called the hash.
  visual: An input box on the left. An arrow labeled "hash()" points to a number on the right. Try "apple"
    → 7823. Try "banana" → 3241. Try "apple" again → 7823 (same every time).
  analogy: A library catalog number. The title "Moby Dick" always maps to the same shelf location number.
    Any librarian can compute the location without searching the entire library.
  why: Hash(key) % tableSize tells you exactly which slot to store the value in. This is how O(1) lookup
    is possible - no searching, just compute the address.
challenges:
- title: Group Anagrams
  difficulty: medium
  description: Given an array of strings, group the anagrams together. You can return the answer in any
    order. An anagram is a word formed by rearranging the letters of another word.
  starter: "from collections import defaultdict\n\ndef group_anagrams(strs):\n    # Key insight: anagrams\
    \ have the same sorted characters\n    pass\n\nprint(group_anagrams([\"eat\",\"tea\",\"tan\",\"ate\"\
    ,\"nat\",\"bat\"]))\nprint(group_anagrams([\"\"]))   # [[\"\"]]\nprint(group_anagrams([\"a\"]))  #\
    \ [[\"a\"]]\n"
  tests:
  - input: group_anagrams(["eat","tea","tan","ate","nat","bat"])
    expected: 3 groups
  - input: group_anagrams([""])
    expected: '[[""]]'
  hints:
  - Two strings are anagrams if and only if their sorted characters are identical.
  - Use sorted(word) as a dictionary key (convert to tuple for hashability).
  - defaultdict(list) makes grouping clean.
  tags:
  - hash-map
  - string
  - google-favorite
  optimal: O(n * k log k) time, O(n * k) space
- title: Subarray Sum Equals K
  difficulty: medium
  description: Given an array of integers `nums` and an integer `k`, return the total number of continuous
    subarrays whose sum equals `k`.
  starter: "from collections import defaultdict\n\ndef subarray_sum(nums, k):\n    # Prefix sum + hash\
    \ map approach\n    pass\n\nprint(subarray_sum([1, 1, 1], 2))       # 2\nprint(subarray_sum([1, 2,\
    \ 3], 3))       # 2\nprint(subarray_sum([-1, -1, 1], 0))     # 1\n"
  tests:
  - input: subarray_sum([1,1,1], 2)
    expected: '2'
  - input: subarray_sum([1,2,3], 3)
    expected: '2'
  hints:
  - Brute force is O(n^2). The trick is using prefix sums.
  - If prefix[j] - prefix[i] == k, then subarray (i,j] sums to k.
  - Store prefix sum counts in a map. For each position, check if (prefix - k) was seen.
  - 'Initialize map with {0: 1} to handle subarrays starting from index 0.'
  tags:
  - prefix-sum
  - hash-map
  - google-favorite
  optimal: O(n) time, O(n) space
---

# Hash Tables

Hash tables trade space for time, turning O(n) searches into O(1). They appear in almost every interview problem. Master frequency counting, two-sum patterns, and grouping.

## Key points

- collections.Counter and defaultdict are critical Python tools
- Anagram grouping: sort the word as the key
- Subarray sum equals k: prefix sum + hash map
- LRU cache: dict + doubly linked list (or use OrderedDict)
- Collision resolution: chaining vs. open addressing

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
from collections import Counter, defaultdict

# --- Group Anagrams ---
def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = tuple(sorted(s))
        groups[key].append(s)
    return list(groups.values())

# --- Subarray Sum Equals K ---
def subarray_sum(nums, k):
    count = 0
    prefix = 0
    seen = defaultdict(int)
    seen[0] = 1
    for n in nums:
        prefix += n
        count += seen[prefix - k]
        seen[prefix] += 1
    return count

# --- Top K Frequent Elements ---
def top_k_frequent(nums, k):
    count = Counter(nums)
    # Bucket sort by frequency for O(n)
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, freq in count.items():
        buckets[freq].append(num)
    result = []
    for freq in range(len(buckets) - 1, 0, -1):
        result.extend(buckets[freq])
        if len(result) >= k:
            return result[:k]
    return result

print(group_anagrams(["eat","tea","tan","ate","nat","bat"]))
print(subarray_sum([1, 1, 1], 2))   # 2
print(top_k_frequent([1,1,1,2,2,3], 2))  # [1, 2]
```

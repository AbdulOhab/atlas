---
title: Tries
order: 9
summary: Tries (prefix trees) are the go-to structure for autocomplete, spell checking, and IP routing.
  Google uses them extensively in search. Master insertion, search, and prefix matching.
category: Data structures
level: Advanced
bigO:
  best: O(m)
  average: O(m)
  worst: O(m)
  space: O(n * m)
explained:
  time: O(L) for insert and search where L is the length of the word - not the number of words stored.
    A trie with a million words is no slower to search than one with ten words.
  space: O(A × L × n) where A is alphabet size (26 for English), L is average word length, n is number
    of words. Each node needs up to 26 child pointers.
  visual: A phone tree. Press 1 for sales, then press 2 for existing customers, then press 3 for billing.
    Each keypress is one letter/step. The depth of the menu tree equals the longest phone path.
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
- id: string-as-path
  title: Strings as paths through a tree
  plain: 'In a trie, each letter of a word is one step down the tree. The word "cat" is stored as: root
    → c → a → t. The depth of the tree equals the length of the longest word, not the number of words.
    This is what makes prefix search so fast.'
  visual: 'A tree where each edge is labeled with a letter. Trace the path for "cat": follow the c edge,
    then a, then t. The node at the end is marked as a complete word.'
  analogy: A filing system where files are sorted one letter at a time. All files starting with "c" are
    in one drawer, within that drawer all "ca" files are in one folder. Finding any file means navigating
    letter by letter.
challenges:
- title: Implement Trie (Prefix Tree)
  difficulty: medium
  description: Implement a Trie with `insert(word)`, `search(word)` (returns true if word exists), and
    `startsWith(prefix)` (returns true if any word has this prefix) methods.
  hints:
  - Each TrieNode needs a children dict mapping char -> TrieNode.
  - Mark the last node of each inserted word with is_end = True.
  - search requires is_end == True at the end; starts_with just needs the path to exist.
  optimal: O(m) per op time, O(n * m) space
---

# Tries

Tries (prefix trees) are the go-to structure for autocomplete, spell checking, and IP routing. Google uses them extensively in search. Master insertion, search, and prefix matching.

## Key points

- m is the length of the word being inserted/searched
- Each node stores children dict and is_end_of_word flag
- Prefix search is O(m) - just traverse without requiring is_end
- Can store additional data at terminal nodes (frequency, definition)
- Compressed trie (radix tree) reduces space for sparse tries

## Reference implementation

A compact Python reference for the patterns this topic tests. Read it line by line; every line has a reason.

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        node = self._traverse(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        return self._traverse(prefix) is not None

    def _traverse(self, s):
        node = self.root
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def autocomplete(self, prefix):
        node = self._traverse(prefix)
        if not node:
            return []
        results = []
        def dfs(n, path):
            if n.is_end:
                results.append(prefix + path)
            for ch, child in n.children.items():
                dfs(child, path + ch)
        dfs(node, "")
        return results

trie = Trie()
for word in ["apple", "app", "application", "apply", "banana"]:
    trie.insert(word)

print(trie.search("app"))           # True
print(trie.search("ap"))            # False
print(trie.starts_with("ap"))       # True
print(trie.autocomplete("app"))     # ['app', 'apple', 'application', 'apply']
```

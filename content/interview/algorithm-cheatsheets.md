---
title: "Algorithm Cheatsheets"
order: 3
summary: "One cheatsheet per topic: the time complexity, the techniques worth knowing, the corner cases to test and the questions to practise."
category: "Interview Prep"
level: Beginner
---

# Algorithm Cheatsheets

One cheatsheet per topic: the time complexity, the techniques worth knowing, the corner cases to test and the questions to practise.

## Introduction

> **Source:** [Introduction](https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### What is this

This section dives deep into practical knowledge and techniques for algorithms and data structures which appear frequently in algorithm interviews. The more techniques you have in your arsenal, the higher the chances of passing the interview. They may lead you to discover corner cases you might have missed out or even lead you toward the optimal approach!

### Contents of each study guide

For each topic, you can expect to find:

1. A brief overview
1. Learning resources
1. Language-specific libraries to use
1. Time complexities cheatsheet
1. Things to look out for during interviews
1. Corner cases
1. Useful techniques with recommended questions to practice

### Study guides list

Here is the list of data structures and algorithms you should prepare for coding interviews and their corresponding study guides:

| Topic                                           | Priority |
| ----------------------------------------------- | -------- |
| [Array](https://www.techinterviewhandbook.org/algorithms/array/)                             | High     |
| [String](https://www.techinterviewhandbook.org/algorithms/string/)                           | High     |
| [Hash Table](https://www.techinterviewhandbook.org/algorithms/hash-table/)                   | Mid      |
| [Recursion](https://www.techinterviewhandbook.org/algorithms/recursion/)                     | Mid      |
| [Sorting and searching](https://www.techinterviewhandbook.org/algorithms/sorting-searching/) | High     |
| [Matrix](https://www.techinterviewhandbook.org/algorithms/matrix/)                           | High     |
| [Linked List](https://www.techinterviewhandbook.org/algorithms/linked-list/)                 | Mid      |
| [Queue](https://www.techinterviewhandbook.org/algorithms/queue/)                             | Mid      |
| [Stack](https://www.techinterviewhandbook.org/algorithms/stack/)                             | Mid      |
| [Tree](https://www.techinterviewhandbook.org/algorithms/tree/)                               | High     |
| [Graph](https://www.techinterviewhandbook.org/algorithms/graph/)                             | High     |
| [Heap](https://www.techinterviewhandbook.org/algorithms/heap/)                               | Mid      |
| [Trie](https://www.techinterviewhandbook.org/algorithms/trie/)                               | Mid      |
| [Interval](https://www.techinterviewhandbook.org/algorithms/interval/)                       | Mid      |
| [Dynamic programming](https://www.techinterviewhandbook.org/algorithms/dynamic-programming/) | Low      |
| [Binary](https://www.techinterviewhandbook.org/algorithms/binary/)                           | Low      |
| [Math](https://www.techinterviewhandbook.org/algorithms/math/)                               | Low      |
| [Geometry](https://www.techinterviewhandbook.org/algorithms/geometry/)                       | Low      |

### General interview tips

Clarify any assumptions you made subconsciously. Many questions are under-specified on purpose.

Always validate input first. Check for invalid/empty/negative/different type input. Never assume you are given the valid parameters. Alternatively, clarify with the interviewer whether you can assume valid input (usually yes), which can save you time from writing code that does input validation.

Are there any time/space complexity requirements/constraints?

Check for off-by-one errors.

In languages where there are no automatic type coercion, check that concatenation of values are of the same type: `int`/`str`/`list`.

After finishing your code, use a few example inputs to test your solution.

Is the algorithm meant to be run multiple times, for example in a web server? If yes, the input is likely to be preprocess-able to improve the efficiency in each call.

Use a mix of functional and imperative programming paradigms:

- Write pure functions as much as possible.
- Pure functions are easier to reason about and can help to reduce bugs in your implementation.
- Avoid mutating the parameters passed into your function especially if they are passed by reference unless you are sure of what you are doing.
- However, functional programming is usually expensive in terms of space complexity because of non-mutation and the repeated allocation of new objects. On the other hand, imperative code is faster because you operate on existing objects. Hence you will need to achieve a balance between accuracy vs efficiency, by using the right amount of functional and imperative code where appropriate.
- Avoid relying on and mutating global variables. Global variables introduce state.
- If you have to rely on global variables, make sure that you do not mutate it by accident.

Generally, to improve the speed of a program, we can either: (1) choose a more appropriate data structure/algorithm; or (2) use more memory. The latter demonstrates a classic space vs. time tradeoff, but it is not necessarily the case that you can only achieve better speed at the expense of space. Also, note that there is often a theoretical limit to how fast your program can run (in terms of time complexity). For instance, a question that requires you to find the smallest/largest element in an unsorted array cannot run faster than O(N).

Data structures are your weapons. Choosing the right weapon for the right battle is the key to victory. Be very familiar about the strengths of each data structure and the time complexities for its various operations.

Data structures can be augmented to achieve efficient time complexities across different operations. For example, a hash map can be used together with a doubly-linked list to achieve O(1) time complexity for both the `get` and `put` operation in an [LRU cache](https://leetcode.com/problems/lru-cache/).

Hash table is probably the most commonly used data structure for algorithm questions. If you are stuck on a question, your last resort can be to enumerate through the common possible data structures (thankfully there aren't that many of them) and consider whether each of them can be applied to the problem. This has worked for me sometimes.

If you are cutting corners in your code, state that out loud to your interviewer and say what you would do in a non-interview setting (no time constraints). E.g., I would write a regex to parse this string rather than using `split()` which may not cover all cases.

### Recommended courses

<!-- ## References

- http://blog.triplebyte.com/how-to-pass-a-programming-interview
- http://www.geeksforgeeks.org/must-do-coding-questions-for-companies-like-amazon-microsoft-adobe/
- https://medium.com/basecs -->

## Array

> **Source:** [Array](https://www.techinterviewhandbook.org/algorithms/array/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

Arrays hold values of the same type at contiguous memory locations. In an array, we're usually concerned about two things - the position/index of an element and the element itself. Different programming languages implement arrays under the hood differently and can affect the time complexity of operations you make to the array. In some languages like Python, JavaScript, Ruby, PHP, the array (or list in Python) size is dynamic and you do not need to have a size defined beforehand when creating the array. As a result, people usually have an easier time using these languages for interviews.

Arrays are among the most common data structures encountered during interviews. Questions which ask about other topics would likely involve arrays/sequences as well. Mastery of array is essential for interviews!

**Advantages**

- Store multiple elements of the same type with one single variable name
- Accessing elements is fast as long as you have the index, as opposed to [linked lists](https://www.techinterviewhandbook.org/algorithms/linked-list/) where you have to traverse from the head.

**Disadvantages**

- Addition and removal of elements into/from the middle of an array is slow because the remaining elements need to be shifted to accommodate the new/missing element. An exception to this is if the position to be inserted/removed is at the end of the array.
- For certain languages where the array size is fixed, it cannot alter its size after initialization. If an insertion causes the total number of elements to exceed the size, a new array has to be allocated and the existing elements have to be copied over. The act of creating a new array and transferring elements over takes O(n) time.

### Learning resources

- Readings
  - [Array in Data Structure: What is, Arrays Operations](https://www.guru99.com/array-data-structure.html), Guru99
- Videos
  - [Arrays](https://www.coursera.org/lecture/data-structures/arrays-OsBSF), University of California San Diego

### Common terms

Common terms you see when doing problems involving arrays:

- Subarray - A range of contiguous values within an array.
  - Example: given an array `[2, 3, 6, 1, 5, 4]`, `[3, 6, 1]` is a subarray while `[3, 1, 5]` is not a subarray.
- Subsequence - A sequence that can be derived from the given sequence by deleting some or no elements without changing the order of the remaining elements.
  - Example: given an array `[2, 3, 6, 1, 5, 4]`, `[3, 1, 5]` is a subsequence but `[3, 5, 1]` is not a subsequence.

### Time complexity

| Operation | Big-O | Note |
| --- | --- | --- |
| Access | O(1) |  |
| Search | O(n) |  |
| Search (sorted array) | O(log(n)) |  |
| Insert | O(n) | Insertion would require shifting all the subsequent elements to the right by one and that takes O(n) |
| Insert (at the end) | O(1) | Special case of insertion where no other element needs to be shifted |
| Remove | O(n) | Removal would require shifting all the subsequent elements to the left by one and that takes O(n) |
| Remove (at the end) | O(1) | Special case of removal where no other element needs to be shifted |

### Things to look out for during interviews

- Clarify if there are duplicate values in the array. Would the presence of duplicate values affect the answer? Does it make the question simpler or harder?
- When using an index to iterate through array elements, be careful not to go out of bounds.
- Be mindful about slicing or concatenating arrays in your code. Typically, slicing and concatenating arrays would take O(n) time. Use start and end indices to demarcate a subarray/range where possible.

### Corner cases

- Empty sequence
- Sequence with 1 or 2 elements
- Sequence with repeated elements
- Duplicated values in the sequence

### Techniques

Note that because both arrays and strings are sequences (a string is an array of characters), most of the techniques here will apply to string problems.

#### Sliding window

Master the [sliding window technique](https://leetcode.com/problems/minimum-window-substring/solutions/26808/here-is-a-10-line-template-that-can-solve-most-substring-problems/) that applies to many subarray/substring problems. In a sliding window, the two pointers usually move in the same direction will never overtake each other. This ensures that each value is only visited at most twice and the time complexity is still O(n). Examples: [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/), [Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/), [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)

#### Two pointers

Two pointers is a more general version of sliding window where the pointers can cross each other and can be on different arrays. Examples: [Sort Colors](https://leetcode.com/problems/sort-colors/), [Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings/)

When you are given two arrays to process, it is common to have one index per array (pointer) to traverse/compare the both of them, incrementing one of the pointers when relevant. For example, we use this approach to merge two sorted arrays. Examples: [Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/)

#### Traversing from the right

Sometimes you can traverse the array starting from the right instead of the conventional approach of from the left. Examples: [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/), [Number of Visible People in a Queue](https://leetcode.com/problems/number-of-visible-people-in-a-queue/)

#### Sorting the array

Is the array sorted or partially sorted? If it is, some form of binary search should be possible. This also usually means that the interviewer is looking for a solution that is faster than O(n).

Can you sort the array? Sometimes sorting the array first may significantly simplify the problem. Obviously this would not work if the order of array elements need to be preserved. Examples: [Merge Intervals](https://leetcode.com/problems/merge-intervals/), [Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/)

#### Precomputation

For questions where summation or multiplication of a subarray is involved, pre-computation using hashing or a prefix/suffix sum/product might be useful. Examples: [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/), [Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/), [LeetCode questions tagged "prefix-sum"](https://leetcode.com/problem-list/prefix-sum/)

#### Index as a hash key

If you are given a sequence and the interviewer asks for O(1) space, it might be possible to use the array itself as a hash table. For example, if the array only has values from 1 to N, where N is the length of the array, negate the value at that index (minus one) to indicate presence of that number. Examples: [First Missing Positive](https://leetcode.com/problems/first-missing-positive/), [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)

#### Traversing the array more than once

This might be obvious, but traversing the array twice/thrice (as long as fewer than n times) is still O(n). Sometimes traversing the array more than once can help you solve the problem while keeping the time complexity to O(n).

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Two Sum](https://leetcode.com/problems/two-sum/)
- [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)
- [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/)
- [Maximum Subarray](https://leetcode.com/problems/maximum-subarray/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)
- [Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray/)
- [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)
- [3Sum](https://leetcode.com/problems/3sum/)
- [Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
- [Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/)

### Recommended courses

## String

> **Source:** [String](https://www.techinterviewhandbook.org/algorithms/string/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

A string is a sequence of characters. Many tips that apply to arrays also apply to strings. You're recommended to read the page on [Arrays](https://www.techinterviewhandbook.org/algorithms/array/) before reading this page.

Common data structures for looking up strings:

- [Trie/Prefix Tree](https://en.wikipedia.org/wiki/Trie)
- [Suffix Tree](https://en.wikipedia.org/wiki/Suffix_tree)

Common string algorithms:

- [Rabin Karp](https://en.wikipedia.org/wiki/Rabin%E2%80%93Karp_algorithm) for efficient searching of substring using a rolling hash
- [KMP](https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm) for efficient searching of substring

### Time complexity

A string is an array of characters, so the time complexities of basic string operations will closely resemble that of array operations.

| Operation | Big-O |
| --------- | ----- |
| Access    | O(1)  |
| Search    | O(n)  |
| Insert    | O(n)  |
| Remove    | O(n)  |

#### Operations involving another string

Here we assume the other string is of length m.

| Operation | Big-O | Note |
| --- | --- | --- |
| Find substring | O(n.m) | This is the most naive case. There are more efficient algorithms for string searching such as the [KMP algorithm](https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm) |
| Concatenating strings | O(n + m) |  |
| Slice | O(m) |  |
| Split (by token) | O(n + m) |  |
| Strip (remove leading and trailing whitespaces) | O(n) |  |

### Things to look out for during interviews

Ask about input character set and case sensitivity. Usually the characters are limited to lowercase Latin characters, for example a to z.

### Corner cases

- Empty string
- String with 1 or 2 characters
- String with repeated characters
- Strings with only distinct characters

### Techniques

Many string questions fall into one of these buckets.

#### Counting characters

Often you will need to count the frequency of characters in a string. The most common way of doing that is by using a hash table/map in your language of choice. If your language has a built-in Counter class like Python, ask if you can use that instead.

If you need to keep a counter of characters, a common mistake is to say that the space complexity required for the counter is O(n). The space required for a counter of a string of latin characters is O(1) not O(n). This is because the upper bound is the range of characters, which is usually a fixed constant of 26. The input set is just lowercase Latin characters.

##### String of unique characters

A neat trick to count the characters in a string of unique characters is to use a 26-bit bitmask to indicate which lower case latin characters are inside the string.

```py
mask = 0
for c in word:
  mask |= (1 << (ord(c) - ord('a')))
```

To determine if two strings have common characters, perform `&` on the two bitmasks. If the result is non-zero, ie. `mask_a & mask_b > 0`, then the two strings have common characters.

#### Anagram

An anagram is word switch or word play. It is the result of rearranging the letters of a word or phrase to produce a new word or phrase, while using all the original letters only once. In interviews, usually we are only bothered with words without spaces in them.

To determine if two strings are anagrams, there are a few approaches:

- Sorting both strings should produce the same resulting string. This takes O(n.log(n)) time and O(n) space.
- If we map each character to a prime number and we multiply each mapped number together, anagrams should have the same multiple (prime factor decomposition). This takes O(n) time and O(1) space. Examples: [Group Anagram](https://leetcode.com/problems/group-anagrams/)
- Frequency counting of characters will help to determine if two strings are anagrams. This also takes O(n) time and O(1) space.

#### Palindrome

A palindrome is a word, phrase, number, or other sequence of characters which reads the same backward as forward, such as `madam` or `racecar`.

Here are ways to determine if a string is a palindrome:

- Reverse the string and it should be equal to itself.
- Have two pointers at the start and end of the string. Move the pointers inward till they meet. At every point in time, the characters at both pointers should match.

The order of characters within the string matters, so hash tables are usually not helpful.

When a question is about counting the number of palindromes, a common trick is to have two pointers that move outward, away from the middle. Note that palindromes can be even or odd length. For each middle pivot position, you need to check it twice - once that includes the character and once without the character. This technique is used in [Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/).

- For substrings, you can terminate early once there is no match
- For subsequences, use dynamic programming as there are overlapping subproblems. Check out [this question](https://leetcode.com/problems/longest-palindromic-subsequence/)

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Valid Anagram](https://leetcode.com/problems/valid-anagram/)
- [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
- [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/)
- [Find All Anagrams in a String](https://leetcode.com/problems/find-all-anagrams-in-a-string/)
- [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/description/)
- [Group Anagrams](https://leetcode.com/problems/group-anagrams/)
- [Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/)
- [Encode and Decode Strings (LeetCode Premium)](https://leetcode.com/problems/encode-and-decode-strings/)

### Recommended courses

## Hash table

> **Source:** [Hash table](https://www.techinterviewhandbook.org/algorithms/hash-table/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

A hash table (commonly referred to as hash map) is a data structure that implements an associative array abstract data type, a structure that can map keys to values. A hash table uses a hash function on an element to compute an index, also called a hash code, into an array of buckets or slots, from which the desired value can be found. During lookup, the key is hashed and the resulting hash indicates where the corresponding value is stored.

Hashing is the most common example of a space-time tradeoff. Instead of linearly searching an array every time to determine if an element is present, which takes O(n) time, we can traverse the array once and hash all the elements into a hash table. Determining if the element is present is a simple matter of hashing the element and seeing if it exists in the hash table, which is O(1) on average.

In the case of hash collisions, there are a number of collision resolution techniques that can be used. You will unlikely be asked about details of collision resolution techniques in interviews:

- **Separate chaining** - A linked list is used for each value, so that it stores all the collided items.
- **Open addressing** - All entry records are stored in the bucket array itself. When a new entry has to be inserted, the buckets are examined, starting with the hashed-to slot and proceeding in some probe sequence, until an unoccupied slot is found.

### Learning resources

- Readings
  - [Taking Hash Tables Off The Shelf](https://medium.com/basecs/taking-hash-tables-off-the-shelf-139cbf4752f0), basecs
  - [Hashing Out Hash Functions](https://medium.com/basecs/hashing-out-hash-functions-ea5dd8beb4dd), basecs
- Videos
  - [Core: Hash Tables](https://www.coursera.org/lecture/data-structures-optimizing-performance/core-hash-tables-m7UuP), University of California San Diego
  - [A Brief Guide to Hash Tables](https://www.youtube.com/watch?v=r1XZGP5ppqQ) ([slides](https://samuelalbanie.com/files/digest-slides/2022-09-brief-guide-to-hash-tables.pdf)), Samuel Albanie, University of Cambridge

### Implementations

| Language | API |
| --- | --- |
| C++ | [`std::unordered_map`](https://learn.microsoft.com/en-us/cpp/standard-library/unordered-map?view=msvc-170) |
| Java | [`java.util.Map`](https://docs.oracle.com/javase/10/docs/api/java/util/Map.html). Use [`java.util.HashMap`](https://docs.oracle.com/javase/10/docs/api/java/util/HashMap.html) |
| Python | [`dict`](https://docs.python.org/3/tutorial/datastructures.html#dictionaries) |
| JavaScript | [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) or [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) |

### Time complexity

| Operation | Big-O  | Note                                                 |
| --------- | ------ | ---------------------------------------------------- |
| Access    | N/A    | Accessing not possible as the hash code is not known |
| Search    | O(1)\* |                                                      |
| Insert    | O(1)\* |                                                      |
| Remove    | O(1)\* |                                                      |

_\* This is the average case, but in interviews we only care about the average case for hash tables._

### Sample questions

- Describe an implementation of a least-used cache, and big-O notation of it.
- A question involving an API's integration with hash map where the buckets of hash map are made up of linked lists.

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Two Sum](https://leetcode.com/problems/two-sum/)
- [Ransom Note](https://leetcode.com/problems/ransom-note/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Group Anagrams](https://leetcode.com/problems/group-anagrams/)
- [Insert Delete GetRandom O(1)](https://leetcode.com/problems/insert-delete-getrandom-o1/)
- [First Missing Positive](https://leetcode.com/problems/first-missing-positive/)
- [LRU Cache](https://leetcode.com/problems/lru-cache/)
- [All O one Data Structure](https://leetcode.com/problems/all-oone-data-structure/)

### Recommended courses

## Recursion

> **Source:** [Recursion](https://www.techinterviewhandbook.org/algorithms/recursion/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

Recursion is a method of solving a computational problem where the solution depends on solutions to smaller instances of the same problem.

All recursive functions contain two parts:

1. A base case (or cases) defined, which defines when the recursion is stopped - otherwise it will go on forever!
1. Breaking down the problem into smaller subproblems and invoking the recursive call

One of the most common example of recursion is the Fibonacci sequence.

- Base cases: `fib(0) = 0` and `fib(1) = 1`
- Recurrence relation: `fib(i) = fib(i-1) + fib(i-2)`

```py
def fib(n):
  if n <= 1:
    return n
  return fib(n - 1) + fib(n - 2)
```

Many algorithms relevant in coding interviews make heavy use of recursion - binary search, merge sort, tree traversal, depth-first search, etc. In this article, we focus on questions which use recursion but aren't part of other well known algorithms.

### Learning resources

- Readings
  - [Recursion](https://users.cs.utah.edu/~germain/PPS/Topics/recursion.html), University of Utah
- Videos
  - [Tail Recursion](https://www.coursera.org/lecture/programming-languages/tail-recursion-YZic1), University of Washington

<!-- TODO: Talk about backtracking -->

### Things to look out for during interviews

- Always remember to define a base case so that your recursion will end.
- Recursion is useful for permutation, because it generates all combinations and tree-based questions. You should know how to generate all permutations of a sequence as well as how to handle duplicates.
- Recursion implicitly uses a stack. Hence all recursive approaches can be rewritten iteratively using a stack. Beware of cases where the recursion level goes too deep and causes a stack overflow (the default limit in Python is 1000). You may get bonus points for pointing this out to the interviewer. Recursion will never be O(1) space complexity because a stack is involved, unless there is [tail-call optimization](https://stackoverflow.com/questions/310974/what-is-tail-call-optimization) (TCO). Find out if your chosen language supports TCO.
- Number of base cases - In the fibonacci example above, note that one of our recursive calls invoke `fib(n - 2)`. This indicates that you should have 2 base cases defined so that your code covers all possible invocations of the function within the input range. If your recursive function only invokes `fn(n - 1)`, then only one base case is needed

### Corner cases

- `n = 0`
- `n = 1`
- Make sure you have enough base cases to cover all possible invocations of the recursive function

### Techniques

#### Memoization

In some cases, you may be computing the result for previously computed inputs. Let's look at the Fibonacci example again. `fib(5)` calls `fib(4)` and `fib(3)`, and `fib(4)` calls `fib(3)` and `fib(2)`. `fib(3)` is being called twice! If the value for `fib(3)` is memoized and used again, that greatly improves the efficiency of the algorithm and the time complexity becomes O(n).

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Generate Parentheses](https://leetcode.com/problems/generate-parentheses/)
- [Combinations](https://leetcode.com/problems/combinations/)
- [Subsets](https://leetcode.com/problems/subsets/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)
- [Subsets II](https://leetcode.com/problems/subsets-ii/)
- [Permutations](https://leetcode.com/problems/permutations/)
- [Sudoku Solver](https://leetcode.com/problems/sudoku-solver/)
- [Strobogrammatic Number II (LeetCode Premium)](https://leetcode.com/problems/strobogrammatic-number-ii/)

### Recommended courses

## Sorting and searching

> **Source:** [Sorting and searching](https://www.techinterviewhandbook.org/algorithms/sorting-searching/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

Sorting is the act of rearranging elements in a sequence in order, either in numerical or lexicographical order, and either ascending or descending.

A number of basic algorithms run in O(n<sup>2</sup>) and should not be used in interviews. In algorithm interviews, you're unlikely to need to implement any of the sorting algorithms from scratch. Instead you would need to sort the input using your language's default sorting function so that you can use binary searches on them.

On a sorted array of elements, by leveraging on its sorted property, searching can be done on them in faster than O(n) time by using a binary search. Binary search compares the target value with the middle element of the array, which informs the algorithm whether the target value lies in the left half or the right half, and this comparison proceeds on the remaining half until the target is found or the remaining half is empty.

### Learning resources

While you're unlikely to be asked to implement a sorting algorithm from scratch during an interview, it is good to know the various time complexities of the different sorting algorithms.

- Readings
  - [Sorting Out The Basics Behind Sorting Algorithms](https://medium.com/basecs/sorting-out-the-basics-behind-sorting-algorithms-b0a032873add), basecs
  - [Binary Search](https://www.khanacademy.org/computing/computer-science/algorithms/binary-search/a/binary-search), Khan Academy
- Additional (only if you have time)
  - [Exponentially Easy Selection Sort](https://medium.com/basecs/exponentially-easy-selection-sort-d7a34292b049), basecs
  - [Bubbling Up With Bubble Sorts](https://medium.com/basecs/bubbling-up-with-bubble-sorts-3df5ac88e592), basecs
  - [Inching Towards Insertion Sort](https://medium.com/basecs/inching-toward-insertion-sort-9799274430da), basecs
  - [Making Sense of Merge Sort (Part 1)](https://medium.com/basecs/making-sense-of-merge-sort-part-1-49649a143478), basecs
  - [Making Sense of Merge Sort (Part 2)](https://medium.com/basecs/making-sense-of-merge-sort-part-2-be8706453209), basecs
  - [Pivoting To Understand Quicksort (Part 1)](https://medium.com/basecs/pivoting-to-understand-quicksort-part-1-75178dfb9313), basecs
  - [Pivoting To Understand Quicksort (Part 2)](https://medium.com/basecs/pivoting-to-understand-quicksort-part-2-30161aefe1d3), basecs
  - [Counting Linearly With Counting Sort](https://medium.com/basecs/counting-linearly-with-counting-sort-cd8516ae09b3), basecs
  - [Getting To The Root Of Sorting With Radix Sort](https://medium.com/basecs/getting-to-the-root-of-sorting-with-radix-sort-f8e9240d4224), basecs
- Videos
  - [Heapsort](https://www.youtube.com/watch?v=ryRfapIQHW0&feature=youtu.be) ([slides](https://samuelalbanie.com/files/digest-slides/2022-12-brief-guide-to-heapsort-and-binary-heaps.pdf)), Samuel Albanie, University of Cambridge
  - [Quicksort](https://www.youtube.com/watch?v=kbiKn1K08RM&feature=youtu.be) ([slides](https://samuelalbanie.com/files/digest-slides/2023-01-brief-guide-to-quicksort.pdf)), Samuel Albanie, University of Cambridge
  - [Lower bounds for comparison sorts](https://www.youtube.com/watch?v=JWSiXs9aB5U) ([slides](https://samuelalbanie.com/files/digest-slides/2023-01-brief-guide-to-comparison-sorting-lower-bounds.pdf)), Samuel Albanie, University of Cambridge
  - [Counting sort](https://www.youtube.com/watch?v=0aMcZpAySjw) ([slides](https://samuelalbanie.com/files/digest-slides/2023-01-brief-guide-to-counting-sort.pdf)), Samuel Albanie, University of Cambridge
  - [Radix sort](https://www.youtube.com/watch?v=HzPbzQi9404) ([slides](https://samuelalbanie.com/files/digest-slides/2023-01-brief-guide-to-radix-sort.pdf)), Samuel Albanie, University of Cambridge
  - [Bucket sort](https://www.youtube.com/watch?v=mz2fBJyoEVc) ([slides](https://samuelalbanie.com/files/digest-slides/2023-01-brief-guide-to-bucket-sort.pdf)), Samuel Albanie, University of Cambridge

### Time complexity

| Algorithm      | Time             | Space     |
| -------------- | ---------------- | --------- |
| Bubble sort    | O(n<sup>2</sup>) | O(1)      |
| Insertion sort | O(n<sup>2</sup>) | O(1)      |
| Selection sort | O(n<sup>2</sup>) | O(1)      |
| Quicksort      | O(nlog(n))       | O(log(n)) |
| Mergesort      | O(nlog(n))       | O(n)      |
| Heapsort       | O(nlog(n))       | O(1)      |
| Counting sort  | O(n + k)         | O(k)      |
| Radix sort     | O(nk)            | O(n + k)  |

| Algorithm     | Big-O     |
| ------------- | --------- |
| Binary search | O(log(n)) |

### Things to look out for during interviews

Make sure you know the time and space complexity of the language's default sorting algorithm! The time complexity is almost definitely O(n log n). Bonus points if you can name the sort. In Python 3.11+, it's [Powersort](https://www.wild-inter.net/posts/powersort-in-python-3.11), which replaced Timsort as the default sorting algorithm. In Java, [an implementation of Timsort](https://github.com/openjdk/jdk/blob/d9052b946682d1c0f2629455d73fe4e6b95b29db/src/java.base/share/classes/java/util/TimSort.java) is used for sorting objects, and [Dual-Pivot Quicksort](https://github.com/openjdk/jdk/blob/d9052b946682d1c0f2629455d73fe4e6b95b29db/src/java.base/share/classes/java/util/DualPivotQuicksort.java) is used for sorting primitives.

### Corner cases

- Empty sequence
- Sequence with one element
- Sequence with two elements
- Sequence containing duplicate elements.

### Techniques

#### Sorted inputs

When a given sequence is in a sorted order (be it ascending or descending), using binary search should be one of the first things that come to your mind.

#### Sorting an input that has limited range

[Counting sort](https://en.wikipedia.org/wiki/Counting_sort) is a non-comparison-based sort you can use on numbers where you know the range of values beforehand. Examples: [H-Index](https://leetcode.com/problems/h-index/)

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Binary Search](https://leetcode.com/problems/binary-search/)
- [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Kth Smallest Element in a Sorted Matrix](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/)
- [Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix/)
- [Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)
- [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/)

### Recommended courses

## Matrix

> **Source:** [Matrix](https://www.techinterviewhandbook.org/algorithms/matrix/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

A matrix is a 2-dimensional array. Questions involving matrices are usually related to [dynamic programming](https://www.techinterviewhandbook.org/algorithms/dynamic-programming/) or [graph](https://www.techinterviewhandbook.org/algorithms/graph/) traversal.

Matrices can be used to represent graphs where each node is a cell on the matrix which has 4 neighbors (except those cells on the edge and corners). This page will focus on questions which don't use matrix as graphs. Questions which are meant to use the matrix as a graph can be found on the [graph section](https://www.techinterviewhandbook.org/algorithms/graph/).

### Corner cases

- Empty matrix. Check that none of the arrays are 0 length
- 1 x 1 matrix
- Matrix with only one row or column

### Techniques

#### Creating an empty N x M matrix

For questions involving traversal or dynamic programming, you almost always want to make a copy of the matrix with the same size/dimensions that is initialized to empty values to store the visited state or dynamic programming table. Be familiar with such a routine in your language of choice:

This can be done easily in Python in one line.

```py
# Assumes that the matrix is non-empty
zero_matrix = [[0 for _ in range(len(matrix[0]))] for _ in range(len(matrix))]
```

Copying a matrix in Python is:

```py
copied_matrix = [row[:] for row in matrix]
```

#### Converting between 1D and 2D indices

An `m x n` matrix can be treated as a one-dimensional array with `m * n` elements. Given a zero-based index in that array, divide it by the number of columns to get the row and use the remainder to get the column:

```py
row = index // num_columns
col = index % num_columns
```

To convert a row and column back into a one-dimensional index:

```py
index = row * num_columns + col
```

This technique can be useful when applying algorithms such as binary search to a matrix.

#### Transposing a matrix

The transpose of a matrix is found by interchanging its rows into columns or columns into rows.

Many grid-based games can be modeled as a matrix, such as Tic-Tac-Toe, Sudoku, Crossword, Connect 4, Battleship, etc. It is not uncommon to be asked to verify the winning condition of the game. For games like Tic-Tac-Toe, Connect 4 and Crosswords, where verification has to be done vertically and horizontally, one trick is to write code to verify the matrix for the horizontal cells, transpose the matrix, and reuse the logic for horizontal verification to verify originally vertical cells (which are now horizontal).

Transposing a matrix in Python is simply:

```py
transposed_matrix = [[matrix[i][j] for i in range(len(matrix))] for j in range(len(matrix[0]))]
```

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/)
- [Spiral Matrix](https://leetcode.com/problems/spiral-matrix/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Rotate Image](https://leetcode.com/problems/rotate-image/)
- [Valid Sudoku](https://leetcode.com/problems/valid-sudoku/)

### Recommended courses

## Linked list

> **Source:** [Linked list](https://www.techinterviewhandbook.org/algorithms/linked-list/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

Like arrays, a linked list is used to represent sequential data. It is a linear collection of data elements whose order is not given by their physical placement in memory, as opposed to arrays, where data is stored in sequential blocks of memory. Instead, each element contains an address of the next element. It is a data structure consisting of a collection of nodes which together represent a sequence.

In its most basic form, each node contains: data, and a reference (in other words, a link) to the next node in the sequence.

**Advantages**

Insertion and deletion of a node in the list (given its location) is O(1) whereas in arrays the following elements will have to be shifted.

**Disadvantages**

Access time is linear because directly accessing elements by its position in the list is not possible (in arrays you can do `arr[4]` for example). You have to traverse from the start.

### Learning resources

- Readings
  - [What's a Linked List, Anyway? [Part 1]](https://medium.com/basecs/whats-a-linked-list-anyway-part-1-d8b7e6508b9d), basecs
  - [What's a Linked List, Anyway? [Part 2]](https://medium.com/basecs/whats-a-linked-list-anyway-part-2-131d96f71996), basecs
- Videos
  - [Singly-linked lists](https://www.coursera.org/lecture/data-structures/singly-linked-lists-kHhgK), University of California San Diego
  - [Doubly linked lists](https://www.coursera.org/lecture/data-structures/doubly-linked-lists-jpGKD), University of California San Diego

### Types of linked lists

#### Singly linked list

A linked list where each node points to the next node and the last node points to `null`.

#### Doubly linked list

A linked list where each node has two pointers, `next` which points to the next node and `prev` which points to the previous node. The `prev` pointer of the first node and the `next` pointer of the last node point to `null`.

#### Circular linked list

A singly linked list where the last node points back to the first node. There is a circular doubly linked list variant where the `prev` pointer of the first node points to the last node and the `next` pointer of the last node points to the first node.

### Implementations

Out of the common languages, only Java provides a linked list implementation. Thankfully it's easy to write your own linked list regardless of language.

| Language | API |
| --- | --- |
| C++ | [`std::list`](https://en.cppreference.com/w/cpp/container/list) |
| Java | [`java.util.LinkedList`](https://docs.oracle.com/javase/10/docs/api/java/util/LinkedList.html) |
| Python | N/A |
| JavaScript | N/A |

### Time complexity

| Operation | Big-O | Note                                                 |
| --------- | ----- | ---------------------------------------------------- |
| Access    | O(n)  |                                                      |
| Search    | O(n)  |                                                      |
| Insert    | O(1)  | Assumes you have traversed to the insertion position |
| Remove    | O(1)  | Assumes you have traversed to the node to be removed |

### Common routines

Be familiar with the following routines because many linked list questions make use of one or more of these routines in the solution:

- Counting the number of nodes in the linked list
- Reversing a linked list in-place
- Finding the middle node of the linked list using two pointers (fast/slow)
- Merging two linked lists together

### Corner cases

- Empty linked list (head is `null`)
- Single node
- Two nodes
- Linked list has cycles. **Tip:** Clarify beforehand with the interviewer whether there can be a cycle in the list. Usually the answer is no and you don't have to handle it in the code

### Techniques

#### Sentinel/dummy nodes

Adding a sentinel/dummy node at the head and/or tail might help to handle many edge cases where operations have to be performed at the head or the tail. The presence of dummy nodes essentially ensures that operations will never be done on the head or the tail, thereby removing a lot of headache in writing conditional checks to dealing with null pointers. Be sure to remember to remove them at the end of the operation.

#### Two pointers

Two pointer approaches are also common for linked lists. This approach is used for many classic linked list problems.

- Getting the k<sup>th</sup> from last node - Have two pointers, where one is k nodes ahead of the other. When the node ahead reaches the end, the other node is k nodes behind
- Detecting cycles - Have two pointers, where one pointer increments twice as much as the other, if the two pointers meet, means that there is a cycle
- Getting the middle node - Have two pointers, where one pointer increments twice as much as the other. When the faster node reaches the end of the list, the slower node will be at the middle

#### Using space

Many linked list problems can be easily solved by creating a new linked list and adding nodes to the new linked list with the final result. However, this takes up extra space and makes the question much less challenging. The interviewer will usually request that you modify the linked list in-place and solve the problem without additional storage. You can borrow ideas from the [Reverse a Linked List](https://leetcode.com/problems/reverse-linked-list/) problem.

#### Elegant modification operations

As mentioned earlier, a linked list's non-sequential nature of memory allows for efficient modification of its contents. Unlike arrays where you can only modify the value at a position, for linked lists you can also modify the `next` pointer in addition to the `value`.

Here are some common operations and how they can be achieved easily:

- Truncate a list - Set the `next` pointer to `null` at the last element
- Swapping values of nodes - Just like arrays, just swap the value of the two nodes, there's no need to swap the `next` pointer
- Combining two lists - attach the head of the second list to the tail of the first list

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Reverse a Linked List](https://leetcode.com/problems/reverse-linked-list/)
- [Detect Cycle in a Linked List](https://leetcode.com/problems/linked-list-cycle/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)
- [Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)
- [Remove Nth Node From End Of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)
- [Reorder List](https://leetcode.com/problems/reorder-list/)

### Recommended courses

## Queue

> **Source:** [Queue](https://www.techinterviewhandbook.org/algorithms/queue/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

A queue is a linear collection of elements that are maintained in a sequence and can be modified by the addition of elements at one end of the sequence (**enqueue** operation) and the removal of elements from the other end (**dequeue** operation). Usually, the end of the sequence at which elements are added is called the back, tail, or rear of the queue, and the end at which elements are removed is called the head or front of the queue. As an abstract data type, queues can be implemented using arrays or singly linked lists.

This behavior is commonly called FIFO (first in, first out). The name "queue" for this type of structure comes from the analogy to people lining up in real life to wait for goods or services.

Breadth-first search is commonly implemented using queues.

### Learning resources

- Readings
  - [To Queue Or Not To Queue](https://medium.com/basecs/to-queue-or-not-to-queue-2653bcde5b04), basecs
- Videos
  - [Queues](https://www.coursera.org/lecture/data-structures/queues-EShpq), University of California San Diego

### Implementations

| Language | API |
| --- | --- |
| C++ | [`std::queue`](https://learn.microsoft.com/en-us/cpp/standard-library/queue-class?view=msvc-170) |
| Java | [`java.util.Queue`](https://docs.oracle.com/javase/10/docs/api/java/util/Queue.html).Use [`java.util.ArrayDeque`](https://docs.oracle.com/javase/10/docs/api/java/util/ArrayDeque.html) |
| Python | [`deque`](https://docs.python.org/3/library/collections.html#collections.deque) |
| JavaScript | N/A |

### Time complexity

| Operation     | Big-O |
| ------------- | ----- |
| Enqueue/Offer | O(1)  |
| Dequeue/Poll  | O(1)  |
| Front         | O(1)  |
| Back          | O(1)  |
| isEmpty       | O(1)  |

### Things to look out for during interviews

Most languages don't have a built-in Queue class which can be used, and candidates often use arrays (JavaScript) or lists (Python) as a queue. However, note that the dequeue operation (assuming the front of the queue is on the left) in such a scenario will be O(n) because it requires shifting of all other elements left by one. In such cases, you can flag this to the interviewer and say that you assume that there's a queue data structure to use which has an efficient dequeue operation.

### Corner cases

- Empty queue
- Queue with one item
- Queue with two items

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Implement Stack using Queues](https://leetcode.com/problems/implement-stack-using-queues/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/)
- [Design Circular Queue](https://leetcode.com/problems/design-circular-queue/)
- [Design Hit Counter (LeetCode Premium)](https://leetcode.com/problems/design-hit-counter/)

### Recommended courses

## Stack

> **Source:** [Stack](https://www.techinterviewhandbook.org/algorithms/stack/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

A stack is an abstract data type that supports the operations **push** (insert a new element on the top of the stack) and **pop** (remove and return the most recently added element, the element at the top of the stack). As an abstract data type, stacks can be implemented using arrays or singly linked lists.

This behavior is commonly called LIFO (last in, first out). The name "stack" for this type of structure comes from the analogy to a set of physical items stacked on top of each other.

Stacks are an important way of supporting nested or recursive function calls and is used to implement depth-first search. Depth-first search can be implemented using recursion or a manual stack.

### Learning resources

- Readings
  - [Stacks and Overflows](https://medium.com/basecs/stacks-and-overflows-dbcf7854dc67), basecs
- Videos
  - [Stacks](https://www.coursera.org/lecture/data-structures/stacks-UdKzQ), University of California San Diego

### Implementations

| Language | API |
| --- | --- |
| C++ | [`std::stack`](https://learn.microsoft.com/en-us/cpp/standard-library/stack-class?view=msvc-170) |
| Java | [`java.util.Stack`](https://docs.oracle.com/javase/10/docs/api/java/util/Stack.html) |
| Python | Simulated using [List](https://docs.python.org/3/tutorial/datastructures.html) |
| JavaScript | Simulated using [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) |

### Time complexity

| Operation | Big-O |
| --------- | ----- |
| Top/Peek  | O(1)  |
| Push      | O(1)  |
| Pop       | O(1)  |
| isEmpty   | O(1)  |
| Search    | O(n)  |

### Corner cases

- Empty stack. Popping from an empty stack
- Stack with one item
- Stack with two items

<!-- ## Techniques

TODO: Monotonic stacks -->

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)
- [Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Implement Stack using Queues](https://leetcode.com/problems/implement-stack-using-queues/)
- [Min Stack](https://leetcode.com/problems/min-stack/)
- [Asteroid Collision](https://leetcode.com/problems/asteroid-collision/)
- [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/)
- [Basic Calculator](https://leetcode.com/problems/basic-calculator/)
- [Basic Calculator II](https://leetcode.com/problems/basic-calculator-ii/)
- [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
- [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)
- [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/)

### Recommended courses

## Interval

> **Source:** [Interval](https://www.techinterviewhandbook.org/algorithms/interval/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

Interval questions are a subset of [array](https://www.techinterviewhandbook.org/algorithms/array/) questions where you are given an array of two-element arrays (an interval) and the two values represent a start and an end value. Interval questions are considered part of the array family but they involve some common techniques hence they are extracted out to this special section of their own.

An example interval array: `[[1, 2], [4, 7]]`.

Interval questions can be tricky to those who have not tried them before because of the sheer number of cases to consider when they overlap.

### Things to look out for during interviews

- Clarify with the interviewer whether `[1, 2]` and `[2, 3]` are considered overlapping intervals as it affects how you will write your equality checks.
- Clarify whether an interval of `[a, b]` will strictly follow `a` < `b` (`a` is smaller than `b`)

### Corner cases

- No intervals
- Single interval
- Two intervals
- Non-overlapping intervals
- An interval totally consumed within another interval
- Duplicate intervals (exactly the same start and end)
- Intervals which start right where another interval ends - `[[1, 2], [2, 3]]`

### Techniques

#### Sort the array of intervals by its starting point

A common routine for interval questions is to sort the array of intervals by each interval's starting value. This step is crucial to solving the [Merge Intervals](https://leetcode.com/problems/merge-intervals/) question.

#### Checking if two intervals overlap

Be familiar with writing code to check if two intervals overlap.

```py
def is_overlap(a, b):
  return a[0] < b[1] and b[0] < a[1]
```

#### Merging two intervals

```py
def merge_overlapping_intervals(a, b):
  return [min(a[0], b[0]), max(a[1], b[1])]
```

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Merge Intervals](https://leetcode.com/problems/merge-intervals/)
- [Insert Interval](https://leetcode.com/problems/insert-interval/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/)
- [Meeting Rooms (LeetCode Premium)](https://leetcode.com/problems/meeting-rooms/)
- [Meeting Rooms II (LeetCode Premium)](https://leetcode.com/problems/meeting-rooms-ii/)

### Recommended courses

## Tree

> **Source:** [Tree](https://www.techinterviewhandbook.org/algorithms/tree/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

A tree is a widely used abstract data type that represents a hierarchical structure with a set of connected nodes. Each node in the tree can be connected to many children, but must be connected to exactly one parent, except for the root node, which has no parent.

A tree is an undirected and connected acyclic graph. There are no cycles or loops. Each node can be like the root node of its own subtree, making [recursion](https://www.techinterviewhandbook.org/algorithms/recursion/) a useful technique for tree traversal.

For the purpose of interviews, you will usually be asked on binary trees as opposed to ternary (3 children) or N-ary (N children) trees. In this page, we will cover binary trees and binary search trees, which is a special case of binary trees.

Trees are commonly used to represent hierarchical data, e.g. file systems, JSON, and HTML documents. Do check out the section on [Trie](https://www.techinterviewhandbook.org/algorithms/trie/), which is an advanced tree used for efficiently storing and searching strings.

### Learning resources

- Videos
  - [Trees](https://www.coursera.org/lecture/data-structures/trees-95qda), University of California San Diego
  - [A Brief Guide to Binary Search Trees](https://www.youtube.com/watch?v=0woI8l0ZWmA) ([slides](https://samuelalbanie.com/files/digest-slides/2022-10-brief-guide-to-binary-search-trees.pdf)), Samuel Albanie, University of Cambridge
  - [A Brief Guide to Red-Black Trees](https://www.youtube.com/watch?v=t-oiZnplv7g) ([slides](https://samuelalbanie.com/files/digest-slides/2022-12-brief-guide-to-red-black-trees.pdf)), Samuel Albanie, University of Cambridge
  - [A Brief Guide to B-trees](https://www.youtube.com/watch?app=desktop&v=7MqaHGWRS3E) ([slides](https://samuelalbanie.com/files/digest-slides/2022-12-brief-guide-to-b-trees.pdf)), Samuel Albanie, University of Cambridge
- Readings
  - [How To Not Be Stumped By Trees](https://medium.com/basecs/how-to-not-be-stumped-by-trees-5f36208f68a7), basecs
  - [Leaf It Up To Binary Trees](https://medium.com/basecs/leaf-it-up-to-binary-trees-11001aaf746d), basecs
- Additional (only if you have time)
  - [The Little AVL Tree That Could](https://medium.com/basecs/the-little-avl-tree-that-could-86a3cae410c7), basecs
  - [Busying Oneself With B-Trees](https://medium.com/basecs/busying-oneself-with-b-trees-78bbf10522e7), basecs
  - [Painting Nodes Black With Red-Black Trees](https://medium.com/basecs/painting-nodes-black-with-red-black-trees-60eacb2be9a5), basecs

### Common terms you need to know

- **Neighbor** - Parent or child of a node
- **Ancestor** - A node reachable by traversing its parent chain
- **Descendant** - A node in the node's subtree
- **Degree** - Number of children of a node
- **Degree of a tree** - Maximum degree of nodes in the tree
- **Distance** - Number of edges along the shortest path between two nodes
- **Level/Depth** - Number of edges along the unique path between a node and the root node
- **Width** - Number of nodes in a level

#### Binary tree

Binary means two, so nodes in a binary tree have a maximum of two children.

**Binary tree terms**

- Complete binary tree - A complete binary tree is a binary tree in which every level, except possibly the last, is completely filled, and all nodes in the last level are as far left as possible.
- Balanced binary tree - A binary tree structure in which the left and right subtrees of every node differ in height by no more than 1.

**Traversals**

![Tree](https://upload.wikimedia.org/wikipedia/commons/5/5e/Binary_tree_v2.svg)

Given such a tree, these are the results for the various traversals.

- **In-order traversal** - Left -> Root -> Right
  - Result: 2, 7, 5, 6, 11, 1, 9, 5, 9
- **Pre-order traversal** - Root -> Left -> Right
  - Result: 1, 7, 2, 6, 5, 11, 9, 9, 5
- **Post-order traversal** - Left -> Right -> Root
  - Result: 2, 5, 11, 6, 7, 5, 9, 9, 1

Note that in-order traversal of a binary tree is insufficient to uniquely serialize a tree. Pre-order or post-order traversal is also required.

#### Binary search tree (BST)

In-order traversal of a BST will give you all elements in order.

Be very familiar with the properties of a BST and validating that a binary tree is a BST. This comes up more often than expected.

When a question involves a BST, the interviewer is usually looking for a solution which runs faster than O(n).

##### Time complexity

| Operation | Big-O     |
| --------- | --------- |
| Access    | O(log(n)) |
| Search    | O(log(n)) |
| Insert    | O(log(n)) |
| Remove    | O(log(n)) |

Space complexity of traversing balanced trees is O(h) where h is the height of the tree, while traversing very skewed trees (which is essentially a linked list) will be O(n).

### Things to look out for during interviews

You should be very familiar with writing pre-order, in-order, and post-order traversal recursively. As an extension, challenge yourself by writing them iteratively. Sometimes interviewers ask candidates for the iterative approach, especially if the candidate finishes writing the recursive approach too quickly.

### Corner cases

- Empty tree
- Single node
- Two nodes
- Very skewed tree (like a linked list)

### Common routines

Be familiar with the following routines because many tree questions make use of one or more of these routines in the solution:

- Insert value
- Delete value
- Count number of nodes in tree
- Whether a value is in the tree
- Calculate height of the tree
- Binary search tree
  - Determine if it is a binary search tree
  - Get maximum value
  - Get minimum value

### Techniques

#### Use recursion

Recursion is the most common approach for traversing trees. When you notice that the subtree problem can be used to solve the entire problem, try using recursion.

When using recursion, always remember to check for the base case, usually where the node is `null`.

Sometimes it is possible that your recursive function needs to return two values.

#### Traversing by level

When you are asked to traverse a tree by level, use breadth-first search.

#### Summation of nodes

If the question involves summation of nodes along the way, be sure to check whether nodes can be negative.

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- Binary Tree
  - [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/)
  - [Invert/Flip Binary Tree](https://leetcode.com/problems/invert-binary-tree/)
- Binary Search Tree
  - [Lowest Common Ancestor of a Binary Search Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- Binary tree
  - [Same Tree](https://leetcode.com/problems/same-tree/)
  - [Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/)
  - [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)
  - [Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/)
  - [Binary Tree Right Side View](https://leetcode.com/problems/binary-tree-right-side-view/)
  - [Subtree of Another Tree](https://leetcode.com/problems/subtree-of-another-tree/)
  - [Construct Binary Tree from Preorder and Inorder Traversal](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)
  - [Serialize and Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/)
- Binary search tree
  - [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/)
  - [Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)

### Recommended courses

## Graph

> **Source:** [Graph](https://www.techinterviewhandbook.org/algorithms/graph/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

A graph is a structure containing a set of objects (nodes or vertices) where there can be edges between these nodes/vertices. Edges can be directed or undirected and can optionally have values (a weighted graph). Trees are undirected graphs in which any two vertices are connected by exactly one edge and there can be no cycles in the graph.

Graphs are commonly used to model relationship between unordered entities, such as

- Friendship between people - Each node is a person and edges between nodes represent that these two people are friends.
- Distances between locations - Each node is a location and the edge between nodes represent that these locations are connected. The value of the edge represents the distance.

Be familiar with the various graph representations, graph search algorithms and their time and space complexities.

### Learning resources

- Readings
  - [From Theory To Practice: Representing Graphs](https://medium.com/basecs/from-theory-to-practice-representing-graphs-cfd782c5be38), basecs
  - [Deep Dive Through A Graph: DFS Traversal](https://medium.com/basecs/deep-dive-through-a-graph-dfs-traversal-8177df5d0f13), basecs
  - [Going Broad In A Graph: BFS Traversal](https://medium.com/basecs/going-broad-in-a-graph-bfs-traversal-959bd1a09255), basecs
- Additional (only if you have time)
  - [Finding The Shortest Path, With A Little Help From Dijkstra](https://medium.com/basecs/finding-the-shortest-path-with-a-little-help-from-dijkstra-613149fbdc8e), basecs
  - [Spinning Around In Cycles With Directed Acyclic Graphs](https://medium.com/basecs/spinning-around-in-cycles-with-directed-acyclic-graphs-a233496d4688), basecs

### Graph representations

You can be given a list of edges and you have to build your own graph from the edges so that you can perform a traversal on them. The common graph representations are:

- Adjacency matrix
- Adjacency list
- Hash table of hash tables

Using a hash table of hash tables would be the simplest approach during algorithm interviews. It will be rare that you have to use an adjacency matrix or list for graph questions during interviews.

In algorithm interviews, graphs are commonly given in the input as 2D matrices where cells are the nodes and each cell can traverse to its adjacent cells (up/down/left/right). Hence it is important that you be familiar with traversing a 2D matrix. When traversing the matrix, always ensure that your current position is within the boundary of the matrix and has not been visited before.

### Time complexity

`|V|` is the number of vertices while `|E|` is the number of edges.

| Algorithm            | Big-O                            |
| -------------------- | -------------------------------- |
| Depth-first search   | O(&#124;V&#124; + &#124;E&#124;) |
| Breadth-first search | O(&#124;V&#124; + &#124;E&#124;) |
| Topological sort     | O(&#124;V&#124; + &#124;E&#124;) |

### Things to look out for during interviews

- A tree-like diagram could very well be a graph that allows for cycles and a naive recursive solution would not work. In that case you will have to handle cycles and keep a set of visited nodes when traversing.
- Ensure you are correctly keeping track of visited nodes and not visiting each node more than once. Otherwise your code could end up in an infinite loop.

### Corner cases

- Empty graph
- Graph with one or two nodes
- Disconnected graphs
- Graph with cycles

### Graph search algorithms

- **Common** - Breadth-first Search, Depth-first Search
- **Uncommon** - Topological Sort, Dijkstra's algorithm
- **Almost never** - Bellman-Ford algorithm, Floyd-Warshall algorithm, Prim's algorithm, Kruskal's algorithm. Your interviewer likely doesn't know them either.

#### Depth-first search

Depth-first search is a graph traversal algorithm which explores as far as possible along each branch before backtracking. A stack is usually used to keep track of the nodes that are on the current search path. This can be done either by an implicit [recursion](https://www.techinterviewhandbook.org/algorithms/recursion/) stack, or an actual [stack](https://www.techinterviewhandbook.org/algorithms/stack/) data structure.

A simple template for doing depth-first searches on a matrix goes like this:

```py
def dfs(matrix):
  # Check for an empty matrix/graph.
  if not matrix:
    return []

  rows, cols = len(matrix), len(matrix[0])
  visited = set()
  directions = ((0, 1), (0, -1), (1, 0), (-1, 0))

  def traverse(i, j):
    if (i, j) in visited:
      return

    visited.add((i, j))
    # Traverse neighbors.
    for direction in directions:
      next_i, next_j = i + direction[0], j + direction[1]
      if 0 <= next_i < rows and 0 <= next_j < cols:
        # Add in question-specific checks, where relevant.
        traverse(next_i, next_j)

  for i in range(rows):
    for j in range(cols):
      traverse(i, j)
```

#### Breadth-first search

Breadth-first search is a graph traversal algorithm which starts at a node and explores all nodes at the present depth, before moving on to the nodes at the next depth level. A [queue](https://www.techinterviewhandbook.org/algorithms/queue/) is usually used to keep track of the nodes that were encountered but not yet explored.

A similar template for doing breadth-first searches on the matrix goes like this. It is important to use double-ended queues and not arrays/Python lists as dequeuing for double-ended queues is O(1) but it's O(n) for arrays.

```py
from collections import deque

def bfs(matrix):
  # Check for an empty matrix/graph.
  if not matrix:
    return []

  rows, cols = len(matrix), len(matrix[0])
  visited = set()
  directions = ((0, 1), (0, -1), (1, 0), (-1, 0))

  def traverse(i, j):
    queue = deque([(i, j)])
    while queue:
      curr_i, curr_j = queue.popleft()
      if (curr_i, curr_j) not in visited:
        visited.add((curr_i, curr_j))
        # Traverse neighbors.
        for direction in directions:
          next_i, next_j = curr_i + direction[0], curr_j + direction[1]
          if 0 <= next_i < rows and 0 <= next_j < cols:
            # Add in question-specific checks, where relevant.
            queue.append((next_i, next_j))

  for i in range(rows):
    for j in range(cols):
      traverse(i, j)
```

> **While Dfs Is Implemented Using Recursion In This Sample, It Could Also Be Implemented Iteratively Similar To Bfs. The Key Difference Between The Algorithms Lies In The Underlying Data Structure (Bfs Uses A Queue While Dfs Uses A Stack). The `Deque` Class In Python Can Function As Both A Stack And A Queue.:**

> **Additional Tips On Bfs And Dfs, You Can Refer To This [Leetcode Post](https://www.techinterviewhandbook.org/algorithms/Https:/Leetcode.Com/Problems/Pacific-Atlantic-Water-Flow/Solutions/90774/Python-Solution-With-Detailed-Explanation/):**

#### Topological sorting

A topological sort or topological ordering of a directed graph is a linear ordering of its vertices such that for every directed edge uv from vertex u to vertex v, u comes before v in the ordering. Precisely, a topological sort is a graph traversal in which each node v is visited only after all its dependencies are visited.

Topological sorting is most commonly used for scheduling a sequence of jobs or tasks which has dependencies on other jobs/tasks. The jobs are represented by vertices, and there is an edge from x to y if job x must be completed before job y can be started.

Another example is taking courses in university where courses have pre-requisites.

Here's an example where the edges is an array of two-value tuples and the first value depends on the second value.

```py
def graph_topo_sort(num_nodes, edges):
    from collections import deque
    nodes, order, queue = {}, [], deque()
    for node_id in range(num_nodes):
        nodes[node_id] = { 'in': 0, 'out': set() }
    for node_id, pre_id in edges:
        nodes[node_id]['in'] += 1
        nodes[pre_id]['out'].add(node_id)
    for node_id in nodes.keys():
        if nodes[node_id]['in'] == 0:
            queue.append(node_id)
    while len(queue):
        node_id = queue.popleft()
        for outgoing_id in nodes[node_id]['out']:
            nodes[outgoing_id]['in'] -= 1
            if nodes[outgoing_id]['in'] == 0:
                queue.append(outgoing_id)
        order.append(node_id)
    return order if len(order) == num_nodes else None

print(graph_topo_sort(4, [[0, 1], [0, 2], [2, 1], [3, 0]]))
# [1, 2, 0, 3]
```

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Number of Islands](https://leetcode.com/problems/number-of-islands/)
- [Flood Fill](https://leetcode.com/problems/flood-fill/)
- [01 Matrix](https://leetcode.com/problems/01-matrix/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- Breadth-first search
  - [Rotting Oranges](https://leetcode.com/problems/rotting-oranges/)
  - [Minimum Knight Moves (LeetCode Premium)](https://leetcode.com/problems/minimum-knight-moves/)
- Either search
  - [Clone Graph](https://leetcode.com/problems/clone-graph/)
  - [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/)
  - [Number of Connected Components in an Undirected Graph (LeetCode Premium)](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/)
  - [Graph Valid Tree (LeetCode Premium)](https://leetcode.com/problems/graph-valid-tree/)
- Topological sorting
  - [Course Schedule](https://leetcode.com/problems/course-schedule/)
  - [Alien Dictionary (LeetCode Premium)](https://leetcode.com/problems/alien-dictionary/)

### Recommended courses

## Heap

> **Source:** [Heap](https://www.techinterviewhandbook.org/algorithms/heap/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

A heap is a specialized tree-based data structure which is a complete tree that satisfies the heap property.

- Max heap - In a max heap, the value of a node must be greatest among the node values in its entire subtree. The same property must be recursively true for all nodes in the tree.
- Min heap - In a min heap, the value of a node must be smallest among the node values in its entire subtree. The same property must be recursively true for all nodes in the tree.

In the context of algorithm interviews, heaps and priority queues can be treated as the same data structure. A heap is a useful data structure when it is necessary to repeatedly remove the object with the highest (or lowest) priority, or when insertions need to be interspersed with removals of the root node.

### Learning resources

- [Learning to Love Heaps](https://medium.com/basecs/learning-to-love-heaps-cef2b273a238), basecs
- [Heapify All The Things With Heap Sort](https://medium.com/basecs/heapify-all-the-things-with-heap-sort-55ee1c93af82), basecs
- [Heaps](http://www.cs.yale.edu/homes/aspnes/classes/223/notes.html#heaps), James Aspnes, Yale University

### Implementations

| Language | API |
| --- | --- |
| C++ | [`std::priority_queue`](https://learn.microsoft.com/en-us/cpp/standard-library/priority-queue-class?view=msvc-170) |
| Java | [`java.util.PriorityQueue`](https://docs.oracle.com/javase/10/docs/api/java/util/PriorityQueue.html) |
| Python | [`heapq`](https://docs.python.org/3/library/heapq.html) |
| JavaScript | N/A |

### Time complexity

| Operation                                              | Big-O     |
| ------------------------------------------------------ | --------- |
| Find max/min                                           | O(1)      |
| Insert                                                 | O(log(n)) |
| Remove                                                 | O(log(n)) |
| Heapify (create a heap out of given array of elements) | O(n)      |

### Techniques

#### Mention of `k`

If you see a top or lowest _k_ being mentioned in the question, it is usually a signal that a heap can be used to solve the problem, such as in [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/).

If you require the top _k_ elements use a Min Heap of size _k_. Iterate through each element, pushing it into the heap (for python `heapq`, invert the value before pushing to find the max). Whenever the heap size exceeds _k_, remove the minimum element, that will guarantee that you have the _k_ largest elements.

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)
- [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)
- [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/)

### Recommended courses

## Trie

> **Source:** [Trie](https://www.techinterviewhandbook.org/algorithms/trie/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

Tries are special trees (prefix trees) that make searching and storing strings more efficient. Tries have many practical applications, such as conducting searches and providing autocomplete. It is helpful to know these common applications so that you can easily identify when a problem can be efficiently solved using a trie.

Be familiar with implementing from scratch, a `Trie` class and its `add`, `remove` and `search` methods.

### Learning resources

- Readings
  - [Trying to Understand Tries](https://medium.com/basecs/trying-to-understand-tries-3ec6bede0014), basecs
  - [Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/editorial/), LeetCode
- Additional (only if you have time)
  - [Compressing Radix Trees Without (Too Many) Tears](https://medium.com/basecs/compressing-radix-trees-without-too-many-tears-a2e658adb9a0), basecs

### Time complexity

`m` is the length of the string used in the operation.

| Operation | Big-O |
| --------- | ----- |
| Search    | O(m)  |
| Insert    | O(m)  |
| Remove    | O(m)  |

### Corner cases

- Searching for a string in an empty trie
- Inserting empty strings into a trie

### Techniques

Sometimes preprocessing a dictionary of words (given in a list) into a trie, will improve the efficiency of searching for a word of length k, among n words. Searching becomes O(k) instead of O(n).

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Add and Search Word](https://leetcode.com/problems/design-add-and-search-words-data-structure/)
- [Word Break](https://leetcode.com/problems/word-break/)
- [Word Search II](https://leetcode.com/problems/word-search-ii/)

### Recommended courses

## Dynamic programming

> **Source:** [Dynamic programming](https://www.techinterviewhandbook.org/algorithms/dynamic-programming/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

Dynamic Programming (DP) is usually used to solve optimization problems. The only way to get better at DP is to practice. It takes some amount of practice to be able to recognize that a problem can be solved by DP.

### Learning resources

- [Demystifying Dynamic Programming](https://www.freecodecamp.org/news/demystifying-dynamic-programming-3efafb8d4296)
- [Dynamic Programming – 7 Steps to Solve any DP Interview Problem](https://dev.to/nikolaotasevic/dynamic-programming--7-steps-to-solve-any-dp-interview-problem-3870)
- [Less Repetition, More Dynamic Programming](https://medium.com/basecs/less-repetition-more-dynamic-programming-43d29830a630), basecs
- [Dynamic Programming](http://www.cs.yale.edu/homes/aspnes/classes/223/notes.html#dynamicProgramming), James Aspnes, Yale University

### Techniques

Sometimes you do not need to store the whole DP table in memory, the last two values or the last two rows of the matrix will suffice.

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)
- [Coin Change](https://leetcode.com/problems/coin-change/)
- [House Robber](https://leetcode.com/problems/house-robber/)
- [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [0/1 Knapsack or Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/)
- [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/)
- [Word Break Problem](https://leetcode.com/problems/word-break/)
- [Combination Sum](https://leetcode.com/problems/combination-sum-iv/)
- [House Robber II](https://leetcode.com/problems/house-robber-ii/)
- [Decode Ways](https://leetcode.com/problems/decode-ways/)
- [Unique Paths](https://leetcode.com/problems/unique-paths/)
- [Jump Game](https://leetcode.com/problems/jump-game/)

### Recommended courses

#### [Grokking Dynamic Programming Patterns for Coding Interviews](https://www.designgurus.io/course/grokking-dynamic-programming?aff=kJSIoU)

Brought to you by the same folks behind the famous ["Grokking the Coding Interview"](https://www.designgurus.io/course/grokking-the-coding-interview?aff=kJSIoU), this is one of the rare few courses focused on helping you get better at Dynamic Programming questions. If you are interviewing for companies who are famous for asking Dynamic Programming questions (-cough- Google -cough-), this course should be helpful.

## Binary

> **Source:** [Binary](https://www.techinterviewhandbook.org/algorithms/binary/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

Knowledge of binary number system and bit manipulation is less important in coding interviews as most Software Engineers do not have to deal with bits, which is more commonly used when dealing with lower level systems and programming languages. They are still asked sometimes, so you should at least still know how to convert a number from decimal form into binary form (and vice versa) in your chosen programming language.

### Learning resources

- Readings
  - [Bits, Bytes, Building With Binary](https://medium.com/basecs/bits-bytes-building-with-binary-13cb4289aafa), basecs
  - [Bitwise operation](https://en.wikipedia.org/wiki/Bitwise_operation), Wikipedia
- Videos
  - [Algorithms: Bit Manipulation](https://www.youtube.com/watch?v=NLKQEOgBAnw), HackerRank
- Practice
  - [Practice with bit operations](https://pconrad.github.io/old_pconrad_cs16/topics/bitOps/)

### Corner cases

- Be aware and check for overflow/underflow
- Negative numbers

### Techniques

Questions involving binary representations and bitwise operations are asked sometimes and you must be absolutely familiar with how to convert a number from decimal form into binary form (and vice versa) in your chosen programming language.

Some helpful utility snippets:

| Technique | Code |
| --- | --- |
| Test k<sup>th</sup> bit is set | `num & (1 << k) != 0` |
| Set k<sup>th</sup> bit | <code>num &#124;= (1 &lt;&lt; k)</code> |
| Turn off k<sup>th</sup> bit | `num &= ~(1 << k)` |
| Toggle the k<sup>th</sup> bit | `num ^= (1 << k)` |
| Multiply by 2<sup>k</sup> | `num << k` |
| Divide by 2<sup>k</sup> | `num >> k` |
| Check if a number is a power of 2 | `(num & num - 1) == 0` or `(num & (-num)) == num` |
| Swapping two variables | `num1 ^= num2; num2 ^= num1; num1 ^= num2` |

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Sum of Two Integers](https://leetcode.com/problems/sum-of-two-integers/)
- [Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Counting Bits](https://leetcode.com/problems/counting-bits/)
- [Missing Number](https://leetcode.com/problems/missing-number/)
- [Reverse Bits](https://leetcode.com/problems/reverse-bits/)
- [Single Number](https://leetcode.com/problems/single-number/)

### Recommended courses

## Math

> **Source:** [Math](https://www.techinterviewhandbook.org/algorithms/math/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

Math is a foundational aspect of Computer Science and every programmer and computer scientist needs to have basic mathematical knowledge. Thankfully, for the purpose of coding interviews, there usually won't be that much math involved, but some basic math techniques is helpful to know as you may be asked to implement mathematical operations.

### Things to look out for during interviews

- If code involves division or modulo, remember to check for division or modulo by 0 case.
- Check for and handle overflow/underflow if you are using a typed language like Java and C++. At the very least, mention that overflow/underflow is possible and ask whether you need to handle it.
- Consider negative numbers and floating point numbers. This may sound obvious, but under interview pressure, many obvious cases go unnoticed.

### Corner cases

- Division by 0
- Multiplication by 1
- Negative numbers
- Floats

### Common formulas

|  | Formula |
| --- | --- |
| Check if a number is even | `num % 2 == 0` |
| Sum of 1 to N | 1 + 2 + ... + (N - 1) + N = (N+1) \* N/2 |
| Sum of Geometric Progression | 2<sup>0</sup> + 2<sup>1</sup> + 2<sup>2</sup> + 2<sup>3</sup> + ... 2<sup>n</sup> = 2<sup>n+1</sup> - 1 |
| Permutations of N | N! / (N-K)! |
| Combinations of N | N! / (K! \* (N-K)!) |

### Techniques

#### Multiples of a number

When a question involves "whether a number is a multiple of X", the modulo operator would be useful.

#### Comparing floats

When dealing with floating point numbers, take note of rounding mistakes. Consider using epsilon comparisons instead of equality checks. E.g. `abs(x - y) <= 1e-6` instead of `x == y`.

#### Fast operators

If the question asks you to implement an operator such as power, square root or division and want it to be faster than O(n), some sort of doubling (fast exponentiation) or halving (binary search) is usually the approach to go. Examples: [Pow(x, n)](https://leetcode.com/problems/powx-n/), [Sqrt(x)](https://leetcode.com/problems/sqrtx/)

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Pow(x, n)](https://leetcode.com/problems/powx-n/)
- [Sqrt(x)](https://leetcode.com/problems/sqrtx/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [Integer to English Words](https://leetcode.com/problems/integer-to-english-words/)

### Recommended courses

## Geometry

> **Source:** [Geometry](https://www.techinterviewhandbook.org/algorithms/geometry/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Introduction

Geometry is a branch of mathematics that is concerned with properties of space that are related with distance, shape, size, and relative position of figures. Advanced geometry (e.g. 3D geometry) is not taught in most Computer Science courses, so you can expect that you will only be asked on 2D geometry.

In algorithm interviews, geometry is usually not the focus of the problem (you're not being evaluated on mathematics after all). You typically have to use other algorithms and/or data structures in the problem.

### Corner cases

- Zero values. This always gets people.

### Techniques

#### Distance between two points

When comparing the distance between two points, using dx<sup>2</sup> + dy<sup>2</sup> is sufficient. It is unnecessary to square root the value. Examples: [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)

#### Overlapping circles

To find out if two circles overlap, check that the distance between the two centers of the circles is less than the sum of their radii.

#### Overlapping rectangles

Two rectangles overlap if the following is true:

```py
overlap = rect_a.left < rect_b.right and \
  rect_a.right > rect_b.left and \
  rect_a.top > rect_b.bottom and \
  rect_a.bottom < rect_b.top
```

Here's a [nice visualization](https://silentmatt.com/rectangle-intersection/). Examples: [Rectangle Overlap](https://leetcode.com/problems/rectangle-overlap/)

### Sample questions

- You have a plane with lots of rectangles on it, find out how many of them intersect.
- Which data structure would you use to query the k-nearest points of a set on a 2D plane?
- Given many points, find k points that are closest to the origin.
- How would you triangulate a polygon?

### Essential questions

_These are essential questions to practice if you're studying for this topic._

- [Rectangle Overlap](https://leetcode.com/problems/rectangle-overlap/)

### Recommended practice questions

_These are recommended questions to practice after you have studied for the topic and have practiced the essential questions._

- [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)
- [Rectangle Area](https://leetcode.com/problems/rectangle-area/)

### Recommended courses

## Object-oriented programming

> **Source:** [Object-oriented programming](https://www.techinterviewhandbook.org/algorithms/oop/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

### Sample questions

- How would you design a chess game? What classes and objects would you use? What methods would they have?
- How would you design the data structures for a book keeping system for a library?
- Explain how you would design a HTTP server? Give examples of classes, methods, and interfaces. What are the challenges here?
- Discuss algorithms and data structures for a garbage collector?
- How would you implement an HR system to keep track of employee salaries and benefits?
- How would you implement an Elevator system?
- How would you implement a Parking Lot system?

### Recommended courses

- [Grokking the Object Oriented Design Interview](https://www.designgurus.io/course/grokking-the-object-oriented-design-interview?aff=kJSIoU)

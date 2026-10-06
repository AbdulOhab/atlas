---
title: "Longest Increasing Subsequence"
order: 27
category: Algorithms
summary: "The longest increasing subsequence problem is to find a subsequence of a given sequence in which the subsequence's elements are in sorted order, lowest to highest, and in which the subsequence is as long as possible."
---

# Longest Increasing Subsequence

> **Source:** [longest-increasing-subsequence](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/sets/longest-increasing-subsequence) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

The longest increasing subsequence problem is to find a subsequence of a 
given sequence in which the subsequence's elements are in sorted order, 
lowest to highest, and in which the subsequence is as long as possible. 
This subsequence is not necessarily contiguous, or unique. 

## Complexity

The longest increasing subsequence problem is solvable in 
time `O(n log n)`, where `n` denotes the length of the input sequence.

Dynamic programming approach has complexity `O(n * n)`.

## Example

In the first 16 terms of the binary Van der Corput sequence

```
0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15
```

a longest increasing subsequence is

```
0, 2, 6, 9, 11, 15.
```

This subsequence has length six; 
the input sequence has no seven-member increasing subsequences. 
The longest increasing subsequence in this example is not unique: for 
instance,

```
0, 4, 6, 9, 11, 15 or
0, 2, 6, 9, 13, 15 or
0, 4, 6, 9, 13, 15
```

are other increasing subsequences of equal length in the same 
input sequence.

## References

- [Wikipedia](https://en.wikipedia.org/wiki/Longest_increasing_subsequence)
- [Dynamic Programming Approach on YouTube](https://www.youtube.com/watch?v=CE2b_-XfVDk&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)

## JavaScript implementation

From [`dpLongestIncreasingSubsequence.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/longest-increasing-subsequence/dpLongestIncreasingSubsequence.js):

```js
/**
 * Dynamic programming approach to find longest increasing subsequence.
 * Complexity: O(n * n)
 *
 * @param {number[]} sequence
 * @return {number}
 */
export default function dpLongestIncreasingSubsequence(sequence) {
  // Create array with longest increasing substrings length and
  // fill it with 1-s that would mean that each element of the sequence
  // is itself a minimum increasing subsequence.
  const lengthsArray = Array(sequence.length).fill(1);

  let previousElementIndex = 0;
  let currentElementIndex = 1;

  while (currentElementIndex < sequence.length) {
    if (sequence[previousElementIndex] < sequence[currentElementIndex]) {
      // If current element is bigger then the previous one then
      // current element is a part of increasing subsequence which
      // length is by one bigger then the length of increasing subsequence
      // for previous element.
      const newLength = lengthsArray[previousElementIndex] + 1;
      if (newLength > lengthsArray[currentElementIndex]) {
        // Increase only if previous element would give us bigger subsequence length
        // then we already have for current element.
        lengthsArray[currentElementIndex] = newLength;
      }
    }

    // Move previous element index right.
    previousElementIndex += 1;

    // If previous element index equals to current element index then
    // shift current element right and reset previous element index to zero.
    if (previousElementIndex === currentElementIndex) {
      currentElementIndex += 1;
      previousElementIndex = 0;
    }
  }

  // Find the biggest element in lengthsArray.
  // This number is the biggest length of increasing subsequence.
  let longestIncreasingLength = 0;

  for (let i = 0; i < lengthsArray.length; i += 1) {
    if (lengthsArray[i] > longestIncreasingLength) {
      longestIncreasingLength = lengthsArray[i];
    }
  }

  return longestIncreasingLength;
}
```

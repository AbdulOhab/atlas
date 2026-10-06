---
title: "Longest Common Subsequence"
order: 26
category: Algorithms
summary: "The longest common subsequence (LCS) problem is the problem of finding the longest subsequence common to all sequences in a set of sequences (often just two sequences)."
---

# Longest Common Subsequence

> **Source:** [longest-common-subsequence](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/sets/longest-common-subsequence) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

The longest common subsequence (LCS) problem is the problem of finding 
the longest subsequence common to all sequences in a set of sequences 
(often just two sequences). It differs from the longest common substring
problem: unlike substrings, subsequences are not required to occupy 
consecutive positions within the original sequences. 

## Application

The longest common subsequence problem is a classic computer science 
problem, the basis of data comparison programs such as the diff utility, 
and has applications in bioinformatics. It is also widely used by 
revision control systems such as Git for reconciling multiple changes 
made to a revision-controlled collection of files.

## Example

- LCS for input Sequences `ABCDGH` and `AEDFHR` is `ADH` of length 3.
- LCS for input Sequences `AGGTAB` and `GXTXAYB` is `GTAB` of length 4.

## References

- [Wikipedia](https://en.wikipedia.org/wiki/Longest_common_subsequence_problem)
- [YouTube](https://www.youtube.com/watch?v=NnD96abizww&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)

## JavaScript implementation

From [`longestCommonSubsequence.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/longest-common-subsequence/longestCommonSubsequence.js):

```js
/**
 * @param {string[]} set1
 * @param {string[]} set2
 * @return {string[]}
 */
export default function longestCommonSubsequence(set1, set2) {
  // Init LCS matrix.
  const lcsMatrix = Array(set2.length + 1).fill(null).map(() => Array(set1.length + 1).fill(null));

  // Fill first row with zeros.
  for (let columnIndex = 0; columnIndex <= set1.length; columnIndex += 1) {
    lcsMatrix[0][columnIndex] = 0;
  }

  // Fill first column with zeros.
  for (let rowIndex = 0; rowIndex <= set2.length; rowIndex += 1) {
    lcsMatrix[rowIndex][0] = 0;
  }

  // Fill rest of the column that correspond to each of two strings.
  for (let rowIndex = 1; rowIndex <= set2.length; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= set1.length; columnIndex += 1) {
      if (set1[columnIndex - 1] === set2[rowIndex - 1]) {
        lcsMatrix[rowIndex][columnIndex] = lcsMatrix[rowIndex - 1][columnIndex - 1] + 1;
      } else {
        lcsMatrix[rowIndex][columnIndex] = Math.max(
          lcsMatrix[rowIndex - 1][columnIndex],
          lcsMatrix[rowIndex][columnIndex - 1],
        );
      }
    }
  }

  // Calculate LCS based on LCS matrix.
  if (!lcsMatrix[set2.length][set1.length]) {
    // If the length of largest common string is zero then return empty string.
    return [''];
  }

  const longestSequence = [];
  let columnIndex = set1.length;
  let rowIndex = set2.length;

  while (columnIndex > 0 || rowIndex > 0) {
    if (set1[columnIndex - 1] === set2[rowIndex - 1]) {
      // Move by diagonal left-top.
      longestSequence.unshift(set1[columnIndex - 1]);
      columnIndex -= 1;
      rowIndex -= 1;
    } else if (lcsMatrix[rowIndex][columnIndex] === lcsMatrix[rowIndex][columnIndex - 1]) {
      // Move left.
      columnIndex -= 1;
    } else {
      // Move up.
      rowIndex -= 1;
    }
  }

  return longestSequence;
}
```

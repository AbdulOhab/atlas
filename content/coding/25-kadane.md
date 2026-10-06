---
title: "Maximum Subarray (Kadane)"
order: 25
category: Algorithms
summary: "The maximum subarray problem is the task of finding the contiguous subarray within a one-dimensional array, a[1...n], of numbers which has the largest sum, where,"
---

# Maximum Subarray (Kadane)

> **Source:** [maximum-subarray](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/sets/maximum-subarray) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

The maximum subarray problem is the task of finding the contiguous
subarray within a one-dimensional array, `a[1...n]`, of numbers
which has the largest sum, where,

![Maximum subarray](https://wikimedia.org/api/rest_v1/media/math/render/svg/e8960f093107b71b21827e726e2bad8b023779b2)

![Maximum subarray](https://www.geeksforgeeks.org/wp-content/uploads/kadane-Algorithm.png)

## Example

The list usually contains both positive and negative numbers along
with `0`. For example, for the array of
values `−2, 1, −3, 4, −1, 2, 1, −5, 4` the contiguous subarray
with the largest sum is `4, −1, 2, 1`, with sum `6`.

## Solutions

- Brute Force solution `O(n^2)`: [bfMaximumSubarray.js](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/maximum-subarray/bfMaximumSubarray.js)
- Divide and Conquer solution `O(n^2)`: [dcMaximumSubarraySum.js](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/maximum-subarray/dcMaximumSubarraySum.js)
- Dynamic Programming solution `O(n)`: [dpMaximumSubarray.js](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/maximum-subarray/dpMaximumSubarray.js)

## References

- [Wikipedia](https://en.wikipedia.org/wiki/Maximum_subarray_problem)
- [YouTube](https://www.youtube.com/watch?v=ohHWQf1HDfU&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)
- [GeeksForGeeks](https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/)
- [LeetCode](https://leetcode.com/explore/interview/card/top-interview-questions-easy/97/dynamic-programming/566/discuss/1595195/C++Python-7-Simple-Solutions-w-Explanation-or-Brute-Force-+-DP-+-Kadane-+-Divide-and-Conquer)

## JavaScript implementation

From [`dpMaximumSubarray.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/maximum-subarray/dpMaximumSubarray.js):

```js
/**
 * Dynamic Programming solution.
 * Complexity: O(n)
 *
 * @param {Number[]} inputArray
 * @return {Number[]}
 */
export default function dpMaximumSubarray(inputArray) {
  // We iterate through the inputArray once, using a greedy approach to keep track of the maximum
  // sum we've seen so far and the current sum.
  //
  // The currentSum variable gets reset to 0 every time it drops below 0.
  //
  // The maxSum variable is set to -Infinity so that if all numbers are negative, the highest
  // negative number will constitute the maximum subarray.

  let maxSum = -Infinity;
  let currentSum = 0;

  // We need to keep track of the starting and ending indices that contributed to our maxSum
  // so that we can return the actual subarray. From the beginning let's assume that whole array
  // is contributing to maxSum.
  let maxStartIndex = 0;
  let maxEndIndex = inputArray.length - 1;
  let currentStartIndex = 0;

  inputArray.forEach((currentNumber, currentIndex) => {
    currentSum += currentNumber;

    // Update maxSum and the corresponding indices if we have found a new max.
    if (maxSum < currentSum) {
      maxSum = currentSum;
      maxStartIndex = currentStartIndex;
      maxEndIndex = currentIndex;
    }

    // Reset currentSum and currentStartIndex if currentSum drops below 0.
    if (currentSum < 0) {
      currentSum = 0;
      currentStartIndex = currentIndex + 1;
    }
  });

  return inputArray.slice(maxStartIndex, maxEndIndex + 1);
}
```

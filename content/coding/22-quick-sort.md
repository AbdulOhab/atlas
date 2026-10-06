---
title: "Quick Sort"
order: 22
category: Algorithms
summary: "Quicksort is a divide and conquer algorithm. Quicksort first divides a large array into two smaller sub-arrays: the low elements and the high elements. Quicksort can then recursively sort the sub-arrays"
---

# Quick Sort

> **Source:** [quick-sort](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/sorting/quick-sort) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

Quicksort is a divide and conquer algorithm.
Quicksort first divides a large array into two smaller 
sub-arrays: the low elements and the high elements.
Quicksort can then recursively sort the sub-arrays

The steps are:

1. Pick an element, called a pivot, from the array.
2. Partitioning: reorder the array so that all elements with 
values less than the pivot come before the pivot, while all 
elements with values greater than the pivot come after it 
(equal values can go either way). After this partitioning, 
the pivot is in its final position. This is called the 
partition operation.
3. Recursively apply the above steps to the sub-array of 
elements with smaller values and separately to the 
sub-array of elements with greater values.

Animated visualization of the quicksort algorithm.
The horizontal lines are pivot values.

![Quicksort](https://upload.wikimedia.org/wikipedia/commons/6/6a/Sorting_quicksort_anim.gif)

## Complexity

| Name                  | Best            | Average             | Worst               | Memory    | Stable    | Comments  |
| --------------------- | :-------------: | :-----------------: | :-----------------: | :-------: | :-------: | :-------- |
| **Quick sort**        | n&nbsp;log(n)   | n&nbsp;log(n)       | n<sup>2</sup>       | log(n)    | No        |  Quicksort is usually done in-place with O(log(n)) stack space |

## References

- [Wikipedia](https://en.wikipedia.org/wiki/Quicksort)
- [YouTube](https://www.youtube.com/watch?v=SLauY6PpjW4&index=28&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)

## JavaScript implementation

From [`QuickSortInPlace.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sorting/quick-sort/QuickSortInPlace.js):

```js
import Sort from '../Sort';

export default class QuickSortInPlace extends Sort {
  /** Sorting in place avoids unnecessary use of additional memory, but modifies input array.
   *
   * This process is difficult to describe, but much clearer with a visualization:
   * @see: https://www.hackerearth.com/practice/algorithms/sorting/quick-sort/visualize/
   *
   * @param {*[]} originalArray - Not sorted array.
   * @param {number} inputLowIndex
   * @param {number} inputHighIndex
   * @param {boolean} recursiveCall
   * @return {*[]} - Sorted array.
   */
  sort(
    originalArray,
    inputLowIndex = 0,
    inputHighIndex = originalArray.length - 1,
    recursiveCall = false,
  ) {
    // Copies array on initial call, and then sorts in place.
    const array = recursiveCall ? originalArray : [...originalArray];

    /**
     * The partitionArray() operates on the subarray between lowIndex and highIndex, inclusive.
     * It arbitrarily chooses the last element in the subarray as the pivot.
     * Then, it partially sorts the subarray into elements than are less than the pivot,
     * and elements that are greater than or equal to the pivot.
     * Each time partitionArray() is executed, the pivot element is in its final sorted position.
     *
     * @param {number} lowIndex
     * @param {number} highIndex
     * @return {number}
     */
    const partitionArray = (lowIndex, highIndex) => {
      /**
       * Swaps two elements in array.
       * @param {number} leftIndex
       * @param {number} rightIndex
       */
      const swap = (leftIndex, rightIndex) => {
        const temp = array[leftIndex];
        array[leftIndex] = array[rightIndex];
        array[rightIndex] = temp;
      };

      const pivot = array[highIndex];
      // visitingCallback is used for time-complexity analysis.
      this.callbacks.visitingCallback(pivot);

      let partitionIndex = lowIndex;
      for (let currentIndex = lowIndex; currentIndex < highIndex; currentIndex += 1) {
        if (this.comparator.lessThan(array[currentIndex], pivot)) {
          swap(partitionIndex, currentIndex);
          partitionIndex += 1;
        }
      }

      // The element at the partitionIndex is guaranteed to be greater than or equal to pivot.
      // All elements to the left of partitionIndex are guaranteed to be less than pivot.
      // Swapping the pivot with the partitionIndex therefore places the pivot in its
      // final sorted position.
      swap(partitionIndex, highIndex);

      return partitionIndex;
    };

    // Base case is when low and high converge.
    if (inputLowIndex < inputHighIndex) {
      const partitionIndex = partitionArray(inputLowIndex, inputHighIndex);
      const RECURSIVE_CALL = true;
      this.sort(array, inputLowIndex, partitionIndex - 1, RECURSIVE_CALL);
      this.sort(array, partitionIndex + 1, inputHighIndex, RECURSIVE_CALL);
    }

    return array;
  }
}
```

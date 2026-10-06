---
title: "Merge Sort"
order: 21
category: Algorithms
summary: "In computer science, merge sort (also commonly spelled mergesort) is an efficient, general-purpose, comparison-based sorting algorithm."
---

# Merge Sort

> **Source:** [merge-sort](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/sorting/merge-sort) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

In computer science, merge sort (also commonly spelled
mergesort) is an efficient, general-purpose,
comparison-based sorting algorithm. Most implementations
produce a stable sort, which means that the implementation
preserves the input order of equal elements in the sorted
output. Mergesort is a divide and conquer algorithm that
was invented by John von Neumann in 1945.

An example of merge sort. First divide the list into
the smallest unit (1 element), then compare each
element with the adjacent list to sort and merge the
two adjacent lists. Finally all the elements are sorted
and merged.

![Merge Sort](https://upload.wikimedia.org/wikipedia/commons/c/cc/Merge-sort-example-300px.gif)

A recursive merge sort algorithm used to sort an array of 7
integer values. These are the steps a human would take to
emulate merge sort (top-down).

![Merge Sort](https://upload.wikimedia.org/wikipedia/commons/e/e6/Merge_sort_algorithm_diagram.svg)

## Complexity

| Name                  | Best            | Average             | Worst               | Memory    | Stable    | Comments  |
| --------------------- | :-------------: | :-----------------: | :-----------------: | :-------: | :-------: | :-------- |
| **Merge sort**        | n&nbsp;log(n)   | n&nbsp;log(n)       | n&nbsp;log(n)       | n         | Yes       |           |

## References

- [Wikipedia](https://en.wikipedia.org/wiki/Merge_sort)
- [YouTube](https://www.youtube.com/watch?v=KF2j-9iSf4Q&index=27&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)

## JavaScript implementation

From [`MergeSort.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sorting/merge-sort/MergeSort.js):

```js
import Sort from '../Sort';

export default class MergeSort extends Sort {
  sort(originalArray) {
    // Call visiting callback.
    this.callbacks.visitingCallback(null);

    // If array is empty or consists of one element then return this array since it is sorted.
    if (originalArray.length <= 1) {
      return originalArray;
    }

    // Split array on two halves.
    const middleIndex = Math.floor(originalArray.length / 2);
    const leftArray = originalArray.slice(0, middleIndex);
    const rightArray = originalArray.slice(middleIndex, originalArray.length);

    // Sort two halves of split array
    const leftSortedArray = this.sort(leftArray);
    const rightSortedArray = this.sort(rightArray);

    // Merge two sorted arrays into one.
    return this.mergeSortedArrays(leftSortedArray, rightSortedArray);
  }

  mergeSortedArrays(leftArray, rightArray) {
    const sortedArray = [];

    // Use array pointers to exclude old elements after they have been added to the sorted array.
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < leftArray.length && rightIndex < rightArray.length) {
      let minElement = null;

      // Find the minimum element between the left and right array.
      if (this.comparator.lessThanOrEqual(leftArray[leftIndex], rightArray[rightIndex])) {
        minElement = leftArray[leftIndex];
        // Increment index pointer to the right
        leftIndex += 1;
      } else {
        minElement = rightArray[rightIndex];
        // Increment index pointer to the right
        rightIndex += 1;
      }

      // Add the minimum element to the sorted array.
      sortedArray.push(minElement);

      // Call visiting callback.
      this.callbacks.visitingCallback(minElement);
    }

    // There will be elements remaining from either the left OR the right
    // Concatenate the remaining elements into the sorted array
    return sortedArray
      .concat(leftArray.slice(leftIndex))
      .concat(rightArray.slice(rightIndex));
  }
}
```

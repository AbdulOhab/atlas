---
title: "Counting Sort"
order: 23
category: Algorithms
summary: "In computer science, counting sort is an algorithm for sorting a collection of objects according to keys that are small integers; that is, it is an integer sorting algorithm."
---

# Counting Sort

> **Source:** [counting-sort](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/sorting/counting-sort) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

In computer science, **counting sort** is an algorithm for sorting 
a collection of objects according to keys that are small integers; 
that is, it is an integer sorting algorithm. It operates by 
counting the number of objects that have each distinct key value, 
and using arithmetic on those counts to determine the positions 
of each key value in the output sequence. Its running time is 
linear in the number of items and the difference between the 
maximum and minimum key values, so it is only suitable for direct 
use in situations where the variation in keys is not significantly 
greater than the number of items. However, it is often used as a 
subroutine in another sorting algorithm, radix sort, that can 
handle larger keys more efficiently.

Because counting sort uses key values as indexes into an array, 
it is not a comparison sort, and the `Ω(n log n)` lower bound for 
comparison sorting does not apply to it. Bucket sort may be used 
for many of the same tasks as counting sort, with a similar time 
analysis; however, compared to counting sort, bucket sort requires 
linked lists, dynamic arrays or a large amount of preallocated 
memory to hold the sets of items within each bucket, whereas 
counting sort instead stores a single number (the count of items) 
per bucket.

Counting sorting works best when the range of numbers for each array
element is very small.

## Algorithm

**Step I**

In first step we calculate the count of all the elements of the 
input array `A`. Then Store the result in the count array `C`.
The way we count is depicted below.

![Counting Sort](https://3.bp.blogspot.com/-jJchly1BkTc/WLGqCFDdvCI/AAAAAAAAAHA/luljAlz2ptMndIZNH0KLTTuQMNsfzDeFQCLcB/s1600/CSortUpdatedStepI.gif)

**Step II**

In second step we calculate how many elements exist in the input 
array `A` which are less than or equals for the given index. 
`Ci` = numbers of elements less than or equals to `i` in input array.

![Counting Sort](https://1.bp.blogspot.com/-1vFu-VIRa9Y/WLHGuZkdF3I/AAAAAAAAAHs/8jKu2dbQee4ap9xlVcNsILrclqw0UxAVACLcB/s1600/Step-II.png)

**Step III**

In this step we place the input array `A` element at sorted 
position by taking help of constructed count array `C` ,i.e what 
we constructed in step two. We used the result array `B` to store 
the sorted elements. Here we handled the index of `B` start from
zero.
 
![Counting Sort](https://1.bp.blogspot.com/-xPqylngqASY/WLGq3p9n9vI/AAAAAAAAAHM/JHdtXAkJY8wYzDMBXxqarjmhpPhM0u8MACLcB/s1600/ResultArrayCS.gif)

## Complexity

| Name                  | Best            | Average             | Worst               | Memory    | Stable    | Comments  |
| --------------------- | :-------------: | :-----------------: | :-----------------: | :-------: | :-------: | :-------- |
| **Counting sort**     | n + r           | n + r               | n + r               | n + r     | Yes       | r - biggest number in array |

## References

- [Wikipedia](https://en.wikipedia.org/wiki/Counting_sort)
- [YouTube](https://www.youtube.com/watch?v=OKd534EWcdk&index=61&t=0s&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)
- [EfficientAlgorithms](https://efficientalgorithms.blogspot.com/2016/09/lenear-sorting-counting-sort.html)

## JavaScript implementation

From [`CountingSort.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sorting/counting-sort/CountingSort.js):

```js
import Sort from '../Sort';

export default class CountingSort extends Sort {
  /**
   * @param {number[]} originalArray
   * @param {number} [smallestElement]
   * @param {number} [biggestElement]
   */
  sort(originalArray, smallestElement = undefined, biggestElement = undefined) {
    // Init biggest and smallest elements in array in order to build number bucket array later.
    let detectedSmallestElement = smallestElement || 0;
    let detectedBiggestElement = biggestElement || 0;

    if (smallestElement === undefined || biggestElement === undefined) {
      originalArray.forEach((element) => {
        // Visit element.
        this.callbacks.visitingCallback(element);

        // Detect biggest element.
        if (this.comparator.greaterThan(element, detectedBiggestElement)) {
          detectedBiggestElement = element;
        }

        // Detect smallest element.
        if (this.comparator.lessThan(element, detectedSmallestElement)) {
          detectedSmallestElement = element;
        }
      });
    }

    // Init buckets array.
    // This array will hold frequency of each number from originalArray.
    const buckets = Array(detectedBiggestElement - detectedSmallestElement + 1).fill(0);

    originalArray.forEach((element) => {
      // Visit element.
      this.callbacks.visitingCallback(element);

      buckets[element - detectedSmallestElement] += 1;
    });

    // Add previous frequencies to the current one for each number in bucket
    // to detect how many numbers less then current one should be standing to
    // the left of current one.
    for (let bucketIndex = 1; bucketIndex < buckets.length; bucketIndex += 1) {
      buckets[bucketIndex] += buckets[bucketIndex - 1];
    }

    // Now let's shift frequencies to the right so that they show correct numbers.
    // I.e. if we won't shift right than the value of buckets[5] will display how many
    // elements less than 5 should be placed to the left of 5 in sorted array
    // INCLUDING 5th. After shifting though this number will not include 5th anymore.
    buckets.pop();
    buckets.unshift(0);

    // Now let's assemble sorted array.
    const sortedArray = Array(originalArray.length).fill(null);
    for (let elementIndex = 0; elementIndex < originalArray.length; elementIndex += 1) {
      // Get the element that we want to put into correct sorted position.
      const element = originalArray[elementIndex];

      // Visit element.
      this.callbacks.visitingCallback(element);

      // Get correct position of this element in sorted array.
      const elementSortedPosition = buckets[element - detectedSmallestElement];

      // Put element into correct position in sorted array.
      sortedArray[elementSortedPosition] = element;

      // Increase position of current element in the bucket for future correct placements.
      buckets[element - detectedSmallestElement] += 1;
    }

    // Return sorted array.
    return sortedArray;
  }
}
```

---
title: "Knapsack Problem"
order: 28
category: Algorithms
summary: "The knapsack problem or rucksack problem is a problem in combinatorial optimization: Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that the total weight is less than or equal to a given li"
---

# Knapsack Problem

> **Source:** [knapsack-problem](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/sets/knapsack-problem) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

The knapsack problem or rucksack problem is a problem in 
combinatorial optimization: Given a set of items, each with 
a weight and a value, determine the number of each item to 
include in a collection so that the total weight is less 
than or equal to a given limit and the total value is as 
large as possible.

It derives its name from the problem faced by someone who is 
constrained by a fixed-size knapsack and must fill it with the 
most valuable items.

Example of a one-dimensional (constraint) knapsack problem: 
which boxes should be chosen to maximize the amount of money 
while still keeping the overall weight under or equal to 15 kg?

![knapsack problem](https://upload.wikimedia.org/wikipedia/commons/f/fd/Knapsack.svg)

## Definition

### 0/1 knapsack problem

The most common problem being solved is the **0/1 knapsack problem**, 
which restricts the number `xi` of copies of each kind of item to zero or one.

Given a set of n items numbered from `1` up to `n`, each with a 
weight `wi` and a value `vi`, along with a maximum weight 
capacity `W`,

maximize ![0/1 knapsack](https://wikimedia.org/api/rest_v1/media/math/render/svg/85620037d368d2136fb3361702df6a489416931b)

subject to ![0/1 knapsack](https://wikimedia.org/api/rest_v1/media/math/render/svg/dd6e7c9bca4397980976ea6d19237500ce3b8176)
and ![0/1 knapsack](https://wikimedia.org/api/rest_v1/media/math/render/svg/07dda71da2a630762c7b21b51ea54f86f422f951)

Here `xi` represents the number of instances of item `i` to 
include in the knapsack. Informally, the problem is to maximize 
the sum of the values of the items in the knapsack so that the 
sum of the weights is less than or equal to the knapsack's 
capacity.

### Bounded knapsack problem (BKP)

The **bounded knapsack problem (BKP)** removes the restriction 
that there is only one of each item, but restricts the number 
`xi` of copies of each kind of item to a maximum non-negative 
integer value `c`:

maximize ![bounded knapsack](https://wikimedia.org/api/rest_v1/media/math/render/svg/85620037d368d2136fb3361702df6a489416931b)

subject to ![bounded knapsack](https://wikimedia.org/api/rest_v1/media/math/render/svg/dd6e7c9bca4397980976ea6d19237500ce3b8176)
and ![bounded knapsack](https://wikimedia.org/api/rest_v1/media/math/render/svg/6c8c5ac4f8247b3b8e01e89de76a1df0ea969821)

### Unbounded knapsack problem (UKP)

The **unbounded knapsack problem (UKP)** places no upper bound 
on the number of copies of each kind of item and can be 
formulated as above except for that the only restriction 
on `xi` is that it is a non-negative integer.

maximize ![unbounded knapsack](https://wikimedia.org/api/rest_v1/media/math/render/svg/85620037d368d2136fb3361702df6a489416931b)

subject to ![unbounded knapsack](https://wikimedia.org/api/rest_v1/media/math/render/svg/dd6e7c9bca4397980976ea6d19237500ce3b8176) 
and ![unbounded knapsack](https://wikimedia.org/api/rest_v1/media/math/render/svg/90a99710f61d5dea19e49ae5b31164d2b56b07e3)

## References

- [Wikipedia](https://en.wikipedia.org/wiki/Knapsack_problem)
- [0/1 Knapsack Problem on YouTube](https://www.youtube.com/watch?v=8LusJS5-AGo&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)

## JavaScript implementation

From [`Knapsack.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/knapsack-problem/Knapsack.js):

```js
import MergeSort from '../../sorting/merge-sort/MergeSort';

export default class Knapsack {
  /**
   * @param {KnapsackItem[]} possibleItems
   * @param {number} weightLimit
   */
  constructor(possibleItems, weightLimit) {
    this.selectedItems = [];
    this.weightLimit = weightLimit;
    this.possibleItems = possibleItems;
  }

  sortPossibleItemsByWeight() {
    this.possibleItems = new MergeSort({
      /**
       * @var KnapsackItem itemA
       * @var KnapsackItem itemB
       */
      compareCallback: (itemA, itemB) => {
        if (itemA.weight === itemB.weight) {
          return 0;
        }

        return itemA.weight < itemB.weight ? -1 : 1;
      },
    }).sort(this.possibleItems);
  }

  sortPossibleItemsByValue() {
    this.possibleItems = new MergeSort({
      /**
       * @var KnapsackItem itemA
       * @var KnapsackItem itemB
       */
      compareCallback: (itemA, itemB) => {
        if (itemA.value === itemB.value) {
          return 0;
        }

        return itemA.value > itemB.value ? -1 : 1;
      },
    }).sort(this.possibleItems);
  }

  sortPossibleItemsByValuePerWeightRatio() {
    this.possibleItems = new MergeSort({
      /**
       * @var KnapsackItem itemA
       * @var KnapsackItem itemB
       */
      compareCallback: (itemA, itemB) => {
        if (itemA.valuePerWeightRatio === itemB.valuePerWeightRatio) {
          return 0;
        }

        return itemA.valuePerWeightRatio > itemB.valuePerWeightRatio ? -1 : 1;
      },
    }).sort(this.possibleItems);
  }

  // Solve 0/1 knapsack problem
  // Dynamic Programming approach.
  solveZeroOneKnapsackProblem() {
    // We do two sorts because in case of equal weights but different values
    // we need to take the most valuable items first.
    this.sortPossibleItemsByValue();
    this.sortPossibleItemsByWeight();

    this.selectedItems = [];

    // Create knapsack values matrix.
    const numberOfRows = this.possibleItems.length;
    const numberOfColumns = this.weightLimit;
    const knapsackMatrix = Array(numberOfRows).fill(null).map(() => {
      return Array(numberOfColumns + 1).fill(null);
    });

    // Fill the first column with zeros since it would mean that there is
    // no items we can add to knapsack in case if weight limitation is zero.
    for (let itemIndex = 0; itemIndex < this.possibleItems.length; itemIndex += 1) {
      knapsackMatrix[itemIndex][0] = 0;
    }

    // Fill the first row with max possible values we would get by just adding
    // or not adding the first item to the knapsack.
    for (let weightIndex = 1; weightIndex <= this.weightLimit; weightIndex += 1) {
      const itemIndex = 0;
      const itemWeight = this.possibleItems[itemIndex].weight;
      const itemValue = this.possibleItems[itemIndex].value;
      knapsackMatrix[itemIndex][weightIndex] = itemWeight <= weightIndex ? itemValue : 0;
    }

    // Go through combinations of how we may add items to knapsack and
    // define what weight/value we would receive using Dynamic Programming
    // approach.
    for (let itemIndex = 1; itemIndex < this.possibleItems.length; itemIndex += 1) {
      for (let weightIndex = 1; weightIndex <= this.weightLimit; weightIndex += 1) {
        const currentItemWeight = this.possibleItems[itemIndex].weight;
        const currentItemValue = this.possibleItems[itemIndex].value;

        if (currentItemWeight > weightIndex) {
          // In case if item's weight is bigger then currently allowed weight
          // then we can't add it to knapsack and the max possible value we can
          // gain at the moment is the max value we got for previous item.
          knapsackMatrix[itemIndex][weightIndex] = knapsackMatrix[itemIndex - 1][weightIndex];
        } else {
          // Else we need to consider the max value we can gain at this point by adding
          // current value or just by keeping the previous item for current weight.
          knapsackMatrix[itemIndex][weightIndex] = Math.max(
            currentItemValue + knapsackMatrix[itemIndex - 1][weightIndex - currentItemWeight],
            knapsackMatrix[itemIndex - 1][weightIndex],
          );
        }
      }
    }

    // Now let's trace back the knapsack matrix to see what items we're going to add
    // to the knapsack.
    let itemIndex = this.possibleItems.length - 1;
    let weightIndex = this.weightLimit;

    while (itemIndex > 0) {
      const currentItem = this.possibleItems[itemIndex];
      const prevItem = this.possibleItems[itemIndex - 1];

      // Check if matrix value came from top (from previous item).
      // In this case this would mean that we need to include previous item
      // to the list of selected items.
      if (
        knapsackMatrix[itemIndex][weightIndex]
        && knapsackMatrix[itemIndex][weightIndex] === knapsackMatrix[itemIndex - 1][weightIndex]
      ) {
        // Check if there are several items with the same weight but with the different values.
        // We need to add highest item in the matrix that is possible to get the highest value.
        const prevSumValue = knapsackMatrix[itemIndex - 1][weightIndex];
        const prevPrevSumValue = knapsackMatrix[itemIndex - 2][weightIndex];
        if (
          !prevSumValue
          || (prevSumValue && prevPrevSumValue !== prevSumValue)
        ) {
          this.selectedItems.push(prevItem);
        }
      } else if (knapsackMatrix[itemIndex - 1][weightIndex - currentItem.weight]) {
        this.selectedItems.push(prevItem);
        weightIndex -= currentItem.weight;
      }

      itemIndex -= 1;
    }
  }

  // Solve unbounded knapsack problem.
  // Greedy approach.
  solveUnboundedKnapsackProblem() {
    this.sortPossibleItemsByValue();
    this.sortPossibleItemsByValuePerWeightRatio();

    for (let itemIndex = 0; itemIndex < this.possibleItems.length; itemIndex += 1) {
      if (this.totalWeight < this.weightLimit) {
        const currentItem = this.possibleItems[itemIndex];

        // Detect how much of current items we can push to knapsack.
        const availableWeight = this.weightLimit - this.totalWeight;
        const maxPossibleItemsCount = Math.floor(availableWeight / currentItem.weight);

        if (maxPossibleItemsCount > currentItem.itemsInStock) {
          // If we have more items in stock then it is allowed to add
          // let's add the maximum allowed number of them.
          currentItem.quantity = currentItem.itemsInStock;
        } else if (maxPossibleItemsCount) {
          // In case if we don't have specified number of items in stock
          // let's add only items we have in stock.
          currentItem.quantity = maxPossibleItemsCount;
        }

        this.selectedItems.push(currentItem);
      }
    }
  }

  get totalValue() {
    /** @var {KnapsackItem} item */
    return this.selectedItems.reduce((accumulator, item) => {
      return accumulator + item.totalValue;
    }, 0);
  }

  get totalWeight() {
    /** @var {KnapsackItem} item */
    return this.selectedItems.reduce((accumulator, item) => {
      return accumulator + item.totalWeight;
    }, 0);
  }
}
```

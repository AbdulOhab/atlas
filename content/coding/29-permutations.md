---
title: "Permutations"
order: 29
category: Algorithms
summary: "When the order doesn't matter, it is a Combination."
---

# Permutations

> **Source:** [permutations](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/sets/permutations) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

When the order doesn't matter, it is a **Combination**.

When the order **does** matter it is a **Permutation**.

**"The combination to the safe is 472"**. We do care about the order. `724` won't work, nor will `247`.
It has to be exactly `4-7-2`.

## Permutations without repetitions

A permutation, also called an “arrangement number” or “order”, is a rearrangement of
the elements of an ordered list `S` into a one-to-one correspondence with `S` itself.

Below are the permutations of string `ABC`.

`ABC ACB BAC BCA CBA CAB`

Or for example the first three people in a running race: you can't be first and second.

**Number of combinations**

```
n * (n-1) * (n -2) * ... * 1 = n!
```

## Permutations with repetitions

When repetition is allowed we have permutations with repetitions.
For example, the lock below could be `333`.

![Permutation Lock](https://www.mathsisfun.com/combinatorics/images/permutation-lock.jpg)

**Number of combinations**

```
n * n * n ... (r times) = n^r
```

## Cheatsheet

![Permutations and Combinations Overview](https://raw.githubusercontent.com/trekhleb/javascript-algorithms/master/src/algorithms/sets/permutations/images/overview.png)

![Permutations overview](https://raw.githubusercontent.com/trekhleb/javascript-algorithms/master/src/algorithms/sets/permutations/images/permutations-overview.jpeg)

| | |
| --- | --- |
|![Permutations with repetition](https://raw.githubusercontent.com/trekhleb/javascript-algorithms/master/src/algorithms/sets/permutations/images/permutations-with-repetitions.jpg) | ![Permutations without repetition](https://raw.githubusercontent.com/trekhleb/javascript-algorithms/master/src/algorithms/sets/permutations/images/permutations-without-repetitions.jpg) |

*Made with [okso.app](https://okso.app)*

## References

- [Math Is Fun](https://www.mathsisfun.com/combinatorics/combinations-permutations.html)
- [Permutations/combinations cheat sheets](https://medium.com/@trekhleb/permutations-combinations-algorithms-cheat-sheet-68c14879aba5)

## JavaScript implementation

From [`permutateWithoutRepetitions.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/permutations/permutateWithoutRepetitions.js):

```js
/**
 * @param {*[]} permutationOptions
 * @return {*[]}
 */
export default function permutateWithoutRepetitions(permutationOptions) {
  if (permutationOptions.length === 1) {
    return [permutationOptions];
  }

  // Init permutations array.
  const permutations = [];

  // Get all permutations for permutationOptions excluding the first element.
  const smallerPermutations = permutateWithoutRepetitions(permutationOptions.slice(1));

  // Insert first option into every possible position of every smaller permutation.
  const firstOption = permutationOptions[0];

  for (let permIndex = 0; permIndex < smallerPermutations.length; permIndex += 1) {
    const smallerPermutation = smallerPermutations[permIndex];

    // Insert first option into every possible position of smallerPermutation.
    for (let positionIndex = 0; positionIndex <= smallerPermutation.length; positionIndex += 1) {
      const permutationPrefix = smallerPermutation.slice(0, positionIndex);
      const permutationSuffix = smallerPermutation.slice(positionIndex);
      permutations.push(permutationPrefix.concat([firstOption], permutationSuffix));
    }
  }

  return permutations;
}
```

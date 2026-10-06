---
title: "Combinations"
order: 30
category: Algorithms
summary: "When the order doesn't matter, it is a Combination."
---

# Combinations

> **Source:** [combinations](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/sets/combinations) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

When the order doesn't matter, it is a **Combination**.

When the order **does** matter it is a **Permutation**.

**"My fruit salad is a combination of apples, grapes and bananas"**
We don't care what order the fruits are in, they could also be
"bananas, grapes and apples" or "grapes, apples and bananas",
its the same fruit salad.

## Combinations without repetitions

This is how lotteries work. The numbers are drawn one at a
time, and if we have the lucky numbers (no matter what order)
we win!

No Repetition: such as lottery numbers `(2,14,15,27,30,33)`

**Number of combinations**

![Formula](https://www.mathsisfun.com/combinatorics/images/combinations-no-repeat.png)

where `n` is the number of things to choose from, and we choose `r` of them,
no repetition, order doesn't matter.

It is often called "n choose r" (such as "16 choose 3"). And is also known as the Binomial Coefficient.

## Combinations with repetitions

Repetition is Allowed: such as coins in your pocket `(5,5,5,10,10)`

Or let us say there are five flavours of ice cream:
`banana`, `chocolate`, `lemon`, `strawberry` and `vanilla`.

We can have three scoops. How many variations will there be?

Let's use letters for the flavours: `{b, c, l, s, v}`.
Example selections include:

- `{c, c, c}` (3 scoops of chocolate)
- `{b, l, v}` (one each of banana, lemon and vanilla)
- `{b, v, v}` (one of banana, two of vanilla)

**Number of combinations**

![Formula](https://www.mathsisfun.com/combinatorics/images/combinations-repeat.gif)

Where `n` is the number of things to choose from, and we
choose `r` of them. Repetition allowed,
order doesn't matter.

## Cheatsheet

![Permutations and Combinations Overview](https://raw.githubusercontent.com/trekhleb/javascript-algorithms/master/src/algorithms/sets/combinations/images/overview.png)

![Combinations overview](https://raw.githubusercontent.com/trekhleb/javascript-algorithms/master/src/algorithms/sets/combinations/images/combinations-overview.jpg)

| | |
| --- | --- |
|![Combinations with repetition](https://raw.githubusercontent.com/trekhleb/javascript-algorithms/master/src/algorithms/sets/combinations/images/combinations-with-repetitions.jpg) | ![Combinations without repetition](https://raw.githubusercontent.com/trekhleb/javascript-algorithms/master/src/algorithms/sets/combinations/images/combinations-without-repetitions.jpg) |

*Made with [okso.app](https://okso.app)*

## References

- [Math Is Fun](https://www.mathsisfun.com/combinatorics/combinations-permutations.html)
- [Permutations/combinations cheat sheets](https://medium.com/@trekhleb/permutations-combinations-algorithms-cheat-sheet-68c14879aba5)

## JavaScript implementation

From [`combineWithoutRepetitions.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/combinations/combineWithoutRepetitions.js):

```js
/**
 * @param {*[]} comboOptions
 * @param {number} comboLength
 * @return {*[]}
 */
export default function combineWithoutRepetitions(comboOptions, comboLength) {
  if (comboLength === 0) {
    return [[]];
  }

  if (comboLength < 0) {
    return [];
  }

  // If the length of the combination is 1 then each element of the original array
  // is a combination itself.
  if (comboLength === 1) {
    return comboOptions.map((comboOption) => [comboOption]);
  }

  // Init combinations array.
  const combos = [];

  // Extract characters one by one and concatenate them to combinations of smaller lengths.
  // We need to extract them because we don't want to have repetitions after concatenation.
  comboOptions.forEach((currentOption, optionIndex) => {
    // Generate combinations of smaller size.
    const smallerCombos = combineWithoutRepetitions(
      comboOptions.slice(optionIndex + 1),
      comboLength - 1,
    );

    // Concatenate currentOption with all combinations of smaller size.
    smallerCombos.forEach((smallerCombo) => {
      combos.push([currentOption].concat(smallerCombo));
    });
  });

  return combos;
}
```

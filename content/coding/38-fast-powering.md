---
title: "Fast Exponentiation"
order: 38
category: Algorithms
summary: "It is written as a small number to the right and above the base number."
---

# Fast Exponentiation

> **Source:** [fast-powering](https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/math/fast-powering) from [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) by Oleksii Trekhleb, MIT licensed.

**The power of a number** says how many times to use the number in a
multiplication.

It is written as a small number to the right and above the base number.

![Power](https://www.mathsisfun.com/algebra/images/exponent-8-2.svg)

## Naive Algorithm Complexity

How to find `a` raised to the power `b`?

We multiply `a` to itself, `b` times. That
is, `a^b = a * a * a * ... * a` (`b` occurrences of `a`).

This operation will take `O(n)` time since we need to do multiplication operation
exactly `n` times.

## Fast Power Algorithm

Can we do better than naive algorithm does? Yes we may solve the task of
powering in `O(log(n))` time.

The algorithm uses divide and conquer approach to compute power. Currently the
algorithm work for two positive integers `X` and `Y`.

The idea behind the algorithm is based on the fact that:

For **even** `Y`:

```text
X^Y = X^(Y/2) * X^(Y/2)
```

For **odd** `Y`:

```text
X^Y = X^(Y//2) * X^(Y//2) * X
where Y//2 is result of division of Y by 2 without reminder.
```

**For example**

```text
2^4 = (2 * 2) * (2 * 2) = (2^2) * (2^2)
```

```text
2^5 = (2 * 2) * (2 * 2) * 2 = (2^2) * (2^2) * (2)
```

Now, since on each step we need to compute the same `X^(Y/2)` power twice we may optimise
it by saving it to some intermediate variable to avoid its duplicate calculation.

**Time Complexity**

Since each iteration we split the power by half then we will call function
recursively `log(n)` times. This the time complexity of the algorithm is reduced to:

```text
O(log(n))
```

## References

- [YouTube](https://www.youtube.com/watch?v=LUWavfN9zEo&index=80&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8&t=0s)
- [Wikipedia](https://en.wikipedia.org/wiki/Exponentiation_by_squaring)

## JavaScript implementation

From [`fastPowering.js`](https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/math/fast-powering/fastPowering.js):

```js
/**
 * Fast Powering Algorithm.
 * Recursive implementation to compute power.
 *
 * Complexity: log(n)
 *
 * @param {number} base - Number that will be raised to the power.
 * @param {number} power - The power that number will be raised to.
 * @return {number}
 */
export default function fastPowering(base, power) {
  if (power === 0) {
    // Anything that is raised to the power of zero is 1.
    return 1;
  }

  if (power % 2 === 0) {
    // If the power is even...
    // we may recursively redefine the result via twice smaller powers:
    // x^8 = x^4 * x^4.
    const multiplier = fastPowering(base, power / 2);
    return multiplier * multiplier;
  }

  // If the power is odd...
  // we may recursively redefine the result via twice smaller powers:
  // x^9 = x^4 * x^4 * x.
  const multiplier = fastPowering(base, Math.floor(power / 2));
  return multiplier * multiplier * base;
}
```

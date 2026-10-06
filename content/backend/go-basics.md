---
title: "Go Language Basics"
order: 17
summary: "Go from zero: values and variables, control flow, slices and maps, functions, structs, methods, interfaces, errors, goroutines and channels."
category: "Frameworks"
level: Beginner
---

# Go Language Basics

Go is a small, compiled language built for servers: fast startup, a strong standard library and concurrency built into the language. These annotated examples cover the core.

**Course outline modules:** 37 (Go Language Basics)

## Hello world

> **Source:** [Hello world](https://gobyexample.com/hello-world) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

Our first program will print the classic "hello world" message. Here's the full source code.

```go
package main

import "fmt"

func main() {
	fmt.Println("hello world")
}
```

```shell
$ go run hello-world.go
hello world

$ go build hello-world.go
$ ls
hello-world	hello-world.go

$ ./hello-world
hello world
```

## Values

> **Source:** [Values](https://gobyexample.com/values) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

Go has various value types including strings, integers, floats, booleans, etc. Here are a few basic examples.

```go
package main

import "fmt"

func main() {
```

Strings, which can be added together with `+`.

```go
	fmt.Println("go" + "lang")
```

Integers and floats.

```go
	fmt.Println("1+1 =", 1+1)
	fmt.Println("7.0/3.0 =", 7.0/3.0)
```

Booleans, with boolean operators as you'd expect.

```go
	fmt.Println(true && false)
	fmt.Println(true || false)
	fmt.Println(!true)
}
```

```shell
$ go run values.go
golang
1+1 = 2
7.0/3.0 = 2.3333333333333335
false
true
false
```

## Variables

> **Source:** [Variables](https://gobyexample.com/variables) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

In Go, _variables_ are explicitly declared and used by the compiler to e.g. check type-correctness of function calls.

```go
package main

import "fmt"

func main() {
```

`var` declares 1 or more variables.

```go
	var a = "initial"
	fmt.Println(a)
```

You can declare multiple variables at once.

```go
	var b, c int = 1, 2
	fmt.Println(b, c)
```

Go will infer the type of initialized variables.

```go
	var d = true
	fmt.Println(d)
```

Variables declared without a corresponding initialization are _zero-valued_. For example, the zero value for an `int` is `0`.

```go
	var e int
	fmt.Println(e)
```

The `:=` syntax is shorthand for declaring and initializing a variable, e.g. for `var f string = "apple"` in this case. This syntax is only available inside functions.

```go
	f := "apple"
	fmt.Println(f)
}
```

```shell
$ go run variables.go
initial
1 2
true
0
apple
```

## Constants

> **Source:** [Constants](https://gobyexample.com/constants) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

Go supports _constants_ of character, string, boolean, and numeric values.

```go
package main

import (
	"fmt"
	"math"
)
```

`const` declares a constant value.

```go
const s string = "constant"

func main() {
	fmt.Println(s)
```

A `const` statement can also appear inside a function body.

```go
	const n = 500000000
```

Constant expressions perform arithmetic with arbitrary precision.

```go
	const d = 3e20 / n
	fmt.Println(d)
```

A numeric constant has no type until it's given one, such as by an explicit conversion.

```go
	fmt.Println(int64(d))
```

A number can be given a type by using it in a context that requires one, such as a variable assignment or function call. For example, here `math.Sin` expects a `float64`.

```go
	fmt.Println(math.Sin(n))
}
```

```shell
$ go run constant.go
constant
6e+11
600000000000
-0.28470407323754404
```

## For

> **Source:** [For](https://gobyexample.com/for) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

`for` is Go's only looping construct. Here are some basic types of `for` loops.

```go
package main

import "fmt"

func main() {
```

The most basic type, with a single condition.

```go
	i := 1
	for i <= 3 {
		fmt.Println(i)
		i = i + 1
	}
```

A classic initial/condition/after `for` loop.

```go
	for j := 0; j < 3; j++ {
		fmt.Println(j)
	}
```

Another way of accomplishing the basic "do this N times" iteration is `range` over an integer.

```go
	for i := range 3 {
		fmt.Println("range", i)
	}
```

`for` without a condition will loop repeatedly until you `break` out of the loop or `return` from the enclosing function.

```go
	for {
		fmt.Println("loop")
		break
	}
```

You can also `continue` to the next iteration of the loop.

```go
	for n := range 6 {
		if n%2 == 0 {
			continue
		}
		fmt.Println(n)
	}
}
```

```shell
$ go run for.go
1
2
3
0
1
2
range 0
range 1
range 2
loop
1
3
5
```

## If/else

> **Source:** [If/else](https://gobyexample.com/if-else) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

Branching with `if` and `else` in Go is straight-forward.

```go
package main

import "fmt"

func main() {
```

Here's a basic example.

```go
	if 7%2 == 0 {
		fmt.Println("7 is even")
	} else {
		fmt.Println("7 is odd")
	}
```

You can have an `if` statement without an else.

```go
	if 8%4 == 0 {
		fmt.Println("8 is divisible by 4")
	}
```

Logical operators like `&&` and `||` are often useful in conditions.

```go
	if 8%2 == 0 || 7%2 == 0 {
		fmt.Println("either 8 or 7 are even")
	}
```

A statement can precede conditionals; any variables declared in this statement are available in the current and all subsequent branches.

```go
	if num := 9; num < 0 {
		fmt.Println(num, "is negative")
	} else if num < 10 {
		fmt.Println(num, "has 1 digit")
	} else {
		fmt.Println(num, "has multiple digits")
	}
}
```

Note that you don't need parentheses around conditions in Go, but that the braces are required.

```shell
$ go run if-else.go
7 is odd
8 is divisible by 4
either 8 or 7 are even
9 has 1 digit
```

## Switch

> **Source:** [Switch](https://gobyexample.com/switch) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

_Switch statements_ express conditionals across many branches.

```go
package main

import (
	"fmt"
	"time"
)

func main() {
```

Here's a basic `switch`.

```go
	i := 2
	fmt.Print("Write ", i, " as ")
	switch i {
	case 1:
		fmt.Println("one")
	case 2:
		fmt.Println("two")
	case 3:
		fmt.Println("three")
	}
```

You can use commas to separate multiple expressions in the same `case` statement. We use the optional `default` case in this example as well.

```go
	switch time.Now().Weekday() {
	case time.Saturday, time.Sunday:
		fmt.Println("It's the weekend")
	default:
		fmt.Println("It's a weekday")
	}
```

`switch` without an expression is an alternate way to express if/else logic. Here we also show how the `case` expressions can be non-constants.

```go
	t := time.Now()
	switch {
	case t.Hour() < 12:
		fmt.Println("It's before noon")
	default:
		fmt.Println("It's after noon")
	}
```

A type `switch` compares types instead of values.  You can use this to discover the type of an interface value.  In this example, the variable `t` will have the type corresponding to its clause.

```go
	whatAmI := func(i any) {
		switch t := i.(type) {
		case bool:
			fmt.Println("I'm a bool")
		case int:
			fmt.Println("I'm an int")
		default:
			fmt.Printf("Don't know type %T\n", t)
		}
	}
	whatAmI(true)
	whatAmI(1)
	whatAmI("hey")
}
```

```shell
$ go run switch.go
Write 2 as two
It's a weekday
It's after noon
I'm a bool
I'm an int
Don't know type string
```

## Slices

> **Source:** [Slices](https://gobyexample.com/slices) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

_Slices_ are an important data type in Go, giving a more powerful interface to sequences than arrays.

```go
package main

import (
	"fmt"
	"slices"
)

func main() {
```

Unlike arrays, slices are typed only by the elements they contain (not the number of elements). An uninitialized slice equals to nil and has length 0.

```go
	var s []string
	fmt.Println("uninit:", s, s == nil, len(s) == 0)
```

To create a slice with non-zero length, use the builtin `make`. Here we make a slice of `string`s of length `3` (initially zero-valued). By default a new slice's capacity is equal to its length; if we know the slice is going to grow ahead of time, it's possible to pass a capacity explicitly as an additional parameter to `make`.

```go
	s = make([]string, 3)
	fmt.Println("emp:", s, "len:", len(s), "cap:", cap(s))
```

We can set and get just like with arrays.

```go
	s[0] = "a"
	s[1] = "b"
	s[2] = "c"
	fmt.Println("set:", s)
	fmt.Println("get:", s[2])
```

`len` returns the length of the slice as expected.

```go
	fmt.Println("len:", len(s))
```

In addition to these basic operations, slices support several more that make them richer than arrays. One is the builtin `append`, which returns a slice containing one or more new values. Note that we need to accept a return value from `append` as we may get a new slice value.

```go
	s = append(s, "d")
	s = append(s, "e", "f")
	fmt.Println("apd:", s)
```

Slices can also be `copy`'d. Here we create an empty slice `c` of the same length as `s` and copy into `c` from `s`.

```go
	c := make([]string, len(s))
	copy(c, s)
	fmt.Println("cpy:", c)
```

Slices support a "slice" operator with the syntax `slice[low:high]`. For example, this gets a slice of the elements `s[2]`, `s[3]`, and `s[4]`.

```go
	l := s[2:5]
	fmt.Println("sl1:", l)
```

This slices up to (but excluding) `s[5]`.

```go
	l = s[:5]
	fmt.Println("sl2:", l)
```

And this slices up from (and including) `s[2]`.

```go
	l = s[2:]
	fmt.Println("sl3:", l)
```

We can declare and initialize a variable for slice in a single line as well.

```go
	t := []string{"g", "h", "i"}
	fmt.Println("dcl:", t)
```

The `slices` package contains a number of useful utility functions for slices.

```go
	t2 := []string{"g", "h", "i"}
	if slices.Equal(t, t2) {
		fmt.Println("t == t2")
	}
```

Slices can be composed into multi-dimensional data structures. The length of the inner slices can vary, unlike with multi-dimensional arrays.

```go
	twoD := make([][]int, 3)
	for i := range 3 {
		innerLen := i + 1
		twoD[i] = make([]int, innerLen)
		for j := range innerLen {
			twoD[i][j] = i + j
		}
	}
	fmt.Println("2d: ", twoD)
}
```

```shell
$ go run slices.go
uninit: [] true true
emp: [  ] len: 3 cap: 3
set: [a b c]
get: c
len: 3
apd: [a b c d e f]
cpy: [a b c d e f]
sl1: [c d e]
sl2: [a b c d e]
sl3: [c d e f]
dcl: [g h i]
t == t2
2d:  [[0] [1 2] [2 3 4]]
```

## Maps

> **Source:** [Maps](https://gobyexample.com/maps) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

_Maps_ are Go's built-in [associative data type](https://en.wikipedia.org/wiki/Associative_array) (sometimes called _hashes_ or _dicts_ in other languages).

```go
package main

import (
	"fmt"
	"maps"
)

func main() {
```

To create an empty map, use the builtin `make`: `make(map[key-type]val-type)`.

```go
	m := make(map[string]int)
```

Set key/value pairs using typical `name[key] = val` syntax.

```go
	m["k1"] = 7
	m["k2"] = 13
```

Printing a map with e.g. `fmt.Println` will show all of its key/value pairs.

```go
	fmt.Println("map:", m)
```

Get a value for a key with `name[key]`.

```go
	v1 := m["k1"]
	fmt.Println("v1:", v1)
```

If the key doesn't exist, the [zero value](https://go.dev/ref/spec#The_zero_value) of the value type is returned.

```go
	v3 := m["k3"]
	fmt.Println("v3:", v3)
```

The builtin `len` returns the number of key/value pairs when called on a map.

```go
	fmt.Println("len:", len(m))
```

The builtin `delete` removes key/value pairs from a map.

```go
	delete(m, "k2")
	fmt.Println("map:", m)
```

To remove *all* key/value pairs from a map, use the `clear` builtin.

```go
	clear(m)
	fmt.Println("map:", m)
```

The optional second return value when getting a value from a map indicates if the key was present in the map. This can be used to disambiguate between missing keys and keys with zero values like `0` or `""`. Here we didn't need the value itself, so we ignored it with the _blank identifier_ `_`.

```go
	_, prs := m["k2"]
	fmt.Println("prs:", prs)
```

You can also declare and initialize a new map in the same line with this syntax.

```go
	n := map[string]int{"foo": 1, "bar": 2}
	fmt.Println("map:", n)
```

The `maps` package contains a number of useful utility functions for maps.

```go
	n2 := map[string]int{"foo": 1, "bar": 2}
	if maps.Equal(n, n2) {
		fmt.Println("n == n2")
	}
}
```

```shell
$ go run maps.go
map: map[k1:7 k2:13]
v1: 7
v3: 0
len: 2
map: map[k1:7]
map: map[]
prs: false
map: map[bar:2 foo:1]
n == n2
```

## Functions

> **Source:** [Functions](https://gobyexample.com/functions) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

_Functions_ are central in Go. We'll learn about functions with a few different examples.

```go
package main

import "fmt"
```

Here's a function that takes two `int`s and returns their sum as an `int`.

```go
func plus(a int, b int) int {
```

Go requires explicit returns, i.e. it won't automatically return the value of the last expression.

```go
	return a + b
}
```

When you have multiple consecutive parameters of the same type, you may omit the type name for the like-typed parameters up to the final parameter that declares the type.

```go
func plusPlus(a, b, c int) int {
	return a + b + c
}

func main() {
```

Call a function just as you'd expect, with `name(args)`.

```go
	res := plus(1, 2)
	fmt.Println("1+2 =", res)

	res = plusPlus(1, 2, 3)
	fmt.Println("1+2+3 =", res)
}
```

```shell
$ go run functions.go
1+2 = 3
1+2+3 = 6
```

## Multiple return values

> **Source:** [Multiple return values](https://gobyexample.com/multiple-return-values) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

Go has built-in support for _multiple return values_. This feature is used often in idiomatic Go, for example to return both result and error values from a function.

```go
package main

import "fmt"
```

The `(int, int)` in this function signature shows that the function returns 2 `int`s.

```go
func vals() (int, int) {
	return 3, 7
}

func main() {
```

Here we use the 2 different return values from the call with _multiple assignment_.

```go
	a, b := vals()
	fmt.Println(a)
	fmt.Println(b)
```

If you only want a subset of the returned values, use the blank identifier `_`.

```go
	_, c := vals()
	fmt.Println(c)
}
```

```shell
$ go run multiple-return-values.go
3
7
7
```

## Pointers

> **Source:** [Pointers](https://gobyexample.com/pointers) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

Go supports <em><a href="https://en.wikipedia.org/wiki/Pointer_(computer_programming)">pointers</a></em>, allowing you to pass references to values and records within your program.

```go
package main

import "fmt"
```

We'll show how pointers work in contrast to values with 2 functions: `zeroval` and `zeroptr`. `zeroval` has an `int` parameter, so arguments will be passed to it by value. `zeroval` will get a copy of `ival` distinct from the one in the calling function.

```go
func zeroval(ival int) {
	ival = 0
}
```

`zeroptr` in contrast has an `*int` parameter, meaning that it takes an `int` pointer. The `*iptr` code in the function body then _dereferences_ the pointer from its memory address to the current value at that address. Assigning a value to a dereferenced pointer changes the value at the referenced address.

```go
func zeroptr(iptr *int) {
	*iptr = 0
}

func main() {
	i := 1
	fmt.Println("initial:", i)

	zeroval(i)
	fmt.Println("zeroval:", i)
```

The `&i` syntax gives the memory address of `i`, i.e. a pointer to `i`.

```go
	zeroptr(&i)
	fmt.Println("zeroptr:", i)
```

Pointers can be printed too.

```go
	fmt.Println("pointer:", &i)
```

A new pointer to a value can be created with the builtin function `new`.

```go
	p := new(42)
	fmt.Println("value at *p:", *p)
	zeroptr(p)
	fmt.Println("value at *p:", *p)
}
```

```shell
$ go run pointers.go
initial: 1
zeroval: 1
zeroptr: 0
pointer: 0x42131100
value at *p: 42
value at *p: 0
```

## Structs

> **Source:** [Structs](https://gobyexample.com/structs) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

Go's _structs_ are typed collections of fields. They're useful for grouping data together to form records.

```go
package main

import "fmt"
```

This `person` struct type has `name` and `age` fields.

```go
type person struct {
	name string
	age  int
}
```

`newPerson` constructs a new person struct with the given name.

```go
func newPerson(name string) *person {
```

Go is a garbage collected language; you can safely return a pointer to a local variable - it will only be cleaned up by the garbage collector when there are no active references to it.

```go
	p := person{name: name}
	p.age = 42
	return &p
}

func main() {
```

This syntax creates a new struct.

```go
	fmt.Println(person{"Bob", 20})
```

You can name the fields when initializing a struct.

```go
	fmt.Println(person{name: "Alice", age: 30})
```

Omitted fields will be zero-valued.

```go
	fmt.Println(person{name: "Fred"})
```

An `&` prefix yields a pointer to the struct.

```go
	fmt.Println(&person{name: "Ann", age: 40})
```

It's idiomatic to encapsulate new struct creation in constructor functions

```go
	fmt.Println(newPerson("Jon"))
```

Access struct fields with a dot.

```go
	s := person{name: "Sean", age: 50}
	fmt.Println(s.name)
```

Structs are mutable.

```go
	s.age = 51
	fmt.Println(s)
```

You can also use dots with struct pointers - the pointers are automatically dereferenced.

```go
	sp := &s
	sp.age = 52
	fmt.Println(sp.age)
```

If a struct type is only used for a single value, we don't have to give it a name. The value can have an anonymous struct type. This technique is commonly used for [table-driven tests](testing-and-benchmarking).

```go
	dog := struct {
		name   string
		isGood bool
	}{
		"Rex",
		true,
	}
	fmt.Println(dog)
}
```

```shell
{Bob 20}
{Alice 30}
{Fred 0}
&{Ann 40}
&{Jon 42}
Sean
{Sean 51}
52
{Rex true}
```

## Methods

> **Source:** [Methods](https://gobyexample.com/methods) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

Go supports _methods_ defined on struct types.

```go
package main

import "fmt"

type rect struct {
	width, height int
}
```

This `area` method has a _receiver type_ of `*rect`.

```go
func (r *rect) area() int {
	return r.width * r.height
}
```

Methods can be defined for either pointer or value receiver types. Here's an example of a value receiver.

```go
func (r rect) perim() int {
	return 2*r.width + 2*r.height
}

func main() {
	r := rect{width: 10, height: 5}
```

Here we call the 2 methods defined for our struct.

```go
	fmt.Println("area: ", r.area())
	fmt.Println("perim:", r.perim())
```

Go automatically handles conversion between values and pointers for method calls. You may want to use a pointer receiver type to avoid copying on method calls or to allow the method to mutate the receiving struct.

```go
	rp := &r
	fmt.Println("area: ", rp.area())
	fmt.Println("perim:", rp.perim())
}
```

```shell
$ go run methods.go
area:  50
perim: 30
area:  50
perim: 30
```

## Interfaces

> **Source:** [Interfaces](https://gobyexample.com/interfaces) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

_Interfaces_ are named collections of method signatures.

```go
package main

import (
	"fmt"
	"math"
)
```

Here's a basic interface for geometric shapes.

```go
type geometry interface {
	area() float64
	perim() float64
}
```

For our example we'll implement this interface on `rect` and `circle` types.

```go
type rect struct {
	width, height float64
}
type circle struct {
	radius float64
}
```

To implement an interface in Go, we just need to implement all the methods in the interface. Here we implement `geometry` on `rect`s.

```go
func (r rect) area() float64 {
	return r.width * r.height
}
func (r rect) perim() float64 {
	return 2*r.width + 2*r.height
}
```

The implementation for `circle`s.

```go
func (c circle) area() float64 {
	return math.Pi * c.radius * c.radius
}
func (c circle) perim() float64 {
	return 2 * math.Pi * c.radius
}
```

If a variable has an interface type, then we can call methods that are in the named interface. Here's a generic `measure` function taking advantage of this to work on any `geometry`.

```go
func measure(g geometry) {
	fmt.Println(g)
	fmt.Println(g.area())
	fmt.Println(g.perim())
}
```

Sometimes it's useful to know the runtime type of an interface value. One option is using a *type assertion* as shown here; another is a [type `switch`](switch).

```go
func detectCircle(g geometry) {
	if c, ok := g.(circle); ok {
		fmt.Println("circle with radius", c.radius)
	}
}

func main() {
	r := rect{width: 3, height: 4}
	c := circle{radius: 5}
```

The `circle` and `rect` struct types both implement the `geometry` interface so we can use instances of these structs as arguments to `measure`.

```go
	measure(r)
	measure(c)

	detectCircle(r)
	detectCircle(c)
}
```

```shell
$ go run interfaces.go
{3 4}
12
14
{5}
78.53981633974483
31.41592653589793
circle with radius 5
```

## Errors

> **Source:** [Errors](https://gobyexample.com/errors) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

In Go it's idiomatic to communicate errors via an explicit, separate return value. This contrasts with the exceptions used in languages like Java, Python and Ruby and the overloaded single result / error value sometimes used in C. Go's approach makes it easy to see which functions return errors and to handle them using the same language constructs employed for other, non-error tasks. See the documentation of the [errors package](https://pkg.go.dev/errors) and [this blog post](https://go.dev/blog/go1.13-errors) for additional details.

```go
package main

import (
	"errors"
	"fmt"
)
```

By convention, errors are the last return value and have type `error`, a built-in interface.

```go
func f(arg int) (int, error) {
	if arg == 42 {
```

`errors.New` constructs a basic `error` value with the given error message.

```go
		return -1, errors.New("can't work with 42")
	}
```

A `nil` value in the error position indicates that there was no error.

```go
	return arg + 3, nil
}
```

A sentinel error is a predeclared variable that is used to signify a specific error condition.

```go
var ErrOutOfTea = errors.New("no more tea available")
var ErrPower = errors.New("can't boil water")

func makeTea(arg int) error {
	if arg == 2 {
		return ErrOutOfTea
	} else if arg == 4 {
```

We can wrap errors with higher-level errors to add context. The simplest way to do this is with the `%w` verb in `fmt.Errorf`. Wrapped errors create a logical chain (A wraps B, which wraps C, etc.) that can be queried with functions like `errors.Is` and `errors.AsType`.

```go
		return fmt.Errorf("making tea: %w", ErrPower)
	}
	return nil
}

func main() {
	for _, i := range []int{7, 42} {
```

It's idiomatic to use an inline error check in the `if` line.

```go
		if r, e := f(i); e != nil {
			fmt.Println("f failed:", e)
		} else {
			fmt.Println("f worked:", r)
		}
	}

	for i := range 5 {
		if err := makeTea(i); err != nil {
```

`errors.Is` checks that a given error (or any error in its chain) matches a specific error value. This is especially useful with wrapped or nested errors, allowing you to identify specific error types or sentinel errors in a chain of errors.

```go
			if errors.Is(err, ErrOutOfTea) {
				fmt.Println("We should buy new tea!")
			} else if errors.Is(err, ErrPower) {
				fmt.Println("Now it is dark.")
			} else {
				fmt.Printf("unknown error: %s\n", err)
			}
			continue
		}

		fmt.Println("Tea is ready!")
	}
}
```

```shell
$ go run errors.go
f worked: 10
f failed: can't work with 42
Tea is ready!
Tea is ready!
We should buy new tea!
Tea is ready!
Now it is dark.
```

## Goroutines

> **Source:** [Goroutines](https://gobyexample.com/goroutines) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

A _goroutine_ is a lightweight thread of execution.

```go
package main

import (
	"fmt"
	"time"
)

func f(from string) {
	for i := range 3 {
		fmt.Println(from, ":", i)
	}
}

func main() {
```

Suppose we have a function call `f(s)`. Here's how we'd call that in the usual way, running it synchronously.

```go
	f("direct")
```

To invoke this function in a goroutine, use `go f(s)`. This new goroutine will execute concurrently with the calling one.

```go
	go f("goroutine")
```

You can also start a goroutine for an anonymous function call.

```go
	go func(msg string) {
		fmt.Println(msg)
	}("going")
```

Our two function calls are running asynchronously in separate goroutines now. Wait for them to finish (for a more robust approach, use a [WaitGroup](waitgroups)).

```go
	time.Sleep(time.Second)
	fmt.Println("done")
}
```

```shell
$ go run goroutines.go
direct : 0
direct : 1
direct : 2
goroutine : 0
going
goroutine : 1
goroutine : 2
done
```

## Channels

> **Source:** [Channels](https://gobyexample.com/channels) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

_Channels_ are the pipes that connect concurrent goroutines. You can send values into channels from one goroutine and receive those values into another goroutine.

```go
package main

import "fmt"

func main() {
```

Create a new channel with `make(chan val-type)`. Channels are typed by the values they convey.

```go
	messages := make(chan string)
```

_Send_ a value into a channel using the `channel <-` syntax. Here we send `"ping"`  to the `messages` channel we made above, from a new goroutine.

```go
	go func() { messages <- "ping" }()
```

The `<-channel` syntax _receives_ a value from the channel. Here we'll receive the `"ping"` message we sent above and print it out.

```go
	msg := <-messages
	fmt.Println(msg)
}
```

```shell
$ go run channels.go
ping
```

## JSON

> **Source:** [JSON](https://gobyexample.com/json) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

Go offers built-in support for JSON encoding and decoding, including to and from built-in and custom data types.

```go
package main

import (
	"bytes"
	"encoding/json/v2"
	"fmt"
	"strings"
)
```

We'll use these two structs to demonstrate encoding and decoding of custom types below.

```go
type response1 struct {
	Page   int
	Fruits []string
}
```

Only exported fields will be encoded/decoded in JSON. Fields must start with capital letters to be exported.

```go
type response2 struct {
	Page   int      `json:"page"`
	Fruits []string `json:"fruits"`
}

func main() {
```

First we'll look at encoding basic data types to JSON strings. Here are some examples for atomic values.

```go
	bolB, _ := json.Marshal(true)
	fmt.Println(string(bolB))

	intB, _ := json.Marshal(1)
	fmt.Println(string(intB))

	fltB, _ := json.Marshal(2.34)
	fmt.Println(string(fltB))

	strB, _ := json.Marshal("gopher")
	fmt.Println(string(strB))
```

And here are some for slices and maps, which encode to JSON arrays and objects as you'd expect.

```go
	slcD := []string{"apple", "peach", "pear"}
	slcB, _ := json.Marshal(slcD)
	fmt.Println(string(slcB))

	mapD := map[string]int{"apple": 5, "lettuce": 7}
	mapB, _ := json.Marshal(mapD)
	fmt.Println(string(mapB))
```

The JSON package can automatically encode your custom data types. It will only include exported fields in the encoded output and will by default use those names as the JSON keys.

```go
	res1D := &response1{
		Page:   1,
		Fruits: []string{"apple", "peach", "pear"}}
	res1B, _ := json.Marshal(res1D)
	fmt.Println(string(res1B))
```

You can use tags on struct field declarations to customize the encoded JSON key names. Check the definition of `response2` above to see an example of such tags.

```go
	res2D := &response2{
		Page:   1,
		Fruits: []string{"apple", "peach", "pear"}}
	res2B, _ := json.Marshal(res2D)
	fmt.Println(string(res2B))
```

Now let's look at decoding JSON data into Go values. Here's an example for a generic data structure.

```go
	byt := []byte(`{"num":6.13,"strs":["a","b"]}`)
```

We need to provide a variable where the JSON package can put the decoded data. This `map[string]any` will hold a map of strings to arbitrary data types.

```go
	var dat map[string]any
```

Here's the actual decoding, and a check for associated errors. For the sake of brevity we ignore the errors in these examples; in real code, you should always check for errors and act upon them.

```go
	if err := json.Unmarshal(byt, &dat); err != nil {
		panic(err)
	}
	fmt.Println(dat)
```

In order to use the values in the decoded map, we'll need to convert them to their appropriate type. For example here we convert the value in `num` to the expected `float64` type.

```go
	num := dat["num"].(float64)
	fmt.Println(num)
```

Accessing nested data requires a series of conversions.

```go
	strs := dat["strs"].([]any)
	str1 := strs[0].(string)
	fmt.Println(str1)
```

We can also decode JSON into custom data types. This has the advantages of adding additional type-safety to our programs and eliminating the need for type assertions when accessing the decoded data.

```go
	str := `{"page": 1, "fruits": ["apple", "peach"]}`
	res := response2{}
	_ = json.Unmarshal([]byte(str), &res)
	fmt.Println(res)
	fmt.Println(res.Fruits[0])
```

In the examples above we always used bytes and strings as intermediates between the data and JSON representation on standard out. We can also stream JSON encodings directly to `io.Writer`s like `os.Stdout` or even HTTP response bodies.

```go
	d := map[string]int{"apple": 5, "lettuce": 7}
	var buf bytes.Buffer
	_ = json.MarshalWrite(&buf, d)
	fmt.Println(buf.String())
```

Streaming reads from `io.Reader`s like `os.Stdin` or HTTP request bodies is done with `json.UnmarshalRead`.

```go
	res1 := response2{}
	_ = json.UnmarshalRead(strings.NewReader(str), &res1)
	fmt.Println(res1)
}
```

```shell
$ go run json.go
true
1
2.34
"gopher"
["apple","peach","pear"]
{"apple":5,"lettuce":7}
{"Page":1,"Fruits":["apple","peach","pear"]}
{"page":1,"fruits":["apple","peach","pear"]}
map[num:6.13 strs:[a b]]
6.13
a
{1 [apple peach]}
apple
{"apple":5,"lettuce":7}
{1 [apple peach]}
```

## HTTP server

> **Source:** [HTTP server](https://gobyexample.com/http-server) · [Go by Example](https://github.com/mmcgrana/gobyexample), CC BY 3.0

Writing a basic HTTP server is easy using the `net/http` package.

```go
package main

import (
	"fmt"
	"net/http"
)
```

A fundamental concept in `net/http` servers is *handlers*. A handler is an object implementing the `http.Handler` interface. A common way to write a handler is by using the `http.HandlerFunc` adapter on functions with the appropriate signature.

```go
func hello(w http.ResponseWriter, req *http.Request) {
```

Functions serving as handlers take a `http.ResponseWriter` and a `http.Request` as arguments. The response writer is used to fill in the HTTP response. Here our simple response is just "hello\n".

```go
	fmt.Fprintf(w, "hello\n")
}

func headers(w http.ResponseWriter, req *http.Request) {
```

This handler does something a little more sophisticated by reading all the HTTP request headers and echoing them into the response body.

```go
	for name, headers := range req.Header {
		for _, h := range headers {
			fmt.Fprintf(w, "%v: %v\n", name, h)
		}
	}
}

func main() {
```

We register our handlers on server routes using the `http.HandleFunc` convenience function. It sets up the *default router* in the `net/http` package and takes a function as an argument.

```go
	http.HandleFunc("/hello", hello)
	http.HandleFunc("/headers", headers)
```

Finally, we call the `ListenAndServe` with the port and a handler. `nil` tells it to use the default router we've just set up.

```go
	http.ListenAndServe(":8090", nil)
}
```

```shell
$ go run http-server.go &

$ curl localhost:8090/hello
hello
```

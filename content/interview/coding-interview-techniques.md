---
title: "Coding Interview Techniques"
order: 2
summary: "What to do in the room: the step-by-step technique, the cheatsheet of do's and don'ts, how you're graded, and the best practice questions."
category: "Interview Prep"
level: Beginner
---

# Coding Interview Techniques

What to do in the room: the step-by-step technique, the cheatsheet of do's and don'ts, how you're graded, and the best practice questions.

## Techniques to Solve Questions

> **Source:** [Techniques to Solve Questions](https://www.techinterviewhandbook.org/coding-interview-techniques/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

The biggest fear most candidates will have during a coding interview is: what if I get stuck on the question and don't know how to do it? Fortunately, there are structured ways to approach coding interview questions that will increase your chances of solving them. From how to find a solution or approach, to optimizing time and space complexity, here are some of the top tips and best practices that will help you solve coding interview questions.

### How to find solutions to coding interview problems

When given a coding interview question, candidates should start by asking clarifying questions and discussing a few possible approaches with their interviewers. However, this is where most candidates tend to get stuck. Thankfully, there are ways to do this in a structured manner.

Note that not all techniques will apply to every coding interview problem, and you can also use multiple techniques on one single problem! As you apply these techniques during your practice, you will develop the intuition for which technique will be useful for the problem at hand.

#### 1. Visualize the problem by drawing it out

Ever wondered why coding interviews are traditionally done on whiteboards and videos explaining answers to coding questions tend to use diagrams? Whiteboards make it easy to draw diagrams which helps with problem solving! A huge part of coding is understanding how the internal state of a program changes and diagrams are super useful tools for representing the internal data structures state. If you are having a hard time understanding how the solution is obtained, come up with a visual representation of the problem and if necessary, the internal states at each step.

This technique is especially useful if the input involves trees, graphs, matrices, linked lists.

##### Example

How would you [return all elements of a matrix in spiral order](https://leetcode.com/problems/spiral-matrix/)? Drawing out the matrix and the steps your iterator needs to take in each direction will help tremendously in allowing you to see the pattern.

#### 2. Think about how you would solve the problem by hand

Solving the problem by hand is about solving the problem without writing any code, like how a non-programmer would. This already happens naturally most of the time when you are trying to understand the example given to you.

What some people don't realize is that sometimes a working solution is simply a code version of the manual approach. If you can come up with a concrete set of rules around the approach that works for every example, you can write the code for it. While you might not arrive at the most efficient solution by doing this, it's a start which will give you some credit.

##### Example

How do you [validate if a tree is a valid Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/) without writing any code? You first check if the left subtree contains only values less than the root, then check that the right subtree contains only values bigger than the root, then repeat for each node. This process seems feasible. Now you just have to turn this process into code.

#### 3. Come up with more examples

Coming up with more examples is something useful you can do regardless of whether you are stuck or not. It helps you to reinforce your understanding of the question, prevents you from prematurely jumping into coding, helps you to identify a pattern which can be generalized to any input, which is the solution! Lastly, the multiple examples can be used as test cases at the end when verifying your solution.

#### 4. Break the question down into smaller independent parts

If the problem is large, start with a high-level function and break it down into smaller constituting functions, solving each one separately. This prevents you from getting overwhelmed with the details of doing everything at once and keeps your thinking structured.

Doing so also makes it clear to the interviewer that you have an approach, even if you don't manage to finish coding all of the smaller functions.

##### Example

The [Group Anagrams](https://leetcode.com/problems/group-anagrams/) problem can be broken down into two parts - hashing a string, grouping the strings together. Each part can be solved separately with independent implementation details. You could start off with this code:

```py
def group_anagrams(strings):
  def hash(string):
    # Fill in later
    pass

  def group_strings(strings_hashes):
    # Fill in later
    pass

  strings_hashes = [(string, hash(string)) for string in strings]
  return group_strings(strings_hashes)
```

And proceed to fill in the implementation of each function. However, do note that sometimes the most efficient solutions will require you to break some abstractions and do multiple operations in one pass of the input. If your interviewer asks you to optimize based on your well-abstracted solution, that is one possible path forward.

#### 5. Apply common data structures and algorithms at the problem

Unlike real-world software engineering where the problems are usually open-ended and might not have clear solutions, coding interview problems tend to be smaller in nature and are designed to be solvable within the duration of the interview. You can also expect that the knowledge required to solve the problem is not out of this world and they would have been taught during college. Thankfully, the number of common data structures and algorithms is finite and a hacky approach which works from my experience is to try going through all the common data structures and applying them to the problem.

These are the data structures to keep in mind and try, in order of frequency they appear in coding interview questions:

- **Hash Maps**: Useful for making lookup efficient. This is the most common data structure used in interviews and you are guaranteed to have to use it.
- **Graphs**: If the data is presented to you as associations between entities, you might be able to model the question as a graph and use some common graph algorithm to solve the problem.
- **Stack and Queue**: If you need to parse a string with nested properties (such as a mathematical equation), you will almost definitely need to use stacks.
- **Heap**: Question involves scheduling/ordering based on some priority. Also useful for finding the max K/min K/median elements in a set.
- **Tree/Trie**: Do you need to store strings in a space-efficient manner and look for the existence of strings (or at least part of them) very quickly?

**Routines**

- Sorting
- Binary search: Useful if the input array is sorted and you need to do faster than O(n) searches
- Sliding window
- Two pointers
- Union find
- BFS/DFS
- Traverse from the back
- Topological Sorting

In future we will add tips on how to better identify the most relevant data structures and routines based on the problem.

### How to optimize your approach or solution

After you've come up with an initial solution to the coding interview problem, your interviewer would most likely prompt you to optimize the solution by asking "Can we do better". The following techniques help you further optimize the time and space complexity of your solution:

#### How to optimize time complexity

##### 1. Identify the Best Theoretical Time Complexity of the solution

The Best Theoretical Time Complexity (BTTC) of a solution is a time complexity you know that you cannot beat.

Some simplified examples:

- The BTTC of finding the sum of numbers in array is O(n) because you have to look at every value in the array at least once
- The BTTC of finding the [number of groups of anagrams](https://leetcode.com/problems/group-anagrams/) is O(nk) where n is the number of words and k is the maximum number of letters in a word because you have to look at each word at least once and look at each character in each word at least once
- The BTTC of finding the number of islands in a matrix is O(nm) where n is the number of rows and m is the number of columns because you have to look at each cell in the matrix at least once

Why is it important to know the BTTC? So that you don't go down the rabbit hole of trying to find a solution that is faster than the BTTC. The fastest practical solution can only ever be as fast as the BTTC, not faster than the BTTC. The BTTC is not necessarily achievable in practice (hence theoretical), it just means you can never find a real solution that is faster than it. If your initial solution is slower than the BTTC, there could be opportunities to improve such that you can attain the BTTC (but not always the case). It wouldn't hurt to mention the BTTC to your interviewer, which will be taken as a positive signal and also to remind yourself that you should not try to come up with something faster than the BTTC.

Some people might think that the BTTC is simply the total number of elements in a data structure, because you need to go through each element once. This is **not always true**. The most famous example would be finding a number in a sorted array of numbers. The sorted property changes things a whole lot:

- Finding a number would be O(log(n)) because you can use a binary search.
- Finding the largest number would be O(1) because it is the last value in the array.

This is why it is important to pay attention to every detail given about the question. Be careful not to determine the incorrect BTTC due to lack of attention to the question details!

With the correct BTTC determined, you now know the time complexity of the optimal solution lies between your initial solution and the BTTC and can work your way toward it. If your solution already has the BTTC and the interviewer is asking you to optimize further, there are usually two things they are looking out for:

- Do even less work. Your solution could be O(n) but making two passes of the array and the interviewer is looking for the solution that uses a single pass.
- Use less space. Refer to the section below on optimizing space complexity.

##### 2. Identify overlapping and repeated computation

A naive/brute force solution often executes the same operation over and over again. When the code is doing an expensive operation that has been done before, take a moment to step back and consider if you can reuse results from previous computations. Dynamic programming (DP) is the most obvious type of questions you can entirely leverage past computations. There are non-DP questions that can leverage this technique too, although not as straightforward and might require a preprocessing step.

###### Example

The [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) question is a good example of a problem which contains overlapping/repeated work. To get the value for an index, you need to multiply the values at all other positions. Doing this for every value in the array would take O(n<sup>2</sup>) time. However, see that:

- `result[n]`: `Product(nums[0] … nums[n-1]) * Product(nums[n + 1] … nums[N - 1])`
- `result[n + 1]`: `Product(nums[0] … nums[n]) * Product(num[n + 2] … nums[N - 1])`

There's a ton of duplicated work in computing the `result[n]` vs `result[n + 1]`! This is an opportunity to reuse earlier computations made while computing `result[n]` to compute `result[n + 1]`. Indeed, we can make use of a prefix array to help us arrive at the final solution in O(n) time at the cost of more space.

##### 3. Try different data structures

Choice of data structures is key to coding interviews. It can help you to reach a solution for the problem, it can also help you to optimize your existing solution. Sometimes it's worth going through the exercise of iterating through the data structures you know once again.

Is lookup time slowing your algorithm down? In general, most lookup operations should be O(1) with the help of a hash table. If the lookup operation in your solution is the bottleneck to your solution's time complexity, more often than not, you can use a hash table to optimize the lookup.

###### Example

The [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/) question can be solved in a naive manner by calculating the distance of each point, sorting them and then taking the K smallest values. This takes O(nlog(n)) time because of the sorting. However, by using a Heap data structure, the time complexity can be reduced to O(nlog(k)) as adding/removing from the heap only takes O(log(k)) time when the size of the heap is capped at K elements. Changing the data structure made a whole ton of difference to the efficiency of the algorithm!

##### 4. Identify redundant work

Here are a few examples of code which is doing redundant work. Although making these mistakes might not change the overall time complexity of your code, you are also evaluated on coding abilities, so it is important to write as efficient code as possible.

###### Don't check conditions unnecessarily

These are Python examples where the second check is redundant.

- `if not arr and len(arr) == 0` - the first check already ensures that the array is empty so there is no need for the second check.
- `x < 5 and x < 10` - the second check is a subcondition of the first check.

###### Mind the order of checks

- `if slow() or fast()` - There are two operations in this check, of varying durations. As long as one of the operations evaluates to `true`, the condition will evaluate to `true`. Most computers execute operations in order from left to right, hence it is more efficient to put the `fast()` on the left.
- `if likely() and unlikely()` - This example uses a similar argument as above. If we execute `unlikely()` first and it is `false`, we don't have to execute `likely()`.

###### Don't invoke methods unnecessarily

If you have to refer to a property multiple times in your function and that property has to be derived from a function call, cache the result as a variable if the value doesn't change throughout the lifetime of the function. The length of the input array is the most common example. Most of the time, the length of the input array doesn't change, declare a variable at the start called `length = len(array)` and use `length` in your function instead of calling `len(array)` every time you need it.

###### Early termination

Early termination. Stop after you already have the answer, return the answer immediately. Here's an example of leveraging early termination. Consider this basic question "Determine if an array of strings contain a string regardless of case sensitivity". The code for it:

```py
def contains_string(search_term, strings):
  result = False
  for string in strings:
    if string.lower() == search_term.lower():
      result = True
  return result
```

Does this code work? Definitely. Is this code as efficient as it can be? Nope. We only need to know if the search term exists in the array of strings. We can stop iterating as soon as we know that there exists the value.

```py
def contains_string(search_term, strings):
  for string in strings:
    if string.lower() == search_term.lower():
      return True # Stop comparing the rest of the array/list because the result won't change.
  return False
```

Most people already know this and already do this outside of an interview. However, in a stressful interview environment, people tend to forget the most obvious things. Terminate early from loops where you can.

###### Minimize work inside loops

Let's further improve on the example above to solve the question "Determine if an array of strings contain a string regardless of case sensitivity".

```py
def contains_string(search_term, strings):
  for string in strings:
    if string.lower() == search_term.lower():
      return True
  return False
```

Note that you are calling `search_term.lower()` once per loop of the for loop! It's a waste because the `search_term` doesn't change throughout the lifecycle of the function.

```py
def contains_string(search_term, strings):
  search_term_lowercase = search_term.lower()
  for string in strings:
    if string.lower() == search_term_lowercase:
      return True
  return False
```

Minimize work inside loops and don't redo work you have already done if it doesn't change.

###### Be lazy

Lazy evaluation is an evaluation strategy which delays the evaluation of an expression until its value is needed. Let's use the same example as above. We could technically improve it a little bit:

```py
def contains_string(search_term, strings):
  if len(strings) == 0:
    return False
  # Don't have to change the search term to lower case if there are no strings at all.
  search_term_lowercase = search_term.lower()
  for string in strings:
    if string.lower() == search_term_lowercase:
      return True
  return False
```

This is considered a micro-optimization and most of the time, `strings` won't be empty, but I'm using it to illustrate the example where you don't have to do certain computations if they aren't needed. This also applies to initialization of objects that you will need in your code (usually hash tables). If the input is empty, there's no need to initialize any variables!

#### How to optimize space complexity

Most of the time, time complexity is more important than space complexity. But when you have already reached the optimal time complexity, the interviewer might ask you to optimize the space your solution is using (if it is using extra space). Here are some techniques you can use to improve the space complexity of your code.

##### 1. Changing data in-place/overwriting input data

If your solution contains code to create new data structures to do intermediate processing/caching, memory space is being allocated and can sometimes be seen as a negative. A trick to get around this is by overwriting values in the original input array so that you are not allocating any new space in your code. However, be careful not to destroy the input data in irreversible ways if you need to use it in subsequent parts of your code.

A possible way which works (but you should never use outside of coding interviews) is to mutate the original array and use it as a hash table to store intermediate data. Refer to the example below.

Note that in Software Engineering, mutating input data is generally frowned upon and makes your code harder to read and maintain, so changing data in-place is mostly something you should do only in coding interviews.

##### Example

The [Dutch National Flag](https://leetcode.com/problems/sort-colors/) problem could be easily solved with O(n) time and O(n) space by creating a new array and filling it up with the respective values in a sorted fashion. As an added challenge and space optimization, the interviewer will usually ask for an O(n) time and O(1) space solution which involves sorting the input array in-place.

An example of using the original array as a hash table is the [First Missing Positive](https://leetcode.com/problems/first-missing-positive/) question. After the first for loop, all the values in the array are positive, and you can indicate presence of a number by negating the value at the index corresponding to the number. To indicate 4 is present, negate `nums[4]`.

##### 2. Change a data structure

Data structures again!? Yes, data structures again! Data structures are so fundamental to coding interviews and mastery of it makes or breaks your interview performance. Are you using the best data structure possible for the problem?

##### Example

You're given a list of strings and want to find how many of these strings start with a certain prefix. What's an efficient way to store the strings so that you can compute your answer quickly? A [Trie](https://leetcode.com/problems/implement-trie-prefix-tree/) is a tree-like data structure that is very efficient for storing strings and also allows you to quickly compute how many strings start with a prefix.

### Next Steps

If you haven't already, I recommend you check out my [free structured guide for coding interviews](https://www.techinterviewhandbook.org/software-engineering-interview-guide/), which contains step by step guidance such as:

- [How to make an efficient plan for your coding interview preparation](https://www.techinterviewhandbook.org/coding-interview-study-plan/) - including priority of topics and questions to study, based on the time you have left
- [Coding interview best practices cheatsheet](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/) - including how to behave during a coding interview to exhibit hire signals
- [Algorithms cheatsheets](https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/) - including the must-remembers that you should internalize for every data structure

## Coding Interview Cheatsheet

> **Source:** [Coding Interview Cheatsheet](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

As coding interviews mature over the years, there are now firmer expectations on how candidates should behave during a coding interview. Some of these practices also help you to exhibit "hire" signals to the interviewer by displaying your ability to communicate well and deal with roadblocks.

Deriving the best practices from top candidates and also based on [how you will be evaluated during a coding interview](https://www.techinterviewhandbook.org/coding-interview-rubrics/), we have summarized some of the top tips for how to behave during a coding interview in an exhaustive checklist - including top mistakes to avoid.

You should read and familiarize with this guide even before you start practicing your coding interview questions. Accompanying LeetCode grinding with this guide will allow you to ingrain these important coding interview behaviors early on.

### What to do _before_ your coding interview

- ✅ Dress comfortably.
  > Usually you do not need to wear smart clothes, casual should be fine. T-shirts and jeans are acceptable at most places.
- ✅ Ensure you have read and prepared for your [self introduction](https://www.techinterviewhandbook.org/self-introduction/) and [final questions to ask](https://www.techinterviewhandbook.org/final-questions/).

#### For virtual onsite coding interviews

<div className="text--center margin-vert--lg">
  <figure>
    <img alt="Summary of what to do before a virtual onsite coding interview"
    title="Summary of what to do before a virtual onsite coding interview" className="shadow--md" src={require('@site/static/img/what-to-do-before-a-virtual-onsite-coding-interview.jpg').default} style={{maxWidth: 'min(100%, 420px)'}} />
    <figcaption>What to do before a virtual onsite coding interview</figcaption>
  </figure>
</div>

- ✅ Prepare pen and paper.
  > In case you need to jot and visualize stuff. Drawings are especially helpful for trees / graphs questions
- ✅ Use earphones or headphones and make sure you are in a quiet environment.
  > Avoid using speakers because if the echo is loud, communication is harder and participants repeating themselves will just result in loss of valuable time.
- ✅ Check that your internet connection is working.
- ✅ Check that your webcam and audio are working.
- ✅ Familiarize and set up shortcuts in the coding environment (CoderPad / CodePen).
  > Set up the editor shortcuts, turn on autocompletion, tab spacing, etc. Interviewers are impressed if you know the shortcuts and use them well
- ✅ Turn off the webcam if possible.
  > Most remote interviews will not require video chat and leaving it on only serves as a distraction and hogs network bandwidth.

#### For phone screen coding interviews

<div className="text--center margin-vert--lg">
  <figure>
    <img alt="Summary of what to do before a phone screen coding interview"
    title="Summary of what to do before a phone screen coding interview" className="shadow--md" src={require('@site/static/img/what-to-do-before-a-phone-screen-coding-interview.jpg').default} style={{maxWidth: 'min(100%, 420px)'}} />
    <figcaption>What to do before a phone screen coding interview</figcaption>
  </figure>
</div>

- ✅ Use earphones and put the phone on the table.
  > Avoid holding a phone in one hand and only having one other hand to type
- ✅ Request for the option to use Zoom/Google Meet/Hangouts or Skype instead of a phone call.
  > It is easier to send links or text across.

#### For onsite whiteboarding coding interviews

- ✅ Learn about whiteboard space management.
  > Leave space between lines of code in case you need to insert lines between existing code.

### What to do _during_ your coding interview

<div className="text--center margin-vert--lg">
  <figure>
    <img alt="Summary of what to do during a coding interview"
    title="Summary of what to do during a coding interview" className="shadow--md" src={require('@site/static/img/what-to-do-during-a-coding-interview.jpg').default} style={{maxWidth: 'min(100%, 420px)'}} />
    <figcaption>What to do during a coding interview</figcaption>
  </figure>
</div>

#### 1. Make a good self introduction at the start of the interview

- ✅ Introduce yourself in a few sentences under a minute or 2.
  > Follow our guide on how to make a good self introduction for software engineers
- ✅ Sound enthusiastic!
  > Speak with a smile and you will naturally sound more engaging.
- ❌ Do not spend too long on your self introduction as you will have less time left to code.

#### 2. Upon receiving the question, make clarifications

**Do not jump into coding right away.** Coding questions tend to be vague and underspecified on purpose to allow the interviewer to gauge the candidate's attention to detail and carefulness. Ask at least 2-3 clarifying questions.

- ✅ Paraphrase and repeat the question back at the interviewer.
  > Make sure you understand exactly what they are asking.
- ✅ Clarify assumptions (Refer to [algorithms cheatsheets](https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/) for common assumptions)
  - > A tree-like diagram could very well be a graph that allows for cycles and a naive recursive solution would not work. Clarify if the given diagram is a tree or a graph.
  - > Can you modify the original array / graph / data structure in any way?
  - > How is the input stored?
  - > If you are given a dictionary of words, is it a list of strings or a Trie?
  - > Is the input array sorted? (e.g. for deciding between binary / linear search)
- ✅ Clarify input value range.
  > Inputs: how big and what is the range?
- ✅ Clarify input value format
  > Values: Negative? Floating points? Empty? Null? Duplicates? Extremely large?
- ✅ Work through a simplified example to ensure you understood the question.
  > E.g., you are asked to write a palindrome checker, before coding, come up with simple test cases like "KAYAK" => true, "MOUSE" => false, then check with the interviewer if those example cases are in line with their expectations
- ❌ Do not jump into coding right away or before the interviewer gives you the green light to do so.

#### 3. Work out and optimize your approach with the interviewer

The worst thing you can do next is jump straight to coding - interviewers expect there to be some time for a 2-way discussion on the correct approach to take for the question, including analysis of the time and space complexity.

This discussion can range from a few minutes to up to 5-10 minutes depending on the complexity of the question. This also gives interviewers a chance to provide you with hints to guide you toward an acceptable solution.

- ✅ If you get stuck on the approach or optimization, use [this structured way](https://www.techinterviewhandbook.org/coding-interview-techniques/) to jog your memory / find a good approach
- ✅ Explain a few approaches that you could take at a high level (don't go too much into implementation details). Discuss the tradeoffs of each approach with your interviewer as if the interviewer was your coworker and you all are collaborating on a problem.

  > For algorithmic questions, space/time is a common tradeoff. Let's take the famous [Two Sum](https://leetcode.com/problems/two-sum/) question for example. There are two common solutions
  >
  > 1. Use nested for loops. This would be O(n<sup>2</sup>) in terms of time complexity and O(1) in terms of space.
  > 2. In one pass of the array, you would hash a value to its index into a hash table. For subsequent values, look up the hash table to see if you can find an existing value that can sum up to the target. This approach is O(N) in terms of both time and space. Discuss both solutions, mention the tradeoffs and conclude on which solution is better (typically the one with lower time complexity)

- ✅ State and explain the time and space complexity of your proposed approach(es).
  > Mention the Big O complexity for time and explain why (e.g O(n<sup>2</sup>) for time because there are nested for loops, O(n) for space because an extra array is created). Master all the time and space complexity using the [algorithm optimization techniques](https://www.techinterviewhandbook.org/coding-interview-techniques/#how-to-optimize-your-approach-or-solution).
- ✅ Agree on the most ideal approach and optimize it. Identify repeated/duplicated/overlapping computations and reduce them via caching. Refer to the page on [optimizing your solution](https://www.techinterviewhandbook.org/coding-interview-techniques/#how-to-optimize-your-approach-or-solution).
- ❌ Do not jump into coding right away or before the interviewer gives you the green light to do so.
- ❌ Do not ignore any piece of information given.
- ❌ Do not appear unsure about your approach or analysis.

#### 4. Code out your solution while talking through it

- ✅ Only start coding after you have explained your approach and the interviewer has given you the green light.
- ✅ Explain what you are trying to achieve as you are coding / writing. Compare different coding approaches where relevant.
  > In so doing, demonstrate mastery of your chosen programming language.
- ✅ Code / write at a reasonable speed so you can talk through it - but not too slow.
  > You want to type slow enough so you can explain the code, but not too slow as you may run out of time to answer all questions
- ✅ Write actual compilable, working code where possible, not pseudocode.
- ✅ Write clean, straightforward and neat code with as few syntax errors / bugs as possible.
  > Always go for a clean, straightforward implementation than a complex, messy one. Ensure you adopt a neat coding style and good coding practices as per language paradigms and constructs. Syntax errors and bugs should be avoided as much as possible.
- ✅ Use variable names that explain your code.
  > Good variable names are important because you need to explain your code to the interviewer. It's better to use long variable names that explain themselves. Let's say you need to find the multiples of 3 in an array of numbers. Name your results array `multiplesOfThree` instead of array/numbers.
- ✅ Ask for permission to use trivial functions without having to implement them.
  > E.g. `reduce`, `filter`, `min`, `max` should all be ok to use
- ✅ Write in a modular fashion, going from higher-level functions and breaking them down into smaller helper functions.
  > Let's say you're asked to build a car. You can just write a few high level functions first: `gatherMaterials()`, `assemble()`. Then break down `assemble()` into smaller functions, `makeEngine()`, `polishWheels()`, `constructCarFrame()`. You could even ask the interviewer if it's ok to not code out some trivial helper functions.
- ✅ If you are cutting corners in your code, state that out loud to your interviewer and say what you would do in a non-interview setting (no time constraints).
  > E.g., "Under non-interview settings, I would write a regex to parse this string rather than using `split()` which may not cover certain edge cases."
- ✅ [Onsite / Whiteboarding] Practice whiteboard space management
- ❌ Do not interrupt your interviewer when they are talking. Usually if they speak, they are trying to give you hints or steer you in the right direction.
- ❌ Do not spend too much time writing comments.
- ❌ Do not repeat yourself
- ❌ Do not use bad variable names.
  - Do not use extremely verbose or single-character variable names, (unless they're common like `i`, `n`) variable names
- ❌ Do not copy and paste code without checking (e.g. some variables might need to be renamed after pasting).

#### 5. After coding, check your code and add test cases

Once you are done coding, do not announce that you are done. Interviewers expect you to start scanning for mistakes and adding test cases to improve on your code.

- ✅ Scan through your code for mistakes - such as off-by-one errors.
  > Read through your code with a fresh pair of eyes - as if it's your first time seeing a piece of code written by someone else - and talk through your process of finding mistakes
- ✅ Brainstorm edge cases with the interviewer and add additional test cases. (Refer to [algorithms cheatsheets](https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/) for common corner cases)
  > Given test cases are usually simple by design. Brainstorm on possible edge cases such as large sized inputs, empty sets, single item sets, negative numbers.
- ✅ Step through your code with those test cases.
- ✅ Look out for places where you can refactor.
- ✅ Reiterate the time and space complexity of your code.
  > This allows you to remind yourself to spot issues within your code that could deviate from the original time and space complexity.
- ✅ Explain trade-offs and how the code / approach can be improved if given more time.
- ❌ Do not immediately announce that you are done coding. Do the above first!
- ❌ Do not argue with the interviewer. They may be wrong but that is very unlikely given that they are familiar with the question.

#### 6. At the end of the interview, leave a good impression

- ✅ Ask good final questions that are tailored to the company.
  > Read tips and [sample final questions to ask](https://www.techinterviewhandbook.org/final-questions/).
- ✅ Thank the interviewer
- ❌ Do not end the interview without asking any questions.

### What to do _after_ your coding interview

<div className="text--center margin-vert--lg">
  <figure>
    <img alt="Summary of what to do after a coding interview"
    title="Summary of what to do after a coding interview" className="shadow--md" src={require('@site/static/img/what-to-do-after-a-coding-interview.jpg').default} style={{maxWidth: 'min(100%, 420px)'}} />
    <figcaption>What to do after a coding interview</figcaption>
  </figure>
</div>

- ✅ Record the interview questions and answers down as these can be useful for future reference.
- ✅ Send a follow up email or Linkedin invitation to your interviewer(s) thanking them for their time and the opportunity to interview with them.
  > As an interviewer myself, these can leave a lasting impression on me.

## Coding interview rubrics

> **Source:** [Coding interview rubrics](https://www.techinterviewhandbook.org/coding-interview-rubrics/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

Ever wondered how coding interviews are evaluated at top tech companies like Google, Amazon, Apple and Netflix?

Across top tech companies, coding interview evaluation criteria actually does not differ to a great extent. While the exact terms used in the rubric could be different, the dimensions evaluated are roughly similar.

I will go into detail on the general coding interview evaluation process across big tech companies in this guide. I've also included an [example rubric](https://www.techinterviewhandbook.org/coding-interview-rubrics/) you can use while practicing on your own or with your peers.

If you haven't done so already, do refer to my [Coding interview best practices cheatsheet](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/) which basically synthesizes what candidates should do to fulfill the evaluated criteria in coding interviews.

### Candidate scoring methodology

Generally across FAANG / MANGA companies, coding interview evaluation rubrics can be split broadly into 4 dimensions:

1. Communication - Does the candidate make clarifications, communicate their approach and explain while coding?
1. Problem Solving - Does the candidate show they understand the problem and are able to come up with a sound approach, conduct trade-offs analysis and optimize their approach?
1. Technical Competency - How fast and accurate is the implementation? Were there syntax errors?
1. Testing - Was the code tested for common and corner cases? Did they self-correct bugs?

There are 2 general methods of candidate scoring in coding interviews:

1. Provide a score (e.g. 1-4) for every dimension and sum them up into an overall score
1. Provide an overall score (e.g. 1-4) based on overall performance across dimensions

Regardless of the method used, the scoring bands are generally:

- Strong hire
- Hire
- No hire
- Strong no hire

Some companies may have a middle band for indecision when the interviewer feels that the candidate requires more assessment.

### How does your score impact the result?

Regardless of the scoring methodology, the final score is based on the overall performance across evaluated criteria (not purely through a certain mathematical cut-off).

For each phone screen round, there's typically only 1 interviewer, hence if they don't give you a "pass" equivalent to "Leaning hire" and above, you would not proceed to the full interview loop. If there were no clear signals obtained from the round, you might be asked to do a follow up phone screen round.

Most top tech companies allow candidates to go through every interview round in the full interview loop before making a decision based on the final package. If a candidate receives mixed results (some "pass" and some "fail") from different rounds, interviewers will convene for a discussion based on the signals you displayed. This is why your performance throughout the interview loop is important.

In certain cases, like follow up phone screen rounds, candidates may be invited for additional assessment rounds if:

- There were aspects that were missed out in the assessment e.g. 2 coding round interviewers gave very similar questions
- Candidate displayed mixed signals in particular areas and additional rounds are required to obtain more reliable signals

Generally, your scores and feedback for each round are visible to all interviewers. Sometimes, interviewers can even see feedback from your interviews at the same company in the past to avoid asking the same question again. Companies want to see that you have grown as compared to the past. So if you got rejected in the past by a company, reflect on possible reasons and address them if/when you interview with that company again.

### Detailed explanation of each evaluated criteria

#### 1. Communication

Basic communication signals:

- Asks appropriate clarifying questions
- Communicates approach, rationale and tradeoffs
- Constantly communicating, even while coding
- Well organized, succinct, clear communication

| Score | Overall evaluation |
| --- | --- |
| Strong hire | Throughout the interview, communication was thorough, well-organized, succinct and clear in terms of thought process - including how they understand the question, their approach, trade-offs.<br/>Interviewer had no challenge following and understanding the candidate's thought process at all. |
| Leaning hire | Throughout the interview, communication was sufficient, clear and organized.<br/>However, the interviewer had to ask follow-up questions to understand the candidate on certain aspects such as their approach or thought process. |
| Leaning no hire | Throughout the interview, communication was (1 or more of the following): (1) Insufficient (e.g. jumped into coding without explaining), (2) Disorganized or unclear<br/>Interviewer had difficulty following the candidate's thought process. |
| Strong no hire | Could not communicate with any clarity or stayed silent even when addressed by the interviewer.<br/>Interviewer had extreme difficulty following the candidate's thought process. |

#### 2. Problem solving

Basic problem solving signals:

- Understands the problem quickly by asking good clarifying questions
- Approached the problem systematically and logically
- Was able to come up with an optimized solution
- Determined time and space complexity accurately
- Did not require any major hints from the interviewer

Advanced problem solving signals:

- Came up with multiple solutions
- Explained trade-offs of each solution clearly and correctly, concluded on which of them are most suitable for the current scenario
- Had time to discuss follow up problems/extensions

| Score | Overall evaluation |
| --- | --- |
| Strong hire | No trouble achieving all basic problem solving signals and did so with enough time to achieve most advanced problem solving signals. |
| Leaning hire | Managed to achieve all basic problem solving signals but did not have sufficient time to achieve advanced problem solving signals. |
| Leaning no hire | Showed only some basic problem solving signals, failing to achieve the rest. |
| Strong no hire | Unable to solve the problem or did it without much explanation of their thought process. Approach was disorganized and incorrect. |

#### 3. Technical competency

Basic technical competency signals:

- Translates discussed solution into working code with minimal to no bugs
- Clean and straightforward implementation with no syntax errors and unnecessary code, good coding practices e.g. DRY (Don't repeat yourself), uses proper abstractions
- Neat coding style (proper indentation, spacing, variable naming, etc)

Advanced technical competency signals:

- Compares several coding approaches
- Demonstrates strong knowledge of language constructs and paradigms

| Score | Overall evaluation |
| --- | --- |
| Strong hire | Demonstrated basic and advanced competency signals effortlessly. |
| Leaning hire | Demonstrated only basic technical competency signals, with some difficulty seen in translating approach to code. Suboptimal usage of language paradigms. |
| Leaning no hire | Struggled to produce a working solution in code. Multiple syntax errors and bad use of language paradigms. |
| Strong no hire | Could not produce a working solution in code. Major syntax errors and very bad use of language paradigms. |

#### 4. Testing

Testing signals:

- Came up with more typical cases and tested their code against it
- Found and handled corner cases
- Identified and self-corrected bugs in code
- Able to verify correctness of the code in a systematic manner (e.g. acting like a debugger and stepping through each line, updating the program's state at each step)

| Score | Overall evaluation |
| --- | --- |
| Strong hire | Demonstrated testing signals effortlessly. |
| Leaning hire | Had some difficulty demonstrating testing signals, such as not being able to identify all the relevant corner cases. |
| Leaning no hire | Conducted testing but did not handle corner cases. Not able to identify or correct bugs in code. |
| Strong no hire | Did not even test code against typical cases. Did not spot glaring bugs in the code and announced they are done. |

<div className="text--center margin-vert--lg">
  <figure>
    <img alt="Coding interview evaluation rubric for software engineers"
    title="Coding interview evaluation rubric for software engineers" className="shadow--md" src={require('@site/static/img/coding-interview-rubric-software-engineer.jpg').default} style={{maxWidth: 'min(100%, 500px)'}} />
    <figcaption>Sample coding interview evaluation rubric, for practice</figcaption>
  </figure>
</div>

## Best practice questions

> **Source:** [Best practice questions](https://www.techinterviewhandbook.org/best-practice-questions/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

> **As Of April 2022, I'Ve Developed A [12-Week Study Plan](https://www.techinterviewhandbook.org/Coding-Interview-Study-Plan.Md/) Which Includes A Curriculum For Revision And Practice Questions. If You Want To Customize Your Own Practice Questions, I'Ve Also Developed [Grind 75](https://www.techinterviewhandbook.org/Https:/Www.Techinterviewhandbook.Org/Grind75/) Which Is A Modern Version Of Blind 75 That You Can Customize.:**

> **There, The Author Of Blind 75 Here 👋!:**

Practicing is the best way to prepare for coding interviews. LeetCode has over a thousand questions. Which should you practice? Hence years ago, I curated a list of the most important 75 questions on [LeetCode](https://leetcode.com). Many other LeetCode questions are a mash of the techniques from these individual questions. I used this list in my last job hunt to only do the important questions.

I [shared this list on Blind](https://www.teamblind.com/post/New-Year-Gift---Curated-List-of-Top-100-LeetCode-Questions-to-Save-Your-Time-OaM1orEU) by extracting the questions from [my freeCodeCamp article](https://www.freecodecamp.org/news/coding-interviews-for-dummies-5e048933b82b/) to save peoples' time when revising and someone reposted this list on [the LeetCode forum](https://leetcode.com/discuss/post/460599/blind-75-leetcode-questions-by-krishnade-9xev/). It somehow blew up and became super famous in the coding interview scene, people even gave it a name - **Blind 75**. The Blind 75 questions as a LeetCode list can be found [here](https://leetcode.com/list/xi4ci4ig/).

Years later, I further distilled the list down into only 50 questions and spread them across a 5-week schedule. Here is the suggested schedule for revising and practicing algorithm questions on LeetCode. Sign up for an account if you don't already have one, it's critical to your success in interviewing!

When practicing, you are advised to treat it like a real coding interview and check through thoroughly before submitting. Consider even manually coming up with some test cases and running through them to verify correctness!

I've created a [LeetCode list](https://leetcode.com/list/9h4lgwl2) for the following questions (except the Premium ones). Feel free to use it to track your practice progress.

> **Expert Tip:**

If you're running low on time, [AlgoMonster](https://shareasale.com/r.cfm?b=1873647&u=3114753&m=114505&urllink=&afftrack=) aims to help you ace the technical interview **in the shortest time possible**. By Google engineers, [AlgoMonster](https://shareasale.com/r.cfm?b=1873647&u=3114753&m=114505&urllink=&afftrack=) uses a data-driven approach to teach you most useful key question patterns and has contents to help you quickly revise basic data structures and algorithms. **Learn and understand patterns, not memorize answers!**

### Week 1 - Sequences

In week 1, we will warm up by doing a mix of easy and medium questions on arrays and strings. Arrays and strings are the most common types of questions to be found in interviews; gaining familiarity with them will help in building strong fundamentals to better handle tougher questions.

| Question | Difficulty | LeetCode |
| :-- | --- | --- |
| Two Sum | Easy | [Link](https://leetcode.com/problems/two-sum/) |
| Contains Duplicate | Easy | [Link](https://leetcode.com/problems/contains-duplicate/) |
| Best Time to Buy and Sell Stock | Easy | [Link](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) |
| Valid Anagram | Easy | [Link](https://leetcode.com/problems/valid-anagram/) |
| Valid Parentheses | Easy | [Link](https://leetcode.com/problems/valid-parentheses/) |
| Maximum Subarray | Easy | [Link](https://leetcode.com/problems/maximum-subarray/) |
| Product of Array Except Self | Medium | [Link](https://leetcode.com/problems/product-of-array-except-self/) |
| 3Sum | Medium | [Link](https://leetcode.com/problems/3sum/) |
| Merge Intervals | Medium | [Link](https://leetcode.com/problems/merge-intervals/) |
| Group Anagrams | Medium | [Link](https://leetcode.com/problems/group-anagrams/) |

##### Optional

| Question | Difficulty | LeetCode |
| :-- | --- | --- |
| Maximum Product Subarray | Medium | [Link](https://leetcode.com/problems/maximum-product-subarray/) |
| Search in Rotated Sorted Array | Medium | [Link](https://leetcode.com/problems/search-in-rotated-sorted-array/) |

### Week 2 - Data structures

The focus of week 2 is on linked lists, strings and matrix-based questions. The goal is to learn the common routines dealing with linked lists, traversing matrices and sequence analysis (arrays/strings) techniques such as sliding window, linked list traversal and matrix traversal.

| Question | Difficulty | LeetCode |
| :-- | --- | --- |
| Reverse a Linked List | Easy | [Link](https://leetcode.com/problems/reverse-linked-list/) |
| Detect Cycle in a Linked List | Easy | [Link](https://leetcode.com/problems/linked-list-cycle/) |
| Container With Most Water | Medium | [Link](https://leetcode.com/problems/container-with-most-water/) |
| Find Minimum in Rotated Sorted Array | Medium | [Link](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) |
| Longest Repeating Character Replacement | Medium | [Link](https://leetcode.com/problems/longest-repeating-character-replacement/) |
| Longest Substring Without Repeating Characters | Medium | [Link](https://leetcode.com/problems/longest-substring-without-repeating-characters/) |
| Number of Islands | Medium | [Link](https://leetcode.com/problems/number-of-islands/) |
| Remove Nth Node From End Of List | Medium | [Link](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) |
| Palindromic Substrings | Medium | [Link](https://leetcode.com/problems/palindromic-substrings/) |
| Pacific Atlantic Water Flow | Medium | [Link](https://leetcode.com/problems/pacific-atlantic-water-flow/) |
| Minimum Window Substring | Hard | [Link](https://leetcode.com/problems/minimum-window-substring/) |

### Week 3 - Non-linear data structures

The focus of week 3 is on non-linear data structures like trees, graphs and heaps. You should be familiar with the various tree traversal (in-order, pre-order, post-order) algorithms and graph traversal algorithms such as breadth-first search and depth-first search. In my experience, using more advanced graph algorithms (Dijkstra's and Floyd-Warshall) is quite rare and usually not necessary.

| Question | Difficulty | LeetCode |
| :-- | --- | --- |
| Invert/Flip Binary Tree | Easy | [Link](https://leetcode.com/problems/invert-binary-tree/) |
| Validate Binary Search Tree | Medium | [Link](https://leetcode.com/problems/validate-binary-search-tree/) |
| Non-overlapping Intervals | Medium | [Link](https://leetcode.com/problems/non-overlapping-intervals/) |
| Construct Binary Tree from Preorder and Inorder Traversal | Medium | [Link](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) |
| Top K Frequent Elements | Medium | [Link](https://leetcode.com/problems/top-k-frequent-elements/) |
| Clone Graph | Medium | [Link](https://leetcode.com/problems/clone-graph/) |
| Course Schedule | Medium | [Link](https://leetcode.com/problems/course-schedule/) |
| Serialize and Deserialize Binary Tree | Hard | [Link](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) |
| Binary Tree Maximum Path Sum | Hard | [Link](https://leetcode.com/problems/binary-tree-maximum-path-sum/) |

##### Optional

| Question | Difficulty | LeetCode |
| :-- | --- | --- |
| Maximum Depth of Binary Tree | Easy | [Link](https://leetcode.com/problems/maximum-depth-of-binary-tree/) |
| Same Tree | Easy | [Link](https://leetcode.com/problems/same-tree/) |
| Binary Tree Level Order Traversal | Medium | [Link](https://leetcode.com/problems/binary-tree-level-order-traversal/) |
| Encode and Decode Strings | Medium | [Link](https://leetcode.com/problems/encode-and-decode-strings/) (Premium) |

### Week 4 - More data structures

Week 4 builds up on knowledge from previous weeks but questions are of increased difficulty. Expect to see such level of questions during interviews. You get more practice on more advanced data structures such as (but not exclusively limited to) heaps and tries which are less common but are still asked.

| Question | Difficulty | LeetCode |
| :-- | --- | --- |
| Subtree of Another Tree | Easy | [Link](https://leetcode.com/problems/subtree-of-another-tree/) |
| Lowest Common Ancestor of BST | Medium | [Link](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/) |
| Implement Trie (Prefix Tree) | Medium | [Link](https://leetcode.com/problems/implement-trie-prefix-tree/) |
| Add and Search Word | Medium | [Link](https://leetcode.com/problems/design-add-and-search-words-data-structure/) |
| Kth Smallest Element in a BST | Medium | [Link](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) |
| Merge K Sorted Lists | Hard | [Link](https://leetcode.com/problems/merge-k-sorted-lists/) |
| Find Median from Data Stream | Hard | [Link](https://leetcode.com/problems/find-median-from-data-stream/) |
| Insert Interval | Medium | [Link](https://leetcode.com/problems/insert-interval/) |
| Longest Consecutive Sequence | Medium | [Link](https://leetcode.com/problems/longest-consecutive-sequence/) |
| Word Search II | Hard | [Link](https://leetcode.com/problems/word-search-ii/) |

##### Optional

| Question | Difficulty | LeetCode |
| :-- | --- | --- |
| Meeting Rooms | Easy | [Link](https://leetcode.com/problems/meeting-rooms/) (Premium) |
| Meeting Rooms II | Medium | [Link](https://leetcode.com/problems/meeting-rooms-ii/) (Premium) |
| Graph Valid Tree | Medium | [Link](https://leetcode.com/problems/graph-valid-tree/) (Premium) |
| Number of Connected Components in an Undirected Graph | Medium | [Link](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/) (Premium) |
| Alien Dictionary | Hard | [Link](https://leetcode.com/problems/alien-dictionary/) (Premium) |

### Week 5 - Dynamic programming

Week 5 focuses on Dynamic Programming (DP) questions. Personally as an interviewer, I'm not a fan of DP questions as they are not really applicable to practical scenarios and frankly if I were made to do the tough DP questions during my interviews I'd not have gotten the job. However, companies like Google still ask DP questions and if joining Google is your dream, DP is unavoidable.

DP questions can be hard to master and the best way to get better at them is... you guessed it - practice! Be familiar with the concepts of memoization and backtracking.

Practically speaking the return of investment (ROI) on studying and practicing for DP questions is very low. Hence DP questions are less important/optional and you should only do them if you have time to spare and you're very keen to have all bases covered (and interviewing with Google).

| Question | Difficulty | LeetCode |
| :-- | --- | --- |
| Climbing Stairs | Easy | [Link](https://leetcode.com/problems/climbing-stairs/) |
| Coin Change | Medium | [Link](https://leetcode.com/problems/coin-change/) |
| Longest Increasing Subsequence | Medium | [Link](https://leetcode.com/problems/longest-increasing-subsequence/) |
| Combination Sum | Medium | [Link](https://leetcode.com/problems/combination-sum-iv/) |
| House Robber | Medium | [Link](https://leetcode.com/problems/house-robber/) |
| House Robber II | Medium | [Link](https://leetcode.com/problems/house-robber-ii/) |
| Decode Ways | Medium | [Link](https://leetcode.com/problems/decode-ways/) |
| Unique Paths | Medium | [Link](https://leetcode.com/problems/unique-paths/) |
| Jump Game | Medium | [Link](https://leetcode.com/problems/jump-game/) |
| Word Break | Medium | [Link](https://leetcode.com/problems/word-break/) |

##### Dynamic programming course

- [Grokking the Dynamic Programming Patterns for Coding Interviews](https://www.designgurus.io/course/grokking-dynamic-programming?aff=kJSIoU)

### Quality courses

If you want more structured algorithms practice, I recommend the following courses:

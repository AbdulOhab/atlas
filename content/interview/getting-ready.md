---
title: "Getting Ready"
order: 1
summary: "How software engineering interviews work and how to prepare: the overall process, choosing a language, a study plan, company formats and mock interviews."
category: "Interview Prep"
level: Beginner
---

# Getting Ready

How software engineering interviews work and how to prepare: the overall process, choosing a language, a study plan, company formats and mock interviews.

## SWE interviews: What are they and how to prepare

> **Source:** [SWE interviews: What are they and how to prepare](https://www.techinterviewhandbook.org/software-engineering-interview-guide/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

Nobody has time to grind hundreds of LeetCode questions, and the good news is that you don't need to do that many to actually get the job at FAANG!

I was frustrated at my job at Grab, a ridesharing company in South-east Asia and wanted to break into FAANG but I wasn't sure how to. After a few months of research, studying and practicing, I interviewed at 11 companies and managed to get 9 offers from top tech companies in the Bay Area - Facebook, Google, Airbnb, Palantir, Dropbox, Lyft, and some startups. It was a tedious process which I don't ever want to go through again. **I went through that process but with this guide, you don't have to.**

This guide will provide a **quick overview of the top tips on how to prepare for a software engineer interview** - both technical and non-technical interview rounds. Where relevant, you can delve into greater detail by accessing links in this overview article, or through the website's left sidebar.

How to prepare for your software engineering interview:

1. Maximize your chances of being shortlisted
1. Find out the interview format
1. Pick a programming language
1. Sharpen your Computer Science fundamentals for interviews
1. Practice for the coding interview
1. Prepare for the system design interview (for mid/senior levels)
1. Prepare for the behavioral interview
1. Negotiating the offer package

### Maximize your chances of being shortlisted

Do you still have trouble getting shortlisted at some or all of the top tech companies? Your resume could be the issue.

Your resume is the single most important entry point to getting shortlisted in major tech companies like FAANG / MANGA. After getting shortlisted, your past achievements become markedly less important as compared to your coding interview skills - which as we know, can be methodically learned. Being able to frame your past achievements well enough to get through the screening stage is hence very important.

Unfortunately, even the most qualified candidates I know personally don't know how to write a good resume and fail to get shortlisted. The truth is that when many of us don't get shortlisted at top tech companies like FAANG / MANGA, we tend to think that we were under-qualified - but in most cases, it's probably just the lack of good framing.

If you want to learn how to write a good software engineer resume, I've written a [step-by-step guide here on software engineering resume preparation](https://www.techinterviewhandbook.org/resume/) for companies like Google, Facebook, Amazon, Netflix, Apple, with examples for your reference as well.

### Find out the interview format

You may encounter various interview formats in your software engineer interviews (from early to late stage):

#### 1. Quiz

Frequency: Occasional

Quizzes are meant to be a first-pass filter as a quick and dirty way of weeding out extremely weak (or even non-technical) candidates. They are structured questions and have clear-cut answers which makes them possible to be administered by recruiters/non-technical folks or automated graders. They are typically done early in the process.

Examples:

- What is 4 & 5 (in binary)? Answer: 4
- What is the time complexity of bubble sort? Answer: O(n<sup>2</sup>)

#### 2. Online coding assessment

Frequency: Occasional

Like quizzes, online coding assessments are usually given early in the process. An algorithm problem is given with well-formed input and output and candidates are expected to write code in an online coding interface to solve the problem. [HackerRank](https://www.hackerrank.com) is a very common platform for conducting online coding assessments. LeetCode would be a good way to practice for the problem solving aspects of online coding assessments. However, in HackerRank you are typically expected to write code to read from stdin and also print to stdout, which can trip candidates up if they aren't familiar with the APIs.

#### 3. Take home assignment

Frequency: Rare

There have been numerous debates on whether asking algorithm questions are a good way of assessing individual abilities as they aren't exactly the most relevant skills needed on a day-to-day basis at a job. Take home assignment is a format designed to address the shortcomings of the algorithm interview by getting candidates to work on larger projects which allow them to demonstrate software design skills.

However, this interview format takes up more time from both the candidates and the company and hence it is not as commonly seen in large companies where they have a high volume of candidates. This format is more common among startups and small companies. Examples

- Build a flights listing app
- Build a kanban app
- Build a snake game

#### 4. Phone screen interviews

Frequency: Common

Phone interviews are the most common format and every candidate will face this at least once while interviewing. You will be asked to speak with an interviewer either by phone or via a video meeting tool such as Microsoft Teams, Google Meet, or Zoom. A question will be given to you and you will work on that question using an online collaborative editor (CoderPad/CodePen/Google Docs).

You are usually not allowed to execute the code even if the editor supports execution. So don't rely on that for verifying the correctness of your solution. Formats would differ slightly depending on the roles you are applying to. Many companies like to use [CoderPad](https://coderpad.io) for collaborative code editing. CoderPad supports running of the program, so it is possible that you will be asked to fix your code such that it can be run. For front end interviews, many companies like to use [CodePen](https://codepen.io), and it will be worth your time to familiarize yourself with the user interfaces of such web-based coding environments.

Check out [coding interview best practices](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/) as well for do's and don'ts before your phone screen interviews.

#### 5. Onsite

Frequency: Almost always

If you have made it to this stage, congratulations! This is usually the final stage before an offer decision. Candidates who made it to the onsite stage will be required to have an in-person interview at the office. If you are an overseas candidate, companies might even fly you in and pay for your accommodations!

The onsite stage usually consists of multiple rounds (coding, system design, behavioral) and is expected to last for a few hours. Since you are onsite, it is possible that you will be asked to do a whiteboard exercise with an interviewer, usually either solving an algorithm question or a system design question. It is also possible that you have to bring your own laptop and work on a project/solve a coding problem on the spot.

For onsite interviews at smaller (non-public) companies, most will allow (and prefer) that you use your own laptop. Hence it is important that you prepare your development environment in advance.

If the company provides lunch, you might also have a lunch session with an employee where you can find out more about the company culture.

### Pick a programming language

With your resume done, the next step of your software engineering interview journey is a simple one and won't take long - decide on a programming language. Unless you're interviewing for a specialist position like mobile or front end where there are domain-specific languages, you should be free to use any language you want for the algorithmic coding interviews.

Most of the time, you'd already have one in mind - pick the one you use the most and you're the most comfortable with. The most common programming languages used for coding interviews are Python, Java, C++, and JavaScript. I wouldn't recommend learning an entirely new language just for coding interviews as it takes a while (few weeks at least on average) to become proficient enough in a language to wield it comfortably in an interview setting, which is already stressful enough on its own. My personal programming language of choice is Python because of how terse it is and the functions/data structures the standard library provides.

Read more on programming languages for coding interviews: [Picking a programming language](https://www.techinterviewhandbook.org/programming-languages-for-coding-interviews/)

<!--
References (omit when publishing)
https://startupnextdoor.com/important-pick-one-language-for-the-coding-interview/
-->

### Study and practice for coding interviews

The next and most important step is to practice solving algorithm questions in your chosen programming language. While Cracking the Coding Interview is a great resource, I prefer learning by actually solving problems.

There are many platforms that can be used for this - such as LeetCode, HackerRank and CodeForces. From my personal experience, LeetCode questions are most suitable for interview preparation whereas HackerRank and CodeForces are more for competitive programming.

However, LeetCode has thousands of questions and it can be daunting to know where to begin, or how to structure your practice. I have provided recommended preparation plans and also structured resources here:

#### Coding interview study plan

The recommended time period to set aside for coding interview preparation is 3 months (11 hours a week i.e. 2-3 hours a day) for a more holistic preparation. I shared my [3 month study plan here](https://www.techinterviewhandbook.org/coding-interview-study-plan/), which provides a list of coding interview topics with resources and practice questions that you should work through in order of priority every week. I will also be adding content on recommended 1 month and 1 week study plans soon.

If you have less than 3 months to prepare, you can generate your own study plans using the [Grind 75 tool](https://www.techinterviewhandbook.org/grind75/) (built by me) which generates recommended study plans for coding interviews based on the time you have left. The algorithm behind it includes a ranking of questions by priority and also a balance between breadth and depth of topics covered.

#### Resources to use in your practice

In the market, there are plenty of resources vying for your attention, plenty of them just vying for your money but not providing any value. If I had to prioritize - these are the top coding interview preparation resources I would use in tandem:

1. [Grokking the Coding Interview: Patterns for Coding Questions](https://www.designgurus.io/course/grokking-the-coding-interview?aff=kJSIoU)
1. [AlgoMonster](https://shareasale.com/r.cfm?b=1873647&u=3114753&m=114505&urllink=&afftrack=)
1. My (free) coding interview best practices guide
1. My (free) coding interview techniques guide
1. My (free) algorithms study guide

##### [AlgoMonster](https://shareasale.com/r.cfm?b=1873647&u=3114753&m=114505&urllink=&afftrack=)

Apart from helping you master important coding interview data structures and algorithm questions through practice and easy to understand guides, AlgoMonster has the added perk of synthesizing [common interview question patterns](https://algo.monster/problems/stats) that you could apply to solve any other questions you have never encountered before. Made by Google engineers, this is definitely a quality platform to use as compared to the unstructured nature of LeetCode grinding. Data structures and algorithms questions are covered in all the common languages - Python, Java, C#, JavaScript, C++, Golang, and more. [**Join today for a 70% discount →**](https://shareasale.com/r.cfm?b=1873647&u=3114753&m=114505&urllink=&afftrack=)

##### [Grokking the Coding Interview: Patterns for Coding Questions](https://www.designgurus.io/course/grokking-the-coding-interview?aff=kJSIoU)

This course by Design Gurus expands upon the questions on the recommended practice questions but approaches the practicing from a questions pattern perspective, which is an approach I also agree with for learning and have personally used to get better at coding interviews. The course allows you to practice selected questions in Java, Python, C++, JavaScript and also provides sample solutions in those languages along with step-by-step visualizations. **Learn and understand patterns, not memorize answers!** [**Get lifetime access today →**](https://www.designgurus.io/course/grokking-the-coding-interview?aff=kJSIoU)

##### My (free) coding interview best practices guide

If you have read the [coding interview evaluation rubric](https://www.techinterviewhandbook.org/coding-interview-rubrics/) used at top tech companies, you may be overwhelmed by the number of items evaluated and how to demonstrate hire behaviors consistently.

This [coding interview best practices guide](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/) synthesizes actionable recommendations of what to do before, during and after your coding interviews to demonstrate hire signals.

I recommend to internalize and use the guide as an accompaniment while you practice coding interview questions - to ensure that you cultivate good habits and muscle memory with regards to interviews right from the beginning.

##### My (free) coding interview techniques guide

Is there a structured method to increase your chances of finding a good solution to the coding interview question? How about optimizing your approach's time and space complexity? My coding interview techniques guide teaches you a few techniques for handling questions that you have never encountered before - such as problem visualizing, solving by hand, breaking the problem into subproblems, etc.

##### My (free) algorithms study cheatsheets

I'm not sure if these would qualify as an in-depth guide - they are more like 1-page "study cheatsheets" of the **best resources to study, best LeetCode questions to practice and the things to remember**. However, they ensure you cover all the most important grounds, especially when you have no time. Because these are also the notes that helped me clinch top tech offers - they definitely work.

For more tips on coding interview preparation, refer to my [full coding interview preparation guide](https://www.techinterviewhandbook.org/coding-interview-prep/) here.

#### Try out mock coding interviews (with Google and Facebook engineers)

Coding right in front of your interviewer can be a nerve-wracking experience especially if you have never done it before - which is why getting hands-on experience is so important.

[interviewing.io](https://iio.sh/r/DMCa) is currently the best mock technical interview resource in the market. It allows you to book mock coding interviews with real Google and Facebook engineers, albeit anonymously. You could even book interviews for specific roles like Mobile, Front End, Engineering Management. Even better - if you want to have an easier transition into real world coding interview - you could view recorded interviews and see what phone interviews are like.

Moreover, if you were to do well on your mock interviews, you will be able to unlock the "jobs page" which allows you to book interviews directly with top companies like Uber, Lyft, Quora, Asana and more. I've used [interviewing.io](https://iio.sh/r/DMCa) both as an interviewer and an interviewee and found the experience to be excellent.

### Prepare for the system design interview

If you are a mid or senior-level candidate, you may expect system design questions as part of your technical interview. They aren't covered adequately by LeetCode and good resources are still harder to come by.

The objective of system design interviews is to evaluate a candidate's skill at designing real-world software systems involving multiple components.

#### Utilize the best system design interview preparation resources

Some of the best system design interview preparation resources include:

1. [ByteByteGo](https://bytebytego.com?fpr=techinterviewhandbook) - This is a new System Design course by Alex Xu, author of the System Design Interview books, a bestseller on Amazon. The course covers system designs basics, then goes into deep dives of the design of over 10 famous common products (e.g. [Designing YouTube](https://bytebytego.com/courses/system-design-interview/design-youtube), Facebook Newsfeed, etc) and multiple big data and storage systems (e.g. [Designing a Chat System](https://bytebytego.com/courses/system-design-interview/design-a-chat-system)). For each deep dive, concepts are explained and comprehensive diagrams are used, making it very approachable for any seniority level.
1. ["Grokking the System Design Interview" by Design Gurus](https://www.designgurus.io/course/grokking-the-system-design-interview?aff=kJSIoU) - This is probably the most famous system design interview course on the internet and what makes it different from most other courses out there is that it is purely text-based, which is great for people who prefer reading over watching videos (such as myself!). It contains a repository of the popular system design problems along with a glossary of system design basics. I've personally completed this course and have recommended many others to use this. Highly recommended!
1. ["System Design Interview Course" by Exponent](https://www.tryexponent.com/courses/system-design-interviews?ref=techinterviewhandbook) - This course covers system designs basics and has a huge database of popular system design questions with videos of mock interviews. Some of the questions have text answers and a database schema and APIs for reference (which I find helpful). While the subscription might be a little pricey for just the system design interviews content, they also offer quality technical content for [Data Structures](https://www.tryexponent.com/courses/swe-practice?ref=techinterviewhandbook), [Algorithms](https://www.tryexponent.com/courses/algorithms?ref=techinterviewhandbook) and [Behavioral Interviews](https://www.tryexponent.com/courses/behavioral?ref=techinterviewhandbook). The convenience of a one-stop platform which covers all aspects of technical interview preparation is very enticing.
1. ["Grokking the Advanced System Design Interview" by Design Gurus](https://www.designgurus.io/course/grokking-the-advanced-system-design-interview?aff=kJSIoU) - I haven't tried this but it's by the same people who created "Grokking the System Design Interview", so it should be good! In my opinion you probably wouldn't need this unless you're very senior or going for a specialist position.

[Check out other Systems Design preparation guides and resources here.](https://www.techinterviewhandbook.org/system-design/)

### Prepare for the behavioral interview

Every top tech company has at least one round of behavioral interviews for software engineers. Typically, behavioral interviews for software engineers include:

- Sharing about details of previous experiences on resume
- Providing examples of past situations and behavior that demonstrate certain behavioral attributes (e.g. conflict management skills, being data-driven)
- Sharing of ambitions and career plans

As much as these interviews seem "fluffy" or unstructured, there is actually a structured way to prepare for behavioral interviews:

#### 1. Know the STAR format for answering them

The **STAR** format helps you to organize your answers to behavioral questions. This is most applicable to questions that require you to recount past experiences or behavior.

- **Situation**: Share details about the situation that gave rise to the task
- **Task**: Explain what you needed to achieve or the problems you had to solve; focus on the
  - Scope
  - Severity
  - Specific benchmarks/outcomes required
- **Action**: Explain what you did to meet your objectives, describing options you had and how you made decisions
- **Results**: Describe the outcome of your actions and what you learned

Read more: [The STAR format for answering behavioral questions](https://en.wikipedia.org/wiki/Situation,_task,_action,_result)

#### 2. Practice the most common behavioral questions for software engineers

Refer to the [top 30 most common behavioral questions](https://www.techinterviewhandbook.org/behavioral-interview-questions/) for Software Engineers

For more tips on behavioral interview preparation, refer to my [full behavioral interview preparation guide](https://www.techinterviewhandbook.org/behavioral-interview/) here.

<!-- which can be broken down into the following steps (these steps are covered in detail in my behavioral interview step-by-step guide):
Understand how software engineers are evaluated during behavioral interviews
Learn effective answer formats and tactics
Practice the most commonly asked questions -->

### Negotiating the software engineer offer package

Finally, the last thing you absolutely need to prepare for before your interview is salary negotiation for software engineers. At any point during the interview process, conversation about salary may crop up. We also have in-depth guides about [negotiation strategies](https://www.techinterviewhandbook.org/negotiation/) and [software engineer compensation](https://www.techinterviewhandbook.org/understanding-compensation/).

And that is all from me - for more detail on each step of the software engineer interview preparation process, do dive into each topic within my handbook through the sidebar or by navigating to the next page!

## How to Prepare for Coding Interviews

> **Source:** [How to Prepare for Coding Interviews](https://www.techinterviewhandbook.org/coding-interview-prep/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

_The ultimate guide on how to efficiently prepare for your software engineering technical interview - coding test round._

If you have decided to embark on the arduous process of preparing for your coding interviews and you don't know how to maximize your time, this is the only guide you need to go from zero to hero on your coding test.

### What is a Software Engineering coding interview?

Coding interviews are a form of technical interviews used to assess a potential software engineer candidate's competencies through presenting them with programming problems. Typically, coding interviews have a focus on data structures and algorithms, while other technical rounds may encompass [system design](https://www.techinterviewhandbook.org/system-design/) (especially for middle to senior level candidates).

A coding interview round is typically 30 - 45 minutes. You will be given a technical question (or questions) by the interviewer, and will be expected to write code in a real-time collaborative editor such as CodePen or CoderPad (phone screen / virtual onsite) or on a whiteboard (onsite) to solve the problem within 30–45 minutes.

### How will you be evaluated during a coding interview?

I have collated evaluation criteria across top tech companies and generalized them into a [coding interview evaluation rubric](https://www.techinterviewhandbook.org/coding-interview-rubrics/) you can use. Specific terminology or weightages may differ across companies, top tech companies always include the following criteria in their evaluation:

1. **Communication** - Asking clarifying questions, communication of approach and tradeoffs clearly such that the interviewer has no trouble following.
1. **Problem solving** - Understanding the problem and approaching it systemically, logically and accurately, discussing multiple potential approaches and tradeoffs. Ability to accurately determine time and space complexity and optimize them.
1. **Technical competency** - Translating discussed solutions to working code with no significant struggle. Clean, correct implementation with strong knowledge of language constructs.
1. **Testing** - Ability to test code against normal and corner cases, self-correcting issues in code.

Read more about [how you should behave in a coding interview to display hire signals](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/).

### How to best prepare for a coding interview?

LeetCode by itself is actually not enough to prepare you well for your coding interviews. Diving straight into LeetCode and thinking you can complete all of the thousands of questions is a bad use of your time and will never prepare you as well as a structured approach.

Given 30 min per question and an average of 3 hours practice a day, the average person will only manage to complete 160 questions within 3-4 weeks, and may not internalize the right approach or remember the questions they have practiced before.

Instead, this is how to prepare for your Software Engineer coding interview:

1. [Pick a good programming language to use](#pick-programming-language)
1. [Plan your time and tackle topics and questions in order of importance](#plan)
1. [Combine studying and practicing for a single topic](#study-and-practice)
1. [Accompany practice with coding interview cheat sheets to internalize the must-dos and must-remembers](#practice-with-cheatsheets)
1. [Prepare a good self introduction and final questions](#prepare-self-introduction)
1. [Try out mock coding interviews (with Google and Facebook engineers)](#mock-interviews)
1. [(If you have extra time) Internalize key tech interview question patterns](#question-patterns)

#### 1. Pick a good programming language to use {#pick-programming-language}

A good programming language to use for coding interviews is one you are familiar with and is suitable for interviews.

What determines if a programming language should be used for interviews? Generally, we want higher level languages that have many standard library functions and data structures and are therefore "easier" to code in.

Recommended programming languages to use for coding interviews: Python, C++, Java, JavaScript

Read more about [considerations for picking a programming language](https://www.techinterviewhandbook.org/programming-languages-for-coding-interviews/) here.

#### 2. Plan your time and tackle topics and questions in order of importance {#plan}

How long does it take to prepare for a coding interview? It actually depends on how well prepared you want to be. On average, it takes about [30 hours to cover the bare minimum and ~100 hours to be well prepared](https://www.techinterviewhandbook.org/coding-interview-study-plan/).

To start preparing for your coding interviews, always begin with a plan. Calculate the amount of time you have left to realistically prepare for your interview from now till the day of the coding test, and carefully make a plan of the topics and questions you will cover per day, prioritizing the most important ones first.

But how do you know which are the most important topics and questions to practice based on the time you have left? You may use the free [Grind 75 tool](https://www.techinterviewhandbook.org/grind75/) (built by me) which produces coding interview study plans for varying lengths of preparation time. The algorithm behind it includes a ranking of questions by priority and also a balance between breadth and depth of topics covered.

If you have the luxury of time to prepare, it is recommended to spend around 3 months (2-3 hours per day) to prepare more holistically. I came up with a [personal 3-month study plan](https://www.techinterviewhandbook.org/coding-interview-study-plan/), which takes you from start to finish on which topics and questions to complete.

#### 3. Combine studying and practicing for a single topic {#study-and-practice}

For the sake of memory retention and efficiency, it is best to study for a single concept and then immediately do relevant practice questions for that topic.

Fortunately, there are already excellent coding interview preparation resources which enable you to do this very easily and systematically:

1. [AlgoMonster](https://shareasale.com/r.cfm?b=1873647&u=3114753&m=114505&urllink=&afftrack=)
1. [Grokking the Coding Interview: Patterns for Coding Questions](https://www.designgurus.io/course/grokking-the-coding-interview?aff=kJSIoU)

##### [AlgoMonster](https://shareasale.com/r.cfm?b=1873647&u=3114753&m=114505&urllink=&afftrack=)

Apart from helping you master important coding interview data structures and algorithm questions through practice and easy to understand guides, AlgoMonster has the added perk of synthesizing [common interview question patterns](https://algo.monster/problems/stats) that you could apply to solve any other questions you have never encountered before. Made by Google engineers, this is definitely a quality platform to use as compared to the unstructured nature of LeetCode grinding. Data structures and algorithms questions are covered in all the common languages - Python, Java, C#, JavaScript, C++, Golang, and more. [**Join today for a 70% discount →**](https://shareasale.com/r.cfm?b=1873647&u=3114753&m=114505&urllink=&afftrack=)

##### [Grokking the Coding Interview: Patterns for Coding Questions](https://www.designgurus.io/course/grokking-the-coding-interview?aff=kJSIoU)

This course by Design Gurus expands upon the questions on the recommended practice questions but approaches the practicing from a questions pattern perspective, which is an approach I also agree with for learning and have personally used to get better at coding interviews. The course allows you to practice selected questions in Java, Python, C++, JavaScript and also provides sample solutions in those languages along with step-by-step visualizations. **Learn and understand patterns, not memorize answers!** [**Get lifetime access today →**](https://www.designgurus.io/course/grokking-the-coding-interview?aff=kJSIoU)

#### 4. Accompany practice with coding interview cheatsheets to internalize the must-dos and must-remembers {#practice-with-cheatsheets}

To maximize what you get out of your practice, I recommend referring to the following coding interview cheatsheets _while_ you are studying and practicing:

- **Coding interview techniques**: how to find a solution and optimize your approach
- **Coding interview best practices**: how to behave through the interview to exhibit hire signals
- **Algorithms study cheatsheets**: covers the best learning resources, must remembers (tips, corner cases) and must do practice questions for every data structure and algorithm

##### Coding interview techniques

Here is [list of around 10 techniques](https://www.techinterviewhandbook.org/coding-interview-techniques/) to do the 2 most important things you need to do in a coding interview: finding approaches to solve the problem presented, and optimizing the time and space complexity of your approaches.

These techniques are useful to apply when you are given questions which you have never encountered before, and to get out of being stuck.

##### Coding interview best practices

Top tech companies evaluate candidates on 4 main criteria: communication, problem solving, technical competency and testing. To exhibit behaviors that fulfill these criteria, I have prepared a [coding interview best practices cheatsheet](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/) which outlines what you should do before, during and after coding interviews. This is based on my personal experience as an interviewee as well as my observation of top candidates as an interviewer at Facebook.

Using this guide to accompany practice ensures that you cultivate good habits and muscle memory with regards to interviews right from the beginning.

##### Algorithms study cheatsheets for coding interviews

These are actually the notes I personally collated for my own coding interview preparation. I have organized them into 1-pagers of the best study resources, best LeetCode questions to practice, and must-remembers (tips, corner cases) for every data structure and algorithm. They ensure that you internalize the most important concepts and get the most out of your preparation. [Check them out](https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/).

#### 5. Prepare a good self introduction and final questions {#prepare-self-introduction}

Self introductions and final questions to ask are almost always required at the start and end of any software engineering interview. As such, you should always spend some time to craft an excellent self introduction and set of final questions to ask. When done well, these can leave a good impression with the interviewer that can turn things to your favor.

For the best software self introduction samples and tips, check out this [self introduction guide for software engineers](https://www.techinterviewhandbook.org/self-introduction/). Also check out samples of the best final questions to ask for software engineers in this [final questions guide](https://www.techinterviewhandbook.org/final-questions/).

#### 6. Try out mock coding interviews {#mock-interviews}

Coding right in front of your interviewer can be a nerve-wracking experience especially if you have never done it before - which is why getting hands-on experience is so important.

[interviewing.io](https://iio.sh/r/DMCa) is currently the best mock technical interview resource in the market. It allows you to book mock coding interviews with real Google and Facebook engineers, albeit anonymously. You could even book interviews for specific roles like Mobile, Front End, Engineering Management. Even better - if you want to have an easier transition into real world coding interview - you could view recorded interviews and see what phone interviews are like.

Moreover, if you were to do very well on your mock interviews, you will be able to unlock the "jobs page" which allows you to book interviews directly with top companies like Uber, Lyft, Quora, Asana and more. I've used [interviewing.io](https://iio.sh/r/DMCa) both as an interviewer and an interviewee and found the experience to be excellent.

Read more about [different mock coding interview platforms here](https://www.techinterviewhandbook.org/mock-interviews/).

#### 7. (If you have extra time) Internalize key tech interview question patterns {#question-patterns}

Many coding interview solutions actually involve a similar set of key patterns - and learning them will help you solve any long tail problem that is outside the set of commonly asked coding interview questions.

##### AlgoMonster

Out of the resources on the internet - AlgoMonster is an excellent platform created by Google engineers. It uses a data-driven approach to condense software engineering coding interview questions into a set of key patterns, and summarized them into a structured, easy to digest course. Imagine LeetCode, but with only the key patterns you need to know.

Best of all, AlgoMonster is not subscription-based - pay a one-time fee and get lifetime access. [Join today for a 70% discount →](https://shareasale.com/r.cfm?b=1873647&u=3114753&m=114505&urllink=&afftrack=)

##### Grokking the Coding Interview: Patterns for Coding Questions

This course by Design Gurus expands upon the questions on the recommended practice questions but approaches the practicing from a questions pattern perspective, which is an approach I also agree with for learning and have personally used to get better at coding interviews. The course allows you to practice selected questions in Java, Python, C++, JavaScript and also provides sample solutions in those languages.

Learn and understand patterns, not memorize answers! [Join today for a 10% discount →](https://www.designgurus.io/course/grokking-the-coding-interview?aff=kJSIoU)

---

And that is all from me - for more detail on each step of the software engineer coding interview preparation process, do dive into each topic within my handbook through the sidebar or by navigating to the next page!

## Picking a programming language

> **Source:** [Picking a programming language](https://www.techinterviewhandbook.org/programming-languages-for-coding-interviews/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

Does the programming language you use for coding interviews matter? The answer is yes.

Most companies let you code in any language you want - the only exception I know being Google, where they only allow candidates to pick from Java, C++, JavaScript or Python for their algorithmic coding interviews.

However, the choice you make can impact your performance much more than you'd like to believe - and this is why it is important to pick a suitable programming language early on in your coding interview preparation - and use regularly in practice.

There are 3 considerations when deciding on which programming language to use:

1. Suitability for interviews
1. Your familiarity with the language
1. Exceptions

### 1. Suitability for interviews

Some languages are just more suited for interviews - higher level languages like Python or Java provide standard library functions and data structures which allow you to translate solution to code more easily.

From my experience as an interviewer, most candidates pick Python or Java. Other commonly seen languages include JavaScript, Ruby and C++. I would absolutely avoid lower level languages like C or Go, simply because they lack many standard library functions and data structures and some may require manual memory management.

Personally, Python is my de facto choice for algorithm coding interviews because it is succinct and has a huge library of functions and data structures available. Python also uses consistent APIs that operate on different data structures, such as `len()`, `for ... in ...` and slicing notation on sequences (strings/lists/tuples). Getting the last element in a sequence is `arr[-1]` and reversing it is simply `arr[::-1]`. You can achieve a lot with minimal syntax in Python.

Java is a decent choice too but having to constantly declare types in your code means extra keystrokes which results in more typing which doesn't result in any benefit (in an interview setting). This issue will be more apparent when you have to write on a whiteboard during onsite interviews. The reasons for choosing/not choosing C++ are similar to Java. Ultimately, Python, Java and C++ are decent choices of languages.

- Recommended: Python, C++, Java, JavaScript
- Acceptable (but prefer recommended if you are familiar): Go, Ruby, PHP, C#, Swift, Kotlin
- Avoid: Haskell, Erlang, Perl, C, Matlab
- You must be mad: Brainfuck, Assembly

### 2. Your familiarity with the language

Most of the time, it is recommended that you use a language that you are extremely familiar with rather than picking up a new language just for using in interviews.

If you are under time constraints, picking up a new language just for interviewing is hardly a good idea. Languages take time to master and if you are already spending most of your time and effort on revising/mastering algorithms, there is barely spare energy left for mastering a new language. If you are familiar with using one of the mainstream languages, there isn't a strong reason to learn a new language just for interviewing.

If you have been using Java at work for a while now and do not have time to be comfortably familiar with another language, I would recommend just sticking to Java instead of picking up Python from scratch just for the sake of interviews. Doing so, you can avoid having to context switch between languages during work vs interviews. **Most of the time, the bottleneck is in the thinking and not the writing**. It takes some getting used to before one becomes fluent in a language and be able to wield it with ease.

Valid reasons to learn a new language:

- The interview requires usage of that language (domain-specific roles like mobile/front end/data science)
- You are not in a rush to start interviewing

Poor reasons to learn a new language:

- The company you are interviewing with uses that language heavily and you want to impress the interviewer/show that you fit in
- You want to show that you are trendy

### 3. Exceptions

One exception to the convention of allowing you to "pick any programming language you want" is when you are interviewing for a domain-specific position, such as Front End/iOS/Android Engineer roles, in which you would need to be familiar with coding in JavaScript, Objective-C/Swift and Java respectively. If you need to use a data structure that the language does not support, such as a Queue or Heap in JavaScript, perhaps try asking the interviewer whether you can assume that you have a data structure that implements certain methods with specified time complexities. If the implementation of that data structure is not crucial to solving the problem, the interviewer will usually allow this. In reality, being aware of existing data structures and selecting the appropriate ones to tackle the problem at hand is more important than knowing the intricate implementation details.

## Study and practice plan

> **Source:** [Study and practice plan](https://www.techinterviewhandbook.org/coding-interview-study-plan/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

One of the most important questions to answer at the start of your coding interview preparation is: What study topics and practice questions should you do to most efficiently prepare for your coding interviews?

There are plenty of resources on the internet, but it can be hard to know how they fit into the time you have left to prepare. Thankfully, this article will help you with that.

I have personally gone through the dreaded Software Engineer interview process myself several times and prepared my own study plans, refining them each time.

In this article, I will share the 3 month study plan that I personally use to prepare for my coding interviews. You will find the exact topics to study (with recommended links) and exact questions to practice (with practice links).

<!--
Do check out these links for:
What to study and practice if you have 1 month left to coding interviews
What to study and practice if you have 1 week left to coding interviews
-->

### Recommended preparation time and approach

How much time do you need to prepare for your coding interviews? Generally, 3 months (if you can dedicate 11 hours a week) is the recommended period of time for a more holistic preparation. I will be sharing recommended study plans for 3 months (recommended period), but you can generate study plans for practice questions for any time frame you need via the Grind 75 tool (built by me). More options like filtering by difficulty, topics, alternative grouping of questions can be found there.

Regardless of how long you have, if you are unfamiliar with core data structures and algorithms knowledge, you are advised to revise them before starting on the coding interview questions practice. Different people have different styles of practicing and you should do what works best for you. The various possible approaches are:

1. **Breadth-first preparation** - Revise every topic and then start practicing a variety of questions across all topics. This strategy is recommended if you have around a month to spare.
1. **Depth-first preparation** - Tackle one topic at a time - revise materials for a topic, practice lots of questions for that topic. After ensuring mastery of a topic, move on to the next topic. Repeat for all or selected topics. If you don't have much time, this might be the best way to prepare. You can focus on the High priority topics in our recommended study plan.
1. **Depth-first-then-breadth preparation** - Tackle one topic at a time - revise materials for a topic, practice a few questions for that topic. After ensuring mastery, move on to the next topic. Repeat for all topics. At the end, practice a variety of questions across all topics. This strategy takes more time than others, so it's recommended if you have more than a month.

My personal recommendation would be the **Breadth-first preparation** or **Depth-first-then-breadth preparation**. It's important to have some form of breadth-level studying / practicing in your schedule so that you don't forget about the earlier topics as you move on to later topics.

### The 3 month study plan - with recommended study resources and practice question links

In each study plan, you will find a list of coding interview topics with resources and practice questions that you should work through **in order of priority** every week.

To best utilize it, you should create a template where you break down the dates left and hours left per day, so that you can later fill in the topics/questions to cover per day.

Keep the estimate relatively conservative so you don't end up burning out.

#### Week 1 - 4: Topical study + practice

These are all the topics you should study, in order of priority. The learning resources linked are my algorithm cheatsheets - which give you an overview of must-remembers like time complexity, corner cases, and topic-specific useful techniques, as well as essential and recommended practice questions.

Don't forget to apply behaviors from [coding interview best practices](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/) and methods from [coding interview techniques](https://www.techinterviewhandbook.org/coding-interview-techniques/) early on while you practice!

##### Week 1

| Topic                                    | Priority | Time required |
| ---------------------------------------- | -------- | ------------- |
| [Array](https://www.techinterviewhandbook.org/algorithms/array/)           | High     | 2 hours       |
| [String](https://www.techinterviewhandbook.org/algorithms/string/)         | High     | 3 hours       |
| [Hash Table](https://www.techinterviewhandbook.org/algorithms/hash-table/) | Mid      | 3 hours       |
| [Recursion](https://www.techinterviewhandbook.org/algorithms/recursion/)   | Mid      | 3 hours       |

##### Week 2

| Topic | Priority | Time required |
| --- | --- | --- |
| [Sorting and searching](https://www.techinterviewhandbook.org/algorithms/sorting-searching/) | High | 3 hours |
| [Matrix](https://www.techinterviewhandbook.org/algorithms/matrix/) | High | 1 hour |
| [Linked List](https://www.techinterviewhandbook.org/algorithms/linked-list/) | Mid | 3 hours |
| [Queue](https://www.techinterviewhandbook.org/algorithms/queue/) | Mid | 2 hours |
| [Stack](https://www.techinterviewhandbook.org/algorithms/stack/) | Mid | 2 hours |

##### Week 3

| Topic                          | Priority | Time required |
| ------------------------------ | -------- | ------------- |
| [Tree](https://www.techinterviewhandbook.org/algorithms/tree/)   | High     | 4 hours       |
| [Graph](https://www.techinterviewhandbook.org/algorithms/graph/) | High     | 4 hours       |
| [Heap](https://www.techinterviewhandbook.org/algorithms/heap/)   | Mid      | 3 hours       |
| [Trie](https://www.techinterviewhandbook.org/algorithms/trie/)   | Mid      | 3 hours       |

##### Week 4

| Topic | Priority | Time required |
| --- | --- | --- |
| [Interval](https://www.techinterviewhandbook.org/algorithms/interval/) | Mid | 2 hours |
| [Dynamic programming](https://www.techinterviewhandbook.org/algorithms/dynamic-programming/) | Low | 4 hours |
| [Binary](https://www.techinterviewhandbook.org/algorithms/binary/) | Low | 2 hours |
| [Math](https://www.techinterviewhandbook.org/algorithms/math/) | Low | 1 hour |
| [Geometry](https://www.techinterviewhandbook.org/algorithms/geometry/) | Low | 1 hour |

#### Week 5 - 12: In-depth practice

Here, I listed 75 questions that you should do to be fully prepared for your coding interviews. This list of questions are generated from the [**Grind 75 tool**](https://www.techinterviewhandbook.org/grind75/) (built by me), which generates recommended study plans for coding interviews based on the time you have left. More options like filtering by difficulty, topics, alternative grouping of questions can be found there.

- If you followed the Week 1 - 4 study plan, you would have done some of these questions here. Feel free to skip them or do them again.
- Feel free to skip the dynamic programming questions if you haven't studied them or feel that they won't be relevant. Many dynamic programming questions can be solved with recursion / backtracking anyway.

Don't forget to apply behaviors from [coding interview best practices](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/) and methods from [coding interview techniques](https://www.techinterviewhandbook.org/coding-interview-techniques/) early on while you practice!

We recommend using the [**Grind 75**](https://www.techinterviewhandbook.org/grind75/) tool which allows you to keep track of your practice progress.

### Factor time for your self introduction, final questions and mock coding interviews

Besides studying and practicing for coding interviews, you should also prepare your self introduction, final questions, and try out mock coding interviews.

#### Prepare self introduction and final questions to ask

I would suggest around 3 hours to craft your self introduction and also prepare some final questions to ask. You may refer to this [self introduction guide](https://www.techinterviewhandbook.org/self-introduction/) and [final questions to ask guide](https://www.techinterviewhandbook.org/final-questions/) which should help you complete these steps fairly quickly.

#### Schedule mock coding interviews

You should start scheduling for mock coding interviews when you are 60% through your coding interview studying and practicing plan. Interview slots are typically provided by interviewers, so you can view them in advance and book them. The platform I have personally used and recommend is [interviewing.io](https://iio.sh/r/DMCa). Read more about [different mock coding interview platforms here](https://www.techinterviewhandbook.org/mock-interviews/).

## Company interview formats

> **Source:** [Company interview formats](https://www.techinterviewhandbook.org/interview-formats-top-companies/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

> **Due To Covid Travel Restrictions, Many Companies Hold Interviews Remotely Even For The Onsite Rounds, So The Instructions Might Differ.:**

> **There Companies You Would Like To Know More About? Email Us At [Contact{At}Techinterviewhandbook.Org](https://www.techinterviewhandbook.org/Mailto:Contact@Techinterviewhandbook.Org/).:**

### Airbnb

- Recruiter phone screen
- Technical phone interview:
  - 1 or 2 x Algorithm/front end on CoderPad/CodePen
- Onsite (General):
  - 2 x Algorithm coding on CoderPad
  - 1 x System Design/architecture
  - 1 x Past experience/project
  - 2 x Cross functional
- Onsite (Front End):
  - 2 x Front end coding on CodePen. Use any framework/library
  - 1 x General coding on your own laptop
  - 1 x Past experience/project
  - 2 x Cross functional
- Tips:
  - All sessions involve coding on your own laptop. Prepare your development environment in advance
  - You are allowed to look up APIs if you need to
  - They seem to place high emphasis on compilable, runnable code in all their coding rounds
  - Cross functional interviews will involve getting Airbnb employees from any discipline to speak with you. These interviews are mostly non-technical but are extremely important to Airbnb because they place a high emphasis on cultural fit. Do look up the Airbnb section of the behavioral questions to know what sort of questions to expect

### Asana

- Recruiter phone screen
- Technical phone interview
- Onsite (Product Engineer):
  - 3 x Algorithm and System Design on whiteboard within the same session
  - 1 x Algorithm on laptop and System Design. This session involves writing code on your own laptop to solve 3 well-defined algorithm problems in around 45 minutes after which an engineer will come in and review the code with you. You are not supposed to run the code while working on the problem
- Tips:
  - No front end questions were asked
  - Asana places high emphasis on System Design and makes heavy use of the whiteboard. You do not necessarily have to write code for the algorithm question of the first three interviews
  - All 4 sessions involve algorithms and System Design. One of the sessions will be conducted by an Engineering Manager
  - The last session will involve coding on your own laptop. Prepare your development environment in advance
  - Regardless of Product Engineer or Engineering Generalist position, their interview format and questions are similar

### Dropbox

- Recruiter phone screen
- Technical phone interviews:
  - 2 x Algorithm/front end on CoderPad/CodePen
- Onsite (Front End):
  - 2 x Front end on CodePen. Only Vanilla JS or jQuery allowed
  - 1 x General coding on CoderPad
  - 1 x All around. Meet with an Engineering Manager and discussing past experiences and working style
- Tips:
  - You can code on your own laptop and look up APIs
  - Dropbox recruiters are very nice and will give you helpful information on what kind of questions to expect for the upcoming sessions
  - One of the front end sessions involve coding up a pixel-perfect version of a real page on the Dropbox website. You'll be given a spec of the desired page and you'll be asked to create a working version during the interview

### Google

- Recruiter phone screen
- Technical phone interview:
  - 1 or 2 x Algorithm on Google Doc
- Onsite:
  - 1 or 2 x Front end on whiteboard. May be required to use Vanilla JS (or at the most, jQuery) depending on the question. (Front End only)
  - 2 to 4 x Algorithm on whiteboard
  - 1 x General Cognitive Ability, Leadership and "Googleyness".
- Team matching
  - Speak with managers from different teams who are interested in your profile
- Tips:
  - In rare cases, candidates may even be allowed to skip the phone interview round and advanced to onsite directly
  - For non-fresh grads, you only receive an offer if you are successfully matched with a team

### Indeed

- Recruiter phone screen
- Technical phone interview (optional)
- Onsite:
  - 1 x Online Assessment on HackerRank (for L0 - L2)
  - 1 x Resume discussion
  - 1 or 2 x Algorithm on HackerRank
  - 1 x Code Review on GitHub
  - 1 or 2 x System Design (for L3+)
  - 1 x Technical Presentation (for L4+)
- Tips:
  - If you are interviewing for a specific role, the bar varies
  - Hiring decision and leveling are separate discussions; leveling is determined by experience and leadership signals
  - If you do well in the interviews but the position is already filled, other hiring managers can pick up your packet

### Lyft

- Recruiter phone screen
- Technical phone interview:
  - 1 x Algorithm/Front end over JSFiddle
- Onsite (Front End):
  - 4 x Front end on Coderpad/your own laptop. Use any language/framework
  - 1 x Behavioral. Meet with an Engineering Manager and go through candidate's resume
- Tips:
  - Can use whiteboard and/or laptop
  - For front end coding, I opted to use React and had to set up the projects on the spot using `create-react-app`

### Meta (previously Facebook)

- Recruiter phone screen
- Technical phone interviews:
  - 1 or 2 x Algorithm/front end on Skype/CoderPad
- Onsite:
  - 2 x Technical coding interview on whiteboard
  - 1 x Behavioral. Meet with an Engineering Manager and discussing past experiences and working style
  - 1 x Design/architecture on whiteboard
- Onsite (University Grad):
  - 2 x Technical coding interview on whiteboard
  - 1 x Behavioral. Meet with an Engineering Manager and discussing past experiences and working style
- Tips:
  - You are only allowed to use the whiteboard (or wall). No laptops involved
  - For the behavioral round, you may be asked a technical question at the end of it. Front end candidates will be given a small HTML/CSS problem nearing the end of the session
  - For the coding rounds, you may be asked one or more questions depending on how fast you progress through the question

### Palantir

- Recruiter phone screen
- Technical phone interview:
  - 1 x Algorithm over HackerRank CodePair and Skype
- Onsite (General):
  - 2 x Algorithm on whiteboard
  - 1 x Decomposition (System Design) on whiteboard
- Onsite (Front End):
  - 1 x Front end on your own laptop. This session lasts about 1.5 hours. Use any library/framework
  - 1 x Decomposition (System Design) on whiteboard
- Tips:
  - I opted to use React and had to set up projects on the spot using `create-react-app`
  - You may be asked to meet with Engineering Managers after the technical sessions and it's not necessarily a good/bad thing

### WhatsApp

- Recruiter phone screen
- Technical phone interview:
  - 2 x Algorithm over CoderPad
- Onsite (Web Client Developer):
  - 4 x Algorithm on whiteboard
- Tips:
  - No front end questions were asked
  - 1 of the interviewers is an Engineering Manager

## Mock coding interviews

> **Source:** [Mock coding interviews](https://www.techinterviewhandbook.org/mock-interviews/) · [Tech Interview Handbook](https://github.com/yangshun/tech-interview-handbook), MIT

Interviewing is a skill that you can get better at. The steps mentioned above can be rehearsed over and over again until you have fully internalized them and following those steps become second nature to you. A good way to practice is to find a friend to partner with and the both of you can take turns to interview each other.

### [interviewing.io](https://iio.sh/r/DMCa)

A great resource for practicing mock coding interviews would be [interviewing.io](https://iio.sh/r/DMCa). [interviewing.io](https://iio.sh/r/DMCa) provides anonymous practice technical interviews with Google and Facebook engineers, which can lead to real jobs and internships. By virtue of being anonymous during the interview, the inclusive interview process is de-biased and low risk. At the end of the interview, both interviewer and interviewees can provide feedback to each other for the purpose of improvement. Doing well in your mock interviews will unlock the jobs page and allow candidates to book interviews (also anonymously) with top companies like Uber, Lyft, Quora, Asana and more. You can also book mock interviews for more specific roles such as Mobile, Front End, Engineering Management. For those who are totally new to technical interviews, you can even view [recorded interviews](https://interviewing.io/mocks) and see how phone interviews are like. Read more about them [here](https://techcrunch.com/2017/09/27/interviewing-io-hopes-to-close-the-engineer-diversity-gap-with-anonymous-interviews/).

I have used [interviewing.io](https://iio.sh/r/DMCa) both as an interviewer and an interviewee and found the experience to be really great! [Aline Lerner](https://twitter.com/alinelernerLLC), the CEO and co-founder of [interviewing.io](https://iio.sh/r/DMCa) and her team are passionate about revolutionizing the technical interview process and helping candidates to improve their skills at interviewing. She has also published a number of technical interview-related articles on the [interviewing.io blog](https://interviewing.io/blog).

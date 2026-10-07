---
title: "Classes and Systems"
order: 9
summary: "From one class to a whole system: responsibilities, cohesion, organizing for change — and separating construction from use so architecture can evolve."
category: "Clean Code"
level: All levels
---

# Classes and Systems

Chapters 10 and 11 of *Clean Code* climb from the design of a single class to the design of the whole system.

> **Note:** This module is a study guide written for Atlas CE, not a copy. Clean Code is a commercial book by Robert C. Martin — buy it at [cleancoder.com](https://cleancoder.com). Each topic distills ideas from the book's tenth and eleventh chapters.

## Classes Should Be Small — by Responsibility

With classes, size is measured in **responsibilities, not lines**: a 70-method "god class" is too big even if each method is tiny. The first test is the name — if you can't derive a concise name, or you need "and"/"if"/"or" in a 25-word description, or the name reaches for weasel words like `Manager`, `Processor` or `Super`, the class has too many reasons to exist.

The single responsibility principle: a class has one, and only one, reason to change. Getting software working and getting it clean are two activities, and the common failure is stopping after the first. Many small classes have no more total moving parts than a few large ones — it's the toolbox of labeled drawers versus the junk drawer.

**The norm:** one reason to change per class; the name should say it.

## Cohesion, and Organizing for Change

Classes should have few instance variables, each manipulated by most methods — that's cohesion. When a subset of methods uses only some variables, the class is asking to split; breaking big functions into small ones naturally proliferates small classes.

Organize for change two ways:

- **Open for extension, closed for modification (OCP):** restructure so new behavior arrives as a new subclass, not an edit to a working `switch`-riddled class.
- **Depend on abstractions (DIP):** a portfolio depends on a `StockExchange` *interface*, so tests can hand it a fixed-price fake. Decoupled systems are more flexible, reusable and testable.

Refactoring is not rewriting: with tests in place, make myriad tiny behavior-preserving changes.

**The norm:** cohesion tells you when to split; abstraction tells you where to draw the line.

## Systems: Separate Constructing from Using

Startup — object construction and dependency wiring — is a different process from runtime logic, and mixing them (scattered lazy-initialization idioms) breaks single responsibility everywhere. Keep them apart:

- **Separation of `main`:** all construction lives in `main` or modules it calls; the application assumes everything is built.
- **Factories:** when the application must control *when* things are created, an abstract factory lets it control when but not how.
- **Dependency injection:** objects are passive — dependencies arrive through constructors or setters, and a container wires them per configuration.

**The norm:** wiring happens once, in one place; the application just runs.

## Scale Up by Staying Clean

Architectures can grow incrementally from simple to sophisticated *if* separation of concerns holds: implement today's stories, refactor and expand tomorrow — "get it right the first time" is a myth. Cross-cutting concerns (persistence, transactions, security) cut across every module; aspect-oriented tools restore their modularity so domain logic stays in plain objects. With domain logic decoupled, you can **test-drive the architecture** itself: start naively simple, let the tests pull the design toward what the system actually needs.

Two closing disciplines: **postpone decisions** until the last responsible moment — not laziness, but maximum information at choice time — and **use standards wisely**, only where they add demonstrable value (teams adopted heavy EJB because it was standard, not because it fit).

**The norm:** simplest thing that can possibly work, evolved under tests.

## Keep Threaded Code Simple

Concurrency is a decoupling strategy — *what* gets done from *when* — but it comes with overhead, non-repeating bugs, and design changes. Defend with four principles: keep concurrency code separate (single responsibility); limit the scope of shared data; use copies of data instead of sharing; make threads as independent as possible.

Know your library (thread-safe collections, executors), know the three execution models most enterprise problems reduce to (producer–consumer, readers–writers, dining philosophers), keep synchronized sections small, and treat every spurious failure as a threading bug — one-offs don't exist. Get non-threaded code working first; make threaded code pluggable and tunable; instrument with waits and yields to force latent failures into daylight.

**The norm:** lock less, copy more, and never dismiss a one-off failure.

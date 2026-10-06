# Atlas CE

A free, open reading app for software engineers: system design, algorithms,
DevOps, backend, forward deployed engineering, languages and frameworks,
security and AI, in one place with one sidebar, one search and one way of reading.

Atlas CE ("community edition") started as
[System Design Atlas](https://github.com/mertkahyaoglu/atlas) by Mert Kahyaoğlu
and grows it into eight tracks. Most of the new material is adapted from openly
licensed documentation and courses, and every page says where it came from; see
[CONTENT.md](CONTENT.md) for each source and its license.

| Track | Route | What's in it |
| --- | --- | --- |
| System design | `/docs` | Concept modules, the technologies designs name, and worked designs with interactive architecture diagrams and interview scripts |
| Algorithms | `/coding`, `/learn`, `/interview` | Data structures and algorithms with step-through visualisations, interview topics with big-O tables, and interview prep from the Tech Interview Handbook |
| DevOps | `/devops` | Linux through Kubernetes, Terraform, observability and security, each module with its reference, labs and project |
| Backend | `/backend` | HTTP, Node.js, Express, APIs, auth, SQL and data modeling, NestJS, FastAPI, Go and Gin |
| Forward Deployed Engineering | `/fde` | Agentic engineering, building a Claude Code-style agent from scratch, agentic system design and platform engineering |
| Languages | `/languages` | Essential JavaScript, TypeScript, Python, React, Next.js, Vue, Tailwind CSS, Laravel, HTMX, FastAPI, Qt and Spring Boot |
| Security | `/security` | The OWASP Cheat Sheet Series in 11 modules: injection, XSS, auth, access control, APIs, cryptography, cloud, AI |
| AI & LLMs | `/ai` | LLM fundamentals, the scientist path (pre-training, fine-tuning, alignment) and the engineer path (RAG, agents, deployment) |

What reading looks like:

- **One sidebar per track**, switched from the logo. Long modules nest their
  child pages (a DevOps module's labs, a framework's topics) under an arrow.
- **Search everything** with Ctrl/⌘ + K: every page title and heading across all
  tracks, jumping straight to the matching section.
- **Progress**: mark a page complete and the sidebar ticks it off.
- **Highlighted code** in every language the content uses, in light and dark themes.

Contributions are welcome, particularly corrections. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production
```

Node 18.17 or newer.

## How it works

Content is plain markdown on disk. `lib/content.ts` reads `content/` at build time,
parses frontmatter with gray-matter, and every page is statically generated — there is
no database and no CMS.

```
app/
  layout.tsx                 root shell, theme bootstrap
  page.tsx                   landing page: one card per track
  docs/                      system design index and pages
  coding/, learn/            algorithms tracks
  devops/, backend/, fde/,
  languages/                 course-ordered tracks: index, [slug], [slug]/[part]
  search-index.json/         static search index, built at build time
components/
  layout/                    sidebar, top bar, site switcher, search dialog
  home/                      system design library: hero, filter bar, cards
  docs/                      markdown renderer, code blocks, diagrams, TOC, prev/next,
                             TrackDocPage (the page for course-ordered tracks)
  docs/diagram/              React Flow canvas, node types, node detail dialog
  viz/                       step-through player, canvas and code pane (coding track)
  ui/                        tag, search input, badges, logo mark
lib/
  content.ts                 filesystem loader, TOC builder, sibling lookup
  parts.ts                   splits long docs into parent and child pages
  trackDocs.ts               course order, shared modules and prev/next per track
  related.ts                 modules a track borrows from another track
  searchIndex.ts             builds the site-wide search index
  highlight.ts               highlight.js setup: registered languages and aliases
  headings.ts                client-safe heading ids and learn panel titles
  tags.ts                    tag registry (single source of truth)
  glossary.ts                abbreviations and their expansions, shown on hover
  search.ts                  system design library filter and sort logic
  types.ts                   shared types
  viz/                       one visualisation per coding concept, plus shared layout
store/
  useUiStore.ts              theme (persisted), sidebar and collapsed sections
  useFilterStore.ts          library query, tags, sort
  useProgressStore.ts        completed pages
content/
  concepts/, tech/, designs/ system design
  scripts/                   interview scripts for designs
  coding/, learn/            algorithms
  devops/, backend/, fde/,
  languages/                 one markdown file per module
scripts/
  check-viz.mjs              validates every visualisation, run in CI
  check-abbr.mjs             fails on an abbreviation missing from the glossary, run in CI
```

## Adding a document

1. Drop a `.md` file into `content/concepts/`, `content/tech/` or `content/designs/`.
2. Give it frontmatter:

```yaml
---
group: "design"
order: 17
title: "Design a Feature Flag Service"
summary: "One line shown on the card and in search results."
hardPart: "Designs only. What the interviewer is actually testing."
tags: ["caching", "redis"]
---
```

3. Any tag you use must exist in `lib/tags.ts`. Unknown tags fall back to their raw id
   rather than throwing, but they won't appear in the filter bar until registered.
4. Technology pages add a `role`: two or three words naming what the thing *is*
   ("Event log", "Wide-column store"), shown on the card. They follow a fixed
   shape — **Basics**, **Key concepts and capabilities**, **When to use it in an
   interview**, **What interviewers push on** — so they can be read in any order
   and compared against each other.
5. Designs also keep their opening and closing panels in frontmatter: `hardPartDetail`,
   `concepts`, `requirements`, `scale`, `tradeoffs` and `followUps`. `lib/content.ts`
   logs a warning for any that are missing. An existing design such as
   `content/designs/02-chat-slack.md` is the easiest template to copy.
6. Every abbreviation in the prose needs an entry in `lib/glossary.ts`. The first use
   of each one per section is tinted and spells itself out on hover, focus or tap, so
   write "APNs" and let the tooltip say "Apple Push Notification service".
   `npm run check:abbr` lists any that are missing; CI runs it too. Terms every reader
   knows (API, URL, JSON) and product names go in `NOT_ABBREVIATIONS` instead.

That's it — the sidebar, index cards, filters, prev/next links and static routes all
derive from the file. Nothing else needs editing.

## Diagrams

Fenced blocks tagged `mermaid` render as diagrams; everything else renders as a
copyable code block.

Flowcharts (`flowchart TB` or `flowchart LR`) are drawn with React Flow, so they pan,
zoom and go full screen. They are still authored in Mermaid syntax:
`lib/diagram/parse.ts` reads the subset the content uses (its header comment lists
it), `lib/diagram/layout.ts` places the nodes with dagre, and
`components/docs/diagram/` renders them. Every node kind is its own small component
built on a shared `NodeCard`. Sequence and ER diagrams still render with Mermaid,
dynamically imported so its ~500 KB stays out of the initial bundle. React Flow loads
lazily too.

Each design's architecture diagram is written directly in its markdown, under
`## High-level architecture`. Clicking a node opens a dialog with its purpose, its
trade-off and its connections. The purpose and trade-off come from a `click` line,
which also links the node to a concept module:

```text
click Node href "/docs/05-async-messaging-and-event-driven" "Role: …<br/>Trade-off: …"
```

A node without a `click` line shows general notes for its kind instead, from
`lib/diagram/kinds.ts`.

If a chart fails to parse, the diagram falls back to showing the source rather than
blanking the page.

Node colour is by kind, not per diagram, so the same colour means the same thing on
every page. A node's class sets its kind:

```text
class Node db        durable stores: Postgres, Cassandra tables
class Node cache     Redis, or anything explicitly TTL'd
class Node blob      object storage: S3-style blobs
class Node queue     message buses, topics, pub/sub
class Node external  third-party systems: APNs, SMTP, a PSP, a CDN
class Node gateway   the edge reverse-proxy tier: an API gateway
class Node lb        a load balancer
class Node hot       the node the deep dive is actually about
```

An unclassed node takes its kind from its shape: `[(…)]` is a plain data store,
`([…])` an endpoint such as a client or a response, `{…}` a decision, and anything
else a service. Colours are theme tokens (`--tone-*` in `app/globals.css`), so they
adapt to both themes. `classDef` lines are ignored by the renderer; keep them only if
you want the fence to still look right in a plain Mermaid viewer.

`hot` is an emphasis layered on top of a kind (`class Node1 db` and `class Node1 hot`
both apply), not a kind of its own. A stateful, per-connection **WS gateway** (the socket-holding
tier in the chat-style designs) is deliberately left uncoloured — it's a different thing
from an API gateway's reverse-proxy role, and colouring both the same would blur that
distinction rather than sharpen it. Everything else stays the unclassed default box, so
the coloured nodes read as "this holds state," "this is async," "this isn't ours," and
"this is the edge tier" at a glance, rather than fighting for attention with the
majority of plain service nodes.

These are flat hex, not `var(--token)` or `rgba(...)` — Mermaid's `classDef` grammar
parses the style string itself and rejects any value with parentheses in it, so both
fail to parse. That also means these colours don't adapt to the light theme; they're
picked to still read fine there since dark is this app's default.

A design's `## High-level architecture` can also show how the design changes at a
higher scale, as a second tab. `lib/tabs.ts` splits the body on comment markers; each
marker starts a tab, and the part of a label after ` · ` renders as a muted note:

```markdown
<!-- tab: Today · ~200 msg/s -->
…today's diagram and walkthrough…
<!-- tab: At 100x · ~20k msg/s -->
…the scaled diagram and what changes…
<!-- /tabs -->
```

Keep headings out of tabs, since the table of contents would link into a hidden panel.
In the scaled diagram, layer `classDef scaled stroke-dasharray:5 3` on nodes that are
new or reshaped compared with today's design, the same way `hot` layers on a type.

## Interview scripts

A design can carry a worked script: the same design spoken aloud as a 45-minute
round, following the six phases of `content/concepts/10-interview-playbook.md`. Drop
`content/scripts/<slug>.md` next to the design's slug and a **Script** button appears in
its header; without the file nothing changes.

The file is plain markdown. A `##` heading starts a phase, and each speaking turn starts
with a speaker marker:

```markdown
## Clarify · 5 min · Requirements, and the scope cuts said out loud

@interviewer · the prompt
Design the chat that lets a researcher talk to the participants in their study.

@you
Let me play that back and then agree the shape with you…

@note · Playbook 10.4
Why that move scores. Notes are asides, not a third voice in the room.
```

A phase heading's fields are ` · ` separated: the title first, then a `N min` budget and a
one-line goal in either order. A marker takes an optional ` · cue` — a stage direction
such as `drawing`, or the playbook section a note draws on. `lib/script.ts` parses it,
`getScript()` loads it, and `components/docs/script/` renders it in a dialog. Turn bodies
are markdown, so tables and lists work.

Only `@you`, `@interviewer` and `@note` are speakers; text before the first marker (a
title, an intro) is ignored, so the file still reads top to bottom in a plain markdown
viewer.

## The coding track

Coding concepts live in `content/coding/` and render under `/coding`, with their own
sidebar and a blue accent. Their frontmatter carries the panels around the body —
a cost table, the signals that call for the structure, pitfalls and follow-ups:

```yaml
---
title: Heaps
order: 8
summary: One line, shown on the card and under the title.
hardPart: What an interviewer is actually testing.
viz: heap                  # names a visualisation in lib/viz/registry.ts
complexity:
  - op: Push / pop
    time: O(log n)
    note: Why it costs that.
reachFor: [...]
pitfalls: [...]
followUps:
  - question: ...
    answer: ...
---
```

A visualisation is data, not animation code. `lib/viz/types.ts` defines a
**frame** as a complete snapshot of the drawing; node ids stay stable across frames,
so stepping forward rewrites positions and a CSS transition turns each jump into a
move. Each file builds its frames from one `scene()` function, so the picture is a
pure function of the algorithm's state.

`npm run check:viz` validates every visualisation — duplicate node ids, edges to
missing nodes, highlighted code lines outside the listing, content overflowing the
canvas, boxes drawn on top of each other. CI runs it on every pull request.

## Course-ordered tracks

DevOps, Backend, FDE, Languages, Security, Interview Prep and AI share one page component and one set of
rules, so adding a module is just adding a file.

- **A module is one markdown file** in `content/<track>/`, with `title`, `order`,
  `summary` and `category` in its frontmatter. `order` sets its place in the
  sidebar; `category` groups it on the track's index page.
- **Long modules split into child pages** automatically (`lib/parts.ts`), so the
  file stays whole on disk. DevOps modules keep their main text on the parent
  and give the Reference, each Lab and the Project their own page; Backend and
  FDE modules split per `##` section once they pass ~25 minutes; Languages
  modules always split per `##` topic. Child pages live at
  `/<track>/<module>/<part>` with their own TOC, progress and prev/next.
- **Shared modules** let a track list a page that lives in another track, in
  course order, without copying it: an entry in `lib/related.ts` serves the
  original content under the host route (e.g. `/backend/git`), so the reader
  never leaves the track. The original page stays canonical.
- **Credit every source.** Adapted sections open with a `> **Source:**` line
  linking the original page, its project and its license, and the source is
  listed in [CONTENT.md](CONTENT.md).

A new track needs a `DocGroup` and `Track` in `lib/types.ts`, an entry in
`GROUP_DIR`/`GROUP_ORDER` in `lib/content.ts`, a route in `lib/utils.ts`, an accent
colour in `app/globals.css` and `tailwind.config.ts`, a label in `GroupBadge` and
`lib/og.tsx`, a sidebar section, a site switcher entry, `RELATED` and the
`app/<track>/` routes (copy an existing track's).

## Design notes

Accent colours carry information rather than decoration: within system design, teal
marks concept modules, violet technologies and amber designs, and each other track
has its own colour. The accent is set once per page as a CSS variable
(`--accent`) and every component reads it, so no component branches on theme or group.

Numbered markers appear on cards and in the sidebar because the content genuinely is
ordered — concepts build on each other, and designs are ranked by how often they come
up in interviews.

Dark is the default because this is long-form night reading. The theme is stored in
`localStorage` via Zustand's persist middleware and applied by an inline script in
`<head>` before first paint, so there's no light flash on reload.

## Extending it

- **Full-text search.** The search index holds titles, summaries and headings
  (~106 KB gzipped). Indexing whole bodies would need a chunked index such as
  Pagefind to stay small.
- **More modules.** [CONTENT.md](CONTENT.md) keeps a waiting list of openly
  licensed sources lined up for import, and a list of sources that can only be
  linked.

## See also

- [awesome-system-design](https://github.com/madd86/awesome-system-design) — a curated list of system design
  resources: articles, books, talks and the tools the designs here name.

## License

- **The application code**, everything outside `content/`, is [MIT](LICENSE).
- **The original System Design Atlas documents** are
  [CC BY-SA 4.0](LICENSE-CONTENT): credit "System Design Atlas by Mert Kahyaoğlu"
  with a link back, and license what you build from them the same way.
- **Imported and adapted documents** keep their source's license: MIT, Apache
  2.0, CC BY, CC BY-SA, PSF and 0BSD among them. [CONTENT.md](CONTENT.md) lists
  every source, what it was used for and its license; each adapted section
  also names its source at the top. One imported page (DevOps interview
  questions) comes from a repository with no license and is reproduced with
  credit.

Contributions are taken under the [DCO](CONTRIBUTING.md#sign-your-commits-dco), so
commits need a `Signed-off-by` line. You keep the copyright in what you write.

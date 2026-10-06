# Content sources

Where the documents under `content/` come from. Each source keeps its own
license; credit the original authors when you reuse their material.

| Folder | Track | Source | License |
| --- | --- | --- | --- |
| `content/concepts/` | System design: concepts | [mertkahyaoglu/atlas](https://github.com/mertkahyaoglu/atlas) | [CC BY-SA 4.0](LICENSE-CONTENT) |
| `content/tech/` | System design: key technology | [mertkahyaoglu/atlas](https://github.com/mertkahyaoglu/atlas) | [CC BY-SA 4.0](LICENSE-CONTENT) |
| `content/designs/` | System design: designs | [mertkahyaoglu/atlas](https://github.com/mertkahyaoglu/atlas) | [CC BY-SA 4.0](LICENSE-CONTENT) |
| `content/scripts/` | System design: interview scripts | [mertkahyaoglu/atlas](https://github.com/mertkahyaoglu/atlas) | [CC BY-SA 4.0](LICENSE-CONTENT) |
| `content/coding/01-13` | Algorithms: coding | [mertkahyaoglu/atlas](https://github.com/mertkahyaoglu/atlas) | [CC BY-SA 4.0](LICENSE-CONTENT) |
| `content/coding/14-38` | Algorithms: coding | [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) | MIT |
| `content/learn/` | Algorithms: learn | [learningto.co](https://learningto.co) (website, no public repository) | — |
| `content/devops/` | DevOps | [crypticani/the-devops-handbook](https://github.com/crypticani/the-devops-handbook) | MIT |
| `content/devops/interview-questions.md` | DevOps | [rohitg00/devops-interview-questions](https://github.com/rohitg00/devops-interview-questions) | none (all rights reserved) |
| `content/backend/` | Backend | Assembled from 14 open documentation projects, see [Backend](#backend) | per section, all allow reuse |

## System Design Atlas

The original reader and the system design and coding documents are
**System Design Atlas by Mert Kahyaoğlu**.

- Repository: <https://github.com/mertkahyaoglu/atlas>

## learningto.co

The 16 topics in `content/learn/` were scraped from learningto.co: big-O costs,
Python structures, brute-force vs optimized comparisons, code walkthroughs and
practice challenges.

- Website: <https://learningto.co>

## The DevOps Handbook

The 17 modules in `content/devops/`, Linux through Kubernetes to interview prep,
come from **The DevOps Handbook by crypticani**. It's MIT licensed, copyright (c) 2026 crypticani.

- Repository: <https://github.com/crypticani/the-devops-handbook>

## JavaScript Algorithms

`content/coding/14-*` to `38-*` are 25 interview topics the original 13 coding
pages didn't cover: Union-Find, LRU cache, binary search trees, graph
algorithms (topological sort, cycle detection, Dijkstra, Kruskal), merge,
quick and counting sort, edit distance, classic DP, backtracking and math.
Each page is the topic's
README plus its JavaScript implementation, from **javascript-algorithms by
Oleksii Trekhleb**, MIT licensed, copyright (c) 2018 Oleksii Trekhleb.

- Repository: <https://github.com/trekhleb/javascript-algorithms>

## DevOps Interview Questions

`content/devops/interview-questions.md` holds the 105 questions and answers from
**DevOps Interview Questions & Answers by Rohit Ghumare**, converted to this
site's format. The repository has no license, so all rights stay with the
author; it's reproduced here with credit.

- Repository: <https://github.com/rohitg00/devops-interview-questions>

## Backend

`content/backend/` is 20 modules that follow the backend modules of the
[Pocket School Academy course outline](https://www.pocketschool.academy/course-details)
(structure only; the course's own material isn't used). Each section is
adapted from an open documentation project and says so in a "Source" line at
the top, linking the original page.

| Source | Used for | License |
| --- | --- | --- |
| [mdn/content](https://github.com/mdn/content) | How the internet works, domains, web servers, HTTP, methods, status codes, cookies, client-server model, web frameworks | CC BY-SA 2.5 |
| [nodejs/learn](https://github.com/nodejs/learn) | Node.js runtime, npm, environment variables, async, promises, event loop, HTTP transactions | MIT |
| [expressjs/expressjs.com](https://github.com/expressjs/expressjs.com) | Express routing, middleware, error handling | CC BY 4.0 |
| [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) | REST security, session management, authentication, password storage, JWT, Node.js security | CC BY-SA 4.0 |
| [microsoft/TypeScript-Website](https://github.com/microsoft/TypeScript-Website) | Object types, classes, generics | CC BY 4.0 |
| [prisma/dataguide](https://github.com/prisma/dataguide) | Databases, schemas, data modeling, SQL, transactions, optimization, caching | Apache 2.0 |
| [brianc/node-postgres](https://github.com/brianc/node-postgres) | Connecting, queries, pooling, transactions, project structure | MIT |
| [nestjs/docs.nestjs.com](https://github.com/nestjs/docs.nestjs.com) | NestJS first steps, controllers, providers, modules, middleware | MIT |
| [fastapi/fastapi](https://github.com/fastapi/fastapi) | FastAPI tutorial: first steps, path and query parameters, request body | MIT |
| [mmcgrana/gobyexample](https://github.com/mmcgrana/gobyexample) | Go language basics | CC BY 3.0 |
| [gin-gonic/website](https://github.com/gin-gonic/website) | Gin quickstart, routing, binding, middleware | MIT |
| [goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) | Project architecture, error handling, production, security practices | CC BY-SA 4.0 |
| [heroku/12factor](https://github.com/heroku/12factor) | The Twelve-Factor App | MIT |
| [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer) | Application layer and microservices | CC BY 4.0 |

Outline modules not covered here: 1 (course welcome), 22-23 (course
projects), 24 (Git, see the DevOps track's Git module), 31-33 (third-party
integrations and AI), 34-36 (business and marketing) and 39-42 (project ideas).

## Waiting

Sources lined up to import next. Nothing here is in `content/` yet. Licenses
marked ✓ were checked against the repository on GitHub; check the rest before
importing.

| Planned for | Source | License |
| --- | --- | --- |
| System design | [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer) | CC BY 4.0 |
| Algorithms | [yangshun/tech-interview-handbook](https://github.com/yangshun/tech-interview-handbook) | MIT |
| Algorithms | [jwasham/coding-interview-university](https://github.com/jwasham/coding-interview-university) | CC BY-SA 4.0 |
| Algorithms | [donnemartin/interactive-coding-challenges](https://github.com/donnemartin/interactive-coding-challenges) | Apache 2.0 |
| Algorithms | [TheAlgorithms/Python](https://github.com/TheAlgorithms/Python): Python implementations of algorithms and data structures | MIT ✓ |
| Algorithms | [williamfiset/Algorithms](https://github.com/williamfiset/Algorithms): clean Java implementations with video explanations | MIT ✓ |
| DevOps | [kelseyhightower/kubernetes-the-hard-way](https://github.com/kelseyhightower/kubernetes-the-hard-way) | Apache 2.0 |
| DevOps | [mxssl/sre-interview-prep-guide](https://github.com/mxssl/sre-interview-prep-guide) | to check |
| DevOps | [tungbq/devops-basics](https://github.com/tungbq/devops-basics): docs and hands-on examples for 40+ DevOps tools | Apache 2.0 ✓ |
| DevOps (security) | [madhuakula/kubernetes-goat](https://github.com/madhuakula/kubernetes-goat): deliberately vulnerable cluster for hands-on Kubernetes security | MIT ✓ |
| Security (new track) | [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) | CC BY-SA 4.0 |
| AI / LLM (new track) | [mlabonne/llm-course](https://github.com/mlabonne/llm-course) | Apache 2.0 |
| AI / LLM (new track) | [dair-ai/Prompt-Engineering-Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) | MIT |
| CS fundamentals (new track) | [ossu/computer-science](https://github.com/ossu/computer-science) | MIT |

### Link only

These licenses don't allow adapting the content, or would force this repository's
license to change, so link to them instead of importing.

- [karanpratapsingh/system-design](https://github.com/karanpratapsingh/system-design): CC BY-NC-ND 4.0 ✓, no derivatives
- [ByteByteGoHq/system-design-101](https://github.com/ByteByteGoHq/system-design-101): CC BY-NC-ND 4.0 ✓, no derivatives
- [bregman-arie/devops-exercises](https://github.com/bregman-arie/devops-exercises): CC BY-NC-ND 3.0, no derivatives (~2,600 DevOps interview questions and exercises)
- [ashishps1/awesome-system-design-resources](https://github.com/ashishps1/awesome-system-design-resources): GPL-3.0 ✓, a curated list of free system design resources
- [kamranahmedse/developer-roadmap](https://github.com/kamranahmedse/developer-roadmap): custom license, content can't be reused

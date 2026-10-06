import Link from "next/link";
import { ArrowRight, Bot, Boxes, Braces, Network, Server, Terminal, type LucideIcon } from "lucide-react";
import { getDocsByGroup, toMeta } from "@/lib/content";
import { docHref } from "@/lib/utils";
import type { DocMeta } from "@/lib/types";
import { TopBar } from "@/components/layout/TopBar";

interface Section {
  id: string;
  kicker: string;
  title: string;
  body: string;
  href: string;
  accent: string;
  icon: LucideIcon;
  docs: DocMeta[];
  /** The first few docs in reading order, shown as a way in. */
  start: DocMeta[];
}

const byOrder = (a: DocMeta, b: DocMeta) => a.order - b.order;

/** The landing page: the tracks side by side, each with a way in. */
export default function HomePage() {
  const concepts = getDocsByGroup("concept").map(toMeta);
  const sysdesign = [...concepts, ...getDocsByGroup("tech").map(toMeta), ...getDocsByGroup("design").map(toMeta)];
  const coding = getDocsByGroup("coding").map(toMeta);
  const algorithms = [...coding, ...getDocsByGroup("learn").map(toMeta)];
  const devops = getDocsByGroup("devops").map(toMeta);
  const backend = getDocsByGroup("backend").map(toMeta);
  const fde = getDocsByGroup("fde").map(toMeta);
  const languages = getDocsByGroup("languages").map(toMeta);

  const sections: Section[] = [
    {
      id: "sysdesign",
      kicker: "System design",
      title: "How large systems are built, and what each choice costs.",
      body: "Concept modules, the technologies real designs name, and worked designs with interactive architecture diagrams.",
      href: "/docs",
      accent: "var(--concept)",
      icon: Network,
      docs: sysdesign,
      start: [...concepts].sort(byOrder).slice(0, 4),
    },
    {
      id: "algorithms",
      kicker: "Algorithms",
      title: "Data structures and algorithms, one step at a time.",
      body: "Step-through diagrams, big-O costs, brute-force vs optimized solutions and practice problems for interviews.",
      href: "/coding",
      accent: "var(--coding)",
      icon: Boxes,
      docs: algorithms,
      start: [...coding].sort(byOrder).slice(0, 4),
    },
    {
      id: "devops",
      kicker: "DevOps",
      title: "From Linux to production, one module at a time.",
      body: "Linux, networking, containers, CI/CD, cloud, Terraform, Kubernetes, security and interview prep, in order.",
      href: "/devops",
      accent: "var(--devops)",
      icon: Terminal,
      docs: devops,
      start: [...devops].sort(byOrder).slice(0, 4),
    },
    {
      id: "backend",
      kicker: "Backend",
      title: "From the first HTTP request to a production API.",
      body: "HTTP, Node.js, Express, auth, SQL and databases, then NestJS, FastAPI and Go with Gin.",
      href: "/backend",
      accent: "var(--backend)",
      icon: Server,
      docs: backend,
      start: [...backend].sort(byOrder).slice(0, 4),
    },
    {
      id: "fde",
      kicker: "Forward Deployed Engineering",
      title: "Agents, the harness behind them, and the platform they run on.",
      body: "Agentic engineering, building a Claude Code-style agent from scratch, agentic system design and platform engineering.",
      href: "/fde",
      accent: "var(--fde)",
      icon: Bot,
      docs: fde,
      start: [...fde].sort(byOrder).slice(0, 4),
    },
    {
      id: "languages",
      kicker: "Languages",
      title: "The JavaScript you need, then the frameworks built on it.",
      body: "Essential JavaScript for frameworks, one topic per page, then React, Next.js, Laravel and HTMX.",
      href: "/languages",
      accent: "var(--languages)",
      icon: Braces,
      docs: languages,
      start: [...languages].sort(byOrder).slice(0, 4),
    },
  ];

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-shell px-4 pb-24 pt-12 sm:px-8">
        <header className="max-w-reading">
          <p className="font-mono text-micro uppercase tracking-wider text-inkFaint">Atlas CE</p>
          <h1 className="mt-3 text-h1 font-semibold text-ink sm:text-display">
            System design, algorithms, DevOps, backend, forward deployed engineering and languages in one place.
          </h1>
          <p className="mt-4 text-lead text-inkMuted">
            Six tracks, each readable on its own. Pick one to start.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const minutes = section.docs.reduce((sum, doc) => sum + doc.readingMinutes, 0);
            return (
              <section
                key={section.id}
                style={{ "--accent": section.accent } as React.CSSProperties}
                className="flex flex-col rounded-md border border-rule bg-surface p-5 transition-colors duration-fast hover:border-[color:var(--accent)]"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded border border-rule text-[color:var(--accent)]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <h2 className="font-mono text-small font-medium text-[color:var(--accent)]">{section.kicker}</h2>
                </div>

                <p className="mt-4 text-h3 font-semibold text-ink">{section.title}</p>
                <p className="mt-2 text-small text-inkMuted">{section.body}</p>

                <p className="mt-4 font-mono text-micro text-inkFaint">
                  {section.docs.length} pages · ~{Math.round(minutes / 60)} h reading
                </p>

                <ul className="mt-4 flex-1 divide-y divide-rule border-y border-rule">
                  {section.start.map((doc) => (
                    <li key={doc.slug}>
                      <Link
                        href={docHref(doc)}
                        className="flex items-center gap-2 py-2 text-small text-inkMuted transition-colors duration-fast hover:text-ink"
                      >
                        <span className="min-w-0 flex-1 truncate">{doc.title}</span>
                        <span className="font-mono text-micro text-inkFaint">{doc.readingMinutes} min</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href={section.href}
                  className="mt-5 flex items-center justify-center gap-1.5 rounded border border-[color:var(--accent)] px-3 py-2 text-small font-medium text-[color:var(--accent)] transition-colors duration-fast hover:bg-[color:color-mix(in_srgb,var(--accent)_10%,transparent)]"
                >
                  Open {section.kicker}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}

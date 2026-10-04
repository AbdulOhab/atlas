"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp, Braces, ChevronDown, FlaskConical, Lightbulb, Sigma } from "lucide-react";
import type {
  LearnApproach,
  LearnBrute,
  LearnChallenge,
  LearnDetails,
  LearnMathConcept,
  LearnStructure,
  LearnWalkthrough,
} from "@/lib/types";
import { LEARN_TITLES, slugifyHeading } from "@/lib/headings";
import { cn } from "@/lib/utils";
import { InlineMarkdown } from "./InlineMarkdown";

function PanelHeading({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <h2 id={slugifyHeading(title)} className="flex items-center gap-2">
      {icon}
      {title}
    </h2>
  );
}

function formatLines(lines: number[]): string {
  if (lines.length === 0) return "";
  const sorted = [...lines].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = start;
  for (const n of sorted.slice(1)) {
    if (n === end + 1) end = n;
    else {
      ranges.push(start === end ? `${start}` : `${start}\u2013${end}`);
      start = end = n;
    }
  }
  ranges.push(start === end ? `${start}` : `${start}\u2013${end}`);
  return `lines ${ranges.join(", ")}`;
}

/** The big-O strip and the same costs in words, above the body. */
export function LearnOverview({ learn }: { learn: LearnDetails }) {
  const stats = [
    { label: "Best", value: learn.complexity.best },
    { label: "Average", value: learn.complexity.average },
    { label: "Worst", value: learn.complexity.worst },
    { label: "Space", value: learn.complexity.space },
  ];

  return (
    <section>
      <PanelHeading title={LEARN_TITLES.cost} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(
          (stat) =>
            stat.value && (
              <div key={stat.label} className="rounded border border-rule bg-surface px-3 py-2.5">
                <div className="font-mono text-micro uppercase tracking-wider text-inkFaint">{stat.label}</div>
                <div className="mt-1 font-mono text-small font-medium text-[color:var(--accent)]">{stat.value}</div>
              </div>
            ),
        )}
      </div>
      {learn.explained && (
        <div className="mt-3 space-y-2 rounded border border-rule bg-surface px-4 py-3 text-small leading-relaxed text-inkMuted">
          {learn.explained.time && (
            <p>
              <span className="font-mono text-micro uppercase tracking-wider text-inkFaint">Time </span>
              <InlineMarkdown>{learn.explained.time}</InlineMarkdown>
            </p>
          )}
          {learn.explained.space && (
            <p>
              <span className="font-mono text-micro uppercase tracking-wider text-inkFaint">Space </span>
              <InlineMarkdown>{learn.explained.space}</InlineMarkdown>
            </p>
          )}
          {learn.explained.visual && (
            <p className="border-l-2 border-[color:var(--accent)] pl-3 italic">
              <InlineMarkdown>{learn.explained.visual}</InlineMarkdown>
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/** The Python structures a problem in this topic maps onto, with their costs. */
export function LearnStructures({ structures }: { structures: LearnStructure[] }) {
  if (structures.length === 0) return null;

  return (
    <section>
      <PanelHeading
        title={LEARN_TITLES.structures}
        icon={<Braces className="h-4 w-4 text-[color:var(--accent)]" aria-hidden />}
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {structures.map((s) => (
          <div key={s.concept} className="overflow-hidden rounded border border-rule bg-surface">
            <div className="border-b border-rule bg-canvas px-4 py-2.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-small font-semibold text-ink">{s.concept}</span>
                <span className="font-mono text-micro text-inkFaint">→</span>
                <span className="font-mono text-tiny text-[color:var(--accent)]">{s.python}</span>
              </div>
              {s.aliases.length > 0 && (
                <div className="mt-0.5 font-mono text-micro text-inkFaint">also called: {s.aliases.join(", ")}</div>
              )}
            </div>
            <div className="px-4 py-2">
              {s.declaration && (
                <pre className="overflow-x-auto font-mono text-micro leading-relaxed text-inkMuted">
                  <code>{s.declaration}</code>
                </pre>
              )}
              <table className="mt-1 w-full border-collapse text-tiny">
                <tbody>
                  {s.ops.map((op) => (
                    <tr key={op.op} className="border-t border-rule">
                      <td className="py-1.5 pr-3 align-top text-ink">{op.op}</td>
                      <td className="py-1.5 pr-3 align-top font-mono text-micro text-inkMuted">
                        <code>{op.code}</code>
                      </td>
                      <td className="w-20 py-1.5 align-top text-right font-mono text-micro text-[color:var(--accent)]">
                        {op.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ApproachCard({ approach, optimized }: { approach: LearnApproach; optimized: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded border bg-surface p-4",
        optimized ? "border-[color:var(--accent)]" : "border-rule",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-micro uppercase tracking-wide",
            optimized
              ? "bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
              : "bg-raised text-inkMuted",
          )}
        >
          {optimized ? "Optimized" : "Brute force"}
        </span>
        <span className="text-small font-semibold text-ink">{approach.name}</span>
      </div>
      <div className="mt-2 flex gap-4 font-mono text-micro text-inkMuted">
        <span>
          time <span className="text-ink">{approach.time}</span>
        </span>
        <span>
          space <span className="text-ink">{approach.space}</span>
        </span>
      </div>
      {approach.quote && <p className="mt-2 text-small italic leading-relaxed text-inkMuted">“{approach.quote}”</p>}
      {(approach.pros.length > 0 || approach.cons.length > 0) && (
        <ul className="plain mt-3 space-y-1.5 text-tiny">
          {approach.pros.map((pro) => (
            <li key={pro} className="flex items-start gap-2 text-inkMuted">
              <ArrowUp className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--tone-green)]" aria-hidden />
              {pro}
            </li>
          ))}
          {approach.cons.map((con) => (
            <li key={con} className="flex items-start gap-2 text-inkMuted">
              <ArrowDown className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--tone-amber)]" aria-hidden />
              {con}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The interview move: say the brute force out loud, then optimize it. */
export function LearnBrutePanel({ brute }: { brute: LearnBrute }) {
  return (
    <section>
      <PanelHeading
        title={LEARN_TITLES.brute}
        icon={<FlaskConical className="h-4 w-4 text-[color:var(--accent)]" aria-hidden />}
      />
      <div className="rounded border border-rule bg-canvas px-4 py-3">
        <div className="text-tiny text-inkFaint">
          <span className="font-mono uppercase tracking-wider text-inkMuted">The move </span>
          {brute.strategy}
        </div>
        {brute.quote && <p className="mt-1 text-small italic text-ink">“{brute.quote}”</p>}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <ApproachCard approach={brute.brute} optimized={false} />
        <ApproachCard approach={brute.optimized} optimized={true} />
      </div>

      {brute.tradeoff && (
        <p className="mt-3 text-small leading-relaxed text-inkMuted">
          <span className="font-mono text-micro uppercase tracking-wider text-inkFaint">The tradeoff </span>
          <InlineMarkdown>{brute.tradeoff}</InlineMarkdown>
        </p>
      )}

      {brute.tip && (
        <div className="mt-3 border-l-2 border-[color:var(--accent)] bg-[color:var(--accent-soft)] py-2.5 pl-4 pr-3 text-small text-ink">
          <span className="font-semibold">Say this: </span>
          {brute.tip}
        </div>
      )}
    </section>
  );
}

/** The scraped step-through: the full program, then what each step does to it. */
export function LearnWalkthroughPanel({ walkthrough }: { walkthrough: LearnWalkthrough }) {
  return (
    <section>
      <PanelHeading title={LEARN_TITLES.walkthrough} />
      <div className="rounded border border-rule bg-surface">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule bg-canvas px-4 py-2.5">
          <div>
            <span className="text-small font-semibold text-ink">{walkthrough.problem}</span>
            <span className="ml-2 text-tiny text-inkFaint">{walkthrough.tagline}</span>
          </div>
          <div className="font-mono text-micro text-inkMuted">
            <span className="text-[color:var(--accent)]">{walkthrough.time}</span>
            <span className="px-2 text-inkFaint">·</span>
            space {walkthrough.space}
          </div>
        </div>

        <div className="border-b border-rule bg-canvas px-4 py-3">
          <div className="mb-1.5 font-mono text-micro uppercase tracking-wider text-inkFaint">
            the full program — each step below names the lines it touches
          </div>
          <pre className="overflow-x-auto font-mono text-micro leading-relaxed text-ink">
            <code>{walkthrough.code}</code>
          </pre>
        </div>

        <ol className="plain divide-y divide-rule">
          {walkthrough.steps.map((step, i) => (
            <li key={i} className="px-4 py-3.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-micro tabular-nums text-[color:var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-small font-medium text-ink">{step.title}</span>
                {step.lines.length > 0 && (
                  <span className="font-mono text-micro text-inkFaint">{formatLines(step.lines)}</span>
                )}
                {step.cost && (
                  <span className="ml-auto font-mono text-micro text-inkMuted">{step.cost}</span>
                )}
              </div>
              <p className="mt-1.5 pl-8 text-small leading-relaxed text-inkMuted">
                <InlineMarkdown>{step.detail}</InlineMarkdown>
              </p>
              {step.math && (
                <p className="mt-2 ml-8 border-l-2 border-[color:var(--accent)] pl-3 text-tiny italic leading-relaxed text-inkFaint">
                  <InlineMarkdown>{step.math}</InlineMarkdown>
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** The math the topic assumes, the way the source site teaches it. */
export function LearnMathPanel({ concepts }: { concepts: LearnMathConcept[] }) {
  if (concepts.length === 0) return null;

  return (
    <section>
      <PanelHeading
        title={LEARN_TITLES.math}
        icon={<Sigma className="h-4 w-4 text-[color:var(--accent)]" aria-hidden />}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {concepts.map((concept) => (
          <div key={concept.id || concept.title} className="rounded border border-rule bg-surface p-4">
            <h3 className="text-small font-semibold text-ink">{concept.title}</h3>
            <p className="mt-2 text-small leading-relaxed text-inkMuted">
              <InlineMarkdown>{concept.plain}</InlineMarkdown>
            </p>
            {concept.visual && (
              <p className="mt-2 border-l-2 border-[color:var(--accent)] pl-3 text-tiny italic leading-relaxed text-inkFaint">
                <InlineMarkdown>{concept.visual}</InlineMarkdown>
              </p>
            )}
            {concept.analogy && (
              <p className="mt-2 text-tiny leading-relaxed text-inkMuted">
                <span className="font-mono text-micro uppercase tracking-wider text-inkFaint">Analogy </span>
                <InlineMarkdown>{concept.analogy}</InlineMarkdown>
              </p>
            )}
            {concept.why && (
              <p className="mt-2 border-l-2 border-[color:var(--accent)] bg-[color:var(--accent-soft)] py-1.5 pl-3 pr-2 text-tiny leading-relaxed text-ink">
                <span className="font-mono text-micro uppercase tracking-wider text-inkFaint">Why it matters </span>
                <InlineMarkdown>{concept.why}</InlineMarkdown>
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Practice challenges with progressive hints, revealed one at a time. */
export function LearnChallengesPanel({ challenges }: { challenges: LearnChallenge[] }) {
  const baseId = useId();
  const [revealed, setRevealed] = useState<Record<string, number>>({});

  function reveal(challengeIndex: number, total: number) {
    setRevealed((previous) => ({
      ...previous,
      [challengeIndex]: Math.min((previous[challengeIndex] ?? 0) + 1, total),
    }));
  }

  return (
    <section>
      <PanelHeading
        title={LEARN_TITLES.challenges}
        icon={<Lightbulb className="h-4 w-4 text-[color:var(--accent)]" aria-hidden />}
      />
      <div className="space-y-3">
        {challenges.map((challenge, ci) => {
          const shown = revealed[ci] ?? 0;
          const panelId = `${baseId}-challenge-${ci}`;
          return (
            <div key={ci} id={panelId} className="rounded border border-rule bg-surface">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-rule px-4 py-2.5">
                <span className="text-small font-semibold text-ink">{challenge.title}</span>
                <span className="rounded-full bg-raised px-2 py-0.5 font-mono text-micro uppercase tracking-wide text-inkMuted">
                  {challenge.difficulty}
                </span>
                {challenge.optimal && (
                  <span className="ml-auto font-mono text-micro text-inkFaint">target: {challenge.optimal}</span>
                )}
              </div>
              <div className="px-4 py-3">
                <p className="text-small leading-relaxed text-inkMuted">
                  <InlineMarkdown>{challenge.description}</InlineMarkdown>
                </p>

                {challenge.starter && (
                  <div className="mt-3 rounded border border-rule bg-canvas px-3 py-2.5">
                    <div className="mb-1.5 font-mono text-micro uppercase tracking-wider text-inkFaint">
                      starter code
                    </div>
                    <pre className="overflow-x-auto font-mono text-micro leading-relaxed text-ink">
                      <code>{challenge.starter}</code>
                    </pre>
                  </div>
                )}

                {challenge.tests.length > 0 && (
                  <div className="mt-3 overflow-x-auto rounded border border-rule">
                    <table className="w-full border-collapse text-tiny">
                      <thead>
                        <tr className="bg-canvas">
                          <th className="border-b border-rule px-3 py-1.5 text-left font-mono text-micro uppercase tracking-wider text-inkFaint">
                            Input
                          </th>
                          <th className="border-b border-rule px-3 py-1.5 text-left font-mono text-micro uppercase tracking-wider text-inkFaint">
                            Expected
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {challenge.tests.map((tc, ti) => (
                          <tr key={ti} className="border-t border-rule first:border-t-0">
                            <td className="px-3 py-1.5 font-mono text-micro text-ink">{tc.input}</td>
                            <td className="px-3 py-1.5 font-mono text-micro text-[color:var(--accent)]">{tc.expected}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {challenge.hints.length > 0 && (
                  <div className="mt-3">
                    {challenge.hints.slice(0, shown).map((hint, hi) => (
                      <p
                        key={hi}
                        className="border-l-2 border-[color:var(--accent)] bg-canvas mb-2 py-1.5 pl-3 pr-3 text-tiny leading-relaxed text-inkMuted"
                      >
                        <span className="font-mono text-micro uppercase tracking-wider text-inkFaint">
                          Hint {hi + 1}{" "}
                        </span>
                        <InlineMarkdown>{hint}</InlineMarkdown>
                      </p>
                    ))}
                    {shown < challenge.hints.length && (
                      <button
                        type="button"
                        onClick={() => reveal(ci, challenge.hints.length)}
                        className="flex items-center gap-1.5 rounded border border-rule px-2.5 py-1 text-tiny text-inkMuted transition-colors duration-fast hover:border-ruleStrong hover:text-ink"
                      >
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                        Reveal hint {shown + 1} of {challenge.hints.length}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

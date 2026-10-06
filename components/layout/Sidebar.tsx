"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FlaskConical, PanelLeftClose, X } from "lucide-react";
import type { DocMeta, Track } from "@/lib/types";
import { useUiStore } from "@/store/useUiStore";
import { cn, trackOf } from "@/lib/utils";
import { SidebarLink } from "./SidebarLink";
import { SiteSwitcher } from "./SiteSwitcher";

interface SidebarProps {
  concepts: DocMeta[];
  tech: DocMeta[];
  designs: DocMeta[];
  coding: DocMeta[];
  learn: DocMeta[];
  devops: DocMeta[];
  backend: DocMeta[];
  fde: DocMeta[];
  languages: DocMeta[];
  security: DocMeta[];
  interview: DocMeta[];
  ai: DocMeta[];
}

/** Ids match the `section-collapsed-*` rules in globals.css. */
const SECTIONS = [
  {
    id: "concepts",
    track: "sysdesign",
    heading: "Concepts",
    note: "",
    accent: "var(--concept)",
  },
  {
    id: "designs",
    track: "sysdesign",
    heading: "Designs",
    note: "",
    accent: "var(--design)",
  },
  {
    id: "tech",
    track: "sysdesign",
    heading: "Key Technologies",
    note: "",
    accent: "var(--tech)",
  },
  {
    id: "data-structures",
    track: "algorithms",
    heading: "Data Structures",
    note: "",
    accent: "var(--coding)",
  },
  {
    id: "algo",
    track: "algorithms",
    heading: "Algorithms",
    note: "",
    accent: "var(--learn)",
  },
  {
    id: "devops",
    track: "devops",
    heading: "Modules",
    note: "",
    accent: "var(--devops)",
  },
  {
    id: "backend",
    track: "backend",
    heading: "Modules",
    note: "",
    accent: "var(--backend)",
  },
  {
    id: "fde",
    track: "fde",
    heading: "Modules",
    note: "",
    accent: "var(--fde)",
  },
  {
    id: "languages",
    track: "languages",
    heading: "Modules",
    note: "",
    accent: "var(--languages)",
  },
  {
    id: "security",
    track: "security",
    heading: "Modules",
    note: "",
    accent: "var(--security)",
  },
  {
    id: "interview",
    track: "algorithms",
    heading: "Interview Prep",
    note: "",
    accent: "var(--interview)",
  },
  {
    id: "ai",
    track: "ai",
    heading: "Modules",
    note: "",
    accent: "var(--ai)",
  },
] as const satisfies readonly { id: string; track: Track; heading: string; note: string; accent: string }[];

type SectionId = (typeof SECTIONS)[number]["id"];

interface SectionProps {
  id: SectionId;
  heading: string;
  note: string;
  accent: string;
  docs: DocMeta[];
  expanded: boolean;
  onToggle: () => void;
  activeSlug: string;
  onNavigate: () => void;
}

/**
 * One module in a section. A long module's child pages nest under it: they
 * open while you're reading the module, and the arrow opens or closes them
 * without leaving the page you're on.
 */
function SidebarItem({
  doc,
  number,
  activeSlug,
  onNavigate,
}: {
  doc: DocMeta;
  number: number;
  activeSlug: string;
  onNavigate: () => void;
}) {
  const inside = activeSlug === doc.slug || activeSlug.startsWith(`${doc.slug}/`);
  const [toggled, setToggled] = useState<boolean | null>(null);
  // Reset to "follow the page" whenever you move into or out of this module.
  useEffect(() => setToggled(null), [inside]);
  const hasParts = !!doc.parts?.length;
  const open = hasParts && (toggled ?? inside);

  return (
    <div className="relative">
      <SidebarLink
        doc={doc}
        number={number}
        tag={doc.sharedFrom}
        active={activeSlug === doc.slug}
        onNavigate={onNavigate}
        className={hasParts ? "pr-7" : undefined}
      />
      {hasParts && (
        <button
          type="button"
          onClick={() => setToggled(!open)}
          aria-expanded={open}
          aria-label={`${open ? "Hide" : "Show"} pages in ${doc.title}`}
          className="absolute right-1 top-1.5 flex h-5 w-5 items-center justify-center rounded-sm text-inkFaint transition-colors duration-fast hover:bg-raised hover:text-ink"
        >
          <ChevronRight
            aria-hidden
            className={cn("h-3.5 w-3.5 transition-transform duration-fast", open && "rotate-90")}
          />
        </button>
      )}
      {open &&
        doc.parts!.map((part) => (
          <SidebarLink
            key={part.slug}
            doc={{ ...doc, slug: `${doc.slug}/${part.slug}`, title: part.title, parts: undefined, sharedFrom: undefined }}
            nested
            active={activeSlug === `${doc.slug}/${part.slug}`}
            onNavigate={onNavigate}
          />
        ))}
    </div>
  );
}

/**
 * The body is hidden by CSS rather than by unmounting it, so the collapsed
 * state can be applied before React runs (see ThemeScript) and nothing flashes
 * open on load.
 */
function Section({ id, heading, note, accent, docs, expanded, onToggle, activeSlug, onNavigate }: SectionProps) {
  const bodyId = `sidebar-section-${id}`;

  return (
    <div data-section={id}>
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="flex w-full items-center gap-2 rounded-sm px-3 py-1 text-left transition-colors duration-fast hover:bg-raised"
        >
          <ChevronRight
            aria-hidden
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-inkFaint transition-transform duration-fast",
              expanded && "rotate-90",
            )}
          />
          <span className="text-small font-semibold text-ink">{heading}</span>
          <span className="ml-auto font-mono text-micro" style={{ color: accent }}>
            {docs.length}
          </span>
        </button>
      </h2>

      <div id={bodyId} data-section-body>
        <p className="mb-3 mt-2 px-3 text-tiny leading-snug text-inkFaint">{note}</p>
        <nav className="flex flex-col">
          {/* Numbered by position: pooled sections mix docs from tracks with their own orders. */}
          {docs.map((doc, i) => (
            <SidebarItem
              key={`${doc.group}/${doc.slug}`}
              doc={doc}
              number={i + 1}
              activeSlug={activeSlug}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

export function Sidebar({ concepts, tech, designs, coding, learn, devops, backend, fde, languages, security, interview, ai }: SidebarProps) {
  const pathname = usePathname();
  const open = useUiStore((s) => s.sidebarOpen);
  const setOpen = useUiStore((s) => s.setSidebarOpen);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const collapsedSections = useUiStore((s) => s.collapsedSections);
  const toggleSection = useUiStore((s) => s.toggleSection);
  const expandSection = useUiStore((s) => s.expandSection);
  const track = trackOf(pathname);
  const activeSlug = pathname.startsWith("/docs/")
    ? pathname.slice("/docs/".length)
    : pathname.startsWith("/coding/")
      ? pathname.slice("/coding/".length)
      : pathname.startsWith("/learn/")
        ? pathname.slice("/learn/".length)
        : pathname.startsWith("/devops/")
          ? pathname.slice("/devops/".length)
          : pathname.startsWith("/backend/")
            ? pathname.slice("/backend/".length)
            : pathname.startsWith("/fde/")
              ? pathname.slice("/fde/".length)
              : pathname.startsWith("/languages/")
                ? pathname.slice("/languages/".length)
                : pathname.startsWith("/security/")
                  ? pathname.slice("/security/".length)
                  : pathname.startsWith("/interview/")
                    ? pathname.slice("/interview/".length)
                    : pathname.startsWith("/ai/")
                      ? pathname.slice("/ai/".length)
                      : "";

  // Coding and learn no longer get their own sidebar section — they're pooled
  // and re-split by what each item actually is, so e.g. Hash Tables (coding)
  // and Hash Tables (learn) both land under Data Structures regardless of
  // which track wrote them.
  const combined = [...coding, ...learn];
  const dataStructureDocs = combined.filter((doc) => doc.category === "Data structures");
  const algoDocs = combined.filter((doc) => doc.category !== "Data structures");
  const docsById: Record<SectionId, DocMeta[]> = {
    concepts,
    tech,
    designs,
    "data-structures": dataStructureDocs,
    algo: algoDocs,
    devops,
    backend,
    fde,
    languages,
    security,
    interview,
    ai,
  };
  const close = () => setOpen(false);

  // The store is restored from localStorage before the first client render,
  // which the server-rendered markup cannot know about. Render the headings
  // expanded until after mount so hydration matches; CSS is already hiding
  // whatever should be collapsed.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // The html classes are what actually hide things; keep them in step with the store.
  useEffect(() => {
    document.documentElement.classList.toggle("sidebar-collapsed", collapsed);
  }, [collapsed]);

  useEffect(() => {
    for (const section of SECTIONS) {
      document.documentElement.classList.toggle(
        `section-collapsed-${section.id}`,
        collapsedSections.includes(section.id),
      );
    }
  }, [collapsedSections]);

  // Navigating into a folded-away section opens it, so the current page is
  // never hidden. Only on a change of page: collapsing the section you are
  // reading has to stick, including across reloads.
  const lastSlug = useRef(activeSlug);
  useEffect(() => {
    if (activeSlug === lastSlug.current) return;
    lastSlug.current = activeSlug;
    const base = activeSlug.split("/")[0];
    const section = SECTIONS.find((s) => docsById[s.id].some((doc) => doc.slug === base));
    if (section) expandSection(section.id);
    // docsById is rebuilt each render; the slug is what decides this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug, expandSection]);

  // `[` toggles the desktop sidebar, unless the reader is typing somewhere.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "[" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      toggleCollapsed();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={close}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside
        data-sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-sidebar flex-col border-r border-rule bg-surface transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-rule px-4">
          <SiteSwitcher track={track} onNavigate={close} />
          <button
            type="button"
            onClick={close}
            aria-label="Close navigation"
            className="text-inkMuted hover:text-ink lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            title="Collapse sidebar  ["
            className="hidden h-8 w-8 items-center justify-center rounded text-inkFaint transition-colors duration-fast hover:bg-raised hover:text-ink lg:flex"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto py-6">
          {SECTIONS.filter((section) => section.track === track).map((section) => (
            <Section
              key={section.id}
              id={section.id}
              heading={section.heading}
              note={section.note}
              accent={section.accent}
              docs={docsById[section.id]}
              expanded={!hydrated || !collapsedSections.includes(section.id)}
              onToggle={() => toggleSection(section.id)}
              activeSlug={activeSlug}
              onNavigate={close}
            />
          ))}
          {track === "sysdesign" && (
            <nav className="px-3">
              <Link
                href="/playground"
                onClick={close}
                aria-current={pathname === "/playground" ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded border px-3 py-2 text-small transition-colors duration-fast",
                  pathname === "/playground"
                    ? "border-design bg-designSoft text-ink"
                    : "border-rule text-inkMuted hover:border-ruleStrong hover:text-ink",
                )}
              >
                <FlaskConical className="h-4 w-4 shrink-0 text-design" aria-hidden />
                <span className="leading-snug">Playground</span>
                <span className="ml-auto font-mono text-micro text-inkFaint">beta</span>
              </Link>
            </nav>
          )}
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { CircleCheck } from "lucide-react";
import type { DocMeta } from "@/lib/types";
import { useIsCompleted } from "@/store/useProgressStore";
import { accentVar, cn, docHref } from "@/lib/utils";

interface SidebarLinkProps {
  doc: DocMeta;
  active: boolean;
  onNavigate: () => void;
  /** Position in the sidebar section; falls back to the doc's own order. */
  number?: number;
  /** Small label for a module shared from another track, e.g. "devops". */
  tag?: string;
  /** A child page under a parent module: indented, with a dot instead of a number. */
  nested?: boolean;
  className?: string;
}

export function SidebarLink({ doc, active, onNavigate, number, tag, nested, className }: SidebarLinkProps) {
  const completed = useIsCompleted(doc.slug);

  return (
    <Link
      href={docHref(doc)}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      style={accentVar(doc.group)}
      className={cn(
        "group flex items-baseline gap-2.5 border-l-2 pr-2 transition-colors duration-fast",
        nested ? "py-1 pl-9 text-tiny" : "py-1.5 pl-3 text-small",
        active
          ? "border-[color:var(--accent)] bg-[color:var(--accent-soft,transparent)] text-ink"
          : "border-transparent text-inkMuted hover:border-rule hover:text-ink",
        className,
      )}
    >
      <span
        className={cn(
          "w-4 shrink-0 font-mono text-micro tabular-nums",
          active ? "text-[color:var(--accent)]" : "text-inkFaint",
        )}
      >
        {nested ? "·" : String(number ?? doc.order).padStart(2, "0")}
      </span>
      <span className="leading-snug">{doc.title}</span>
      {tag && !completed && <span className="ml-auto self-center font-mono text-micro text-inkFaint">{tag}</span>}
      {completed && (
        <>
          <CircleCheck
            className="ml-auto h-3.5 w-3.5 shrink-0 self-center text-[color:var(--accent)]"
            aria-hidden
          />
          <span className="sr-only">(completed)</span>
        </>
      )}
    </Link>
  );
}

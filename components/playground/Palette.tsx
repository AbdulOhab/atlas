"use client";

import type { CSSProperties, DragEvent } from "react";
import { COMPONENTS, PALETTE } from "@/lib/playground/components";
import type { ComponentKind } from "@/lib/playground/types";
import { KIND_ICONS } from "./ComponentNode";

export const DRAG_TYPE = "application/atlas-component";

interface PaletteProps {
  /** Tap-to-add for touch screens, where HTML drag and drop doesn't fire. */
  onAdd: (kind: ComponentKind) => void;
}

export function Palette({ onAdd }: PaletteProps) {
  function onDragStart(event: DragEvent, kind: ComponentKind) {
    event.dataTransfer.setData(DRAG_TYPE, kind);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-rule bg-surface md:w-56 md:border-b-0 md:border-r">
      <div className="border-b border-rule px-4 py-3">
        <h2 className="text-small font-semibold text-ink">Components</h2>
        <p className="mt-0.5 text-tiny leading-snug text-inkFaint">
          <span className="md:hidden">Tap to add to the canvas.</span>
          <span className="hidden md:inline">Drag onto the canvas, or click to add.</span>
        </p>
      </div>
      {/* A scrolling row on phones, a column beside the canvas from md up. */}
      <ul className="flex gap-1 overflow-x-auto p-2 md:flex-1 md:flex-col md:gap-0 md:space-y-1 md:overflow-y-auto md:overflow-x-visible">
        {PALETTE.map((kind) => {
          const def = COMPONENTS[kind];
          const Icon = KIND_ICONS[kind];
          return (
            <li key={kind} className="shrink-0 md:shrink">
              <button
                type="button"
                draggable
                onDragStart={(e) => onDragStart(e, kind)}
                onClick={() => onAdd(kind)}
                title={def.description}
                style={{ "--tone": def.tone } as CSSProperties}
                className="pg-palette-item flex w-full cursor-grab whitespace-nowrap md:whitespace-normal items-center gap-2.5 rounded border border-transparent px-2 py-1.5 text-left transition-colors duration-fast hover:border-rule hover:bg-raised active:cursor-grabbing"
              >
                <span className="flow-node__icon" aria-hidden>
                  <Icon strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block text-small text-ink">{def.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

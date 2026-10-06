/** The atlas mark: `^/` — a caret and the wordmark's slash. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5,19 10.5,12 16,19" stroke="var(--ink)" />
        <line x1="19" y1="25" x2="27" y2="7" stroke="var(--devops)" />
      </g>
    </svg>
  );
}

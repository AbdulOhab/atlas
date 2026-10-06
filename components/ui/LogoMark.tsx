/**
 * The atlas mark: the wordmark's slash with one dot per track on it —
 * system design, algorithms, devops — in their accent colours.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <line x1="8" y1="26" x2="24" y2="6" stroke="var(--ink-faint)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="8" cy="26" r="4" fill="var(--concept)" />
      <circle cx="16" cy="16" r="4" fill="var(--coding)" />
      <circle cx="24" cy="6" r="4" fill="var(--devops)" />
    </svg>
  );
}

/**
 * Shared CSS-only backdrop.
 * Kept deliberately quiet so content and navigation stay visually primary.
 */
export default function SiteBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[var(--fx-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-18%,rgba(0,128,128,.095),transparent_36%)] dark:bg-[radial-gradient(circle_at_50%_-18%,rgba(99,216,212,.075),transparent_36%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--fx-primary)]/15 to-transparent" />
    </div>
  )
}

/**
 * Shared CSS-only backdrop.
 * No raster background assets are used so the shell stays fast and predictable
 * on low-memory phones and across themes.
 */
export default function SiteBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--fx-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-12%,rgba(0,128,128,.13),transparent_34%)] dark:bg-[radial-gradient(circle_at_50%_-12%,rgba(99,216,212,.11),transparent_34%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[.10] via-transparent to-black/[.025] dark:from-white/[.015] dark:via-transparent dark:to-black/[.28]" />
      <div className="absolute inset-0 fenix-grid opacity-75 dark:opacity-100" />
      <div className="absolute -left-24 top-[12%] h-80 w-80 rounded-full bg-teal-400/[.07] blur-[88px] dark:bg-teal-300/[.05]" />
      <div className="absolute -right-24 top-[32%] h-80 w-80 rounded-full bg-amber-300/[.055] blur-[92px] dark:bg-amber-200/[.025]" />
      <div className="absolute bottom-[-10%] left-[36%] h-72 w-72 rounded-full bg-teal-500/[.045] blur-[96px] dark:bg-teal-400/[.03]" />
      <div className="absolute left-1/2 top-[15%] h-px w-[min(70vw,980px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent dark:via-teal-300/15" />
    </div>
  )
}

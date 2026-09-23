/**
 * CSS-only FeniX backdrop.
 * No raster/hero background image: the visual depth comes from controlled gradients,
 * grid structure and a soft topographic vignette.
 */
export default function SiteBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--fx-bg)]">
      <div className="absolute -top-32 left-1/2 h-[34rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,128,128,.12),transparent_62%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(99,216,212,.08),transparent_62%)]" />
      <div className="absolute inset-0 opacity-[.26] [background-image:linear-gradient(to_right,rgba(11,23,54,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,23,54,.035)_1px,transparent_1px)] [background-size:42px_42px] dark:opacity-[.2] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,.028)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.028)_1px,transparent_1px)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--fx-primary-soft)] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,transparent_0,transparent_48%,rgba(11,23,54,.035)_100%)] dark:bg-[radial-gradient(circle_at_50%_25%,transparent_0,transparent_48%,rgba(0,0,0,.22)_100%)]" />
    </div>
  )
}

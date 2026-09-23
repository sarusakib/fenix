/** Lightweight FeniX shell background. No raster images or decorative assets. */
export default function SiteBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--fx-bg)]">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(0,128,128,.08),transparent_62%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,216,212,.07),transparent_62%)]" />
    </div>
  )
}

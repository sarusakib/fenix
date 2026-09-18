'use client'

export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#f6f8f8] dark:bg-[#030506]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,128,128,0.09),transparent_38%)] dark:bg-[radial-gradient(circle_at_50%_-10%,rgba(0,128,128,0.13),transparent_38%)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-500/[0.035] blur-3xl dark:bg-teal-400/[0.055]" />
      <div className="absolute -right-24 top-[42%] h-80 w-80 rounded-full bg-amber-500/[0.025] blur-3xl dark:bg-amber-300/[0.025]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/[0.025] to-transparent dark:from-white/[0.015]" />
    </div>
  )
}

export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#f3f7f7] dark:bg-[#030506]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-12%,rgba(0,128,128,0.13),transparent_34%)] dark:bg-[radial-gradient(circle_at_50%_-12%,rgba(99,216,212,0.11),transparent_34%)]" />
      <div className="absolute inset-0 fenix-grid opacity-70 dark:opacity-100" />
      <div className="absolute -left-24 top-[14%] h-80 w-80 rounded-full bg-teal-400/[0.08] blur-[90px] dark:bg-teal-300/[0.06]" />
      <div className="absolute right-[-10%] top-[28%] h-[26rem] w-[26rem] rounded-full bg-amber-300/[0.08] blur-[110px] dark:bg-amber-200/[0.035]" />
      <div className="absolute bottom-[-8%] left-[38%] h-72 w-72 rounded-full bg-teal-500/[0.05] blur-[100px] dark:bg-teal-400/[0.04]" />
      <div className="absolute left-1/2 top-[18%] h-px w-[min(70vw,980px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent dark:via-teal-300/15" />
    </div>
  )
}

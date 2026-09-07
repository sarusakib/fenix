'use client'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#030506] px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.035] p-8 text-center shadow-2xl backdrop-blur-xl">

        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#56d1ce]">
          FeniX
        </div>

        <h1 className="mt-4 text-2xl font-bold">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/40">
          The page could not be loaded correctly.
          Please try again.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-7 min-h-[46px] rounded-xl bg-[#008080] px-5 text-sm font-semibold text-white transition hover:bg-[#079494]"
        >
          Try again
        </button>
      </div>
    </main>
  )
}

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#030506] px-5 text-white">
      <div className="text-center">

        <div className="text-7xl font-black tracking-[-0.06em] sm:text-8xl">
          404
        </div>

        <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.3em] text-[#56d1ce]">
          FeniX
        </div>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/40">
          The page you are looking for does not exist.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-[46px] items-center rounded-xl bg-[#008080] px-5 text-sm font-semibold text-white transition hover:bg-[#079494]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}

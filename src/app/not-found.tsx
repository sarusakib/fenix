import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#030506] px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 text-center">
        <div className="text-6xl font-black text-white/90">404</div>

        <h1 className="mt-4 text-2xl font-black">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/45">
          The page you are looking for does not exist.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#008080] px-5 text-sm font-bold text-white transition hover:bg-[#079494]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}

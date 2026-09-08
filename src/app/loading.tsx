export default function Loading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#030506] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#72ddda]" />
        <p className="mt-5 text-sm text-white/45">FeniX loading…</p>
      </div>
    </main>
  )
}

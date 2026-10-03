import Image from 'next/image'
import FenixBrand from '@/components/FenixBrand'

export default function Loading() {
  return (
    <main aria-label="Loading FeniX" aria-busy="true" className="fenix-shell flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--fx-primary-soft)]">
            <Image src="/icon.svg" alt="" width={36} height={36} priority className="h-9 w-9" />
          </div>
          <div className="min-w-0 flex-1">
            <FenixBrand compact />
            <div className="mt-2 h-2 w-28 animate-pulse rounded-full bg-[var(--fx-primary-soft)]" />
          </div>
        </div>
        <div className="mt-7 space-y-3">
          <div className="h-3 w-full animate-pulse rounded-full bg-[var(--fx-primary-soft)]" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-[var(--fx-primary-soft)]" />
          <div className="h-20 animate-pulse rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]" />
        </div>
        <p className="mt-6 text-center text-xs font-semibold text-[var(--fx-muted)]">FeniX loading…</p>
      </div>
    </main>
  )
}

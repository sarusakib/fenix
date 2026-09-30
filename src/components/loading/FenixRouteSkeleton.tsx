export default function FenixRouteSkeleton({variant='feed'}:{variant?:'feed'|'article'|'messages'|'search'|'brain'|'generic'}) {
  const rows = variant === 'messages' ? 6 : variant === 'article' ? 4 : 5
  return (
    <main aria-label="Loading FeniX" aria-busy="true" className="fenix-shell min-h-dvh">
      <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-7 sm:px-6 lg:px-8">
        <div className="h-5 w-24 animate-pulse rounded bg-[var(--fx-primary-soft)]" />
        <div className="mt-6 h-10 w-64 max-w-full animate-pulse rounded-xl bg-[var(--fx-primary-soft)]" />
        <div className="mt-3 h-4 w-[28rem] max-w-full animate-pulse rounded bg-[var(--fx-primary-soft)]" />
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: variant === 'search' ? 6 : 3 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)]" />
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
              <div className="h-4 w-32 animate-pulse rounded bg-[var(--fx-primary-soft)]" />
              <div className="mt-4 h-5 w-3/4 max-w-full animate-pulse rounded bg-[var(--fx-primary-soft)]" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-[var(--fx-primary-soft)]" />
              <div className="mt-2 h-4 w-5/6 max-w-full animate-pulse rounded bg-[var(--fx-primary-soft)]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

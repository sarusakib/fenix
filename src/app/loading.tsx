export default function Loading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#030506] text-white">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#56d1ce]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#56d1ce] [animation-delay:120ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#56d1ce] [animation-delay:240ms]" />
      </div>
    </main>
  )
}

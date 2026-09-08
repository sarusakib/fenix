export default function Loading() {
  return (
    <main
      className="
        flex
        min-h-dvh
        items-center
        justify-center
        bg-[#eef3f5]
        px-6
        text-[#111827]
        dark:bg-[#030506]
        dark:text-white
      "
      aria-busy="true"
      aria-live="polite"
    >
      <div className="text-center">
        <div
          className="
            mx-auto
            h-10
            w-10
            animate-spin
            rounded-full
            border-2
            border-black/10
            border-t-[#008080]
            dark:border-white/10
            dark:border-t-[#72ddda]
          "
          aria-hidden="true"
        />

        <p className="mt-5 text-sm text-black/45 dark:text-white/45">
          FeniX loading…
        </p>
      </div>
    </main>
  )
}

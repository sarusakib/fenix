import Navbar from '@/components/Navbar'
import DirectoryBrowser from '@/components/directory/DirectoryBrowser'

export default function DirectoryPage() {
  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip bg-[var(--fx-bg)] text-[var(--fx-text)]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <DirectoryBrowser />
      </div>
    </main>
  )
}

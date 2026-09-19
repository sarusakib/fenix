import Navbar from '@/components/Navbar'
import DirectoryBrowser from '@/components/directory/DirectoryBrowser'

export default function DirectoryPage() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-[#f8fafc] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <DirectoryBrowser />
      </div>
    </main>
  )
}

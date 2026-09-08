'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SiteBackground from '../components/layout/SiteBackground'

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    const query = searchQuery.trim()

    if (!query) {
      router.push('/guide')
      return
    }

    router.push(`/guide?q=${encodeURIComponent(query)}`)
  }

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#030506] text-white">

      <SiteBackground />

      <div className="relative z-10">

        {/* =====================================================
            তোমার আগের Master Home content এখানে থাকবে
            Navbar / Hero / Cards / Vision / Trust / Footer
        ====================================================== */}

      </div>
    </main>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, Storefront } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { searchDirectoryBusinesses, getBusinessDisplayName, getBusinessPath, type DirectoryBusiness } from '@/lib/directory'

export default function DirectoryMapPage() {
  const [items, setItems] = useState<DirectoryBusiness[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void searchDirectoryBusinesses({ limit: 50 }).then(r => {
      setItems(r.data)
      setLoading(false)
    })
  }, [])

  const mapped = useMemo(() => items.filter(x => x.latitude != null && x.longitude != null), [items])
  const first = mapped[0]
  const mapSrc = first
    ? 'https://www.openstreetmap.org/export/embed.html?bbox=' +
      (Number(first.longitude) - 0.01) + '%2C' +
      (Number(first.latitude) - 0.01) + '%2C' +
      (Number(first.longitude) + 0.01) + '%2C' +
      (Number(first.latitude) + 0.01) +
      '&layer=mapnik&marker=' + first.latitude + '%2C' + first.longitude
    : ''

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/directory" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17} /> Directory</Link>
        <div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Local map</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Businesses on the map</h1><p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">Only business locations intentionally published with coordinates are shown on the live map layer.</p></div>
        {loading ? <div className="mt-8 h-96 animate-pulse rounded-[2rem] bg-black/[.03] dark:bg-white/[.04]" /> : mapped.length ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 dark:border-white/10 dark:bg-white/[.04]"><iframe title="FeniX business map" src={mapSrc} className="h-[34rem] w-full border-0" loading="lazy" /></div>
            <div className="space-y-3">
              {mapped.map(item => (
                <article key={item.id} className="rounded-2xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-white/[.045]">
                  <div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]"><Storefront size={20} /></div><div className="min-w-0"><h2 className="truncate font-black">{getBusinessDisplayName(item)}</h2><p className="mt-1 flex items-start gap-1 text-xs opacity-50"><MapPin size={14} className="mt-0.5 shrink-0" />{item.map_label || item.address || String(item.latitude) + ', ' + String(item.longitude)}</p></div></div>
                  <div className="mt-4 flex gap-2"><Link href={getBusinessPath(item)} className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-[#008080] text-xs font-bold text-white">Profile</Link><a href={'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(String(item.latitude) + ',' + String(item.longitude))} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-black/10 px-3 text-xs font-bold dark:border-white/10"><Compass size={15} /> Directions</a></div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <section className="mt-8 rounded-[2rem] border border-dashed border-black/15 bg-white/75 p-10 text-center dark:border-white/10 dark:bg-white/[.03]">
            <MapPin size={32} className="mx-auto opacity-35" /><h2 className="mt-4 text-xl font-black">Map coordinates are not published yet</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 opacity-55">The map layer is ready. As businesses add verified/public coordinates, they will appear here automatically. Address-only records remain searchable without exposing a guessed point.</p>
          </section>
        )}
      </section>
    </main>
  )
}

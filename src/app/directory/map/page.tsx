'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Compass, MagnifyingGlass, MapPin, ShieldCheck, Storefront } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { searchDirectoryBusinesses, getBusinessDisplayName, getBusinessPath, type DirectoryBusiness } from '@/lib/directory'

export default function DirectoryMapPage() {
  const [items, setItems] = useState<DirectoryBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    let active = true
    void searchDirectoryBusinesses({ limit: 100 }).then((result) => {
      if (!active) return
      setItems(result.data)
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  const mapped = useMemo(
    () => items.filter((item) => item.latitude != null && item.longitude != null),
    [items],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return mapped
    return mapped.filter((item) =>
      [
        getBusinessDisplayName(item),
        item.map_label,
        item.address,
        item.upazila,
        item.area,
        item.market,
      ].filter(Boolean).join(' ').toLowerCase().includes(q),
    )
  }, [mapped, search])

  const selected = filtered.find((item) => item.id === selectedId) || filtered[0]

  const mapSrc = selected
    ? 'https://www.openstreetmap.org/export/embed.html?bbox=' +
      (Number(selected.longitude) - 0.01) + '%2C' +
      (Number(selected.latitude) - 0.01) + '%2C' +
      (Number(selected.longitude) + 0.01) + '%2C' +
      (Number(selected.latitude) + 0.01) +
      '&layer=mapnik&marker=' + selected.latitude + '%2C' + selected.longitude
    : ''

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/directory" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]">
          <ArrowLeft size={17} /> Directory
        </Link>

        <div className="mt-7">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Local map intelligence</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">Find mapped businesses by place.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 opacity-60">Search the mapped FeniX directory, select a business to focus the map, and use public verification signals without exposing guessed home locations.</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-3 dark:border-white/10 dark:bg-white/[.04]">
            <MagnifyingGlass size={17} className="opacity-45" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business, area, upazila or market..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <div className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 bg-white/80 px-4 text-xs font-bold dark:border-white/10 dark:bg-white/[.04]">
            {loading ? 'Loading map...' : filtered.length + ' mapped'}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 h-96 animate-pulse rounded-[2rem] bg-black/[.03] dark:bg-white/[.04]" />
        ) : filtered.length ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 dark:border-white/10 dark:bg-white/[.04]">
              <iframe
                title="FeniX business map"
                src={mapSrc}
                className="h-[34rem] w-full border-0"
                loading="lazy"
              />
            </div>

            <div className="space-y-3">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={'cursor-pointer rounded-2xl border bg-white/85 p-4 dark:bg-white/[.045] ' +
                    (selected?.id === item.id ? 'border-[#008080]/40 ring-1 ring-[#008080]/15' : 'border-black/10 dark:border-white/10')}
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]">
                      <Storefront size={20} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-black">{getBusinessDisplayName(item)}</h2>
                      <p className="mt-1 flex items-start gap-1 text-xs opacity-50">
                        <MapPin size={14} className="mt-0.5 shrink-0" />
                        {item.map_label || item.address || [item.upazila, item.area, item.market].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                    {item.location_verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#008080]/[.08] px-2.5 py-1 text-[#008080]">
                        <ShieldCheck size={12} /> Verified location
                      </span>
                    )}
                    {item.verification_level && (
                      <span className="rounded-full border border-black/10 px-2.5 py-1 dark:border-white/10">{item.verification_level}</span>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={getBusinessPath(item)}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-[#008080] text-xs font-bold text-white"
                    >
                      Profile
                    </Link>
                    <a
                      href={'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(String(item.latitude) + ',' + String(item.longitude))}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-black/10 px-3 text-xs font-bold dark:border-white/10"
                    >
                      <Compass size={15} /> Directions
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <section className="mt-8 rounded-[2rem] border border-dashed border-black/15 bg-white/75 p-10 text-center dark:border-white/10 dark:bg-white/[.03]">
            <MapPin size={32} className="mx-auto opacity-35" />
            <h2 className="mt-4 text-xl font-black">{search ? 'No mapped match found.' : 'Map coordinates are not published yet.'}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 opacity-55">
              {search ? 'Try a business name, area, market or upazila.' : 'Businesses can publish verified/public coordinates; address-only records remain searchable without inventing a point.'}
            </p>
          </section>
        )}
      </section>
    </main>
  )
}

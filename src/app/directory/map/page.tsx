'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, Storefront } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { searchDirectoryBusinesses, getBusinessDisplayName, getBusinessPath, type DirectoryBusiness } from '@/lib/directory'

export default function DirectoryMapPage() {
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'
  const [items, setItems] = useState<DirectoryBusiness[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retryVersion, setRetryVersion] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setLoadError(false)

      try {
        const result = await searchDirectoryBusinesses({ limit: 50, offset: 0 })
        if (!active) return

        if (result.error) {
          setItems([])
          setSelectedId(null)
          setLoadError(true)
          return
        }

        setItems(result.data)
        const firstMapped = result.data.find(
          (business) =>
            typeof business.latitude === 'number' &&
            Number.isFinite(business.latitude) &&
            typeof business.longitude === 'number' &&
            Number.isFinite(business.longitude),
        )
        setSelectedId(firstMapped?.id ?? null)
      } catch {
        if (active) {
          setItems([])
          setSelectedId(null)
          setLoadError(true)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [retryVersion])

  const mapped = useMemo(
    () =>
      items.filter(
        (item) =>
          typeof item.latitude === 'number' &&
          Number.isFinite(item.latitude) &&
          typeof item.longitude === 'number' &&
          Number.isFinite(item.longitude),
      ),
    [items],
  )

  const selected = mapped.find((item) => item.id === selectedId) ?? mapped[0]
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
          <ArrowLeft size={17} /> {bn ? 'ব্যবসার তালিকা' : 'Directory'}
        </Link>
        <div className="mt-7">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">{bn ? 'স্থানীয় মানচিত্র' : 'Local map'}</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{bn ? 'মানচিত্রে ব্যবসা খুঁজুন' : 'Explore businesses on the map'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">
            {bn
              ? 'তালিকা থেকে একটি ব্যবসা বেছে নিলে মানচিত্র সেই প্রকাশিত অবস্থানে যাবে। শুধু প্রকাশের জন্য অনুমোদিত স্থানাঙ্ক দেখানো হয়।'
              : 'Choose a business from the list to focus the map on its published coordinates. Only intentionally published coordinates are shown.'}
          </p>
        </div>
        {loading ? (
          <div role="status" aria-label={bn ? 'মানচিত্র লোড হচ্ছে' : 'Loading map'} className="mt-8 h-96 animate-pulse rounded-[2rem] bg-black/[.03] dark:bg-white/[.04]" />
        ) : loadError ? (
          <section role="alert" className="mt-8 rounded-[2rem] border border-red-500/20 bg-red-500/[.05] p-8 text-center">
            <h2 className="text-xl font-black">{bn ? 'মানচিত্রের তথ্য লোড হয়নি' : 'The business map could not be loaded'}</h2>
            <p className="mt-2 text-sm opacity-65">{bn ? 'সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।' : 'Check the connection and try again.'}</p>
            <button type="button" onClick={() => setRetryVersion((value) => value + 1)} className="mt-5 min-h-11 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
              {bn ? 'আবার চেষ্টা করুন' : 'Try again'}
            </button>
          </section>
        ) : mapped.length ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 dark:border-white/10 dark:bg-white/[.04]">
              <iframe
                title={selected ? (bn ? getBusinessDisplayName(selected) + ' এর মানচিত্র' : 'Map for ' + getBusinessDisplayName(selected)) : (bn ? 'FeniX ব্যবসার মানচিত্র' : 'FeniX business map')}
                src={mapSrc}
                className="h-[34rem] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              {selected && (
                <div className="border-t border-black/10 p-4 dark:border-white/10">
                  <p className="text-xs font-semibold opacity-50">{bn ? 'নির্বাচিত ব্যবসা' : 'Selected business'}</p>
                  <p className="mt-1 font-black">{getBusinessDisplayName(selected)}</p>
                  <p className="mt-1 text-xs opacity-55">{selected.map_label || selected.address || String(selected.latitude) + ', ' + String(selected.longitude)}</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {mapped.map((item) => {
                const active = item.id === selected?.id
                const location = item.map_label || item.address || String(item.latitude) + ', ' + String(item.longitude)
                return (
                  <article key={item.id} className={'rounded-2xl border bg-white/85 p-4 transition dark:bg-white/[.045] ' + (active ? 'border-[#008080] ring-1 ring-[#008080]/20 dark:border-teal-300' : 'border-black/10 dark:border-white/10')}>
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]"><Storefront size={20} /></div>
                      <div className="min-w-0">
                        <h2 className="truncate font-black">{getBusinessDisplayName(item)}</h2>
                        <p className="mt-1 flex items-start gap-1 text-xs opacity-50"><MapPin size={14} className="mt-0.5 shrink-0" />{location}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        aria-pressed={active}
                        className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-[#008080]/25 px-3 text-xs font-bold text-[#007171] dark:text-teal-200"
                      >
                        {active ? (bn ? 'মানচিত্রে নির্বাচিত' : 'Selected on map') : (bn ? 'মানচিত্রে দেখুন' : 'Show on map')}
                      </button>
                      <Link href={getBusinessPath(item)} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#008080] px-3 text-xs font-bold text-white">
                        {bn ? 'প্রোফাইল' : 'Profile'}
                      </Link>
                      <a href={'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(String(item.latitude) + ',' + String(item.longitude))} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-black/10 px-3 text-xs font-bold dark:border-white/10">
                        <Compass size={15} /> {bn ? 'দিকনির্দেশ' : 'Directions'}
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        ) : (
          <section className="mt-8 rounded-[2rem] border border-dashed border-black/15 bg-white/75 p-10 text-center dark:border-white/10 dark:bg-white/[.03]">
            <MapPin size={32} className="mx-auto opacity-35" />
            <h2 className="mt-4 text-xl font-black">{bn ? 'এখনো মানচিত্রের স্থানাঙ্ক প্রকাশিত হয়নি' : 'Map coordinates are not published yet'}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 opacity-55">
              {bn
                ? 'ব্যবসার মালিকেরা প্রকাশযোগ্য স্থানাঙ্ক যোগ করলে সেগুলো এখানে আসবে। ঠিকানা থেকে অনুমান করে কোনো পিন দেখানো হয় না।'
                : 'Businesses will appear here when public coordinates are added. Address-only records stay searchable; the map does not guess a location.'}
            </p>
          </section>
        )}
      </section>
    </main>
  )
}

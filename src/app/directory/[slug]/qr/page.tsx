'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, QrCode, ShieldCheck } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { getDirectoryBusiness, getBusinessDisplayName } from '@/lib/directory'

export default function BusinessQrPage() {
  const [business, setBusiness] = useState<any | null>(null)
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const parts = window.location.pathname.split('/').filter(Boolean)
    const identifier = parts.length >= 2 ? parts[parts.length - 2] : ''
    setUrl(window.location.href.replace(/\/qr\/?$/, ''))
    if (identifier) void getDirectoryBusiness(identifier).then(r => setBusiness(r.data))
  }, [])

  async function copy() {
    await navigator.clipboard?.writeText(url)
    setMessage('Identity link copied.')
  }

  if (!business) return <main className="min-h-dvh bg-[#f7faf9] dark:bg-[#030506]"><Navbar /><div className="mx-auto max-w-2xl px-4 py-16 text-sm opacity-60">Loading business identity…</div></main>

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link href={'/directory/' + encodeURIComponent(business.slug || business.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17} /> Business profile</Link>
        <div className="mt-7 rounded-[2rem] border border-black/10 bg-white/85 p-7 text-center dark:border-white/10 dark:bg-white/[.045] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#008080]/[.08] text-[#008080]"><QrCode size={34} /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-[#008080]">FeniX Business Identity</p>
          <h1 className="mt-2 text-3xl font-black">{getBusinessDisplayName(business)}</h1>
          <div className="mx-auto mt-6 max-w-xs rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[.04]">
            <img src={'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=' + encodeURIComponent(url)} alt="QR code for this public FeniX business identity" className="mx-auto h-64 w-64 max-w-full rounded-xl" referrerPolicy="no-referrer" />
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs opacity-50"><ShieldCheck size={16} /> The QR encodes only this public profile URL.</div>
          <div className="mt-5 break-all rounded-xl bg-black/[.025] p-3 text-xs leading-5 opacity-60 dark:bg-white/[.03]">{url}</div>
          <button onClick={() => void copy()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white"><Copy size={16} /> Copy identity link</button>
          {message && <p className="mt-3 text-xs text-[#007171]">{message}</p>}
          <p className="mt-6 text-xs leading-5 opacity-45">QR delivery uses a third-party image renderer for the public URL. No account secrets, private contacts or auth tokens are encoded.</p>
        </div>
      </section>
    </main>
  )
}

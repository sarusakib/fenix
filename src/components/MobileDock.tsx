'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, House, List, MagnifyingGlass, UserCircle } from '@phosphor-icons/react'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

export default function MobileDock() {
  const pathname = usePathname()
  const { locale } = useFenixLocale()
  if (pathname === '/login' || pathname?.startsWith('/auth/')) return null
  const bn = locale === 'bn'
  const items = [
    { href: '/', label: bn ? 'হোম' : 'Home', icon: House },
    { href: '/search', label: bn ? 'সার্চ' : 'Search', icon: MagnifyingGlass },
    { href: '/services', label: bn ? 'নেটওয়ার্ক' : 'Network', icon: List },
    { href: '/guide', label: bn ? 'ব্রেইন' : 'Brain', icon: Brain },
    { href: '/profile', label: bn ? 'প্রোফাইল' : 'Profile', icon: UserCircle },
  ]
  return (
    <nav aria-label="Mobile primary navigation" className="fixed inset-x-2 bottom-2 z-[70] md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-1 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/92 p-1.5 shadow-[0_18px_60px_rgba(15,23,42,.14)] backdrop-blur-2xl dark:shadow-[0_18px_60px_rgba(0,0,0,.42)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(href + '/')
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={'flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-bold transition ' + (active ? 'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]' : 'text-[var(--fx-muted)]')}>
            <Icon size={20} weight={active ? 'fill' : 'regular'}/>
            <span className="mt-0.5">{label}</span>
          </Link>
        })}
      </div>
    </nav>
  )
}

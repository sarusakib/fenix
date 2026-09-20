'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, House, MagnifyingGlass, Storefront, UserCircle } from '@phosphor-icons/react'

const items = [
  { href: '/', label: 'Home', labelBn: 'হোম', icon: House },
  { href: '/services', label: 'Services', labelBn: 'সার্ভিস', icon: Storefront },
  { href: '/guide', label: 'Brain', labelBn: 'ব্রেইন', icon: Brain },
  { href: '/directory', label: 'Explore', labelBn: 'এক্সপ্লোর', icon: MagnifyingGlass },
  { href: '/dashboard', label: 'Account', labelBn: 'অ্যাকাউন্ট', icon: UserCircle },
]

export default function MobileDock() {
  const pathname = usePathname()
  if (pathname === '/login' || pathname?.startsWith('/auth/')) return null

  return (
    <nav aria-label="Mobile primary navigation" className="fixed inset-x-2 bottom-2 z-[70] md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-1 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/90 p-1.5 shadow-[0_18px_60px_rgba(15,23,42,.14)] backdrop-blur-2xl dark:shadow-[0_18px_60px_rgba(0,0,0,.42)]">
        {items.map(({ href, label, labelBn, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={
                'flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-1 py-2 text-[9px] font-bold transition sm:text-[10px] ' +
                (active
                  ? 'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]'
                  : 'text-[var(--fx-muted)]')
              }
            >
              <Icon size={20} weight={active ? 'fill' : 'regular'} />
              <span className="mt-0.5">{label}</span>
              <span className="text-[8px] opacity-55">{labelBn}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

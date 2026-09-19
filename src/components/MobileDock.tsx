'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Brain,
  House,
  MagnifyingGlass,
  Storefront,
  UserCircle,
} from '@phosphor-icons/react'

const items = [
  { href: '/', label: 'Home', icon: House },
  { href: '/services', label: 'Services', icon: Storefront },
  { href: '/guide', label: 'Brain', icon: Brain },
  { href: '/directory', label: 'Explore', icon: MagnifyingGlass },
  { href: '/dashboard', label: 'Account', icon: UserCircle },
]

export default function MobileDock() {
  const pathname = usePathname()

  if (
    pathname === '/login' ||
    pathname?.startsWith('/auth/')
  ) {
    return null
  }

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-3 bottom-3 z-[70] md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-1 rounded-2xl border border-black/[.07] bg-white/80 p-1.5 shadow-[0_18px_60px_rgba(15,23,42,.16)] backdrop-blur-2xl dark:border-white/[.08] dark:bg-[#081018]/85 dark:shadow-[0_18px_60px_rgba(0,0,0,.45)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/'
              ? pathname === '/'
              : pathname === href || pathname?.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-bold transition ' +
                (active
                  ? 'bg-teal-600/[.1] text-teal-800 dark:bg-teal-300/[.09] dark:text-teal-100'
                  : 'text-slate-500 dark:text-white/45')
              }
            >
              <Icon size={20} weight={active ? 'fill' : 'regular'} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

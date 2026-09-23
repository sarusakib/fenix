import Link from 'next/link'

type FenixBrandProps = {
  compact?: boolean
  onClick?: () => void
  href?: string
  light?: boolean
}

export default function FenixBrand({ compact = false, onClick, href = '/', light = false }: FenixBrandProps) {
  return (
    <Link href={href} onClick={onClick} className="group inline-flex min-h-11 items-center gap-2.5" aria-label="FeniX home">
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-[var(--fx-navy)] shadow-[0_8px_30px_rgba(11,23,54,.18)]">
        <img src="/fenix-logo.svg" alt="" className="h-full w-full object-cover" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className={'block text-[21px] font-black tracking-[-.065em] leading-none ' + (light ? 'text-white' : 'text-[var(--fx-text)]')}>
            Feni<span className="text-[var(--fx-primary-strong)]">X</span>
          </span>
          <span className={'mt-1 hidden text-[8px] font-black uppercase tracking-[.17em] sm:block ' + (light ? 'text-white/45' : 'text-[var(--fx-muted)]')}>
            Feni Business Ecosystem
          </span>
        </span>
      )}
    </Link>
  )
}

import type { SVGProps } from 'react'

export default function FenixMark({ size = 34, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <rect x="1.5" y="1.5" width="37" height="37" rx="11" stroke="currentColor" strokeWidth="3" />
      <path d="M11 10.5 20 19.5 29 10.5M20 19.5 11 29.5M20 19.5 29 29.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="19.5" r="2.1" fill="currentColor" />
    </svg>
  )
}

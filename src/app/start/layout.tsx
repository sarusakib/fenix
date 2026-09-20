import type { ReactNode } from 'react'

/**
 * The Business Journey is user-specific and its client workspace depends on
 * browser-side Supabase authentication. Keep the entire /start tree dynamic
 * so CI/build-time rendering never tries to create a user client without
 * deployment runtime environment variables.
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function StartLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}

import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/core/routes'

export default function LegacySettingsRedirect() {
  redirect(ROUTES.settings)
}

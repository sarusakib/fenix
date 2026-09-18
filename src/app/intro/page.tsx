import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import UltraIntro from './UltraIntro'

export const dynamic = 'force-dynamic'

export default async function IntroPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    redirect('/login')
  }

  return <UltraIntro />
}

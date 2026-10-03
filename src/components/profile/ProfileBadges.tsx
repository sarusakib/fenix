'use client'

import { useEffect, useState } from 'react'
import { createPublicClient, createClient } from '@/utils/supabase/client'

type Props = {
  userId: string
  role?: string | null
  locale?: 'bn' | 'en'
}

export default function ProfileBadges({ userId, role, locale = 'bn' }: Props) {
  const [badges, setBadges] = useState<string[]>([])
  const bn = locale === 'bn'

  useEffect(() => {
    if (!userId) return
    let active = true
    async function load() {
      const s = createClient()
      const publicClient = createPublicClient()
      const [donor, business, seller] = await Promise.all([
        publicClient.from('fenix_public_blood_donors').select('user_id').eq('user_id', userId).maybeSingle(),
        s.from('businesses').select('id').eq('owner_id', userId).limit(1),
        s.from('vendor_profiles').select('id').eq('user_id', userId).eq('status','approved').limit(1),
      ])
      if (!active) return
      const next: string[] = []
      if (donor.data) next.push(bn ? '🩸 Donor' : '🩸 Donor')
      if ((business.data ?? []).length) next.push(bn ? '🏪 Business' : '🏪 Business')
      if ((seller.data ?? []).length) next.push(bn ? '🛒 Seller' : '🛒 Seller')
      if (role === 'investor') next.push(bn ? '💼 Investor' : '💼 Investor')
      setBadges(next)
    }
    void load()
    return () => { active = false }
  }, [bn, role, userId])

  if (!badges.length) return null

  return <div className="mt-3 flex flex-wrap gap-1.5" aria-label={bn ? 'Profile category badges' : 'Profile category badges'}>
    {badges.map(badge => <span key={badge} className="inline-flex items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-2.5 py-1 text-[10px] font-bold">{badge}</span>)}
  </div>
}

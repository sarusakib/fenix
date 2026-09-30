'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserPlus, UserMinus } from '@phosphor-icons/react'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

export default function ProfileFollowButton({ profileId, nextPath = '/feed' }: { profileId: string; nextPath?: string }) {
  const { locale } = useFenixLocale()
  const [userId, setUserId] = useState<string | null>(null)
  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const { data: auth } = await s.auth.getSession()
      const uid = auth.session?.user?.id ?? null
      if (!active) return
      setUserId(uid)
      if (!uid || uid === profileId) return
      const { data } = await s.from('fenix_profile_follows').select('following_id').eq('follower_id', uid).eq('following_id', profileId).maybeSingle()
      if (active) setFollowing(Boolean(data))
    }
    void load()
    return () => { active = false }
  }, [profileId])

  if (!userId) {
    return <Link href={'/login?next='+encodeURIComponent(nextPath)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-3.5 text-xs font-bold text-white"><UserPlus size={16}/>{locale==='bn'?'অনুসরণ':'Follow'}</Link>
  }
  if (userId === profileId) return null

  async function toggle() {
    if (!userId) return
    setBusy(true)
    const s = createClient()
    const result = following
      ? await s.from('fenix_profile_follows').delete().eq('follower_id', userId).eq('following_id', profileId)
      : await s.from('fenix_profile_follows').insert({ follower_id: userId, following_id: profileId })
    if (!result.error) setFollowing(value => !value)
    setBusy(false)
  }

  return <button type="button" disabled={busy} onClick={()=>void toggle()} className={'inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-bold disabled:opacity-45 '+(following?'border border-[var(--fx-border)] bg-[var(--fx-surface)]':'bg-[var(--fx-primary-strong)] text-white')}>
    {following?<UserMinus size={16}/>:<UserPlus size={16}/>}
    {following?(locale==='bn'?'অনুসরণ করছেন':'Following'):(locale==='bn'?'অনুসরণ':'Follow')}
  </button>
}

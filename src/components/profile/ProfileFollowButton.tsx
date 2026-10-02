'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserPlus, UserMinus } from '@phosphor-icons/react'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { ROUTES } from '@/lib/core/routes'

export default function ProfileFollowButton({ profileId, nextPath = '/feed' }: { profileId: string; nextPath?: string }) {
  const { locale } = useFenixLocale()
  const [userId, setUserId] = useState<string | null>(null)
  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      const uid = auth.user?.id ?? null
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
    return <Link href={ROUTES.auth.login+'?next='+encodeURIComponent(nextPath)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-3.5 text-xs font-bold text-white"><UserPlus size={16}/>{locale==='bn'?'অনুসরণ':'Follow'}</Link>
  }
  if (userId === profileId) return null

  async function toggle() {
    if (!userId) return
    setBusy(true)
    setError('')
    const s = createClient()
    const result = following
      ? await s.from('fenix_profile_follows').delete().eq('follower_id', userId).eq('following_id', profileId)
      : await s.from('fenix_profile_follows').insert({ follower_id: userId, following_id: profileId })
    if (!result.error) setFollowing(value => !value)
    else setError(locale === 'bn' ? 'Follow update করা যায়নি। আবার চেষ্টা করুন।' : 'Could not update follow. Please try again.')
    setBusy(false)
  }

  return <div className="flex flex-col items-end gap-1"><button type="button" disabled={busy} aria-pressed={following} onClick={()=>void toggle()} className={'inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-bold disabled:opacity-45 '+(following?'border border-[var(--fx-border)] bg-[var(--fx-surface)]':'bg-[var(--fx-primary-strong)] text-white')}>
    {following?<UserMinus size={16}/>:<UserPlus size={16}/>}
    {following?(locale==='bn'?'অনুসরণ করছেন':'Following'):(locale==='bn'?'অনুসরণ':'Follow')}
  </button>{error && <span role="status" className="text-[10px] text-red-600 dark:text-red-300">{error}</span>}</div>
}

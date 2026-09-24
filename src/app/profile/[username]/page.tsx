import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChatCircleText, Globe, MapPin, UserCircle } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import ProfileReportButton from '@/components/profile/ProfileReportButton'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const s = await createClient()
  const { data } = await s.from('fenix_public_profiles').select('full_name,username,bio,location_text').eq('username', decodeURIComponent(username).toLowerCase()).maybeSingle()
  return {
    title: data?.full_name ? `${data.full_name} | FeniX` : 'FeniX Profile',
    description: data?.bio || 'Public profile on FeniX — Feni Business Ecosystem.',
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const s = await createClient()
  const { data: profile } = await s
    .from('fenix_public_profiles')
    .select('id,full_name,username,bio,avatar_url,cover_url,location_text,website_url,created_at')
    .eq('username', decodeURIComponent(username).toLowerCase())
    .maybeSingle()

  if (!profile) notFound()

  const profileId = profile.id
  const profileUsername = profile.username
  const createdAt = profile.created_at
  if (!profileId || !profileUsername || !createdAt) notFound()
  const safeName = profile.full_name || `@${profileUsername}`
  const website = profile.website_url && /^https?:\/\//i.test(profile.website_url) ? profile.website_url : null

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 pb-28 pt-7 sm:px-6 lg:px-8">
        <Link href="/feed" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Feed</Link>
        <article className="fenix-surface-strong mt-6 overflow-hidden rounded-[2rem]">
          <div className="relative h-36 bg-[var(--fx-primary-soft)] sm:h-52">{profile.cover_url ? <img src={profile.cover_url} alt="" className="h-full w-full object-cover"/> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(0,128,128,.25),transparent_38%),linear-gradient(135deg,rgba(11,23,54,.02),rgba(0,128,128,.09))]"/>}</div>
          <div className="p-5 sm:p-8">
            <div className="-mt-14 flex items-end justify-between gap-4 sm:-mt-16">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-28 w-28 rounded-3xl border-4 border-[var(--fx-surface-strong)] bg-[var(--fx-bg)] object-cover"/> : <div className="grid h-28 w-28 place-items-center rounded-3xl border-4 border-[var(--fx-surface-strong)] bg-[var(--fx-primary-soft)]"><UserCircle size={62} className="text-[var(--fx-primary-strong)]"/></div>}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[var(--fx-primary-soft)] px-3 text-xs font-bold text-[var(--fx-primary-strong)]">Public profile</span>
                <Link href={'/messages?to=' + encodeURIComponent(profileId) + '&name=' + encodeURIComponent(safeName)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white"><ChatCircleText size={16}/> Message</Link>
              </div>
            </div>
            <div className="mt-5">
              <h1 className="text-3xl font-black tracking-[-.05em] sm:text-4xl">{safeName}</h1>
              <p className="mt-1 text-sm text-[var(--fx-muted)]">@{profileUsername}</p>
              {profile.bio && <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-7">{profile.bio}</p>}
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--fx-muted)]">
                {profile.location_text && <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-1.5"><MapPin size={14}/>{profile.location_text}</span>}
                {website && <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-1.5 hover:underline"><Globe size={14}/>Website</a>}
              </div>
              <ProfileReportButton profileId={profileId} locale="bn" />
              <p className="mt-5 text-[11px] text-[var(--fx-muted)]">FeniX member since {new Date(createdAt).toLocaleDateString('en-BD')}</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}
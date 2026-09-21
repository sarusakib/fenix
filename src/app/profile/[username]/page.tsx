import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChatCircleText, Globe, MapPin, UserCircle } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import ProfileReportButton from '@/components/profile/ProfileReportButton'
import ShareButton from '@/components/ShareButton'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const s = await createClient()
  const { data } = await s.from('fenix_public_profiles').select('full_name,username,bio,public_location').eq('username', decodeURIComponent(username).toLowerCase()).maybeSingle()
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
    .select('id,full_name,username,bio,avatar_url,cover_url,public_location,website_url,facebook_url,instagram_url,linkedin_url,youtube_url,whatsapp,phone,created_at')
    .eq('username', decodeURIComponent(username).toLowerCase())
    .maybeSingle()

  if (!profile) notFound()

  const profileId = profile.id
  const profileUsername = profile.username
  const createdAt = profile.created_at
  if (!profileId || !profileUsername || !createdAt) notFound()
  const safeName = profile.full_name || `@${profileUsername}`
  const website = profile.website_url && /^https?:\/\//i.test(profile.website_url) ? profile.website_url : null
  const socialLinks = [
    profile.facebook_url && ['Facebook', profile.facebook_url],
    profile.instagram_url && ['Instagram', profile.instagram_url],
    profile.linkedin_url && ['LinkedIn', profile.linkedin_url],
    profile.youtube_url && ['YouTube', profile.youtube_url],
  ].filter(Boolean) as [string, string][]

  return (
    <main className="min-h-dvh">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 pb-28 pt-7 sm:px-6">
        <Link href="/feed" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Feed</Link>
        <article className="mt-6 overflow-hidden rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
          <div className="h-32 bg-[var(--fx-primary-soft)] sm:h-44">{profile.cover_url && <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />}</div>
          <div className="p-5 sm:p-7">
            <div className="-mt-14 flex items-end justify-between gap-4 sm:-mt-16">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-24 w-24 rounded-full border-4 border-[var(--fx-surface)] object-cover sm:h-28 sm:w-28" /> : <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-[var(--fx-surface)] bg-[var(--fx-primary-soft)] sm:h-28 sm:w-28"><UserCircle size={58} className="text-[var(--fx-primary-strong)]" /></div>}
              <Link href={`/messages?name=${encodeURIComponent('@' + profileUsername)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white"><ChatCircleText size={17}/> Message</Link>
            </div>
            <div className="mt-4">
              <h1 className="text-3xl font-black tracking-[-.04em]">{safeName}</h1>
              <p className="mt-1 text-sm text-[var(--fx-muted)]">@{profileUsername}</p>
              {profile.bio && <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{profile.bio}</p>}
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--fx-muted)]">
                {profile.public_location && <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[.03] px-3 py-1.5 dark:bg-white/[.04]"><MapPin size={14}/>{profile.public_location}</span>}
                {website && <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-black/[.03] px-3 py-1.5 hover:underline dark:bg-white/[.04]"><Globe size={14}/>Website</a>}
                {socialLinks.map(([label, href]) => <a key={label} href={/^https?:\/\//i.test(href) ? href : 'https://' + href} target="_blank" rel="noopener noreferrer" className="rounded-full bg-black/[.03] px-3 py-1.5 hover:underline dark:bg-white/[.04]">{label}</a>)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ShareButton label="Share profile" />
                <ProfileReportButton profileId={profileId} locale="bn" />
              </div>
              <p className="mt-5 text-[11px] text-[var(--fx-muted)]">Profile joined FeniX on {new Date(createdAt).toLocaleDateString('en-BD')}</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}
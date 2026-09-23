import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChatCircleText, Globe, MapPin, ShieldCheck, UserCircle } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import ProfileReportButton from '@/components/profile/ProfileReportButton'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

async function loadPublicProfile(username: string) {
  const s = await createClient()
  const key = decodeURIComponent(username).toLowerCase()
  const { data, error } = await s.from('fenix_public_profiles').select('id,full_name,username,bio,avatar_url,cover_url,location_text,website_url,created_at').eq('username', key).maybeSingle()
  if (!error && data) return { profile: data, client: s }
  const fallback = await s.from('profiles').select('id,full_name,username,bio,avatar_url,cover_url,location_text,website_url,created_at').eq('username', key).eq('is_public', true).maybeSingle()
  return { profile: fallback.data ?? null, client: s }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const { profile } = await loadPublicProfile(username)
  return { title: profile?.full_name ? profile.full_name + ' | FeniX' : 'FeniX Profile', description: profile?.bio || 'Public profile on FeniX — Feni Business Ecosystem.' }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const { profile, client: s } = await loadPublicProfile(username)
  if (!profile) notFound()

  const profileId = profile.id
  const profileUsername = profile.username
  const createdAt = profile.created_at
  if (!profileId || !profileUsername || !createdAt) notFound()
  const safeName = profile.full_name || '@' + profileUsername
  const website = profile.website_url && /^https?:\/\//i.test(profile.website_url) ? profile.website_url : null
  const { data: posts } = await s.from('fenix_public_feed').select('id,body,created_at').eq('author_id', profileId).order('created_at',{ascending:false}).limit(3)

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar/>
      <section className="mx-auto max-w-4xl px-4 pb-28 pt-7 sm:px-6 lg:px-8">
        <Link href="/feed" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Feed</Link>
        <article className="fenix-surface-strong mt-6 overflow-hidden rounded-[2rem]">
          <div className="relative h-36 bg-[var(--fx-primary-soft)] sm:h-52">{profile.cover_url ? <img src={profile.cover_url} alt="" className="h-full w-full object-cover"/> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(0,128,128,.25),transparent_38%),linear-gradient(135deg,rgba(11,23,54,.02),rgba(0,128,128,.09))]"/>}</div>
          <div className="p-5 sm:p-8">
            <div className="-mt-14 flex items-end justify-between gap-4 sm:-mt-16">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-28 w-28 rounded-3xl border-4 border-[var(--fx-surface-strong)] bg-[var(--fx-bg)] object-cover"/> : <div className="grid h-28 w-28 place-items-center rounded-3xl border-4 border-[var(--fx-surface-strong)] bg-[var(--fx-primary-soft)]"><UserCircle size={62} className="text-[var(--fx-primary-strong)]"/></div>}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[var(--fx-primary-soft)] px-3 text-xs font-bold text-[var(--fx-primary-strong)]"><ShieldCheck size={16}/> Public profile</span>
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
              <p className="mt-4 text-[11px] text-[var(--fx-muted)]">FeniX member since {new Date(createdAt).toLocaleDateString('en-BD')}</p>
            </div>
          </div>
        </article>

        <div className="mt-5 grid gap-5 md:grid-cols-[.85fr_1.15fr]">
          <section className="fenix-surface rounded-[2rem] p-5 sm:p-6">
            <p className="fenix-kicker">Profile layer</p>
            <h2 className="mt-2 text-xl font-black">One identity, useful context.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">Your public-safe profile can be referenced by eligible FeniX community and connection features without exposing account roles or private phone information.</p>
          </section>
          <section className="fenix-surface rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3"><div><p className="fenix-kicker">Public activity</p><h2 className="mt-2 text-xl font-black">Recent posts</h2></div><Link href="/feed" className="text-xs font-bold text-[var(--fx-primary-strong)]">Open feed →</Link></div>
            {posts?.length ? <div className="mt-4 space-y-2">{posts.map(post => <article key={post.id} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><p className="whitespace-pre-wrap text-sm leading-6">{post.body}</p><p className="mt-2 text-[10px] text-[var(--fx-muted)]">{new Date(post.created_at).toLocaleDateString('en-BD')}</p></article>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 text-sm text-[var(--fx-muted)]">No public posts yet.</div>}
          </section>
        </div>
        <div className="mt-5"><ProfileReportButton profileId={profileId} locale="bn"/></div>
      </section>
    </main>
  )
}

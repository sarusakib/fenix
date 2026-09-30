import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, DotsThree, FacebookLogo, Globe, InstagramLogo, MapPin, UserCircle, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import ProfileReportButton from '@/components/profile/ProfileReportButton'
import MessageButton from '@/components/messaging/MessageButton'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

type PublicPost = { id: string; body: string; created_at: string }

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const s = await createClient()
  const { data } = await s.from('fenix_public_profiles')
    .select('full_name,username,bio,location_text,instagram_url,facebook_url,whatsapp_url')
    .eq('username', decodeURIComponent(username).toLowerCase())
    .maybeSingle()

  return {
    title: data?.full_name ? data.full_name + ' | FeniX' : 'FeniX Profile',
    description: data?.bio || 'Public profile on FeniX — Feni Business Ecosystem.',
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const normalized = decodeURIComponent(username).trim().toLowerCase()
  const s = await createClient()

  const { data: profile } = await s.from('fenix_public_profiles')
    .select('id,full_name,username,bio,avatar_url,location_text,website_url,instagram_url,facebook_url,whatsapp_url,created_at')
    .eq('username', normalized)
    .maybeSingle()

  if (!profile?.id || !profile.username || !profile.created_at) notFound()

  const [{ data: publicPosts, count: postCount }] = await Promise.all([
    s.from('fenix_posts')
      .select('id,body,created_at', { count: 'exact' })
      .eq('author_id', profile.id)
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  const safeName = profile.full_name || '@' + profile.username
  const website = profile.website_url && /^https?:\/\//i.test(profile.website_url) ? profile.website_url : null
  const posts = (publicPosts ?? []) as PublicPost[]

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar />
      <section className="mx-auto max-w-3xl px-3 pb-28 pt-2 sm:px-5 sm:pt-5">
        <header className="flex h-12 items-center justify-between border-b border-[var(--fx-border)]">
          <Link href="/feed" aria-label="Back to feed" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/[.04] dark:hover:bg-white/[.05]">
            <ArrowLeft size={18} />
          </Link>
          <p className="truncate text-sm font-black">@{profile.username}</p>
          <button type="button" aria-label="More" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/[.04] dark:hover:bg-white/[.05]">
            <DotsThree size={19} weight="bold" />
          </button>
        </header>

        <div className="py-7 sm:py-9">
          <div className="flex items-center gap-5 sm:gap-9">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" className="h-24 w-24 shrink-0 rounded-full border border-[var(--fx-border)] bg-[var(--fx-bg)] object-cover sm:h-32 sm:w-32" />
              : <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] sm:h-32 sm:w-32"><UserCircle size={65} className="text-[var(--fx-primary-strong)]" /></div>}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <MessageButton userId={profile.id} name={safeName} />
                <Link href="/feed" className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--fx-border)] bg-[var(--fx-surface)]" aria-label="Back to feed">
                  <ArrowLeft size={15} />
                </Link>
              </div>
              <div className="mt-5 text-sm">
                <strong className="font-black">{postCount ?? 0}</strong> posts
              </div>
            </div>
          </div>

          <div className="mt-6 max-w-xl">
            <h1 className="text-base font-black">{safeName}</h1>
            <p className="mt-1 text-xs text-[var(--fx-muted)]">@{profile.username}</p>
            {profile.bio && <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{profile.bio}</p>}
            {profile.location_text && <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--fx-muted)]"><MapPin size={13} />{profile.location_text}</p>}
            {(website || profile.instagram_url || profile.facebook_url || profile.whatsapp_url) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {website && <a href={website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-xs font-bold"><Globe size={14}/>Website</a>}
                {profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noreferrer noopener" aria-label="Instagram" className="grid h-8 w-8 place-items-center rounded-full border border-[var(--fx-border)]"><InstagramLogo size={15}/></a>}
                {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noreferrer noopener" aria-label="Facebook" className="grid h-8 w-8 place-items-center rounded-full border border-[var(--fx-border)]"><FacebookLogo size={15}/></a>}
                {profile.whatsapp_url && <a href={profile.whatsapp_url} target="_blank" rel="noreferrer noopener" aria-label="WhatsApp" className="grid h-8 w-8 place-items-center rounded-full border border-[var(--fx-border)]"><WhatsappLogo size={15}/></a>}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--fx-border)]">
          <div className="h-12 border-b border-[var(--fx-border)] text-center text-[11px] font-black uppercase tracking-[.08em]">
            <span className="inline-flex h-full items-center border-b-2 border-[var(--fx-text)] px-5">Posts</span>
          </div>
          {posts.length ? (
            <div className="space-y-2 py-3">
              {posts.map(post => (
                <article key={post.id} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6">{post.body}</p>
                  <p className="mt-2 text-[10px] text-[var(--fx-muted)]">{new Date(post.created_at).toLocaleString('en-BD')}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[var(--fx-muted)]">No public posts yet.</div>
          )}
          <div className="pb-4 pt-2">
            <ProfileReportButton profileId={profile.id} locale="bn" />
          </div>
        </div>
      </section>
    </main>
  )
}

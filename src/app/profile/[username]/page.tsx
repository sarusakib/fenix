import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FacebookLogo, Globe, InstagramLogo, MapPin, UserCircle, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import ProfileReportButton from '@/components/profile/ProfileReportButton'
import ProfileFollowButton from '@/components/profile/ProfileFollowButton'
import MessageButton from '@/components/messaging/MessageButton'
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
    .select('id,full_name,username,bio,avatar_url,cover_url,location_text,website_url,whatsapp_url,facebook_url,instagram_url,created_at')
    .eq('username', decodeURIComponent(username).toLowerCase())
    .maybeSingle()

  if (!profile) notFound()

  const profileId = profile.id
  const profileUsername = profile.username
  const createdAt = profile.created_at
  if (!profileId || !profileUsername || !createdAt) notFound()
  const safeName = profile.full_name || `@${profileUsername}`
  const website = profile.website_url && /^https?:\/\//i.test(profile.website_url) ? profile.website_url : null
  const whatsapp = profile.whatsapp_url && /^https?:\/\//i.test(profile.whatsapp_url) ? profile.whatsapp_url : null
  const facebook = profile.facebook_url && /^https?:\/\//i.test(profile.facebook_url) ? profile.facebook_url : null
  const instagram = profile.instagram_url && /^https?:\/\//i.test(profile.instagram_url) ? profile.instagram_url : null

  const [{ data: publicPosts }, { data: stats }] = await Promise.all([
    s.from('fenix_public_feed').select('id,body,created_at').eq('author_id', profileId).order('created_at', { ascending: false }).limit(12),
    s.rpc('fenix_public_profile_stats', { p_profile_id: profileId }),
  ])

  const profileStats = stats && typeof stats === 'object' ? stats as { posts?: number; followers?: number; following?: number } : null

  const postIds = (publicPosts ?? []).map(post => post.id).filter((id): id is string => Boolean(id))
  const { data: publicMedia } = postIds.length
    ? await s.from('fenix_post_media').select('id,post_id,storage_bucket,storage_path,width,height,sort_order').in('post_id', postIds).order('sort_order', { ascending: true })
    : { data: [] }

  const mediaByPost: Record<string, Array<{ id: string; url: string; width: number | null; height: number | null }>> = {}
  for (const item of (publicMedia ?? []) as Array<{ id: string; post_id: string; storage_bucket: string; storage_path: string; width: number | null; height: number | null }>) {
    ;(mediaByPost[item.post_id] ??= []).push({
      id: item.id,
      url: s.storage.from(item.storage_bucket).getPublicUrl(item.storage_path).data.publicUrl,
      width: item.width,
      height: item.height,
    })
  }

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
                <ProfileFollowButton profileId={profileId} nextPath={'/profile/'+encodeURIComponent(profileUsername)} />
                <MessageButton userId={profileId} name={safeName} />
              </div>
            </div>
            <div className="mt-5">
              <h1 className="text-3xl font-black tracking-[-.05em] sm:text-4xl">{safeName}</h1>
              <p className="mt-1 text-sm text-[var(--fx-muted)]">@{profileUsername}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <span><strong className="font-black">{Number(profileStats?.posts ?? 0)}</strong> Posts</span>
                <span><strong className="font-black">{Number(profileStats?.followers ?? 0)}</strong> Followers</span>
                <span><strong className="font-black">{Number(profileStats?.following ?? 0)}</strong> Following</span>
              </div>
              {profile.bio && <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-7">{profile.bio}</p>}
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--fx-muted)]">
                {profile.location_text && <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-1.5"><MapPin size={14}/>{profile.location_text}</span>}
                {website && <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-1.5 hover:underline"><Globe size={14}/>Website</a>}
                {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-1.5 hover:underline"><WhatsappLogo size={14}/>WhatsApp</a>}
                {facebook && <a href={facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-1.5 hover:underline"><FacebookLogo size={14}/>Facebook</a>}
                {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-1.5 hover:underline"><InstagramLogo size={14}/>Instagram</a>}
              </div>
              <ProfileReportButton profileId={profileId} locale="bn" />
              <p className="mt-5 text-[11px] text-[var(--fx-muted)]">FeniX member since {new Date(createdAt).toLocaleDateString('en-BD')}</p>
            </div>
          </div>
        </article>

        <section className="mt-5 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-5 sm:p-7">
          <div className="flex items-end justify-between gap-3">
            <div><p className="fenix-kicker">Public activity</p><h2 className="mt-2 text-2xl font-black">Posts</h2></div>
            {publicPosts?.length ? <span className="text-xs text-[var(--fx-muted)]">{publicPosts.length} latest</span> : null}
          </div>
          {publicPosts?.length ? (
            <div className="mt-5 grid gap-3">
              {publicPosts.map(post => {
                if (!post.id || !post.created_at) return null
                return <Link key={post.id} href={'/feed/post/'+post.id} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/35 p-4 hover:bg-[var(--fx-bg)]">
                  <div className="flex items-center justify-between gap-3"><time className="text-[10px] text-[var(--fx-muted)]">{new Date(post.created_at).toLocaleString('en-BD')}</time><span className="text-[10px] font-bold text-[var(--fx-primary-strong)]">Open post →</span></div>
                  {post.body && <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6">{post.body}</p>}
                  {(mediaByPost[post.id]?.length ?? 0) > 0 && <div className="mt-3 grid grid-cols-2 gap-1.5">{mediaByPost[post.id].slice(0,4).map(media => <img key={media.id} src={media.url} alt="" loading="lazy" decoding="async" width={media.width ?? 800} height={media.height ?? 600} className="aspect-square w-full rounded-xl object-cover"/>)}</div>}
                </Link>
              })}
            </div>
          ) : <div className="mt-5 rounded-2xl border border-dashed border-[var(--fx-border)] p-8 text-center text-sm text-[var(--fx-muted)]">No public posts yet.</div>}
        </section>
      </section>
    </main>
  )
}
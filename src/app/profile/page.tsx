'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowLeft, Camera, Check, CheckCircle, Copy, Gear, Globe, InstagramLogo,
  FacebookLogo, LinkSimple, LockKey, MapPin, Moon, Palette, ShareNetwork,
  SignOut, SpinnerGap, Sun, Translate, UserCircle, UserSwitch, WarningCircle,
  WhatsappLogo, X, DotsThree
} from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { useHomeTheme, type HomeTheme } from '@/components/theme/HomeThemeProvider'
import { optimizeImageFile, removePublicImage, uploadOptimizedPublicImage } from '@/lib/media/image-upload'

type Visibility = 'public' | 'private'
type MessagePermission = 'everyone' | 'authenticated' | 'nobody'
type FeedVisibility = 'public' | 'authenticated'
type SettingsSection = 'edit' | 'privacy' | 'appearance' | 'language' | 'links' | 'account' | null
type Tab = 'posts' | 'activity'
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const PROFILE_MAX_BYTES = 150 * 1024
const PROFILE_TARGET_BYTES = 138 * 1024

function cleanUrl(value: string) {
  const raw = value.trim()
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw.slice(0, 500) : null
}

function normalizeUsername(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 30)
}

function validUsername(value: string) {
  return /^[a-z0-9._]{3,30}$/.test(value) &&
    !value.startsWith('.') && !value.endsWith('.') && !value.includes('..')
}

function makeUsername(value: string) {
  const base = value.toLowerCase().split('@')[0].replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24)
  return base.length >= 3 ? base : 'user_' + Math.random().toString(36).slice(2, 8)
}

function storagePathFromPublicUrl(value: string, bucket: string) {
  const marker = '/storage/v1/object/public/' + bucket + '/'
  const index = value.indexOf(marker)
  return index >= 0 ? decodeURIComponent(value.slice(index + marker.length)) : ''
}

type PostPreview = { id: string; body: string; created_at: string }

export default function ProfilePage() {
  const { locale, setLocale } = useFenixLocale()
  const { theme, setTheme } = useHomeTheme()
  const bn = locale === 'bn'

  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')
  const [bio, setBio] = useState('')
  const [locationText, setLocationText] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [messagePermissions, setMessagePermissions] = useState<MessagePermission>('everyone')
  const [feedVisibility, setFeedVisibility] = useState<FeedVisibility>('public')
  const [reducedMotion, setReducedMotion] = useState(false)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsSection, setSettingsSection] = useState<SettingsSection>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('posts')

  const [posts, setPosts] = useState<PostPreview[]>([])
  const [postCount, setPostCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [imageBusy, setImageBusy] = useState<'avatar' | 'cover' | null>(null)
  const [imageProgress, setImageProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')

  const publicUrl = username ? '/profile/' + encodeURIComponent(username) : '/profile'

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) {
        window.location.replace('/login?next=/profile')
        return
      }

      const [{ data: profile }, { data: settings }, { data: userPosts, count: userPostCount }] = await Promise.all([
        s.from('profiles')
          .select('id,full_name,username,bio,avatar_url,cover_url,location_text,website_url,whatsapp_url,facebook_url,instagram_url')
          .eq('id', auth.user.id)
          .maybeSingle(),
        s.from('profile_settings')
          .select('locale,theme,profile_visibility,message_permissions,feed_visibility,reduced_motion')
          .eq('user_id', auth.user.id)
          .maybeSingle(),
        s.from('fenix_posts')
          .select('id,body,created_at', { count: 'exact' })
          .eq('author_id', auth.user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(12),
      ])
      if (!active) return

      const providerAvatar =
        typeof auth.user.user_metadata?.avatar_url === 'string'
          ? auth.user.user_metadata.avatar_url
          : typeof auth.user.user_metadata?.picture === 'string'
            ? auth.user.user_metadata.picture
            : ''

      const initialUsername = profile?.username ?? makeUsername(auth.user.email ?? 'user')
      setUserId(auth.user.id)
      setEmail(auth.user.email ?? '')
      setFullName(profile?.full_name ?? auth.user.user_metadata?.full_name ?? auth.user.user_metadata?.name ?? '')
      setUsername(initialUsername)
      setOriginalUsername(initialUsername)
      setBio(profile?.bio ?? '')
      setLocationText(profile?.location_text ?? '')
      setWebsiteUrl(profile?.website_url ?? '')
      setWhatsappUrl(profile?.whatsapp_url ?? '')
      setFacebookUrl(profile?.facebook_url ?? '')
      setInstagramUrl(profile?.instagram_url ?? '')
      setAvatarUrl(profile?.avatar_url ?? providerAvatar)
      setCoverUrl(profile?.cover_url ?? '')
      setPosts((userPosts ?? []) as PostPreview[])
      setPostCount(userPostCount ?? 0)

      if (settings?.locale === 'bn' || settings?.locale === 'en') setLocale(settings.locale)
      if (settings?.theme === 'light' || settings?.theme === 'dark' || settings?.theme === 'system') setTheme(settings.theme as HomeTheme)
      if (settings?.profile_visibility === 'private') setVisibility('private')
      if (settings?.message_permissions === 'everyone' || settings?.message_permissions === 'authenticated' || settings?.message_permissions === 'nobody') setMessagePermissions(settings.message_permissions)
      if (settings?.feed_visibility === 'authenticated') setFeedVisibility('authenticated')
      setReducedMotion(Boolean(settings?.reduced_motion))
      setUsernameStatus(validUsername(initialUsername) ? 'available' : 'invalid')
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [setLocale, setTheme])

  useEffect(() => {
    if (!userId || !username) {
      setUsernameStatus('idle')
      return
    }
    const clean = normalizeUsername(username)
    if (clean !== username || !validUsername(clean)) {
      setUsernameStatus('invalid')
      return
    }
    if (clean === originalUsername) {
      setUsernameStatus('available')
      return
    }

    setUsernameStatus('checking')
    const timer = window.setTimeout(async () => {
      const s = createClient()
      const { data, error } = await s.rpc('is_fenix_username_available', {
        p_username: clean,
        p_exclude_user_id: userId,
      })
      setUsernameStatus(error ? 'idle' : data ? 'available' : 'taken')
    }, 350)

    return () => window.clearTimeout(timer)
  }, [originalUsername, userId, username])

  function openEdit() {
    setMessage('')
    setEditOpen(true)
    setSettingsOpen(false)
  }

  function openSettings(section: SettingsSection = null) {
    setMessage('')
    setSettingsSection(section)
    setSettingsOpen(true)
    setEditOpen(false)
  }

  async function copyProfileLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin + publicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setMessage(bn ? 'Profile link copy করা যায়নি।' : 'Could not copy the profile link.')
    }
  }

  async function uploadProfileImage(kind: 'avatar' | 'cover', file: File) {
    if (!file.type.startsWith('image/')) {
      setMessage(bn ? 'একটি image file বাছাই করুন।' : 'Choose an image file.')
      return
    }

    setImageBusy(kind)
    setImageProgress(4)
    setMessage('')
    try {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) throw new Error(bn ? 'আবার sign in করুন।' : 'Please sign in again.')

      setImageProgress(10)
      const optimized = await optimizeImageFile(file, {
        maxDimension: kind === 'avatar' ? 1000 : 1600,
        targetBytes: PROFILE_TARGET_BYTES,
        hardLimitBytes: PROFILE_MAX_BYTES,
      })

      setImageProgress(72)
      if (optimized.byteSize > PROFILE_MAX_BYTES) {
        throw new Error(bn ? 'ছবিটি 150KB-এর মধ্যে আনা যায়নি।' : 'This image could not be reduced below 150KB.')
      }

      const extension = optimized.mimeType === 'image/webp' ? 'webp' : 'jpg'
      const path = auth.user.id + '/' + kind + '/' + crypto.randomUUID() + '.' + extension
      setImageProgress(82)
      const uploaded = await uploadOptimizedPublicImage(s, 'avatars', path, optimized, PROFILE_MAX_BYTES)
      setImageProgress(94)

      const patch = kind === 'avatar' ? { avatar_url: uploaded.publicUrl } : { cover_url: uploaded.publicUrl }
      const { error } = await s.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', auth.user.id)
      if (error) {
        await removePublicImage(s, 'avatars', path)
        throw error
      }

      if (kind === 'avatar') setAvatarUrl(uploaded.publicUrl)
      else setCoverUrl(uploaded.publicUrl)

      const oldPath = storagePathFromPublicUrl(kind === 'avatar' ? avatarUrl : coverUrl, 'avatars')
      if (oldPath) await removePublicImage(s, 'avatars', oldPath)

      setImageProgress(100)
      setMessage(bn ? (kind === 'avatar' ? 'Profile photo আপডেট হয়েছে।' : 'Cover photo আপডেট হয়েছে.') : (kind === 'avatar' ? 'Profile photo updated.' : 'Cover photo updated.'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (bn ? 'Image upload failed.' : 'Image upload failed.'))
    } finally {
      window.setTimeout(() => setImageProgress(0), 450)
      setImageBusy(null)
    }
  }

  async function saveProfile() {
    const cleanUsername = normalizeUsername(username)
    if (usernameStatus !== 'available' || cleanUsername !== username || !validUsername(cleanUsername)) {
      setMessage(bn ? 'Username available না হওয়া পর্যন্ত save করা যাবে না।' : 'Choose an available username before saving.')
      return
    }

    const website = cleanUrl(websiteUrl)
    const whatsapp = cleanUrl(whatsappUrl)
    const facebook = cleanUrl(facebookUrl)
    const instagram = cleanUrl(instagramUrl)

    for (const [label, original, clean] of [
      ['Website', websiteUrl, website],
      ['WhatsApp', whatsappUrl, whatsapp],
      ['Facebook', facebookUrl, facebook],
      ['Instagram', instagramUrl, instagram],
    ] as Array<[string, string, string | null]>) {
      if (original.trim() && !clean) {
        setSettingsOpen(true)
        setSettingsSection('links')
        setMessage((bn ? label + ' এ পূর্ণ http/https link দিন।' : label + ' must be a full http/https link.'))
        return
      }
    }

    setBusy(true)
    setMessage('')
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) {
      setBusy(false)
      return
    }

    const [{ error: profileError }, { error: settingsError }] = await Promise.all([
      s.from('profiles').update({
        full_name: fullName.trim().slice(0, 160) || null,
        username: cleanUsername,
        bio: bio.trim().slice(0, 1000) || null,
        location_text: locationText.trim().slice(0, 160) || null,
        website_url: website,
        whatsapp_url: whatsapp,
        facebook_url: facebook,
        instagram_url: instagram,
        updated_at: new Date().toISOString(),
      }).eq('id', auth.user.id),
      s.from('profile_settings').upsert({
        user_id: auth.user.id,
        locale,
        theme,
        profile_visibility: visibility,
        message_permissions: messagePermissions,
        feed_visibility: feedVisibility,
        reduced_motion: reducedMotion,
      }, { onConflict: 'user_id' }),
    ])

    if (profileError || settingsError) {
      const duplicate = profileError?.code === '23505'
      setMessage(duplicate
        ? (bn ? 'এই username ইতিমধ্যে নেওয়া হয়েছে। অন্যটি চেষ্টা করুন।' : 'That username is already taken. Try another one.')
        : (bn ? 'Profile save করা যায়নি।' : 'Profile could not be saved.'))
    } else {
      setOriginalUsername(cleanUsername)
      setUsername(cleanUsername)
      setUsernameStatus('available')
      setMessage(bn ? 'Profile updated successfully.' : 'Profile updated successfully.')
      setEditOpen(false)
    }
    setBusy(false)
  }

  async function changeTheme(next: HomeTheme) {
    setTheme(next)
    const s = createClient()
    await s.from('profile_settings').upsert({ user_id: userId, theme: next, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  }

  async function changeLocale(next: 'bn' | 'en') {
    setLocale(next)
    const s = createClient()
    await s.from('profile_settings').upsert({ user_id: userId, locale: next, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  }

  async function changeSetting(patch: Record<string, unknown>, apply: () => void) {
    apply()
    const s = createClient()
    const { error } = await s.from('profile_settings').update({ ...patch, updated_at: new Date().toISOString() }).eq('user_id', userId)
    if (error) setMessage(bn ? 'Setting save করা যায়নি।' : 'Setting could not be saved.')
  }

  async function signOut() {
    const s = createClient()
    await s.auth.signOut()
    window.location.replace('/login')
  }

  if (loading) {
    return (
      <main className="min-h-dvh">
        <Navbar />
        <section className="mx-auto max-w-2xl px-4 py-16">
          <div className="animate-pulse rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-8 text-sm text-[var(--fx-muted)]">
            {bn ? 'Profile loading…' : 'Loading profile…'}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar />

      <section className="mx-auto max-w-3xl px-3 pb-28 pt-2 sm:px-5 sm:pt-5">
        <header className="flex h-12 items-center justify-between border-b border-[var(--fx-border)]">
          <Link href="/feed" aria-label={bn ? 'ফিডে ফিরে যান' : 'Back to feed'} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/[.04] dark:hover:bg-white/[.05]">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-black">@{username}</p>
          </div>
          <button type="button" onClick={() => openSettings()} aria-label={bn ? 'সেটিংস' : 'Settings'} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/[.04] dark:hover:bg-white/[.05]">
            <Gear size={19} />
          </button>
        </header>

        <div className="py-7 sm:py-9">
          <div className="flex items-center gap-5 sm:gap-9">
            <div className="relative shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="h-24 w-24 rounded-full border border-[var(--fx-border)] bg-[var(--fx-bg)] object-cover sm:h-32 sm:w-32" />
                : <div className="grid h-24 w-24 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] sm:h-32 sm:w-32"><UserCircle size={65} className="text-[var(--fx-primary-strong)]" /></div>}
              <label className="absolute bottom-0 right-0 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-2 border-[var(--fx-bg)] bg-[var(--fx-primary-strong)] text-white shadow">
                {imageBusy === 'avatar' ? <span className="text-[8px] font-black">{imageProgress}%</span> : <Camera size={14} />}
                <input type="file" accept="image/*" className="sr-only" disabled={imageBusy !== null} onChange={e => { const file = e.target.files?.[0]; e.currentTarget.value = ''; if (file) void uploadProfileImage('avatar', file) }} />
              </label>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={openEdit} className="min-h-9 rounded-lg bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white">{bn ? 'Edit profile' : 'Edit profile'}</button>
                <button type="button" onClick={() => void copyProfileLink()} className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--fx-border)] bg-[var(--fx-surface)]" aria-label={bn ? 'Profile link copy' : 'Copy profile link'}>
                  {copied ? <Check size={16} /> : <ShareNetwork size={16} />}
                </button>
                <Link href={publicUrl} target="_blank" className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--fx-border)] bg-[var(--fx-surface)]" aria-label={bn ? 'Public profile' : 'Public profile'}>
                  <Globe size={16} />
                </Link>
                <button type="button" onClick={() => openSettings()} className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--fx-border)] bg-[var(--fx-surface)]" aria-label={bn ? 'More' : 'More'}>
                  <DotsThree size={18} weight="bold" />
                </button>
              </div>
              <div className="mt-5 flex items-center gap-7 text-sm">
                <span><strong className="font-black">{postCount}</strong> {bn ? 'পোস্ট' : 'posts'}</span>
                <span className="text-[var(--fx-muted)]"><strong className="text-[var(--fx-text)]">FeniX</strong> {bn ? 'member' : 'member'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 max-w-xl">
            <h1 className="text-base font-black">{fullName || (bn ? 'FeniX user' : 'FeniX user')}</h1>
            {bio && <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{bio}</p>}
            {locationText && <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--fx-muted)]"><MapPin size={13} />{locationText}</p>}
            {(websiteUrl || instagramUrl || facebookUrl || whatsappUrl) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {websiteUrl && <a href={websiteUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-xs font-bold"><Globe size={14}/>Website</a>}
                {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer noopener" aria-label="Instagram" className="grid h-8 w-8 place-items-center rounded-full border border-[var(--fx-border)]"><InstagramLogo size={15}/></a>}
                {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer noopener" aria-label="Facebook" className="grid h-8 w-8 place-items-center rounded-full border border-[var(--fx-border)]"><FacebookLogo size={15}/></a>}
                {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer noopener" aria-label="WhatsApp" className="grid h-8 w-8 place-items-center rounded-full border border-[var(--fx-border)]"><WhatsappLogo size={15}/></a>}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--fx-border)]">
          <div className="grid grid-cols-2">
            <button type="button" onClick={() => setTab('posts')} className={'relative h-12 text-[11px] font-black uppercase tracking-[.08em] ' + (tab === 'posts' ? '' : 'text-[var(--fx-muted)]')}>
              {bn ? 'পোস্ট' : 'Posts'}
              {tab === 'posts' && <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-[var(--fx-text)]" />}
            </button>
            <button type="button" onClick={() => setTab('activity')} className={'relative h-12 text-[11px] font-black uppercase tracking-[.08em] ' + (tab === 'activity' ? '' : 'text-[var(--fx-muted)]')}>
              {bn ? 'অ্যাক্টিভিটি' : 'Activity'}
              {tab === 'activity' && <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-[var(--fx-text)]" />}
            </button>
          </div>

          {tab === 'posts' ? (
            posts.length ? (
              <div className="space-y-2 py-3">
                {posts.map(post => (
                  <article key={post.id} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6">{post.body}</p>
                    <p className="mt-2 text-[10px] text-[var(--fx-muted)]">{new Date(post.created_at).toLocaleString(bn ? 'bn-BD' : 'en-BD')}</p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState text={bn ? 'এখনও কোনো পোস্ট নেই।' : 'No posts yet.'} />
            )
          ) : (
            <EmptyState text={bn ? 'আপনার FeniX activity এখানে দেখা যাবে।' : 'Your FeniX activity will appear here.'} />
          )}
        </div>
      </section>

      {message && <Toast message={message} onClose={() => setMessage('')} />}

      {editOpen && (
        <Sheet title={bn ? 'Edit profile' : 'Edit profile'} onClose={() => setEditOpen(false)}>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" /> : <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--fx-primary-soft)]"><UserCircle size={42}/></div>}
                <label className="absolute -bottom-1 -right-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-[var(--fx-primary-strong)] text-white">
                  {imageBusy === 'avatar' ? <span className="text-[7px] font-black">{imageProgress}%</span> : <Camera size={12}/>}
                  <input type="file" accept="image/*" className="sr-only" disabled={imageBusy !== null} onChange={e => { const file = e.target.files?.[0]; e.currentTarget.value=''; if(file) void uploadProfileImage('avatar', file) }} />
                </label>
              </div>
              <div><p className="text-sm font-black">{bn ? 'Profile photo' : 'Profile photo'}</p><p className="mt-1 text-[11px] text-[var(--fx-muted)]">{bn ? 'যেকোনো image → সর্বোচ্চ 150KB' : 'Any image → max 150KB'}</p></div>
            </div>

            <Field label={bn ? 'নাম' : 'Name'} value={fullName} onChange={setFullName} maxLength={160} />
            <div>
              <label className="text-xs font-bold">Username</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3">
                <span className="text-sm text-[var(--fx-muted)]">@</span>
                <input value={username} onChange={e => setUsername(normalizeUsername(e.target.value))} maxLength={30} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"/>
                {usernameStatus === 'checking' && <SpinnerGap size={16} className="animate-spin text-[var(--fx-muted)]"/>}
                {usernameStatus === 'available' && <CheckCircle size={17} className="text-[var(--fx-primary-strong)]"/>}
                {usernameStatus === 'taken' && <WarningCircle size={17} className="text-red-500"/>}
                {usernameStatus === 'invalid' && <WarningCircle size={17} className="text-amber-500"/>}
              </div>
              <p className="mt-1 text-[10px] text-[var(--fx-muted)]">{usernameStatus === 'available' ? 'Available' : usernameStatus === 'taken' ? 'Already taken' : usernameStatus === 'invalid' ? '3–30 • a-z • 0-9 • . • _' : 'Changes your public profile URL'}</p>
            </div>
            <Field label={bn ? 'Bio' : 'Bio'} value={bio} onChange={setBio} maxLength={1000} multiline />
            <Field label={bn ? 'Location' : 'Location'} value={locationText} onChange={setLocationText} maxLength={160} icon={<MapPin size={15}/>} />

            <div>
              <p className="text-xs font-black">{bn ? 'Cover photo' : 'Cover photo'}</p>
              <div className="mt-2 relative overflow-hidden rounded-xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)]">
                {coverUrl ? <img src={coverUrl} alt="" className="h-28 w-full object-cover"/> : <div className="h-28"/>}
                <label className="absolute right-2 top-2 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-black/55 text-white">
                  {imageBusy === 'cover' ? <span className="text-[8px] font-black">{imageProgress}%</span> : <Camera size={14}/>}
                  <input type="file" accept="image/*" className="sr-only" disabled={imageBusy !== null} onChange={e => { const file=e.target.files?.[0]; e.currentTarget.value=''; if(file) void uploadProfileImage('cover',file)}} />
                </label>
              </div>
            </div>

            <button type="button" disabled={busy || usernameStatus !== 'available'} onClick={() => void saveProfile()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] text-xs font-bold text-white disabled:opacity-40">
              {busy ? <SpinnerGap size={16} className="animate-spin"/> : <Check size={16}/>} {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </Sheet>
      )}

      {settingsOpen && (
        <Sheet title={bn ? 'Settings' : 'Settings'} onClose={() => setSettingsOpen(false)}>
          {settingsSection === null ? (
            <div className="overflow-hidden rounded-2xl border border-[var(--fx-border)]">
              <SettingRow icon={<UserSwitch size={18}/>} title={bn ? 'Edit profile' : 'Edit profile'} onClick={openEdit} />
              <SettingRow icon={<LinkSimple size={18}/>} title={bn ? 'Links & contact' : 'Links & contact'} onClick={() => setSettingsSection('links')} />
              <SettingRow icon={<LockKey size={18}/>} title={bn ? 'Privacy & messaging' : 'Privacy & messaging'} onClick={() => setSettingsSection('privacy')} />
              <SettingRow icon={<Palette size={18}/>} title={bn ? 'Appearance' : 'Appearance'} onClick={() => setSettingsSection('appearance')} />
              <SettingRow icon={<Translate size={18}/>} title={bn ? 'Language' : 'Language'} onClick={() => setSettingsSection('language')} />
              <SettingRow icon={<Gear size={18}/>} title={bn ? 'Account & safety' : 'Account & safety'} onClick={() => setSettingsSection('account')} />
            </div>
          ) : (
            <SettingsDetail section={settingsSection} bn={bn} email={email} websiteUrl={websiteUrl} instagramUrl={instagramUrl} facebookUrl={facebookUrl} whatsappUrl={whatsappUrl} setWebsiteUrl={setWebsiteUrl} setInstagramUrl={setInstagramUrl} setFacebookUrl={setFacebookUrl} setWhatsappUrl={setWhatsappUrl} visibility={visibility} messagePermissions={messagePermissions} feedVisibility={feedVisibility} reducedMotion={reducedMotion} theme={theme} onTheme={changeTheme} onLocale={changeLocale} onSetting={changeSetting} setVisibility={setVisibility} setMessagePermissions={setMessagePermissions} setFeedVisibility={setFeedVisibility} setReducedMotion={setReducedMotion} onBack={() => setSettingsSection(null)} copy={copyProfileLink} copied={copied} publicUrl={publicUrl} signOut={signOut} save={saveProfile} />
          )}
        </Sheet>
      )}
    </main>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="py-12 text-center text-xs text-[var(--fx-muted)]">{text}</div>
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <button type="button" onClick={onClose} className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] px-4 py-2.5 text-xs font-semibold shadow-xl">{message}</button>
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div className="relative max-h-[92dvh] w-full overflow-auto rounded-t-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4 shadow-2xl sm:max-w-xl sm:rounded-[2rem] sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-black">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/[.05]"><X size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function SettingRow({ icon, title, onClick }: { icon: ReactNode; title: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-12 w-full items-center gap-3 border-b border-[var(--fx-border)] px-4 text-left last:border-b-0 hover:bg-black/[.03]"><span className="text-[var(--fx-primary-strong)]">{icon}</span><span className="flex-1 text-sm font-bold">{title}</span><span className="text-[var(--fx-muted)]">›</span></button>
}

function Field({ label, value, onChange, maxLength, icon, multiline }: { label: string; value: string; onChange: (v: string) => void; maxLength: number; icon?: ReactNode; multiline?: boolean }) {
  return <label className="block"><span className="text-xs font-bold">{label}</span>{multiline ? <textarea value={value} onChange={e=>onChange(e.target.value)} maxLength={maxLength} rows={4} className="mt-2 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] p-3 text-sm outline-none"/> : <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3"><span className="text-[var(--fx-muted)]">{icon}</span><input value={value} onChange={e=>onChange(e.target.value)} maxLength={maxLength} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"/></div>}</label>
}

function SettingsDetail(props: {
  section: Exclude<SettingsSection, null>; bn: boolean; email: string
  websiteUrl: string; instagramUrl: string; facebookUrl: string; whatsappUrl: string
  setWebsiteUrl: (v:string)=>void; setInstagramUrl:(v:string)=>void; setFacebookUrl:(v:string)=>void; setWhatsappUrl:(v:string)=>void
  visibility: Visibility; messagePermissions: MessagePermission; feedVisibility: FeedVisibility; reducedMotion:boolean; theme:HomeTheme
  onTheme:(v:HomeTheme)=>void; onLocale:(v:'bn'|'en')=>void
  onSetting:(patch:Record<string,unknown>,apply:()=>void)=>void
  setVisibility:(v:Visibility)=>void; setMessagePermissions:(v:MessagePermission)=>void; setFeedVisibility:(v:FeedVisibility)=>void; setReducedMotion:(v:boolean)=>void
  onBack:()=>void; copy:()=>void; copied:boolean; publicUrl:string; signOut:()=>void; save:()=>void
}) {
  const p=props
  return <div>
    <button type="button" onClick={p.onBack} className="mb-4 text-xs font-bold text-[var(--fx-primary-strong)]">‹ {p.bn ? 'Settings' : 'Settings'}</button>

    {p.section === 'links' && <div className="space-y-3">
      <Field label="Website" value={p.websiteUrl} onChange={p.setWebsiteUrl} maxLength={500}/>
      <Field label="Instagram" value={p.instagramUrl} onChange={p.setInstagramUrl} maxLength={500}/>
      <Field label="Facebook" value={p.facebookUrl} onChange={p.setFacebookUrl} maxLength={500}/>
      <Field label="WhatsApp" value={p.whatsappUrl} onChange={p.setWhatsappUrl} maxLength={500}/>
      <button type="button" onClick={p.save} className="min-h-11 w-full rounded-xl bg-[var(--fx-primary-strong)] text-xs font-bold text-white">{p.bn ? 'Save links' : 'Save links'}</button>
    </div>}

    {p.section === 'privacy' && <div className="space-y-3">
      <SelectRow label={p.bn?'Profile visibility':'Profile visibility'} value={p.visibility} options={[['public','Public'],['private','Private']]} onChange={v=>p.onSetting({profile_visibility:v},()=>p.setVisibility(v as Visibility))}/>
      <SelectRow label={p.bn?'Who can message you':'Who can message you'} value={p.messagePermissions} options={[['everyone',p.bn?'Everyone':'Everyone'],['authenticated',p.bn?'Logged-in users':'Authenticated users'],['nobody',p.bn?'Nobody':'Nobody']]} onChange={v=>p.onSetting({message_permissions:v},()=>p.setMessagePermissions(v as MessagePermission))}/>
      <SelectRow label={p.bn?'Feed visibility':'Feed visibility'} value={p.feedVisibility} options={[['public','Public'],['authenticated',p.bn?'Logged-in users':'Authenticated users']]} onChange={v=>p.onSetting({feed_visibility:v},()=>p.setFeedVisibility(v as FeedVisibility))}/>
    </div>}

    {p.section === 'appearance' && <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">{(['light','system','dark'] as HomeTheme[]).map(k=><button key={k} type="button" onClick={()=>void p.onTheme(k)} className={'min-h-11 rounded-xl border text-xs font-bold '+(p.theme===k?'border-[var(--fx-primary)] bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>{k==='light'?<Sun size={17} className="mx-auto mb-1"/>:k==='dark'?<Moon size={17} className="mx-auto mb-1"/>:<Palette size={17} className="mx-auto mb-1"/>}{k}</button>)}</div>
      <ToggleRow label={p.bn?'Reduced motion':'Reduced motion'} value={p.reducedMotion} onChange={v=>p.onSetting({reduced_motion:v},()=>{p.setReducedMotion(v);try{localStorage.setItem('fenix-reduce-motion',String(v));document.documentElement.dataset.reduceMotion=v?'true':'false'}catch{}})}/>
    </div>}

    {p.section === 'language' && <div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>void p.onLocale('bn')} className={'min-h-11 rounded-xl border text-xs font-bold '+(p.bn?'border-[var(--fx-primary)] bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>বাংলা</button><button type="button" onClick={()=>void p.onLocale('en')} className={'min-h-11 rounded-xl border text-xs font-bold '+(!p.bn?'border-[var(--fx-primary)] bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>English</button></div>}

    {p.section === 'account' && <div className="space-y-2">
      <div className="rounded-xl border border-[var(--fx-border)] p-3"><p className="text-xs font-black">Account email</p><p className="mt-1 truncate text-[11px] text-[var(--fx-muted)]">{p.email || '—'}</p></div>
      <button type="button" onClick={p.copy} className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><Copy size={16}/> {p.copied ? 'Copied' : 'Copy profile link'}</button>
      <Link href={p.publicUrl} target="_blank" className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><Globe size={16}/> View public profile</Link>
      <button type="button" onClick={()=>void p.signOut()} className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-red-500/20 px-3 text-xs font-bold text-red-600"><SignOut size={16}/> Sign out</button>
    </div>}
  </div>
}

function SelectRow({label,value,options,onChange}:{label:string;value:string;options:string[][];onChange:(v:string)=>void}) {
  return <label className="block"><span className="text-xs font-bold">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-xs outline-none">{options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
}

function ToggleRow({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void}) {
  return <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--fx-border)] p-3"><span className="text-xs font-bold">{label}</span><button type="button" role="switch" aria-checked={value} onClick={()=>onChange(!value)} className={'relative h-7 w-12 rounded-full '+(value?'bg-[var(--fx-primary)]':'bg-black/10 dark:bg-white/10')}><span className={'absolute top-1 h-5 w-5 rounded-full bg-white transition '+(value?'left-6':'left-1')}/></button></div>
}

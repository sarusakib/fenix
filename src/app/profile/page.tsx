'use client'

import Link from 'next/link'
import {
  ArrowLeft, Bell, Check, CheckCircle, Copy, FacebookLogo, Gear, Globe, ImageSquare,
  InstagramLogo, LinkSimple, LockSimple, MapPin, Moon, Palette, PencilSimple,
  ShieldCheck, SignOut, Sun, Translate, UserCircle, WhatsappLogo
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { useHomeTheme, type HomeTheme } from '@/components/theme/HomeThemeProvider'
import { optimizeImageFile, removePublicImage, uploadOptimizedPublicImage } from '@/lib/media/image-upload'

type Visibility = 'public' | 'private'
type MessagePermission = 'everyone' | 'authenticated' | 'nobody'
type FeedVisibility = 'public' | 'authenticated'
type UsernameState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const PROFILE_IMAGE_TARGET = 96 * 1024
const PROFILE_IMAGE_MAX = 100 * 1024

function validUsername(value: string) {
  return /^[a-z][a-z0-9._]{2,31}$/.test(value) && !/[._]{2}/.test(value)
}

function cleanPublicUrl(value: string) {
  const raw = value.trim()
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw.slice(0, 500) : null
}

function makeUsername(value: string) {
  const base = value
    .toLowerCase()
    .split('@')[0]
    .replace(/[^a-z0-9._]+/g, '_')
    .replace(/^[._]+|[._]+$/g, '')
    .slice(0, 24)
  return validUsername(base) ? base : 'user_' + Math.random().toString(36).slice(2, 8)
}

function normalizeUsername(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 32)
}

function previousStoragePath(value: string) {
  const marker = '/storage/v1/object/public/avatars/'
  const index = value.indexOf(marker)
  return index >= 0 ? decodeURIComponent(value.slice(index + marker.length)) : ''
}

export default function ProfileEditorPage() {
  const { locale, setLocale } = useFenixLocale()
  const { theme, setTheme } = useHomeTheme()
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [savedUsername, setSavedUsername] = useState('')
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
  const [usernameState, setUsernameState] = useState<UsernameState>('idle')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [imageBusy, setImageBusy] = useState<'avatar' | 'cover' | null>(null)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const bn = locale === 'bn'

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) {
        window.location.replace('/login?next=/profile')
        return
      }

      const [{ data: profile }, { data: contacts }, { data: settings }] = await Promise.all([
        s.from('profiles')
          .select('id,full_name,username,bio,avatar_url,cover_url,location_text,website_url')
          .eq('id', auth.user.id)
          .maybeSingle(),
        s.from('profile_contacts')
          .select('whatsapp,facebook_url,instagram_url,public_whatsapp,public_facebook_url,public_instagram_url')
          .eq('user_id', auth.user.id)
          .maybeSingle(),
        s.from('profile_settings')
          .select('locale,theme,profile_visibility,message_permissions,feed_visibility,reduced_motion')
          .eq('user_id', auth.user.id)
          .maybeSingle(),
      ])

      if (!active) return
      const providerAvatar =
        typeof auth.user.user_metadata?.avatar_url === 'string'
          ? auth.user.user_metadata.avatar_url
          : typeof auth.user.user_metadata?.picture === 'string'
            ? auth.user.user_metadata.picture
            : ''

      const loadedUsername = profile?.username ?? makeUsername(auth.user.email ?? 'user')
      setUserId(auth.user.id)
      setEmail(auth.user.email ?? '')
      setFullName(profile?.full_name ?? auth.user.user_metadata?.full_name ?? auth.user.user_metadata?.name ?? '')
      setUsername(loadedUsername)
      setSavedUsername(loadedUsername)
      setBio(profile?.bio ?? '')
      setLocationText(profile?.location_text ?? '')
      setWebsiteUrl(profile?.website_url ?? '')
      setWhatsappUrl(contacts?.whatsapp ?? contacts?.public_whatsapp ?? '')
      setFacebookUrl(contacts?.facebook_url ?? contacts?.public_facebook_url ?? '')
      setInstagramUrl(contacts?.instagram_url ?? contacts?.public_instagram_url ?? '')
      setAvatarUrl(profile?.avatar_url ?? providerAvatar)
      setCoverUrl(profile?.cover_url ?? '')

      if (settings?.locale === 'bn' || settings?.locale === 'en') setLocale(settings.locale)
      if (settings?.theme === 'light' || settings?.theme === 'dark' || settings?.theme === 'system') setTheme(settings.theme as HomeTheme)
      if (settings?.profile_visibility === 'private') setVisibility('private')
      if (settings?.message_permissions === 'everyone' || settings?.message_permissions === 'authenticated' || settings?.message_permissions === 'nobody') setMessagePermissions(settings.message_permissions)
      if (settings?.feed_visibility === 'authenticated') setFeedVisibility('authenticated')
      if (typeof settings?.reduced_motion === 'boolean') setReducedMotion(settings.reduced_motion)
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [setLocale, setTheme])

  useEffect(() => {
    if (!userId || !username) {
      setUsernameState('idle')
      return
    }
    if (username === savedUsername) {
      setUsernameState(validUsername(username) ? 'available' : 'invalid')
      return
    }
    if (!validUsername(username)) {
      setUsernameState('invalid')
      return
    }

    setUsernameState('checking')
    const timer = window.setTimeout(async () => {
      const s = createClient()
      const { data, error } = await s.rpc('is_fenix_username_available', {
        p_username: username,
        p_exclude_user_id: userId,
      })
      if (error) setUsernameState('idle')
      else setUsernameState(Boolean(data) ? 'available' : 'taken')
    }, 350)

    return () => window.clearTimeout(timer)
  }, [savedUsername, userId, username])

  const publicUrl = username ? '/profile/' + encodeURIComponent(username) : '/profile'
  const profileCompletion = useMemo(() => {
    const values = [fullName, username, bio, locationText, avatarUrl]
    return Math.round(values.filter(Boolean).length / values.length * 100)
  }, [avatarUrl, bio, fullName, locationText, username])

  const social = useMemo(() => [
    { href: whatsappUrl, label: 'WhatsApp', Icon: WhatsappLogo },
    { href: facebookUrl, label: 'Facebook', Icon: FacebookLogo },
    { href: instagramUrl, label: 'Instagram', Icon: InstagramLogo },
    { href: websiteUrl, label: 'Website', Icon: Globe },
  ].filter(item => Boolean(item.href)), [facebookUrl, instagramUrl, websiteUrl, whatsappUrl])

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
    setImageBusy(kind)
    setMessage('')
    try {
      if (!file.type.startsWith('image/')) throw new Error(bn ? 'শুধু image file দিন।' : 'Please choose an image file.')

      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) throw new Error(bn ? 'আবার sign in করুন।' : 'Please sign in again.')

      const previousUrl = kind === 'avatar' ? avatarUrl : coverUrl
      const optimized = await optimizeImageFile(file, {
        maxDimension: kind === 'avatar' ? 960 : 1600,
        minDimension: kind === 'avatar' ? 160 : 180,
        targetBytes: PROFILE_IMAGE_TARGET,
      })

      if (optimized.byteSize > PROFILE_IMAGE_MAX) {
        throw new Error(bn ? 'ছবিটি 100KB-এর মধ্যে করা যায়নি।' : 'This image could not be prepared under 100KB.')
      }

      const extension = optimized.mimeType === 'image/webp' ? 'webp' : 'jpg'
      const path = auth.user.id + '/' + kind + '/' + crypto.randomUUID() + '.' + extension
      const uploaded = await uploadOptimizedPublicImage(s, 'avatars', path, optimized)
      const patch = kind === 'avatar' ? { avatar_url: uploaded.publicUrl } : { cover_url: uploaded.publicUrl }
      const { error } = await s.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', auth.user.id)

      if (error) {
        await removePublicImage(s, 'avatars', path)
        throw error
      }

      if (kind === 'avatar') setAvatarUrl(uploaded.publicUrl)
      else setCoverUrl(uploaded.publicUrl)

      const oldPath = previousStoragePath(previousUrl)
      if (oldPath) await removePublicImage(s, 'avatars', oldPath)

      setMessage(bn
        ? (kind === 'avatar' ? 'Profile photo আপলোড হয়েছে · 100KB max.' : 'Cover photo আপলোড হয়েছে · 100KB max.')
        : (kind === 'avatar' ? 'Profile photo uploaded · max 100KB.' : 'Cover photo uploaded · max 100KB.'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (bn ? 'Image upload failed.' : 'Image upload failed.'))
    } finally {
      setImageBusy(null)
    }
  }

  async function save() {
    setBusy(true)
    setMessage('')

    if (!validUsername(username)) {
      setMessage(bn ? 'Username 3–32 অক্ষরের হতে হবে, letter দিয়ে শুরু হবে।' : 'Username must be 3–32 characters and start with a letter.')
      setBusy(false)
      return
    }

    if (username !== savedUsername && usernameState !== 'available') {
      setMessage(bn ? 'এই usernameটি available নয়। অন্য username দিন।' : 'This username is not available. Choose another username.')
      setBusy(false)
      return
    }

    const values = {
      website: cleanPublicUrl(websiteUrl),
      whatsapp: cleanPublicUrl(whatsappUrl),
      facebook: cleanPublicUrl(facebookUrl),
      instagram: cleanPublicUrl(instagramUrl),
    }
    if (Object.entries(values).some(([key, value]) => Boolean(({
      website: websiteUrl,
      whatsapp: whatsappUrl,
      facebook: facebookUrl,
      instagram: instagramUrl,
    } as Record<string, string>)[key]?.trim()) && !value)) {
      setMessage(bn ? 'সব social link-এর শুরুতে http:// অথবা https:// দিন।' : 'Social links must start with http:// or https://.')
      setBusy(false)
      return
    }

    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) {
      setBusy(false)
      return
    }

    const [{ error: profileError }, { error: settingError }] = await Promise.all([
      s.from('profiles').update({
        full_name: fullName.trim().slice(0, 160) || null,
        username,
        bio: bio.trim().slice(0, 1000) || null,
        avatar_url: cleanPublicUrl(avatarUrl),
        cover_url: cleanPublicUrl(coverUrl),
        location_text: locationText.trim().slice(0, 160) || null,
        website_url: values.website,
        updated_at: new Date().toISOString(),
      }).eq('id', auth.user.id),
      s.from('profile_contacts').upsert({
        user_id: auth.user.id,
        whatsapp: values.whatsapp,
        facebook_url: values.facebook,
        instagram_url: values.instagram,
        public_whatsapp: values.whatsapp,
        public_facebook_url: values.facebook,
        public_instagram_url: values.instagram,
        whatsapp_public: Boolean(values.whatsapp),
        facebook_public: Boolean(values.facebook),
        instagram_public: Boolean(values.instagram),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }),
      s.from('profile_settings').upsert({
        user_id: auth.user.id,
        locale,
        theme,
        profile_visibility: visibility,
        message_permissions: messagePermissions,
        feed_visibility: feedVisibility,
        reduced_motion: reducedMotion,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }),
    ])

    if (profileError || settingError) {
      const duplicateUsername = profileError?.code === '23505'
      setMessage(duplicateUsername
        ? (bn ? 'এই usernameটি ইতিমধ্যে নেওয়া হয়েছে।' : 'That username is already taken.')
        : (bn ? 'Profile save করা যায়নি। আবার চেষ্টা করুন।' : 'Could not save the profile. Please try again.'))
    } else {
      setSavedUsername(username)
      setUsernameState('available')
      setMessage(bn ? 'Profile updated.' : 'Profile updated.')
    }
    setBusy(false)
  }

  async function updateLocale(next: 'bn' | 'en') {
    setLocale(next)
    const s = createClient()
    await s.from('profile_settings').update({ locale: next, updated_at: new Date().toISOString() }).eq('user_id', userId)
  }

  async function chooseTheme(next: HomeTheme) {
    setTheme(next)
    const s = createClient()
    await s.from('profile_settings').update({ theme: next, updated_at: new Date().toISOString() }).eq('user_id', userId)
  }

  async function chooseMotion(next: boolean) {
    setReducedMotion(next)
    try {
      localStorage.setItem('fenix-reduce-motion', String(next))
      document.documentElement.dataset.reduceMotion = next ? 'true' : 'false'
    } catch {}
    const s = createClient()
    await s.from('profile_settings').update({ reduced_motion: next, updated_at: new Date().toISOString() }).eq('user_id', userId)
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
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="fenix-surface-strong animate-pulse rounded-[2rem] p-10 text-sm text-[var(--fx-muted)]">{bn ? 'প্রোফাইল লোড হচ্ছে…' : 'Loading profile…'}</div>
        </section>
      </main>
    )
  }

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 pb-28 pt-4 sm:px-6 sm:pt-7">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold">
            <ArrowLeft size={16} /> {bn ? 'অ্যাকাউন্ট' : 'Account'}
          </Link>
          <Link href={publicUrl} target="_blank" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-3.5 text-xs font-bold text-[var(--fx-primary-strong)]">
            <LinkSimple size={15} /> {bn ? 'প্রোফাইল দেখুন' : 'View profile'}
          </Link>
        </div>

        <article className="mt-5 overflow-hidden rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] shadow-sm">
          <div className="relative h-36 overflow-hidden bg-[var(--fx-primary-soft)] sm:h-48">
            {coverUrl
              ? <img src={coverUrl} alt="" className="h-full w-full object-cover" />
              : <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,23,54,.03),rgba(0,128,128,.14))]" />}
            <label className="absolute right-3 top-3 inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-xl bg-black/55 px-3 text-xs font-bold text-white backdrop-blur">
              <ImageSquare size={15} /> {imageBusy === 'cover' ? (bn ? 'আপলোড…' : 'Uploading…') : (bn ? 'Cover বদলান' : 'Edit cover')}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={imageBusy !== null || busy} onChange={e => { const file = e.target.files?.[0]; e.currentTarget.value = ''; if (file) void uploadProfileImage('cover', file) }} />
            </label>
          </div>

          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-12 flex items-end justify-between gap-3 sm:-mt-14">
              <div className="relative">
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="h-24 w-24 rounded-full border-4 border-[var(--fx-surface)] bg-[var(--fx-bg)] object-cover sm:h-28 sm:w-28" />
                  : <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-[var(--fx-surface)] bg-[var(--fx-primary-soft)] sm:h-28 sm:w-28"><UserCircle size={58} className="text-[var(--fx-primary-strong)]" /></div>}
                <label className="absolute bottom-0 right-0 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-[var(--fx-surface)] bg-[var(--fx-primary-strong)] text-white shadow">
                  <PencilSimple size={15} />
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={imageBusy !== null || busy} onChange={e => { const file = e.target.files?.[0]; e.currentTarget.value = ''; if (file) void uploadProfileImage('avatar', file) }} />
                </label>
              </div>
              <button type="button" onClick={() => void copyProfileLink()} className="mb-1 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold">
                {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? (bn ? 'কপি হয়েছে' : 'Copied') : (bn ? 'লিংক কপি' : 'Copy link')}
              </button>
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-black tracking-[-.045em] sm:text-3xl">{fullName || (bn ? 'আপনার FeniX প্রোফাইল' : 'Your FeniX profile')}</h1>
              <p className="mt-1 text-sm text-[var(--fx-muted)]">@{username || 'username'}</p>
              {bio && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--fx-muted)]">{bio}</p>}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--fx-muted)]">
                {locationText && <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fx-border)] px-2.5 py-1.5"><MapPin size={13} />{locationText}</span>}
                {social.map(({ href, label, Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--fx-border)] px-2.5 py-1.5 hover:bg-[var(--fx-primary-soft)]"><Icon size={13} />{label}</a>)}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-[var(--fx-muted)]">
                <ShieldCheck size={14} className="text-[var(--fx-primary-strong)]" />
                <span>{profileCompletion}% {bn ? 'profile complete' : 'profile complete'}</span>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-4 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)]">
          <SettingRow icon={<PencilSimple size={19}/>} title={bn ? 'প্রোফাইল এডিট' : 'Edit profile'} hint={bn ? 'নাম, bio, location ও social links' : 'Name, bio, location and social links'}>
            <div className="space-y-4">
              <Field label={bn ? 'নাম' : 'Name'} value={fullName} onChange={setFullName} maxLength={160} />
              <div>
                <label className="text-xs font-bold">Username</label>
                <div className="mt-2 flex items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3">
                  <span className="text-sm font-bold text-[var(--fx-muted)]">@</span>
                  <input value={username} onChange={e => { setUsername(normalizeUsername(e.target.value)); setMessage('') }} maxLength={32} className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
                  {usernameState === 'checking' && <span className="text-[10px] text-[var(--fx-muted)]">{bn ? 'চেক হচ্ছে…' : 'Checking…'}</span>}
                  {usernameState === 'available' && <CheckCircle size={17} className="text-[var(--fx-primary-strong)]" />}
                  {usernameState === 'taken' && <span className="text-[10px] font-bold text-red-500">{bn ? 'নেওয়া আছে' : 'Taken'}</span>}
                </div>
                <p className="mt-1 text-[10px] text-[var(--fx-muted)]">
                  {usernameState === 'invalid'
                    ? (bn ? 'Letter দিয়ে শুরু করুন; A–Z, 0–9, dot ও underscore ব্যবহার করা যাবে।' : 'Start with a letter; use A–Z, 0–9, dot or underscore.')
                    : (bn ? 'আপনার public URL: ' + window.location.origin + publicUrl : 'Your public URL: ' + window.location.origin + publicUrl)}
                </p>
              </div>
              <Field label={bn ? 'Bio' : 'Bio'} value={bio} onChange={setBio} maxLength={1000} multiline />
              <Field label={bn ? 'এলাকা' : 'Location'} value={locationText} onChange={setLocationText} maxLength={160} icon={<MapPin size={15}/>} />
              <Field label="Website" value={websiteUrl} onChange={setWebsiteUrl} maxLength={500} placeholder="https://example.com" icon={<Globe size={15}/>} />

              <div className="grid gap-2 sm:grid-cols-3">
                <Field label="WhatsApp" value={whatsappUrl} onChange={setWhatsappUrl} maxLength={500} placeholder="https://wa.me/…" icon={<WhatsappLogo size={15}/>} />
                <Field label="Facebook" value={facebookUrl} onChange={setFacebookUrl} maxLength={500} placeholder="https://facebook.com/…" icon={<FacebookLogo size={15}/>} />
                <Field label="Instagram" value={instagramUrl} onChange={setInstagramUrl} maxLength={500} placeholder="https://instagram.com/…" icon={<InstagramLogo size={15}/>} />
              </div>

              <button type="button" disabled={busy} onClick={() => void save()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white disabled:opacity-45">
                <Check size={17}/>{busy ? (bn ? 'সংরক্ষণ…' : 'Saving…') : (bn ? 'পরিবর্তন সংরক্ষণ' : 'Save changes')}
              </button>
            </div>
          </SettingRow>

          <SettingRow icon={<LockSimple size={19}/>} title={bn ? 'Privacy ও messaging' : 'Privacy & messaging'} hint={bn ? 'কে profile দেখবে, message করবে' : 'Who can view and message you'}>
            <div className="grid gap-3">
              <Select label={bn ? 'Profile visibility' : 'Profile visibility'} value={visibility} onChange={v => setVisibility(v as Visibility)} options={[['public', bn ? 'সবার জন্য public' : 'Public'], ['private', bn ? 'Private' : 'Private']]} />
              <Select label={bn ? 'কে message করতে পারবে' : 'Who can message you'} value={messagePermissions} onChange={v => setMessagePermissions(v as MessagePermission)} options={[['everyone', bn ? 'সবাই' : 'Everyone'], ['authenticated', bn ? 'শুধু logged-in user' : 'Authenticated users'], ['nobody', bn ? 'কেউ না' : 'Nobody']]} />
              <Select label={bn ? 'Feed visibility' : 'Feed visibility'} value={feedVisibility} onChange={v => setFeedVisibility(v as FeedVisibility)} options={[['public','Public'],['authenticated',bn ? 'Logged-in users' : 'Authenticated users']]} />
              <button type="button" onClick={() => void save()} disabled={busy} className="min-h-11 rounded-xl border border-[var(--fx-border)] text-xs font-bold">{bn ? 'Privacy save করুন' : 'Save privacy'}</button>
            </div>
          </SettingRow>

          <SettingRow icon={<Palette size={19}/>} title={bn ? 'Appearance' : 'Appearance'} hint={bn ? 'Theme ও motion' : 'Theme and motion'}>
            <div className="grid grid-cols-3 gap-2">
              {([['light','Light',Sun],['system','System',Palette],['dark','Dark',Moon]] as const).map(([key,label,Icon]) =>
                <button key={key} type="button" onClick={() => void chooseTheme(key)} aria-pressed={theme === key} className={'flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-bold ' + (theme === key ? 'border-[var(--fx-primary)]/30 bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)]')}>
                  <Icon size={17}/>{label}
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--fx-border)] p-3">
              <div><p className="text-xs font-bold">{bn ? 'কম animation' : 'Reduced motion'}</p><p className="mt-1 text-[10px] text-[var(--fx-muted)]">{bn ? 'কম transition ও motion ব্যবহার করুন।' : 'Reduce extra motion and transitions.'}</p></div>
              <button type="button" role="switch" aria-checked={reducedMotion} onClick={() => void chooseMotion(!reducedMotion)} className={'relative h-7 w-12 rounded-full ' + (reducedMotion ? 'bg-[var(--fx-primary)]' : 'bg-black/10 dark:bg-white/10')}>
                <span className={'absolute top-1 h-5 w-5 rounded-full bg-white transition ' + (reducedMotion ? 'left-6' : 'left-1')} />
              </button>
            </div>
          </SettingRow>

          <SettingRow icon={<Translate size={19}/>} title={bn ? 'ভাষা' : 'Language'} hint={bn ? 'বাংলা / English' : 'Bangla / English'}>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => void updateLocale('bn')} className={'min-h-11 rounded-xl border text-xs font-bold ' + (bn ? 'border-[var(--fx-primary)]/30 bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)]')}>বাংলা</button>
              <button type="button" onClick={() => void updateLocale('en')} className={'min-h-11 rounded-xl border text-xs font-bold ' + (!bn ? 'border-[var(--fx-primary)]/30 bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)]')}>English</button>
            </div>
          </SettingRow>

          <SettingRow icon={<Bell size={19}/>} title={bn ? 'Notifications' : 'Notifications'} hint={bn ? 'অন্য notification preference এখানে' : 'More notification preferences'}>
            <Link href="/notifications" className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--fx-border)] text-xs font-bold">
              {bn ? 'Notification settings খুলুন' : 'Open notification settings'}
            </Link>
          </SettingRow>

          <SettingRow icon={<Gear size={19}/>} title={bn ? 'Account & safety' : 'Account & safety'} hint={bn ? 'Help, policy ও sign out' : 'Help, policy and sign out'}>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/help" className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold">Help & safety</Link>
              <Link href="/policy" className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><ShieldCheck size={15}/> Privacy & policy</Link>
              <button type="button" onClick={() => void signOut()} className="flex min-h-11 items-center gap-2 rounded-xl border border-red-500/20 px-3 text-xs font-bold text-red-600"><SignOut size={15}/> {bn ? 'Sign out' : 'Sign out'}</button>
              <span className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-[10px] text-[var(--fx-muted)]"><CheckCircle size={15}/> {email}</span>
            </div>
          </SettingRow>
        </div>

        {message && <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] p-3 text-xs"><CheckCircle size={17} className="mt-0.5 shrink-0"/><span>{message}</span></div>}
      </section>
    </main>
  )
}

function SettingRow({ icon, title, hint, children }: { icon: ReactNode; title: string; hint: string; children: ReactNode }) {
  return (
    <details className="group border-b border-[var(--fx-border)] last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">{icon}</span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{title}</span><span className="mt-0.5 block truncate text-[10px] text-[var(--fx-muted)]">{hint}</span></span>
        <span className="text-lg text-[var(--fx-muted)] transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  )
}

function Field({ label, value, onChange, maxLength, icon, placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; maxLength: number; icon?: ReactNode; placeholder?: string; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-bold">{label}</span>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} maxLength={maxLength} rows={4} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] p-3 text-sm leading-6 outline-none" />
        : <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3"><span className="text-[var(--fx-muted)]">{icon}</span><input value={value} onChange={e => onChange(e.target.value)} maxLength={maxLength} placeholder={placeholder} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /></div>}
    </label>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <label className="block">
      <span className="text-xs font-bold">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-sm">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

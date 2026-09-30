'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft, Bell, Camera, CaretDown, Check, CheckCircle, Copy, Gear,
  Globe, InstagramLogo, FacebookLogo, LinkSimple, LockKey, MapPin,
  Moon, Palette, ShareNetwork, SignOut, SpinnerGap, Sun, Translate,
  UserCircle, UserSwitch, WarningCircle, WhatsappLogo, X
} from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { useHomeTheme, type HomeTheme } from '@/components/theme/HomeThemeProvider'
import { optimizeImageFile, removePublicImage, uploadOptimizedPublicImage } from '@/lib/media/image-upload'

type Visibility = 'public' | 'private'
type MessagePermission = 'everyone' | 'authenticated' | 'nobody'
type FeedVisibility = 'public' | 'authenticated'
type Panel = 'edit' | 'privacy' | 'appearance' | 'language' | 'links' | 'account' | null
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const PROFILE_MAX_BYTES = 100 * 1024
const PROFILE_TARGET_BYTES = 92 * 1024

function cleanUrl(value: string) {
  const raw = value.trim()
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw.slice(0, 500) : null
}

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, '')
    .slice(0, 30)
}

function validUsername(value: string) {
  return /^[a-z0-9._]{3,30}$/.test(value) && !value.startsWith('.') && !value.endsWith('.') && !value.includes('..')
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
  const [panel, setPanel] = useState<Panel>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageBusy, setImageBusy] = useState<'avatar' | 'cover' | null>(null)
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
      const [{ data: profile }, { data: settings }] = await Promise.all([
        s.from('profiles').select('id,full_name,username,bio,avatar_url,cover_url,location_text,website_url,whatsapp_url,facebook_url,instagram_url').eq('id', auth.user.id).maybeSingle(),
        s.from('profile_settings').select('locale,theme,profile_visibility,message_permissions,feed_visibility,reduced_motion').eq('user_id', auth.user.id).maybeSingle(),
      ])
      if (!active) return

      const providerAvatar =
        typeof auth.user.user_metadata?.avatar_url === 'string'
          ? auth.user.user_metadata.avatar_url
          : typeof auth.user.user_metadata?.picture === 'string'
            ? auth.user.user_metadata.picture
            : ''

      setUserId(auth.user.id)
      setEmail(auth.user.email ?? '')
      setFullName(profile?.full_name ?? auth.user.user_metadata?.full_name ?? auth.user.user_metadata?.name ?? '')
      const initialUsername = profile?.username ?? makeUsername(auth.user.email ?? 'user')
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
    if (clean !== username) {
      setUsernameStatus('invalid')
      return
    }
    if (!validUsername(clean)) {
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
      if (error) setUsernameStatus('idle')
      else setUsernameStatus(data ? 'available' : 'taken')
    }, 350)

    return () => window.clearTimeout(timer)
  }, [originalUsername, userId, username])

  const profileCompletion = useMemo(() => {
    const values = [fullName.trim(), username.trim(), bio.trim(), locationText.trim(), avatarUrl]
    return Math.round(values.filter(Boolean).length / values.length * 100)
  }, [avatarUrl, bio, fullName, locationText, username])

  const togglePanel = (next: Exclude<Panel, null>) => setPanel(current => current === next ? null : next)

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
    setMessage('')
    try {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) throw new Error(bn ? 'আবার sign in করুন।' : 'Please sign in again.')

      const previousUrl = kind === 'avatar' ? avatarUrl : coverUrl
      const optimized = await optimizeImageFile(file, {
        maxDimension: kind === 'avatar' ? 1000 : 1600,
        targetBytes: PROFILE_TARGET_BYTES,
        hardLimitBytes: PROFILE_MAX_BYTES,
      })

      if (optimized.byteSize > PROFILE_MAX_BYTES) {
        throw new Error(bn ? 'ছবিটি 100KB-এর মধ্যে আনা যায়নি।' : 'This image could not be reduced below 100KB.')
      }

      const extension = optimized.mimeType === 'image/webp' ? 'webp' : 'jpg'
      const path = auth.user.id + '/' + kind + '/' + crypto.randomUUID() + '.' + extension
      const uploaded = await uploadOptimizedPublicImage(s, 'avatars', path, optimized, PROFILE_MAX_BYTES)

      const patch = kind === 'avatar' ? { avatar_url: uploaded.publicUrl } : { cover_url: uploaded.publicUrl }
      const { error } = await s.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', auth.user.id)
      if (error) {
        await removePublicImage(s, 'avatars', path)
        throw error
      }

      if (kind === 'avatar') setAvatarUrl(uploaded.publicUrl)
      else setCoverUrl(uploaded.publicUrl)

      const oldPath = storagePathFromPublicUrl(previousUrl, 'avatars')
      if (oldPath) await removePublicImage(s, 'avatars', oldPath)

      setMessage(bn
        ? (kind === 'avatar' ? 'Profile photo আপডেট হয়েছে।' : 'Cover photo আপডেট হয়েছে।') + ' • 100KB-এর মধ্যে'
        : (kind === 'avatar' ? 'Profile photo updated.' : 'Cover photo updated.') + ' • under 100KB')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (bn ? 'ছবিটি upload করা যায়নি।' : 'Image upload failed.'))
    } finally {
      setImageBusy(null)
    }
  }

  async function saveProfile() {
    const cleanUsername = normalizeUsername(username)
    if (usernameStatus !== 'available' || cleanUsername !== username || !validUsername(cleanUsername)) {
      setPanel('edit')
      setMessage(bn ? 'Username available না হওয়া পর্যন্ত save করা যাবে না।' : 'Choose an available username before saving.')
      return
    }

    const website = cleanUrl(websiteUrl)
    const whatsapp = cleanUrl(whatsappUrl)
    const facebook = cleanUrl(facebookUrl)
    const instagram = cleanUrl(instagramUrl)

    for (const [label, original, clean] of [
      [bn ? 'Website' : 'Website', websiteUrl, website],
      [bn ? 'WhatsApp link' : 'WhatsApp link', whatsappUrl, whatsapp],
      [bn ? 'Facebook link' : 'Facebook link', facebookUrl, facebook],
      [bn ? 'Instagram link' : 'Instagram link', instagramUrl, instagram],
    ] as Array<[string,string,string|null]>) {
      if (original.trim() && !clean) {
        setPanel('links')
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
      setPanel(null)
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
    return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-2xl px-4 py-16 sm:px-6"><div className="fenix-surface-strong animate-pulse rounded-[2rem] p-8 text-sm text-[var(--fx-muted)]">{bn ? 'Profile loading…' : 'Loading profile…'}</div></section></main>
  }

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar/>
      <section className="mx-auto max-w-2xl px-3 pb-28 pt-4 sm:px-5 sm:pt-7">
        <div className="flex items-center justify-between gap-3">
          <Link href="/feed" aria-label={bn ? 'ফিডে ফিরে যান' : 'Back to feed'} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)]"><ArrowLeft size={18}/></Link>
          <div className="text-center"><p className="text-sm font-black">{bn ? 'প্রোফাইল' : 'Profile'}</p><p className="text-[10px] text-[var(--fx-muted)]">@{username}</p></div>
          <button type="button" aria-label={bn ? 'সেটিংস' : 'Settings'} onClick={() => togglePanel('account')} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)]"><Gear size={18}/></button>
        </div>

        <article className="fenix-surface-strong mt-4 overflow-hidden rounded-[2rem]">
          <div className="relative h-32 bg-[var(--fx-primary-soft)] sm:h-44">
            {coverUrl ? <img src={coverUrl} alt="" className="h-full w-full object-cover"/> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(0,128,128,.24),transparent_40%),linear-gradient(135deg,rgba(11,23,54,.02),rgba(0,128,128,.10))]"/>}
            <label className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-black/55 text-white backdrop-blur" title={bn ? 'Cover photo বদলান' : 'Change cover photo'}>
              {imageBusy === 'cover' ? <SpinnerGap size={17} className="animate-spin"/> : <Camera size={17}/>}
              <input type="file" accept="image/*" className="sr-only" disabled={imageBusy !== null} onChange={e => { const file = e.target.files?.[0]; e.currentTarget.value = ''; if (file) void uploadProfileImage('cover', file) }}/>
            </label>
          </div>

          <div className="px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="-mt-12 flex items-end justify-between gap-3 sm:-mt-14">
              <div className="relative">
                {avatarUrl ? <img src={avatarUrl} alt="" className="h-24 w-24 rounded-[1.7rem] border-4 border-[var(--fx-surface-strong)] bg-[var(--fx-bg)] object-cover sm:h-28 sm:w-28"/> : <div className="grid h-24 w-24 place-items-center rounded-[1.7rem] border-4 border-[var(--fx-surface-strong)] bg-[var(--fx-primary-soft)] sm:h-28 sm:w-28"><UserCircle size={58} className="text-[var(--fx-primary-strong)]"/></div>}
                <label className="absolute -bottom-1 -right-1 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-[var(--fx-surface-strong)] bg-[var(--fx-primary-strong)] text-white shadow-lg">
                  {imageBusy === 'avatar' ? <SpinnerGap size={15} className="animate-spin"/> : <Camera size={15}/>}
                  <input type="file" accept="image/*" className="sr-only" disabled={imageBusy !== null} onChange={e => { const file = e.target.files?.[0]; e.currentTarget.value = ''; if (file) void uploadProfileImage('avatar', file) }}/>
                </label>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => togglePanel('edit')} className="rounded-xl bg-[var(--fx-primary-strong)] px-4 py-2.5 text-xs font-bold text-white">{bn ? 'প্রোফাইল edit' : 'Edit profile'}</button>
                <button type="button" onClick={() => void copyProfileLink()} aria-label={bn ? 'প্রোফাইল লিংক কপি' : 'Copy profile link'} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)]">{copied ? <Check size={17}/> : <ShareNetwork size={17}/>}</button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0"><h1 className="truncate text-2xl font-black tracking-[-.045em] sm:text-3xl">{fullName || (bn ? 'আপনার FeniX profile' : 'Your FeniX profile')}</h1><p className="mt-1 truncate text-sm text-[var(--fx-muted)]">@{username}</p></div>
                <span className="shrink-0 rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[9px] font-black text-[var(--fx-primary-strong)]">{profileCompletion}%</span>
              </div>
              {bio && <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{bio}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--fx-muted)]">
                {locationText && <span className="inline-flex items-center gap-1.5"><MapPin size={14}/>{locationText}</span>}
                {websiteUrl && <span className="inline-flex items-center gap-1.5"><Globe size={14}/>Website</span>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer noopener" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)]"><InstagramLogo size={17}/></a>}
                {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer noopener" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)]"><FacebookLogo size={17}/></a>}
                {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer noopener" aria-label="WhatsApp" className="grid h-9 w-9 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)]"><WhatsappLogo size={17}/></a>}
              </div>
            </div>
          </div>
        </article>

        <div className="mt-3 overflow-hidden rounded-[1.6rem] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
          <AccordionRow open={panel === 'edit'} onClick={() => togglePanel('edit')} icon={<UserSwitch size={19}/>} title={bn ? 'Edit profile' : 'Edit profile'} summary={bn ? 'নাম, username, bio ও location' : 'Name, username, bio and location'} />
          {panel === 'edit' && <div className="border-t border-[var(--fx-border)] p-4 sm:p-5">
            <div className="grid gap-3">
              <Field label={bn ? 'নাম' : 'Name'} value={fullName} onChange={setFullName} maxLength={160}/>
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
                <p className="mt-1 text-[10px] text-[var(--fx-muted)]">
                  {usernameStatus === 'available' ? (bn ? 'Username available • 3–30 • letters, numbers, . and _' : 'Username available • 3–30 • letters, numbers, . and _') :
                   usernameStatus === 'taken' ? (bn ? 'এই username নেওয়া হয়েছে।' : 'This username is already taken.') :
                   usernameStatus === 'invalid' ? (bn ? '3–30 অক্ষর • শুরু/শেষে dot নয় • .. ব্যবহার নয়' : '3–30 characters • no leading/trailing dot • no ..') :
                   (bn ? 'Username পরিবর্তন করলে public profile URL-ও বদলাবে।' : 'Changing this updates your public profile URL.')}
                </p>
              </div>
              <Field label={bn ? 'Location' : 'Location'} value={locationText} onChange={setLocationText} maxLength={160} icon={<MapPin size={15}/>}/>
              <label className="block"><span className="text-xs font-bold">Bio</span><textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] p-3 text-sm leading-6 outline-none"/><span className="mt-1 block text-[10px] text-[var(--fx-muted)]">{bio.length}/1000</span></label>
            </div>
            <div className="mt-4 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-xs">
              <p className="font-bold">{bn ? 'Public profile URL' : 'Public profile URL'}</p>
              <p className="mt-1 break-all text-[var(--fx-muted)]">{publicUrl}</p>
            </div>
            <button type="button" disabled={busy || usernameStatus !== 'available'} onClick={() => void saveProfile()} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white disabled:opacity-40"><Check size={16}/>{busy ? (bn ? 'Saving…' : 'Saving…') : (bn ? 'Save changes' : 'Save changes')}</button>
          </div>}

          <AccordionRow open={panel === 'links'} onClick={() => togglePanel('links')} icon={<LinkSimple size={19}/>} title={bn ? 'Links & contact' : 'Links & contact'} summary={bn ? 'Website, Instagram, Facebook, WhatsApp' : 'Website, Instagram, Facebook, WhatsApp'} />
          {panel === 'links' && <div className="border-t border-[var(--fx-border)] p-4 sm:p-5"><div className="grid gap-3">
            <Field label="Website" value={websiteUrl} onChange={setWebsiteUrl} maxLength={500} placeholder="https://example.com"/>
            <Field label="Instagram" value={instagramUrl} onChange={setInstagramUrl} maxLength={500} placeholder="https://instagram.com/username"/>
            <Field label="Facebook" value={facebookUrl} onChange={setFacebookUrl} maxLength={500} placeholder="https://facebook.com/username"/>
            <Field label="WhatsApp" value={whatsappUrl} onChange={setWhatsappUrl} maxLength={500} placeholder="https://wa.me/..."/>
            <button type="button" disabled={busy || usernameStatus !== 'available'} onClick={() => void saveProfile()} className="min-h-11 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white disabled:opacity-40">{bn ? 'Links save করুন' : 'Save links'}</button>
          </div><p className="mt-3 text-[10px] text-[var(--fx-muted)]">{bn ? 'শুধু আপনি যে public links দিতে চান সেগুলোই দিন।' : 'Only add the public links you want to share.'}</p></div>}

          <AccordionRow open={panel === 'privacy'} onClick={() => togglePanel('privacy')} icon={<LockKey size={19}/>} title={bn ? 'Privacy & messaging' : 'Privacy & messaging'} summary={bn ? 'কে profile দেখবে ও message করবে' : 'Who can view and message you'} />
          {panel === 'privacy' && <div className="border-t border-[var(--fx-border)] p-4 sm:p-5"><div className="space-y-2">
            <SettingSelect label={bn ? 'Profile visibility' : 'Profile visibility'} value={visibility} onChange={v => void changeSetting({ profile_visibility: v }, () => setVisibility(v as Visibility))} options={[['public',bn?'Public':'Public'],['private',bn?'Private':'Private']]}/>
            <SettingSelect label={bn ? 'কে message করতে পারবে' : 'Who can message you'} value={messagePermissions} onChange={v => void changeSetting({ message_permissions: v }, () => setMessagePermissions(v as MessagePermission))} options={[['everyone',bn?'সবাই':'Everyone'],['authenticated',bn?'শুধু logged-in users':'Authenticated users'],['nobody',bn?'কেউ না':'Nobody']]}/>
            <SettingSelect label={bn ? 'Feed visibility' : 'Feed visibility'} value={feedVisibility} onChange={v => void changeSetting({ feed_visibility: v }, () => setFeedVisibility(v as FeedVisibility))} options={[['public','Public'],['authenticated',bn?'Logged-in users':'Authenticated users']]}/>
          </div></div>}

          <AccordionRow open={panel === 'appearance'} onClick={() => togglePanel('appearance')} icon={<Palette size={19}/>} title={bn ? 'Appearance' : 'Appearance'} summary={bn ? 'Light, dark বা device' : 'Light, dark or device'} />
          {panel === 'appearance' && <div className="border-t border-[var(--fx-border)] p-4 sm:p-5"><div className="grid grid-cols-3 gap-2">{([
            ['light',Sun,bn?'Light':'Light'],['system',Palette,bn?'Device':'System'],['dark',Moon,bn?'Dark':'Dark']
          ] as Array<[HomeTheme, typeof Sun, string]>).map(([key,Icon,label]) => <button key={key} type="button" onClick={() => void changeTheme(key)} aria-pressed={theme === key} className={'flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-bold ' + (theme === key ? 'border-[var(--fx-primary)]/30 bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)]')}><Icon size={18}/>{label}</button>)}</div><div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[var(--fx-border)] p-3"><div><p className="text-xs font-bold">{bn?'Reduced motion':'Reduced motion'}</p><p className="mt-1 text-[10px] text-[var(--fx-muted)]">{bn?'অপ্রয়োজনীয় animation কমান।':'Reduce extra animation.'}</p></div><button type="button" role="switch" aria-checked={reducedMotion} onClick={() => void changeSetting({ reduced_motion: !reducedMotion }, () => { const next = !reducedMotion; setReducedMotion(next); try { localStorage.setItem('fenix-reduce-motion', String(next)); document.documentElement.dataset.reduceMotion = next ? 'true' : 'false' } catch {} })} className={'relative h-7 w-12 shrink-0 rounded-full ' + (reducedMotion ? 'bg-[var(--fx-primary)]' : 'bg-black/10 dark:bg-white/10')}><span className={'absolute top-1 h-5 w-5 rounded-full bg-white transition ' + (reducedMotion ? 'left-6' : 'left-1')}/></button></div></div>}

          <AccordionRow open={panel === 'language'} onClick={() => togglePanel('language')} icon={<Translate size={19}/>} title={bn ? 'Language' : 'Language'} summary={bn ? 'বাংলা / English' : 'Bangla / English'} />
          {panel === 'language' && <div className="border-t border-[var(--fx-border)] p-4 sm:p-5"><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => void changeLocale('bn')} className={'min-h-11 rounded-xl border text-xs font-bold ' + (bn ? 'border-[var(--fx-primary)]/30 bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)]')}>বাংলা</button><button type="button" onClick={() => void changeLocale('en')} className={'min-h-11 rounded-xl border text-xs font-bold ' + (!bn ? 'border-[var(--fx-primary)]/30 bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)]')}>English</button></div></div>}

          <AccordionRow open={panel === 'account'} onClick={() => togglePanel('account')} icon={<Gear size={19}/>} title={bn ? 'Account & safety' : 'Account & safety'} summary={bn ? 'Email, profile link, sign out' : 'Email, profile link, sign out'} />
          {panel === 'account' && <div className="border-t border-[var(--fx-border)] p-4 sm:p-5">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--fx-border)] p-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--fx-primary-soft)]"><Bell size={17}/></div><div className="min-w-0"><p className="text-xs font-bold">{bn?'Account email':'Account email'}</p><p className="truncate text-[11px] text-[var(--fx-muted)]">{email || '—'}</p></div></div>
            <button type="button" onClick={() => void copyProfileLink()} className="mt-2 flex min-h-11 w-full items-center justify-between rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><span className="inline-flex items-center gap-2"><Copy size={16}/>{bn?'Profile link copy':'Copy profile link'}</span>{copied && <Check size={15}/>}</button>
            <Link href={publicUrl} target="_blank" className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><Globe size={16}/>{bn?'Public profile দেখুন':'View public profile'}</Link>
            <button type="button" onClick={() => void signOut()} className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-xl border border-red-500/20 px-3 text-xs font-bold text-red-600"><SignOut size={16}/>{bn?'Sign out':'Sign out'}</button>
          </div>}
        </div>

        {message && <div className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] p-3 text-xs"><span className="mt-0.5">{message.toLowerCase().includes('failed') || message.toLowerCase().includes('cannot') || message.includes('যায়নি') ? <X size={15}/> : <CheckCircle size={15}/>}</span><p>{message}</p></div>}
      </section>
    </main>
  )
}

function AccordionRow({open,onClick,icon,title,summary}:{open:boolean;onClick:()=>void;icon:ReactNode;title:string;summary:string}) {
  return <button type="button" onClick={onClick} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-black/[.02] dark:hover:bg-white/[.03]">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">{icon}</span>
    <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{title}</span><span className="mt-0.5 block truncate text-[10px] text-[var(--fx-muted)]">{summary}</span></span>
    <CaretDown size={17} className={'shrink-0 transition ' + (open ? 'rotate-180' : '')}/>
  </button>
}

function Field({label,value,onChange,maxLength,icon,placeholder}:{label:string;value:string;onChange:(v:string)=>void;maxLength:number;icon?:ReactNode;placeholder?:string}) {
  return <label className="block"><span className="text-xs font-bold">{label}</span><div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3"><span className="text-[var(--fx-muted)]">{icon}</span><input value={value} onChange={e=>onChange(e.target.value)} maxLength={maxLength} placeholder={placeholder} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--fx-muted)]"/></div></label>
}

function SettingSelect({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[][]}) {
  return <label className="block"><span className="text-xs font-bold">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-xs outline-none">{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>
}

'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Copy, FacebookLogo, Globe, ImageSquare, InstagramLogo, LinkSimple, MapPin, ShieldCheck, UploadSimple, UserCircle, WhatsappLogo } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { optimizeImageFile, PROFILE_IMAGE_HARD_LIMIT_BYTES, PROFILE_IMAGE_TARGET_BYTES, removePublicImage, uploadOptimizedPublicImage } from '@/lib/media/image-upload'
import ImageCropEditor from '@/components/profile/ImageCropEditor'
import FeniLocationPicker from '@/components/profile/FeniLocationPicker'
import { ROUTES } from '@/lib/core/routes'

type Visibility = 'public' | 'private'
type MessagePermission = 'everyone' | 'authenticated' | 'nobody'
type FeedVisibility = 'public' | 'authenticated'

function cleanPublicUrl(value: string) {
  const raw = value.trim()
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw.slice(0, 500) : null
}

function makeUsername(value: string) {
  const base = value.toLowerCase().split('@')[0].replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24)
  return base.length >= 3 ? base : 'user_' + Math.random().toString(36).slice(2, 8)
}

export default function ProfileEditorPage() {
  const { locale, setLocale } = useFenixLocale()
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [originalUsername, setOriginalUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [locationText, setLocationText] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [upazilaId, setUpazilaId] = useState('')
  const [localityId, setLocalityId] = useState('')
  const [areaText, setAreaText] = useState('')
  const [roadText, setRoadText] = useState('')
  const [houseDetails, setHouseDetails] = useState('')
  const [holdingNo, setHoldingNo] = useState('')
  const [locationPublicLevel, setLocationPublicLevel] = useState<'district'|'upazila'|'locality'>('district')
  const [exactLocationVisibility, setExactLocationVisibility] = useState<'private'|'connections'>('private')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [messagePermissions, setMessagePermissions] = useState<MessagePermission>('everyone')
  const [feedVisibility, setFeedVisibility] = useState<FeedVisibility>('public')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [imageBusy, setImageBusy] = useState<'avatar' | 'cover' | null>(null)
  const [imageProgress, setImageProgress] = useState(0)
  const [cropTarget, setCropTarget] = useState<{ kind: 'avatar' | 'cover'; file: File } | null>(null)
  const [usernameStatus, setUsernameStatus] = useState<'idle'|'checking'|'available'|'taken'|'invalid'>('idle')

  useEffect(() => {
    const value = username.trim().toLowerCase()
    if (!value) {
      setUsernameStatus('idle')
      return
    }
    if (!/^[a-z0-9._]{3,30}$/.test(value) || value.startsWith('.') || value.endsWith('.') || value.includes('..')) {
      setUsernameStatus('invalid')
      return
    }
    if (value === username.toLowerCase() && value === username.trim().toLowerCase() && value === (originalUsername || '').toLowerCase()) {
      setUsernameStatus('available')
      return
    }
    setUsernameStatus('checking')
    const timer = window.setTimeout(async () => {
      const s = createClient()
      const { data, error } = await s.rpc('is_fenix_username_available', { p_username: value, p_exclude_user_id: userId || undefined })
      if (!error) setUsernameStatus(data ? 'available' : 'taken')
      else setUsernameStatus('idle')
    }, 450)
    return () => window.clearTimeout(timer)
  }, [username, originalUsername, userId])

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) { window.location.replace(ROUTES.auth.login + '?next=' + encodeURIComponent(ROUTES.core.profile)); return }
      const [{ data: profile }, { data: settings }] = await Promise.all([
        s.from('profiles').select('id,full_name,username,bio,avatar_url,cover_url,location_text,website_url,whatsapp_url,facebook_url,instagram_url,district_id,upazila_id,locality_id,area_text,road_text,house_details,holding_no,location_public_level,exact_location_visibility').eq('id', auth.user.id).maybeSingle(),
        s.from('profile_settings').select('locale,profile_visibility,message_permissions,feed_visibility').eq('user_id', auth.user.id).maybeSingle(),
      ])
      if (!active) return
      const providerAvatar = typeof auth.user.user_metadata?.avatar_url === 'string' ? auth.user.user_metadata.avatar_url : typeof auth.user.user_metadata?.picture === 'string' ? auth.user.user_metadata.picture : ''
      const providerCover = typeof auth.user.user_metadata?.cover_url === 'string' ? auth.user.user_metadata.cover_url : typeof auth.user.user_metadata?.cover === 'string' ? auth.user.user_metadata.cover : typeof auth.user.user_metadata?.cover_photo === 'string' ? auth.user.user_metadata.cover_photo : ''
      setUserId(auth.user.id)
      setEmail(auth.user.email ?? '')
      setFullName(profile?.full_name ?? auth.user.user_metadata?.full_name ?? auth.user.user_metadata?.name ?? '')
      const loadedUsername = profile?.username ?? makeUsername(auth.user.email ?? 'user')
      setUsername(loadedUsername)
      setOriginalUsername(loadedUsername)
      setBio(profile?.bio ?? '')
      setLocationText(profile?.location_text ?? '')
      setWebsiteUrl(profile?.website_url ?? '')
      setAvatarUrl(profile?.avatar_url ?? providerAvatar)
      setCoverUrl(profile?.cover_url ?? providerCover)
      setWhatsappUrl(profile?.whatsapp_url ?? '')
      setFacebookUrl(profile?.facebook_url ?? '')
      setInstagramUrl(profile?.instagram_url ?? '')
      setDistrictId(profile?.district_id ?? '')
      setUpazilaId(profile?.upazila_id ?? '')
      setLocalityId(profile?.locality_id ?? '')
      setAreaText(profile?.area_text ?? '')
      setRoadText(profile?.road_text ?? '')
      setHouseDetails(profile?.house_details ?? '')
      setHoldingNo(profile?.holding_no ?? '')
      if(profile?.location_public_level==='upazila'||profile?.location_public_level==='locality') setLocationPublicLevel(profile.location_public_level)
      if(profile?.exact_location_visibility==='connections') setExactLocationVisibility('connections')
      if (settings?.locale === 'bn' || settings?.locale === 'en') setLocale(settings.locale)
      if (settings?.profile_visibility === 'private') setVisibility('private')
      if (settings?.message_permissions === 'everyone' || settings?.message_permissions === 'authenticated' || settings?.message_permissions === 'nobody') setMessagePermissions(settings.message_permissions)
      if (settings?.feed_visibility === 'authenticated') setFeedVisibility('authenticated')
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [setLocale])

  const completion = useMemo(() => {
    const values = [fullName, username, bio, locationText, websiteUrl, avatarUrl, visibility === 'public' ? 'public' : '']
    return Math.round(values.filter(Boolean).length / values.length * 100)
  }, [avatarUrl, bio, fullName, locationText, username, visibility, websiteUrl])

  const publicUrl = username ? ROUTES.core.profile + '/' + encodeURIComponent(username) : ROUTES.core.profile

  async function copyProfileLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin + publicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setMessage(locale === 'bn' ? 'Link copy করা যায়নি।' : 'Could not copy the profile link.')
    }
  }

  function previousStoragePath(value: string, bucket: string) {
    const marker = '/storage/v1/object/public/' + bucket + '/'
    const index = value.indexOf(marker)
    return index >= 0 ? decodeURIComponent(value.slice(index + marker.length)) : ''
  }

  function openImageCrop(kind: 'avatar' | 'cover', file: File) {
    setCropTarget({ kind, file })
  }

  async function uploadProfileImage(kind: 'avatar' | 'cover', file: File) {
    setImageBusy(kind)
    setMessage('')
    try {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) throw new Error('Please sign in again.')
      const previousUrl = kind === 'avatar' ? avatarUrl : coverUrl
      setImageProgress(15)
      // The source can be very large (for example 10 MB+). The optimizer decodes it locally,
      // crops it to the Facebook-style frame, and stores only an image up to 200 KB.
      const optimized = await optimizeImageFile(file, { maxDimension: kind === 'avatar' ? 1200 : 1800, targetBytes: PROFILE_IMAGE_TARGET_BYTES, hardLimitBytes: PROFILE_IMAGE_HARD_LIMIT_BYTES })
      setImageProgress(55)
      const extension = optimized.mimeType === 'image/webp' ? 'webp' : 'jpg'
      const path = auth.user.id + '/' + kind + '/' + crypto.randomUUID() + '.' + extension
      const uploaded = await uploadOptimizedPublicImage(s, 'avatars', path, optimized, PROFILE_IMAGE_HARD_LIMIT_BYTES)
      setImageProgress(80)
      const patch = kind === 'avatar' ? { avatar_url: uploaded.publicUrl } : { cover_url: uploaded.publicUrl }
      const { data: updatedProfile, error } = await s.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', auth.user.id).select('id').maybeSingle()
      if (error || !updatedProfile) {
        await removePublicImage(s, 'avatars', path)
        throw error ?? new Error(locale === 'bn' ? 'Profile record পাওয়া যায়নি। আবার login করুন।' : 'Your profile record was not found. Please sign in again.')
      }
      if (kind === 'avatar') setAvatarUrl(uploaded.publicUrl)
      else setCoverUrl(uploaded.publicUrl)
      setImageProgress(100)
      const oldPath = previousStoragePath(previousUrl, 'avatars')
      if (oldPath) await removePublicImage(s, 'avatars', oldPath)
      setMessage(locale === 'bn' ? (kind === 'avatar' ? 'Profile photo gallery থেকে আপলোড হয়েছে।' : 'Cover photo gallery থেকে আপলোড হয়েছে।') : (kind === 'avatar' ? 'Profile photo uploaded from your gallery.' : 'Cover photo uploaded from your gallery.'))
    } catch (error) {
      setMessage(locale === 'bn' ? 'ছবিটি আপলোড করা যায়নি। অন্য একটি photo চেষ্টা করুন।' : (error instanceof Error ? error.message : 'Image upload failed.'))
    } finally {
      window.setTimeout(() => setImageProgress(0), 500)
      setImageBusy(null)
    }
  }

  async function save() {
    setBusy(true)
    setMessage('')
    const cleanUsername = username.trim().toLowerCase()
    if (!/^[a-z0-9._]{3,30}$/.test(cleanUsername) || cleanUsername.startsWith('.') || cleanUsername.endsWith('.') || cleanUsername.includes('..')) {
      setMessage(locale === 'bn' ? 'Username 3–30 অক্ষরের lowercase letter/number/dot/underscore হতে হবে।' : 'Username must be 3–30 lowercase letters, numbers, dots or underscores.')
      setBusy(false)
      return
    }
    const RESERVED_USERNAMES = new Set([
      'admin','administrator','api','contact','directory','emergency','fenix','fenixx','guide','help',
      'invest','login','messages','news','notifications','official','profile','search','security',
      'services','settings','signup','staff','support','system','user',
    ])
    if (RESERVED_USERNAMES.has(cleanUsername)) {
      setMessage(locale === 'bn' ? 'এই username FeniX-এর জন্য সংরক্ষিত। অন্য username দিন।' : 'This username is reserved by FeniX. Choose another username.')
      setBusy(false)
      return
    }

    if (usernameStatus === 'checking' || usernameStatus === 'taken' || usernameStatus === 'invalid') {
      setMessage(locale === 'bn' ? 'এই username ব্যবহার করা যাবে না।' : 'This username is not available.')
      setBusy(false)
      return
    }

    const website = cleanPublicUrl(websiteUrl)
    const whatsapp = cleanPublicUrl(whatsappUrl)
    const facebook = cleanPublicUrl(facebookUrl)
    const instagram = cleanPublicUrl(instagramUrl)
    if ((websiteUrl.trim() && !website) || (whatsappUrl.trim() && !whatsapp) || (facebookUrl.trim() && !facebook) || (instagramUrl.trim() && !instagram)) {
      setMessage(locale === 'bn' ? 'সব link-এ পূর্ণ http:// অথবা https:// URL দিন।' : 'Use a full http:// or https:// URL for each link.')
      setBusy(false)
      return
    }

    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) { setBusy(false); return }

    const [{ error: profileError }, { error: settingError }] = await Promise.all([
      s.from('profiles').update({
        full_name: fullName.trim().slice(0, 160) || null,
        username: cleanUsername,
        bio: bio.trim().slice(0, 1000) || null,
        avatar_url: cleanPublicUrl(avatarUrl),
        cover_url: cleanPublicUrl(coverUrl),
        location_text: locationText.trim().slice(0, 500) || null,
        website_url: website,
        whatsapp_url: whatsapp,
        facebook_url: facebook,
        instagram_url: instagram,
        district_id: districtId || null,
        upazila_id: upazilaId || null,
        locality_id: localityId || null,
        area_text: areaText.trim().slice(0, 160) || null,
        road_text: roadText.trim().slice(0, 160) || null,
        house_details: houseDetails.trim().slice(0, 200) || null,
        holding_no: holdingNo.trim().slice(0, 80) || null,
        location_public_level: locationPublicLevel,
        exact_location_visibility: exactLocationVisibility,
        updated_at: new Date().toISOString(),
      }).eq('id', auth.user.id),
      s.from('profile_settings').upsert({
        user_id: auth.user.id,
        locale,
        profile_visibility: visibility,
        message_permissions: messagePermissions,
        feed_visibility: feedVisibility,
      }, { onConflict: 'user_id' }),
    ])

    if (profileError || settingError) {
      setMessage(locale === 'bn'
        ? 'Profile save করা যায়নি। Username আগে থেকে ব্যবহার হয়ে থাকলে অন্যটা দিন।'
        : 'Could not save the profile. The username may already be taken.')
    } else {
      setMessage(locale === 'bn' ? 'Profile সফলভাবে সংরক্ষণ হয়েছে।' : 'Profile successfully updated.')
    }
    setBusy(false)
  }

  if (loading) return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-4xl px-4 py-16 sm:px-6"><div className="fenix-surface-strong animate-pulse rounded-[2rem] p-10 text-sm text-[var(--fx-muted)]">Loading profile…</div></section></main>

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar/>
      {cropTarget && (
        <ImageCropEditor
          file={cropTarget.file}
          kind={cropTarget.kind}
          locale={locale}
          onCancel={() => setCropTarget(null)}
          onConfirm={async (croppedFile) => {
            const target = cropTarget
            setCropTarget(null)
            await uploadProfileImage(target.kind, croppedFile)
          }}
        />
      )}
      <section className="mx-auto max-w-5xl px-4 pb-28 pt-7 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={ROUTES.settings} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> {locale==='bn'?'সেটিংস':'Settings'}</Link>
          <div className="flex flex-wrap gap-2">
            <Link href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-3.5 text-xs font-bold text-[var(--fx-primary-strong)]"><LinkSimple size={15}/> {locale==='bn'?'Public profile দেখুন':'View public profile'}</Link>
            <button type="button" onClick={()=>void copyProfileLink()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold">{copied?<Check size={15}/>:<Copy size={15}/>} {copied?(locale==='bn'?'কপি হয়েছে':'Copied'):(locale==='bn'?'লিংক কপি':'Copy link')}</button>
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="fenix-surface-strong overflow-hidden rounded-[2rem]">
            <div className="relative h-36 overflow-hidden bg-[var(--fx-primary-soft)] sm:h-48">
              <label className="absolute right-3 top-3 z-10 inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-xl bg-black/55 px-3 text-xs font-bold text-white backdrop-blur">
                <ImageSquare size={15}/>{imageBusy==='cover' ? (locale==='bn' ? 'আপলোড হচ্ছে ' : 'Uploading ') + imageProgress + '%' : (locale==='bn' ? 'কভার ছবি' : 'Cover photo')}
                <input type="file" accept="image/*" className="sr-only" disabled={imageBusy!==null || busy || cropTarget!==null} onChange={e=>{const file=e.target.files?.[0]; e.currentTarget.value=''; if(file) openImageCrop('cover',file)}}/>
              </label>
              {coverUrl ? <img src={coverUrl} alt="" className="h-full w-full object-cover"/> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,128,128,.22),transparent_42%),linear-gradient(135deg,rgba(11,23,54,.02),rgba(0,128,128,.10))]"/>}
            </div>
            <div className="px-5 pb-6 sm:px-7">
              <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 sm:-mt-14">
                <div className="flex items-end gap-3">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="h-24 w-24 rounded-3xl border-4 border-[var(--fx-surface-strong)] bg-[var(--fx-bg)] object-cover sm:h-28 sm:w-28"/> : <div className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-[var(--fx-surface-strong)] bg-[var(--fx-primary-soft)] sm:h-28 sm:w-28"><UserCircle size={58} className="text-[var(--fx-primary-strong)]"/></div>}
                  <label className="mb-1 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-xs font-bold shadow-sm">
                    <UploadSimple size={16}/><span>{imageBusy==='avatar' ? (locale==='bn' ? 'আপলোড হচ্ছে ' : 'Uploading ') + imageProgress + '%' : (locale==='bn' ? 'গ্যালারি' : 'Gallery')}</span>
                    <input type="file" accept="image/*" className="sr-only" disabled={imageBusy!==null || busy || cropTarget!==null} onChange={e=>{const file=e.target.files?.[0]; e.currentTarget.value=''; if(file) openImageCrop('avatar',file)}}/>
                  </label>
                </div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--fx-primary-strong)]"><ShieldCheck size={14}/> {locale==='bn'?'প্রোফাইল নিয়ন্ত্রণ সক্রিয়':'Profile controls active'}</span>
              </div>
              <div className="mt-4"><h1 className="text-3xl font-black tracking-[-.045em] sm:text-4xl">{fullName || (locale==='bn' ? 'আপনার FeniX profile' : 'Your FeniX profile')}</h1><p className="mt-1 text-sm text-[var(--fx-muted)]">@{username || 'username'} · {email}</p>{bio && <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-[var(--fx-muted)]">{bio}</p>}<div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--fx-muted)]">{locationText && <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[.03] px-3 py-1.5 dark:bg-white/[.04]"><MapPin size={14}/>{locationText}</span>}{websiteUrl && <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[.03] px-3 py-1.5 dark:bg-white/[.04]"><Globe size={14}/>Website</span>}</div></div>
            </div>
            {imageBusy && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--fx-border)]"><div className="h-full rounded-full bg-[var(--fx-primary-strong)] transition-all" style={{width:imageProgress+'%'}}/></div>}
          </div>

          <aside className="fenix-surface-strong rounded-[2rem] p-5 sm:p-6">
            <p className="fenix-kicker">{locale==='bn'?'প্রোফাইল অগ্রগতি':'Profile health'}</p>
            <div className="mt-2 flex items-end justify-between gap-3"><h2 className="text-3xl font-black">{completion}%</h2><span className="text-xs text-[var(--fx-muted)]">{locale==='bn'?'শেয়ার করার জন্য প্রস্তুত':'ready to share'}</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--fx-border)]"><div className="h-full rounded-full bg-[var(--fx-primary-strong)] transition-all" style={{width: completion + '%'}}/></div>
            <div className="mt-5 space-y-2 text-xs">{[[locale==='bn'?'নাম':'Name',!!fullName],[locale==='bn'?'Username':'Username',!!username],[locale==='bn'?'Bio':'Bio',!!bio],[locale==='bn'?'Location':'Location',!!locationText],[locale==='bn'?'Website':'Website',!!websiteUrl],[locale==='bn'?'Profile photo':'Profile photo',!!avatarUrl],[locale==='bn'?'Public visibility':'Public visibility',visibility==='public']].map(([label,done])=><div key={String(label)} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2.5"><span>{String(label)}</span><span className={done?'text-[var(--fx-primary-strong)]':'text-[var(--fx-muted)]'}>{locale==='bn'?(done?'প্রস্তুত':'যোগ করুন'):(done?'Ready':'Add')}</span></div>)}</div>
          </aside>
        </div>

        <section className="mt-5 fenix-surface-strong rounded-[2rem] p-5 sm:p-7">
          <p className="fenix-kicker">{locale==='bn'?'পরিচয়':'Identity'}</p>
          <h2 className="mt-2 text-2xl font-black">{locale==='bn'?'প্রোফাইলকে আরও কার্যকর করুন।':'Make the profile useful.'}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fx-muted)]">{locale==='bn'?'এই তথ্যগুলো FeniX-এর প্রাসঙ্গিক ফিচারে আপনার public identity তৈরি করে। Private account information কখনো public profile content হয় না।':'These details power your public identity across eligible FeniX features. Private account information is never turned into public profile content.'}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label={locale==='bn'?'নাম':'Name'} value={fullName} onChange={setFullName} maxLength={160}/>
            <div><Field label="Username" value={username} onChange={v=>setUsername(v.replace(/[^a-zA-Z0-9._]/g,'').toLowerCase())} maxLength={30} prefix="@"/><p className={'mt-1 text-[10px] '+(usernameStatus==='available'?'text-[var(--fx-primary-strong)]':usernameStatus==='taken'||usernameStatus==='invalid'?'text-red-600':'text-[var(--fx-muted)]')}>{usernameStatus==='checking'?(locale==='bn'?'Username যাচাই হচ্ছে…':'Checking username…'):usernameStatus==='available'?(locale==='bn'?'Username পাওয়া যাচ্ছে':'Username available'):usernameStatus==='taken'?(locale==='bn'?'এই username ইতিমধ্যে নেওয়া হয়েছে':'Username already taken'):usernameStatus==='invalid'?(locale==='bn'?'3–30 অক্ষর, a-z/0-9/._ এবং শুরু/শেষে dot নয়':'Use 3–30 lowercase letters, numbers, dot or underscore; no leading/trailing dot'):(locale==='bn'?'Username 3–30 অক্ষর':'Username 3–30 characters')}</p></div>
            <Field label={locale==='bn'?'ওয়েবসাইট':'Website'} value={websiteUrl} onChange={setWebsiteUrl} maxLength={500} icon={<Globe size={15}/>} placeholder="https://example.com"/>
            <Field label={locale==='bn'?'WhatsApp link':'WhatsApp link'} value={whatsappUrl} onChange={setWhatsappUrl} maxLength={500} icon={<WhatsappLogo size={15}/>} placeholder="https://wa.me/…"/>
            <Field label={locale==='bn'?'Facebook link':'Facebook link'} value={facebookUrl} onChange={setFacebookUrl} maxLength={500} icon={<FacebookLogo size={15}/>} placeholder="https://facebook.com/…"/>
            <Field label={locale==='bn'?'Instagram link':'Instagram link'} value={instagramUrl} onChange={setInstagramUrl} maxLength={500} icon={<InstagramLogo size={15}/>} placeholder="https://instagram.com/…"/>
            <div className="md:col-span-2"><FeniLocationPicker districtId={districtId} upazilaId={upazilaId} localityId={localityId} areaText={areaText} roadText={roadText} houseDetails={houseDetails} holdingNo={holdingNo} publicLevel={locationPublicLevel} exactVisibility={exactLocationVisibility} onChange={(patch)=>{if(patch.districtId!==undefined)setDistrictId(patch.districtId);if(patch.upazilaId!==undefined)setUpazilaId(patch.upazilaId);if(patch.localityId!==undefined)setLocalityId(patch.localityId);if(patch.areaText!==undefined)setAreaText(patch.areaText);if(patch.roadText!==undefined)setRoadText(patch.roadText);if(patch.houseDetails!==undefined)setHouseDetails(patch.houseDetails);if(patch.holdingNo!==undefined)setHoldingNo(patch.holdingNo);if(patch.publicLevel!==undefined)setLocationPublicLevel(patch.publicLevel);if(patch.exactVisibility!==undefined)setExactLocationVisibility(patch.exactVisibility);if(patch.locationText!==undefined)setLocationText(patch.locationText)}}/></div>
          </div>
          <label className="mt-4 block"><span className="text-xs font-bold">{locale==='bn'?'বায়ো':'Bio'}</span><textarea value={bio} onChange={e=>setBio(e.target.value)} maxLength={1000} rows={5} className="mt-2 w-full rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3 text-sm leading-7 outline-none" placeholder={locale==='bn'?'আপনি কী করেন? কী নিয়ে কাজ করেন?':'What do you do and what are you building?'}/><span className="mt-1 block text-[10px] text-[var(--fx-muted)]">{bio.length}/1000</span></label>
        </section>

        <section className="mt-5 fenix-surface-strong rounded-[2rem] p-5 sm:p-7">
          <p className="fenix-kicker">{locale==='bn'?'Privacy ও preference':'Privacy & preferences'}</p>
          <h2 className="mt-2 text-2xl font-black">{locale==='bn'?'আপনার visibility আপনি ঠিক করবেন।':'You control your visibility.'}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Select label={locale==='bn'?'প্রোফাইলের দৃশ্যমানতা':'Profile visibility'} value={visibility} onChange={v=>setVisibility(v as Visibility)} options={[['public','Public'],['private','Private']]}/>
            <Select label={locale==='bn'?'কে message করতে পারবে':'Who can message you'} value={messagePermissions} onChange={v=>setMessagePermissions(v as MessagePermission)} options={[['everyone',locale==='bn'?'সবাই':'Everyone'],['authenticated',locale==='bn'?'শুধু logged-in user':'Authenticated users'],['nobody',locale==='bn'?'কেউ না':'Nobody']]}/>
            <Select label={locale==='bn'?'ফিডের দৃশ্যমানতা':'Feed visibility'} value={feedVisibility} onChange={v=>setFeedVisibility(v as FeedVisibility)} options={[['public','Public'],['authenticated',locale==='bn'?'Logged-in users':'Authenticated users']]}/>
            <div><span className="text-xs font-bold">{locale==='bn'?'ভাষা':'Language'}</span><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={()=>setLocale('bn')} className={'min-h-11 rounded-xl border text-xs font-bold '+(locale==='bn'?'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>বাংলা</button><button type="button" aria-label="English" onClick={()=>setLocale('en')} className={'min-h-11 rounded-xl border text-xs font-bold '+(locale==='en'?'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>English</button></div></div>
          </div>
        </section>

        {message && <p className="mt-4 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] p-4 text-sm">{message}</p>}
        <div className="sticky bottom-20 z-20 mt-5 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-2 shadow-xl backdrop-blur-xl sm:bottom-5">
          <button type="button" disabled={busy} onClick={()=>void save()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-bold text-white disabled:opacity-45"><Check size={17}/>{busy?(locale==='bn'?'সংরক্ষণ হচ্ছে…':'Saving…'):(locale==='bn'?'Profile save করুন':'Save profile')}</button>
        </div>
      </section>
    </main>
  )
}
function Field({label,value,onChange,maxLength,icon,prefix,placeholder}:{label:string;value:string;onChange:(v:string)=>void;maxLength:number;icon?:React.ReactNode;prefix?:string;placeholder?:string}) {
  return <label className="block"><span className="text-xs font-bold">{label}</span><div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3"><span className="text-[var(--fx-muted)]">{prefix||icon}</span><input value={value} onChange={e=>onChange(e.target.value)} maxLength={maxLength} placeholder={placeholder} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--fx-muted)]"/></div></label>
}
function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[][]}) {
  return <label className="block"><span className="text-xs font-bold">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
}

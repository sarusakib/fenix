'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Copy, Globe, ImageSquare, LinkSimple, MapPin, ShieldCheck, UploadSimple, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { optimizeImageFile, removePublicImage, uploadOptimizedPublicImage } from '@/lib/media/image-upload'

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
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [locationText, setLocationText] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [messagePermissions, setMessagePermissions] = useState<MessagePermission>('everyone')
  const [feedVisibility, setFeedVisibility] = useState<FeedVisibility>('public')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [imageBusy, setImageBusy] = useState<'avatar' | 'cover' | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) { window.location.replace('/login?next=/profile'); return }
      const [{ data: profile }, { data: settings }] = await Promise.all([
        s.from('profiles').select('id,full_name,username,bio,avatar_url,cover_url,location_text,website_url').eq('id', auth.user.id).maybeSingle(),
        s.from('profile_settings').select('locale,profile_visibility,message_permissions,feed_visibility').eq('user_id', auth.user.id).maybeSingle(),
      ])
      if (!active) return
      const providerAvatar = typeof auth.user.user_metadata?.avatar_url === 'string' ? auth.user.user_metadata.avatar_url : typeof auth.user.user_metadata?.picture === 'string' ? auth.user.user_metadata.picture : ''
      setEmail(auth.user.email ?? '')
      setFullName(profile?.full_name ?? auth.user.user_metadata?.full_name ?? auth.user.user_metadata?.name ?? '')
      setUsername(profile?.username ?? makeUsername(auth.user.email ?? 'user'))
      setBio(profile?.bio ?? '')
      setLocationText(profile?.location_text ?? '')
      setWebsiteUrl(profile?.website_url ?? '')
      setAvatarUrl(profile?.avatar_url ?? providerAvatar)
      setCoverUrl(profile?.cover_url ?? '')
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

  const publicUrl = username ? '/profile/' + encodeURIComponent(username) : '/profile'

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

  async function uploadProfileImage(kind: 'avatar' | 'cover', file: File) {
    setImageBusy(kind)
    setMessage('')
    try {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) throw new Error('Please sign in again.')
      const previousUrl = kind === 'avatar' ? avatarUrl : coverUrl
      const optimized = await optimizeImageFile(file, { maxDimension: kind === 'avatar' ? 960 : 1800 })
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
      const oldPath = previousStoragePath(previousUrl, 'avatars')
      if (oldPath) await removePublicImage(s, 'avatars', oldPath)
      setMessage(locale === 'bn' ? (kind === 'avatar' ? 'Profile photo gallery থেকে আপলোড হয়েছে।' : 'Cover photo gallery থেকে আপলোড হয়েছে।') : (kind === 'avatar' ? 'Profile photo uploaded from your gallery.' : 'Cover photo uploaded from your gallery.'))
    } catch (error) {
      setMessage(locale === 'bn' ? 'ছবিটি আপলোড করা যায়নি। অন্য একটি photo চেষ্টা করুন।' : (error instanceof Error ? error.message : 'Image upload failed.'))
    } finally {
      setImageBusy(null)
    }
  }

  async function save() {    setBusy(true)
    setMessage('')
    const cleanUsername = username.trim().toLowerCase()
    if (!/^[a-z0-9_]{3,32}$/.test(cleanUsername)) {
      setMessage(locale === 'bn' ? 'Username 3–32 অক্ষরের lowercase letter/number/underscore হতে হবে।' : 'Username must be 3–32 lowercase letters, numbers or underscores.')
      setBusy(false)
      return
    }
    const website = cleanPublicUrl(websiteUrl)
    if (websiteUrl.trim() && !website) {
      setMessage(locale === 'bn' ? 'Website-এর ক্ষেত্রে https:// বা http:// URL দিন।' : 'Use a full http:// or https:// website URL.')
      setBusy(false)
      return
    }

    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) { setBusy(false); return }
    const [{ error: profileError }, { error: settingError }] = await Promise.all([
s.from('profiles').update({
        full_name: fullName.trim().slice(0,160) || null,
        username: cleanUsername,
        bio: bio.trim().slice(0,1000) || null,
        avatar_url: cleanPublicUrl(avatarUrl),
        cover_url: cleanPublicUrl(coverUrl),
        location_text: locationText.trim().slice(0,160) || null,
        website_url: website,
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
    }
    else setMessage(locale === 'bn' ? 'Profile successfully updated.' : 'Profile successfully updated.')
    setBusy(false)
  }

  if (loading) return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-4xl px-4 py-16 sm:px-6"><div className="fenix-surface-strong animate-pulse rounded-[2rem] p-10 text-sm text-[var(--fx-muted)]">Loading profile…</div></section></main>

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar/>
      <section className="mx-auto max-w-5xl px-4 pb-28 pt-7 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Account</Link>
          <div className="flex flex-wrap gap-2">
            <Link href={publicUrl} target="_blank" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-3.5 text-xs font-bold text-[var(--fx-primary-strong)]"><LinkSimple size={15}/> View public profile</Link>
            <button type="button" onClick={()=>void copyProfileLink()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold">{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy link'}</button>
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="fenix-surface-strong overflow-hidden rounded-[2rem]">
            <div className="relative h-36 overflow-hidden bg-[var(--fx-primary-soft)] sm:h-48">
              <label className="absolute right-3 top-3 z-10 inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-xl bg-black/55 px-3 text-xs font-bold text-white backdrop-blur">
                <ImageSquare size={15}/>{imageBusy==='cover' ? 'Uploading…' : 'Cover photo'}
                <input type="file" accept="image/*" className="sr-only" disabled={imageBusy!==null || busy} onChange={e=>{const file=e.target.files?.[0]; e.currentTarget.value=''; if(file) void uploadProfileImage('cover',file)}}/>
              </label>
              {coverUrl ? <img src={coverUrl} alt="" className="h-full w-full object-cover"/> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,128,128,.22),transparent_42%),linear-gradient(135deg,rgba(11,23,54,.02),rgba(0,128,128,.10))]"/>}
            </div>
            <div className="px-5 pb-6 sm:px-7">
              <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 sm:-mt-14">
                <div className="flex items-end gap-3">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="h-24 w-24 rounded-3xl border-4 border-[var(--fx-surface-strong)] bg-[var(--fx-bg)] object-cover sm:h-28 sm:w-28"/> : <div className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-[var(--fx-surface-strong)] bg-[var(--fx-primary-soft)] sm:h-28 sm:w-28"><UserCircle size={58} className="text-[var(--fx-primary-strong)]"/></div>}
                  <label className="mb-1 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-xs font-bold shadow-sm">
                    <UploadSimple size={16}/><span>{imageBusy==='avatar' ? 'Uploading…' : 'Gallery'}</span>
                    <input type="file" accept="image/*" className="sr-only" disabled={imageBusy!==null || busy} onChange={e=>{const file=e.target.files?.[0]; e.currentTarget.value=''; if(file) void uploadProfileImage('avatar',file)}}/>
                  </label>
                </div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--fx-primary-strong)]"><ShieldCheck size={14}/> Profile controls active</span>
              </div>
              <div className="mt-4"><h1 className="text-3xl font-black tracking-[-.045em] sm:text-4xl">{fullName || 'Your FeniX profile'}</h1><p className="mt-1 text-sm text-[var(--fx-muted)]">@{username || 'username'} · {email}</p>{bio && <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-[var(--fx-muted)]">{bio}</p>}<div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--fx-muted)]">{locationText && <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[.03] px-3 py-1.5 dark:bg-white/[.04]"><MapPin size={14}/>{locationText}</span>}{websiteUrl && <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[.03] px-3 py-1.5 dark:bg-white/[.04]"><Globe size={14}/>Website</span>}</div></div>
            </div>
          </div>

          <aside className="fenix-surface-strong rounded-[2rem] p-5 sm:p-6">
            <p className="fenix-kicker">Profile health</p>
            <div className="mt-2 flex items-end justify-between gap-3"><h2 className="text-3xl font-black">{completion}%</h2><span className="text-xs text-[var(--fx-muted)]">ready to share</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--fx-border)]"><div className="h-full rounded-full bg-[var(--fx-primary-strong)] transition-all" style={{width: completion + '%'}}/></div>
            <div className="mt-5 space-y-2 text-xs">{[['Name',!!fullName],['Username',!!username],['Bio',!!bio],['Location',!!locationText],['Website',!!websiteUrl],['Profile photo',!!avatarUrl],['Public visibility',visibility==='public']].map(([label,done])=><div key={String(label)} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2.5"><span>{String(label)}</span><span className={done?'text-[var(--fx-primary-strong)]':'text-[var(--fx-muted)]'}>{done?'Ready':'Add'}</span></div>)}</div>
          </aside>
        </div>

        <section className="mt-5 fenix-surface-strong rounded-[2rem] p-5 sm:p-7">
          <p className="fenix-kicker">Identity</p>
          <h2 className="mt-2 text-2xl font-black">Make the profile useful.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fx-muted)]">These details power your public identity across eligible FeniX features. Private account information is never turned into public profile content.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label={locale==='bn'?'নাম':'Name'} value={fullName} onChange={setFullName} maxLength={160}/>
            <Field label="Username" value={username} onChange={v=>setUsername(v.replace(/[^a-zA-Z0-9_]/g,'').toLowerCase())} maxLength={32} prefix="@"/>
            <Field label={locale==='bn'?'এলাকা':'Location'} value={locationText} onChange={setLocationText} maxLength={160} icon={<MapPin size={15}/>}/>
            <Field label="Website" value={websiteUrl} onChange={setWebsiteUrl} maxLength={500} icon={<Globe size={15}/>} placeholder="https://example.com"/>
            <Field label="Profile image URL" value={avatarUrl} onChange={setAvatarUrl} maxLength={500} placeholder="https://…"/>
            <Field label="Cover image URL" value={coverUrl} onChange={setCoverUrl} maxLength={500} placeholder="https://…"/>
          </div>
          <label className="mt-4 block"><span className="text-xs font-bold">Bio</span><textarea value={bio} onChange={e=>setBio(e.target.value)} maxLength={1000} rows={5} className="mt-2 w-full rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3 text-sm leading-7 outline-none" placeholder={locale==='bn'?'আপনি কী করেন? কী নিয়ে কাজ করেন?':'What do you do and what are you building?'}/><span className="mt-1 block text-[10px] text-[var(--fx-muted)]">{bio.length}/1000</span></label>
        </section>

        <section className="mt-5 fenix-surface-strong rounded-[2rem] p-5 sm:p-7">
          <p className="fenix-kicker">Privacy & preferences</p>
          <h2 className="mt-2 text-2xl font-black">{locale==='bn'?'আপনার visibility আপনি ঠিক করবেন।':'You control your visibility.'}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Select label="Profile visibility" value={visibility} onChange={v=>setVisibility(v as Visibility)} options={[['public','Public'],['private','Private']]}/>
            <Select label={locale==='bn'?'কে message করতে পারবে':'Who can message you'} value={messagePermissions} onChange={v=>setMessagePermissions(v as MessagePermission)} options={[['everyone',locale==='bn'?'সবাই':'Everyone'],['authenticated',locale==='bn'?'শুধু logged-in user':'Authenticated users'],['nobody',locale==='bn'?'কেউ না':'Nobody']]}/>
            <Select label="Feed visibility" value={feedVisibility} onChange={v=>setFeedVisibility(v as FeedVisibility)} options={[['public','Public'],['authenticated',locale==='bn'?'Logged-in users':'Authenticated users']]}/>
            <div><span className="text-xs font-bold">Language</span><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={()=>setLocale('bn')} className={'min-h-11 rounded-xl border text-xs font-bold '+(locale==='bn'?'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>বাংলা</button><button type="button" onClick={()=>setLocale('en')} className={'min-h-11 rounded-xl border text-xs font-bold '+(locale==='en'?'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>English</button></div></div>
          </div>
        </section>

        {message && <p className="mt-4 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] p-4 text-sm">{message}</p>}
        <div className="sticky bottom-20 z-20 mt-5 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-2 shadow-xl backdrop-blur-xl sm:bottom-5">
          <button type="button" disabled={busy} onClick={()=>void save()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-bold text-white disabled:opacity-45"><Check size={17}/>{busy?'Saving…':(locale==='bn'?'Profile save করুন':'Save profile')}</button>
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

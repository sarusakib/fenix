'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Check, Globe, MapPin, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

export default function ProfileEditorPage() {
  const { locale, setLocale } = useFenixLocale()
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [locationText, setLocationText] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [visibility, setVisibility] = useState<'public'|'private'>('public')
  const [messagePermissions, setMessagePermissions] = useState<'everyone'|'authenticated'|'nobody'>('everyone')
  const [feedVisibility, setFeedVisibility] = useState<'public'|'authenticated'>('public')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) { window.location.replace('/login?next=/profile'); return }
      const { data: profile } = await s.from('profiles').select('id,full_name,username,bio,location_text,website_url').eq('id', auth.user.id).single()
      const { data: settings } = await s.from('profile_settings').select('locale,profile_visibility,message_permissions,feed_visibility').eq('user_id', auth.user.id).maybeSingle()
      if (!active) return
      setUserId(auth.user.id); setEmail(auth.user.email ?? '')
      setFullName(profile?.full_name ?? ''); setUsername(profile?.username ?? '')
      setBio(profile?.bio ?? ''); setLocationText(profile?.location_text ?? ''); setWebsiteUrl(profile?.website_url ?? '')
      if (settings?.locale === 'bn' || settings?.locale === 'en') setLocale(settings.locale)
      if (settings?.profile_visibility === 'private') setVisibility('private')
      if (settings?.message_permissions === 'everyone' || settings?.message_permissions === 'authenticated' || settings?.message_permissions === 'nobody') setMessagePermissions(settings.message_permissions)
      if (settings?.feed_visibility === 'authenticated') setFeedVisibility('authenticated')
    }
    void load()
    return () => { active = false }
  }, [setLocale])

  async function save() {
    setBusy(true); setMessage('')
    const cleanUsername = username.trim().toLowerCase()
    if (!/^[a-z0-9_]{3,32}$/.test(cleanUsername)) {
      setMessage(locale === 'bn' ? 'Username 3–32 অক্ষরের ছোট ইংরেজি অক্ষর/number/underscore হতে হবে।' : 'Username must be 3–32 lowercase letters, numbers or underscores.')
      setBusy(false); return
    }
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) { setBusy(false); return }
    const [{ error: profileError }, { error: settingError }] = await Promise.all([
      s.from('profiles').update({
        full_name: fullName.trim().slice(0,160) || null,
        username: cleanUsername,
        bio: bio.trim().slice(0,1000) || null,
        location_text: locationText.trim().slice(0,160) || null,
        website_url: websiteUrl.trim().slice(0,500) || null,
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
    if (profileError || settingError) setMessage(locale === 'bn' ? 'Profile save করা যায়নি। Username আগে থেকেই থাকতে পারে।' : 'Could not save the profile. The username may already be taken.')
    else setMessage(locale === 'bn' ? 'Profile আপডেট হয়েছে।' : 'Profile updated.')
    setBusy(false)
  }

  return (
    <main className="min-h-dvh">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 pb-28 pt-7 sm:px-6">
        <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> {locale === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}</Link>
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">Profile</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{locale === 'bn' ? 'আপনার FeniX পরিচয়' : 'Your FeniX identity'}</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--fx-muted)]">{locale === 'bn' ? 'সবার জন্য profile তৈরি করা যাবে। Public profile-এ শুধু আপনি যেগুলো প্রকাশ করতে চান সেগুলোই থাকবে।' : 'Everyone can create a profile. Only the fields you choose to make public are shown on your public profile.'}</p>
        </div>

        <section className="mt-7 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
          <div className="flex items-center gap-3"><UserCircle size={34} className="opacity-45"/><div><p className="font-black">{email}</p><p className="text-xs text-[var(--fx-muted)]">FeniX account</p></div></div>
          <div className="mt-6 grid gap-4">
            <Field label={locale === 'bn' ? 'নাম' : 'Name'} value={fullName} onChange={setFullName} maxLength={160}/>
            <Field label="Username" value={username} onChange={v => setUsername(v.replace(/[^a-zA-Z0-9_]/g,'').toLowerCase())} maxLength={32} prefix="@"/>
            <label className="block"><span className="text-xs font-bold">{locale === 'bn' ? 'Bio' : 'Bio'}</span><textarea value={bio} onChange={e=>setBio(e.target.value)} maxLength={1000} rows={5} className="mt-2 w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-6" /><span className="mt-1 block text-[10px] text-[var(--fx-muted)]">{bio.length}/1000</span></label>
            <Field label={locale === 'bn' ? 'এলাকা' : 'Location'} value={locationText} onChange={setLocationText} maxLength={160} icon={<MapPin size={15}/>}/>
            <Field label={locale === 'bn' ? 'Website' : 'Website'} value={websiteUrl} onChange={setWebsiteUrl} maxLength={500} icon={<Globe size={15}/>}/>
          </div>
        </section>

        <section className="mt-4 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
          <h2 className="text-lg font-black">{locale === 'bn' ? 'Privacy ও Community' : 'Privacy & Community'}</h2>
          <div className="mt-5 grid gap-4">
            <Select label={locale === 'bn' ? 'Profile visibility' : 'Profile visibility'} value={visibility} onChange={v=>setVisibility(v as typeof visibility)} options={[['public',locale==='bn'?'Public':'Public'],['private',locale==='bn'?'Private':'Private']]}/>
            <Select label={locale === 'bn' ? 'কে message করতে পারবে' : 'Who can message you'} value={messagePermissions} onChange={v=>setMessagePermissions(v as typeof messagePermissions)} options={[['everyone',locale==='bn'?'সবাই':'Everyone'],['authenticated',locale==='bn'?'শুধু logged-in user':'Authenticated users'],['nobody',locale==='bn'?'কেউ না':'Nobody']]}/>
            <Select label={locale === 'bn' ? 'Feed visibility' : 'Feed visibility'} value={feedVisibility} onChange={v=>setFeedVisibility(v as typeof feedVisibility)} options={[['public','Public'],['authenticated',locale==='bn'?'Logged-in users':'Authenticated users']]}/>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={()=>setLocale('bn')} className={'min-h-11 rounded-xl border text-xs font-bold '+(locale==='bn'?'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>বাংলা</button>
              <button type="button" onClick={()=>setLocale('en')} className={'min-h-11 rounded-xl border text-xs font-bold '+(locale==='en'?'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>English</button>
            </div>
          </div>
        </section>

        {message && <p className="mt-4 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-sm">{message}</p>}
        <button type="button" disabled={busy} onClick={()=>void save()} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] text-sm font-bold text-white disabled:opacity-45"><Check size={17}/>{busy ? (locale==='bn'?'Saving...':'Saving...') : (locale==='bn'?'Save profile':'Save profile')}</button>
      </section>
    </main>
  )
}

function Field({label,value,onChange,maxLength,icon,prefix}:{label:string;value:string;onChange:(v:string)=>void;maxLength:number;icon?:React.ReactNode;prefix?:string}) {
  return <label className="block"><span className="text-xs font-bold">{label}</span><div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3"><span className="text-[var(--fx-muted)]">{prefix||icon}</span><input value={value} onChange={e=>onChange(e.target.value)} maxLength={maxLength} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"/></div></label>
}

function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[][]}) {
  return <label className="block"><span className="text-xs font-bold">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
}

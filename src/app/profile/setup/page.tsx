'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ImageSquare, MapPin, UserCircle, X } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type StepKey = 'welcome' | 'basics' | 'photo' | 'location' | 'contacts' | 'interests' | 'done'

type LocationRow = {
  id: string
  level: string
  name_bn: string
  name_en: string | null
  slug: string
  parent_id: string | null
}

type Contacts = {
  whatsapp: string
  facebook_url: string
  instagram_url: string
  linkedin_url: string
  youtube_url: string
  phone_public: boolean
  whatsapp_public: boolean
  facebook_public: boolean
  instagram_public: boolean
  linkedin_public: boolean
  youtube_public: boolean
}

const steps: StepKey[] = ['welcome', 'basics', 'photo', 'location', 'contacts', 'interests', 'done']
const interests = [
  ['business', 'Business', 'ব্যবসা'],
  ['job', 'Job / Career', 'চাকরি / ক্যারিয়ার'],
  ['investment', 'Investment', 'বিনিয়োগ'],
  ['shopping', 'Shopping', 'কেনাকাটা'],
  ['connect', 'Connect', 'কানেক্ট'],
  ['learn', 'Learn', 'শেখা'],
  ['agriculture', 'Agriculture', 'কৃষি'],
  ['services', 'Local Services', 'স্থানীয় সেবা'],
  ['explore', 'Explore Feni', 'ফেনী ঘোরা / জানা'],
]

export default function ProfileSetupPage() {
  const router = useRouter()
  const { locale } = useFenixLocale()
  const [userId, setUserId] = useState('')
  const [step, setStep] = useState<StepKey>('welcome')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [initialUsername, setInitialUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [countryCode, setCountryCode] = useState('BD')
  const [districtId, setDistrictId] = useState('')
  const [upazilaId, setUpazilaId] = useState('')
  const [localityId, setLocalityId] = useState('')
  const [areaText, setAreaText] = useState('')
  const [roadText, setRoadText] = useState('')
  const [houseDetails, setHouseDetails] = useState('')
  const [holdingNo, setHoldingNo] = useState('')
  const [locationPublicLevel, setLocationPublicLevel] = useState<'district' | 'upazila' | 'locality'>('district')
  const [contacts, setContacts] = useState<Contacts>({
    whatsapp: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    phone_public: false,
    whatsapp_public: false,
    facebook_public: false,
    instagram_public: false,
    linkedin_public: false,
    youtube_public: false,
  })
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [locations, setLocations] = useState<LocationRow[]>([])
  const [publicAreaNames, setPublicAreaNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState('')
  const [message, setMessage] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const supabase = createClient()
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        window.location.replace('/login?next=/profile/setup')
        return
      }

      const [{ data: profile }, { data: settings }, { data: contactRows }, { data: locationRows }, { data: publicLocations }] = await Promise.all([
        supabase.from('profiles').select('id,full_name,username,bio,avatar_url,country_code,district_id,upazila_id,locality_id,area_text,road_text,house_details,holding_no,location_public_level').eq('id', auth.user.id).maybeSingle(),
        supabase.from('profile_settings').select('onboarding_step,onboarding_completed,onboarding_dismissed,interests').eq('user_id', auth.user.id).maybeSingle(),
        supabase.from('profile_contacts').select('whatsapp,facebook_url,instagram_url,linkedin_url,youtube_url,phone_public,whatsapp_public,facebook_public,instagram_public,linkedin_public,youtube_public').eq('user_id', auth.user.id).maybeSingle(),
        supabase.from('fenix_brain_locations').select('id,level,name_bn,name_en,slug,parent_id').eq('is_active', true).order('name_bn', { ascending: true }).limit(300),
        supabase.from('business_directory_locations').select('area,market,upazila,district,is_public').eq('is_public', true).limit(500),
      ])

      if (!active) return

      const firstStep = settings?.onboarding_completed ? 'done' : ((settings?.onboarding_step as StepKey) || 'welcome')
      setUserId(auth.user.id)
      setStep(steps.includes(firstStep) ? firstStep : 'welcome')
      setFullName(profile?.full_name ?? '')
      setUsername(profile?.username ?? '')
      setInitialUsername(profile?.username ?? '')
      setBio(profile?.bio ?? '')
      setAvatarUrl(profile?.avatar_url ?? '')
      setCountryCode('BD')
      const feniDistrict = (locationRows ?? []).find((item) => item.level === 'district' && (item.name_en?.toLowerCase() === 'feni' || item.name_bn === 'ফেনী'))
      setDistrictId(profile?.district_id ?? feniDistrict?.id ?? '')
      setUpazilaId(profile?.upazila_id ?? '')
      setLocalityId(profile?.locality_id ?? '')
      setAreaText(profile?.area_text ?? '')
      setRoadText(profile?.road_text ?? '')
      setHouseDetails(profile?.house_details ?? '')
      setHoldingNo(profile?.holding_no ?? '')
      if (profile?.location_public_level === 'upazila' || profile?.location_public_level === 'locality') {
        setLocationPublicLevel(profile.location_public_level)
      }
      setContacts({
        whatsapp: contactRows?.whatsapp ?? '',
        facebook_url: contactRows?.facebook_url ?? '',
        instagram_url: contactRows?.instagram_url ?? '',
        linkedin_url: contactRows?.linkedin_url ?? '',
        youtube_url: contactRows?.youtube_url ?? '',
        phone_public: Boolean(contactRows?.phone_public),
        whatsapp_public: Boolean(contactRows?.whatsapp_public),
        facebook_public: Boolean(contactRows?.facebook_public),
        instagram_public: Boolean(contactRows?.instagram_public),
        linkedin_public: Boolean(contactRows?.linkedin_public),
        youtube_public: Boolean(contactRows?.youtube_public),
      })
      setSelectedInterests(Array.isArray(settings?.interests) ? settings.interests : [])
      setLocations(Array.isArray(locationRows) ? locationRows : [])
      const selectedUpazilaName = (locationRows ?? []).find((item) => item.id === (profile?.upazila_id ?? ''))?.name_bn
      const areaNames = new Set<string>()
      for (const row of (publicLocations ?? [])) {
        if (selectedUpazilaName && row.upazila && String(row.upazila).toLowerCase() !== selectedUpazilaName.toLowerCase()) continue
        for (const value of [row.area, row.market]) {
          if (value && String(value).trim().length >= 2) areaNames.add(String(value).trim())
        }
      }
      setPublicAreaNames([...areaNames].sort((a,b) => a.localeCompare(b, 'bn')).slice(0, 160))
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  const district = locations.find((item) => item.id === districtId)
  const upazilas = useMemo(
    () => locations.filter((item) => item.parent_id === districtId && item.level === 'upazila'),
    [locations, districtId],
  )
  const localities = useMemo(
    () => locations.filter((item) => item.parent_id === upazilaId && ['union', 'ward', 'municipality'].includes(item.level)),
    [locations, upazilaId],
  )
  const areaOptions = useMemo(
    () => {
      const named = locations
        .filter((item) => item.parent_id === localityId || item.parent_id === upazilaId)
        .filter((item) => ['area', 'village', 'mouza', 'market'].includes(item.level))
        .flatMap((item) => [item.name_bn, item.name_en].filter(Boolean) as string[])
      return [...new Set([...named, ...publicAreaNames])].slice(0, 160)
    },
    [locations, localityId, upazilaId, publicAreaNames],
  )

  async function saveStep(next: StepKey, options?: { dismissed?: boolean }) {
    if (!userId) return false
    setSaving(true)
    setMessage('')
    const supabase = createClient()

    const profilePayload = {
      full_name: fullName.trim().slice(0, 160) || null,
      username: username.trim().toLowerCase() || null,
      bio: bio.trim().slice(0, 1000) || null,
      avatar_url: avatarUrl.trim() || null,
      country_code: 'BD',
      district_id: districtId || null,
      upazila_id: upazilaId || null,
      locality_id: localityId || null,
      area_text: areaText.trim().slice(0, 200) || null,
      road_text: roadText.trim().slice(0, 240) || null,
      house_details: houseDetails.trim().slice(0, 300) || null,
      holding_no: holdingNo.trim().slice(0, 80) || null,
      location_public_level: locationPublicLevel,
      updated_at: new Date().toISOString(),
    }

    if (profilePayload.username && !/^[a-z0-9_]{3,32}$/.test(profilePayload.username)) {
      setMessage(locale === 'bn' ? 'Username 3–32 অক্ষরের lowercase letters, numbers বা underscore হতে হবে।' : 'Username must be 3–32 lowercase letters, numbers or underscores.')
      setSaving(false)
      return false
    }

    if (profilePayload.username && profilePayload.username !== initialUsername) {
      const { data: available } = await supabase.rpc('is_fenix_username_available', {
        p_username: profilePayload.username,
        p_exclude_user_id: userId,
      })
      if (available === false) {
        setUsernameStatus(locale === 'bn' ? 'এই username নেওয়া আছে।' : 'This username is already taken.')
        setSaving(false)
        return false
      }
    }

    const { error: profileError } = await supabase.from('profiles').update(profilePayload).eq('id', userId)
    if (profileError) {
      setMessage(locale === 'bn' ? 'Profile save হয়নি। Username বা তথ্য যাচাই করুন।' : 'Profile could not be saved. Check the username or fields.')
      setSaving(false)
      return false
    }

    const { error: contactError } = await supabase.from('profile_contacts').upsert({
      user_id: userId,
      whatsapp: contacts.whatsapp.trim().slice(0, 80) || null,
      facebook_url: contacts.facebook_url.trim().slice(0, 500) || null,
      instagram_url: contacts.instagram_url.trim().slice(0, 500) || null,
      linkedin_url: contacts.linkedin_url.trim().slice(0, 500) || null,
      youtube_url: contacts.youtube_url.trim().slice(0, 500) || null,
      phone_public: contacts.phone_public,
      whatsapp_public: contacts.whatsapp_public,
      facebook_public: contacts.facebook_public,
      instagram_public: contacts.instagram_public,
      linkedin_public: contacts.linkedin_public,
      youtube_public: contacts.youtube_public,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (contactError) {
      setMessage(locale === 'bn' ? 'Contact information পুরোপুরি save হয়নি।' : 'Contact information could not be fully saved.')
      setSaving(false)
      return false
    }

    const isDone = next === 'done'
    const { error: settingsError } = await supabase.from('profile_settings').update({
      onboarding_step: next,
      onboarding_completed: isDone,
      onboarding_dismissed: Boolean(options?.dismissed),
      interests: selectedInterests,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)

    if (settingsError) {
      setMessage(locale === 'bn' ? 'Setup progress save হয়নি।' : 'Setup progress could not be saved.')
      setSaving(false)
      return false
    }

    setStep(next)
    setSaving(false)
    if (isDone) {
      router.push('/profile')
    }
    return true
  }

  async function next() {
    const index = steps.indexOf(step)
    const nextStep = steps[Math.min(index + 1, steps.length - 1)]
    await saveStep(nextStep)
  }

  async function skip() {
    const index = steps.indexOf(step)
    const nextStep = steps[Math.min(index + 1, steps.length - 1)]
    await saveStep(nextStep)
  }

  async function notNow() {
    const ok = await saveStep(step, { dismissed: true })
    if (ok) router.push('/dashboard')
  }

  async function uploadAvatar(file: File | null) {
    if (!file || !userId) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage(locale === 'bn' ? 'JPG, PNG বা WebP ছবি দিন।' : 'Use a JPG, PNG or WebP image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage(locale === 'bn' ? 'ছবির size সর্বোচ্চ 2MB।' : 'Image size must be 2MB or less.')
      return
    }

    setPhotoBusy(true)
    setMessage('')
    const supabase = createClient()
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const path = userId + '/' + crypto.randomUUID() + '.' + ext
    const { error } = await supabase.storage.from('avatars').upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type,
    })
    if (error) {
      setMessage(locale === 'bn' ? 'Photo upload হয়নি।' : 'Photo upload failed.')
      setPhotoBusy(false)
      return
    }

    const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(publicUrl.publicUrl)
    await supabase.from('profiles').update({ avatar_url: publicUrl.publicUrl, updated_at: new Date().toISOString() }).eq('id', userId)
    setPhotoBusy(false)
  }

  async function removeAvatar() {
    if (!avatarUrl) return
    setPhotoBusy(true)
    const supabase = createClient()
    const marker = '/avatars/'
    const markerIndex = avatarUrl.indexOf(marker)
    if (markerIndex >= 0) {
      const path = avatarUrl.slice(markerIndex + marker.length).split('?')[0]
      if (path.startsWith(userId + '/')) {
        await supabase.storage.from('avatars').remove([path])
      }
    }
    await supabase.from('profiles').update({ avatar_url: null, updated_at: new Date().toISOString() }).eq('id', userId)
    setAvatarUrl('')
    setPhotoBusy(false)
  }

  if (loading) {
    return <main className="min-h-dvh grid place-items-center px-5"><div className="text-sm font-semibold text-[var(--fx-muted)]">FeniX profile setup…</div></main>
  }

  const progress = Math.min(100, Math.round((steps.indexOf(step) / (steps.length - 1)) * 100))
  const title = step === 'welcome'
    ? (locale === 'bn' ? 'আপনার FeniX profile তৈরি করুন' : 'Set up your FeniX profile')
    : step === 'basics'
      ? (locale === 'bn' ? 'আপনার পরিচয়' : 'Your identity')
      : step === 'photo'
        ? (locale === 'bn' ? 'একটি profile photo দিন' : 'Add a profile photo')
        : step === 'location'
          ? (locale === 'bn' ? 'Feni-তে আপনি কোথায়?' : 'Where are you in Feni?')
          : step === 'contacts'
            ? (locale === 'bn' ? 'যোগাযোগ ও social' : 'Contact & social')
            : step === 'interests'
              ? (locale === 'bn' ? 'FeniX-এ আপনি কী করতে চান?' : 'What brings you to FeniX?')
              : (locale === 'bn' ? 'Profile ready' : 'Profile ready')

  return (
    <main className="min-h-dvh bg-[var(--fx-bg)] px-4 py-6 pb-24 text-[var(--fx-text)] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold">
            <ArrowLeft size={16} /> {locale === 'bn' ? 'Profile' : 'Profile'}
          </Link>
          <span className="text-xs font-semibold text-[var(--fx-muted)]">{progress}%</span>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--fx-border)]">
          <div className="h-full rounded-full bg-[var(--fx-primary-strong)] transition-all" style={{ width: progress + '%' }} />
        </div>

        <section className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">FeniX</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">
            {step === 'welcome'
              ? (locale === 'bn' ? 'একবার profile setup করুন। পরে যেকোনো সময় পরিবর্তন করতে পারবেন। কোনো ধাপ বাধ্যতামূলক নয়।' : 'Set it up once and change it anytime. Nothing here is mandatory.')
              : step === 'location'
                ? (locale === 'bn' ? 'Bangladesh → Feni → Upazila → Union/Ward → Area/Para. Exact road, house ও holding information private রাখা হয়।' : 'Bangladesh → Feni → Upazila → Union/Ward → Area/Para. Exact road, house and holding details remain private.')
                : (locale === 'bn' ? 'Continue, Skip বা Not now—আপনার সুবিধামতো এগোন।' : 'Continue, Skip or Not now whenever you prefer.')}
          </p>

          {message && <div className="mt-5 rounded-2xl bg-[var(--fx-primary-soft)] px-4 py-3 text-sm">{message}</div>}

          {step === 'welcome' && (
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                ['Profile identity', 'Name, username and bio'],
                ['Photo', 'Upload or change your profile photo'],
                ['Feni location', 'Choose your area step-by-step'],
                ['Contact & interests', 'Optional social and personalization'],
              ].map(([a,b]) => (
                <div key={a} className="rounded-2xl border border-[var(--fx-border)] p-4">
                  <div className="text-sm font-bold">{a}</div>
                  <div className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{b}</div>
                </div>
              ))}
            </div>
          )}

          {step === 'basics' && (
            <div className="mt-7 grid gap-4">
              <label>
                <span className="text-xs font-bold">{locale === 'bn' ? 'নাম' : 'Name'}</span>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={160} className="mt-2 h-12 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm outline-none" />
              </label>
              <label>
                <span className="text-xs font-bold">Username</span>
                <div className="mt-2 flex items-center rounded-xl border border-[var(--fx-border)] px-3">
                  <span className="text-[var(--fx-muted)]">@</span>
                  <input
                    value={username}
                    onChange={(e) => { setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()); setUsernameStatus('') }}
                    maxLength={32}
                    className="h-12 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
                  />
                </div>
                {usernameStatus && <p className="mt-1 text-xs text-rose-600">{usernameStatus}</p>}
              </label>
              <label>
                <span className="text-xs font-bold">Bio</span>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-6 outline-none" />
              </label>
            </div>
          )}

          {step === 'photo' && (
            <div className="mt-8 flex flex-col items-center">
              <div className="relative">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Profile" className="h-36 w-36 rounded-full object-cover ring-4 ring-[var(--fx-primary-soft)]" />
                  : <div className="grid h-36 w-36 place-items-center rounded-full bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><UserCircle size={78} weight="duotone" /></div>}
                {avatarUrl && (
                  <button type="button" onClick={() => void removeAvatar()} disabled={photoBusy} className="absolute -right-1 top-1 grid h-9 w-9 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] shadow-sm">
                    <X size={16} />
                  </button>
                )}
              </div>

              <label className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-bold text-white">
                <ImageSquare size={18} />
                {photoBusy ? 'Uploading…' : (avatarUrl ? 'Change photo' : 'Upload photo')}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void uploadAvatar(e.target.files?.[0] ?? null)} />
              </label>
              <p className="mt-3 text-center text-xs leading-5 text-[var(--fx-muted)]">JPG, PNG or WebP · max 2MB</p>
            </div>
          )}

          {step === 'location' && (
            <div className="mt-7 grid gap-4">
              <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] p-4 text-sm">
                <div className="flex items-center gap-2 font-bold"><MapPin size={18} /> Bangladesh → Feni</div>
                <div className="mt-1 text-xs text-[var(--fx-muted)]">Country fixed: Bangladesh · District: {district?.name_bn || 'ফেনী'}</div>
              </div>

              <label>
                <span className="text-xs font-bold">{locale === 'bn' ? 'Upazila' : 'Upazila'}</span>
                <select value={upazilaId} onChange={(e) => { setUpazilaId(e.target.value); setLocalityId(''); setAreaText('') }} className="mt-2 h-12 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">
                  <option value="">Select Upazila</option>
                  {upazilas.map((item) => <option key={item.id} value={item.id}>{item.name_bn}{item.name_en ? ' · ' + item.name_en : ''}</option>)}
                </select>
              </label>

              <label>
                <span className="text-xs font-bold">Union / Ward</span>
                <select value={localityId} onChange={(e) => { setLocalityId(e.target.value); setAreaText('') }} disabled={!upazilaId} className="mt-2 h-12 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm disabled:opacity-50">
                  <option value="">Select Union / Ward</option>
                  {localities.map((item) => <option key={item.id} value={item.id}>{item.name_bn} · {item.level}</option>)}
                </select>
              </label>

              <label>
                <span className="text-xs font-bold">{locale === 'bn' ? 'Area / Para / Mohalla' : 'Area / Para / Mohalla'}</span>
                <input list="fenix-area-options" value={areaText} onChange={(e) => setAreaText(e.target.value)} maxLength={200} placeholder="Search local area, para or bazaar…" className="mt-2 h-12 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm outline-none" />
                <datalist id="fenix-area-options">
                  {areaOptions.map((item) => <option key={item} value={item} />)}
                </datalist>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label><span className="text-xs font-bold">Road / Street</span><input value={roadText} onChange={(e) => setRoadText(e.target.value)} maxLength={240} className="mt-2 h-12 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm outline-none" /></label>
                <label><span className="text-xs font-bold">Holding No.</span><input value={holdingNo} onChange={(e) => setHoldingNo(e.target.value)} maxLength={80} className="mt-2 h-12 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm outline-none" /></label>
              </div>

              <label><span className="text-xs font-bold">House details</span><input value={houseDetails} onChange={(e) => setHouseDetails(e.target.value)} maxLength={300} className="mt-2 h-12 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm outline-none" /></label>

              <div className="rounded-2xl border border-[var(--fx-border)] p-4">
                <div className="text-xs font-bold">What can be public?</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {(['district','upazila','locality'] as const).map((level) => (
                    <button key={level} type="button" onClick={() => setLocationPublicLevel(level)} className={'rounded-xl border px-3 py-3 text-left text-xs font-bold ' + (locationPublicLevel === level ? 'border-[var(--fx-primary)] bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)]')}>
                      {level === 'district' ? 'Feni' : level === 'upazila' ? 'Upazila' : 'Union / Ward'}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-5 text-[var(--fx-muted)]">Road, house details and holding number stay private.</p>
              </div>
            </div>
          )}

          {step === 'contacts' && (
            <div className="mt-7 grid gap-4">
              {[
                ['whatsapp', 'WhatsApp', 'whatsapp_public'],
                ['facebook_url', 'Facebook', 'facebook_public'],
                ['instagram_url', 'Instagram', 'instagram_public'],
                ['linkedin_url', 'LinkedIn', 'linkedin_public'],
                ['youtube_url', 'YouTube', 'youtube_public'],
              ].map(([key,label,visibilityKey]) => (
                <label key={key}>
                  <span className="text-xs font-bold">{label}</span>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3">
                    <input value={(contacts as Record<string, string | boolean>)[key] as string} onChange={(e) => setContacts((c) => ({ ...c, [key]: e.target.value }))} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" />
                    <button type="button" onClick={() => setContacts((c) => ({ ...c, [visibilityKey]: !(c as Record<string, string | boolean>)[visibilityKey] }))} className={'rounded-lg px-2.5 py-1.5 text-[10px] font-bold ' + ((contacts as Record<string, string | boolean>)[visibilityKey] ? 'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]' : 'border border-[var(--fx-border)] text-[var(--fx-muted)]')}>{(contacts as Record<string, string | boolean>)[visibilityKey] ? 'Public' : 'Private'}</button>
                  </div>
                </label>
              ))}
              <p className="text-xs leading-5 text-[var(--fx-muted)]">সবগুলো optional। Public করলে public profile-এ দেখাবে।</p>
            </div>
          )}

          {step === 'interests' && (
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {interests.map(([key,en,bn]) => {
                const active = selectedInterests.includes(key)
                return (
                  <button key={key} type="button" onClick={() => setSelectedInterests((current) => active ? current.filter((x) => x !== key) : [...current, key])} className={'rounded-2xl border p-4 text-left transition ' + (active ? 'border-[var(--fx-primary)] bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)]')}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">{locale === 'bn' ? bn : en}</span>
                      {active && <Check size={16} />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {step === 'done' && (
            <div className="mt-8 rounded-2xl bg-[var(--fx-primary-soft)] p-5">
              <div className="text-lg font-black">Ready.</div>
              <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">আপনার profile এখন FeniX-এর search, profile, business ও future personalization layer-এর জন্য প্রস্তুত।</p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            {step !== 'done' && (
              <>
                <button type="button" disabled={saving} onClick={() => void next()} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-bold text-white disabled:opacity-50">
                  {saving ? 'Saving…' : (step === 'welcome' ? 'Continue' : 'Continue')} <ArrowRight size={17} />
                </button>
                {step !== 'welcome' && <button type="button" disabled={saving} onClick={() => void skip()} className="min-h-12 rounded-xl border border-[var(--fx-border)] px-5 text-sm font-bold">Skip</button>}
                <button type="button" disabled={saving} onClick={() => void notNow()} className="min-h-12 rounded-xl border border-[var(--fx-border)] px-5 text-sm font-bold text-[var(--fx-muted)]">Not now</button>
              </>
            )}
            {step === 'done' && <button type="button" onClick={() => router.push('/profile')} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-bold text-white">Open Profile <ArrowRight size={17}/></button>}
          </div>
        </section>
      </div>
    </main>
  )
}

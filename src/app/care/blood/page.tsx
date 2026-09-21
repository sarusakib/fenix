'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle, Heartbeat, PaperPlaneRight, UserCircle } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'] as const

type RequestRow = {
  id: string
  blood_group: string
  units: number
  hospital_name: string
  hospital_area: string | null
  upazila_bn: string | null
  upazila_en: string | null
  area_text: string | null
  needed_at: string | null
  urgency: string
  status: string
  created_at: string
}

type DonorRow = {
  user_id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  blood_group: string
  area_text: string | null
  upazila_bn: string | null
  upazila_en: string | null
  availability: string
  last_donation_date: string | null
  preferred_contact: string
}

type LocationRow = { id: string; level: string; name_bn: string; name_en: string | null; parent_id: string | null }

export default function BloodHelpPage() {
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'
  const [mode, setMode] = useState<'requests'|'donor'>('requests')
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [donors, setDonors] = useState<DonorRow[]>([])
  const [locations, setLocations] = useState<LocationRow[]>([])
  const [bloodGroup, setBloodGroup] = useState('O+')
  const [units, setUnits] = useState(1)
  const [hospitalName, setHospitalName] = useState('')
  const [hospitalArea, setHospitalArea] = useState('')
  const [upazilaId, setUpazilaId] = useState('')
  const [areaText, setAreaText] = useState('')
  const [neededAt, setNeededAt] = useState('')
  const [urgency, setUrgency] = useState('urgent')
  const [contactMethod, setContactMethod] = useState('in_app')
  const [note, setNote] = useState('')
  const [donorAvailable, setDonorAvailable] = useState('available')
  const [donorLastDonation, setDonorLastDonation] = useState('')
  const [donorContact, setDonorContact] = useState('in_app')
  const [donorPublic, setDonorPublic] = useState(false)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [hasDonor, setHasDonor] = useState(false)

  const feniUpazilas = useMemo(
    () => locations.filter((item) => item.level === 'upazila'),
    [locations],
  )

  async function load() {
    const supabase = createClient()
    const [{ data: req }, { data: donorRows }, { data: locationRows }, { data: auth }] = await Promise.all([
      supabase.from('fenix_public_blood_requests').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('fenix_public_blood_donors').select('*').order('last_donation_date', { ascending: true, nullsFirst: true }).limit(50),
      supabase.from('fenix_brain_locations').select('id,level,name_bn,name_en,parent_id').eq('is_active', true).eq('level', 'upazila').order('name_bn', { ascending: true }),
      supabase.auth.getUser(),
    ])
    setRequests((req ?? []) as RequestRow[])
    setDonors((donorRows ?? []) as DonorRow[])
    setLocations((locationRows ?? []) as LocationRow[])
    if (auth.user) {
      const { data: own } = await supabase.from('fenix_blood_donors').select('blood_group,upazila_id,area_text,availability,last_donation_date,preferred_contact,is_public').eq('user_id', auth.user.id).maybeSingle()
      if (own) {
        setHasDonor(true)
        setBloodGroup(own.blood_group)
        setUpazilaId(own.upazila_id ?? '')
        setAreaText(own.area_text ?? '')
        setDonorAvailable(own.availability ?? 'available')
        setDonorLastDonation(own.last_donation_date ?? '')
        setDonorContact(own.preferred_contact ?? 'in_app')
        setDonorPublic(Boolean(own.is_public))
      }
    }
  }

  useEffect(() => { void load() }, [])

  async function submitRequest() {
    setBusy(true)
    setStatus('')
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      window.location.href = '/login?next=/care/blood'
      return
    }
    const { error } = await supabase.from('fenix_blood_requests').insert({
      requester_id: auth.user.id,
      blood_group: bloodGroup,
      units,
      hospital_name: hospitalName.trim(),
      hospital_area: hospitalArea.trim() || null,
      upazila_id: upazilaId || null,
      area_text: areaText.trim() || null,
      needed_at: neededAt ? new Date(neededAt).toISOString() : null,
      urgency,
      contact_method: contactMethod,
      note: note.trim() || null,
    })
    setStatus(error ? (bn ? 'Blood request save হয়নি।' : 'Blood request could not be saved.') : (bn ? 'Blood request পোস্ট হয়েছে।' : 'Blood request posted.'))
    if (!error) {
      setHospitalName('')
      setHospitalArea('')
      setNeededAt('')
      setNote('')
      await load()
    }
    setBusy(false)
  }

  async function saveDonor() {
    setBusy(true)
    setStatus('')
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      window.location.href = '/login?next=/care/blood'
      return
    }
    const { error } = await supabase.from('fenix_blood_donors').upsert({
      user_id: auth.user.id,
      blood_group: bloodGroup,
      upazila_id: upazilaId || null,
      area_text: areaText.trim() || null,
      availability: donorAvailable,
      last_donation_date: donorLastDonation || null,
      preferred_contact: donorContact,
      is_public: donorPublic,
    }, { onConflict: 'user_id' })
    setStatus(error ? (bn ? 'Donor profile save হয়নি।' : 'Donor profile could not be saved.') : (bn ? 'Donor profile আপডেট হয়েছে।' : 'Donor profile updated.'))
    if (!error) {
      setHasDonor(true)
      await load()
    }
    setBusy(false)
  }

  async function respond(requestId: string) {
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      window.location.href = '/login?next=/care/blood'
      return
    }
    const message = window.prompt(bn ? 'আপনি কীভাবে help করতে পারবেন? (optional)' : 'How can you help? (optional)') || null
    const { error } = await supabase.from('fenix_blood_responses').insert({
      request_id: requestId,
      donor_id: auth.user.id,
      message: message?.trim().slice(0, 1000) || null,
    })
    setStatus(error ? (bn ? 'Response পাঠানো যায়নি; হয়তো already responded করেছেন।' : 'Response could not be sent; you may have already responded.') : (bn ? 'আপনার help response পাঠানো হয়েছে।' : 'Your help response was sent.'))
  }

  return (
    <main className="min-h-dvh bg-[var(--fx-bg)]">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-28 pt-7 sm:px-6">
        <Link href="/care" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/>Care</Link>

        <div className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]"><Heartbeat size={17}/> {bn ? 'রক্ত সহায়তা' : 'Blood Help'}</div>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">{bn ? 'রক্ত দরকার? Donor হতে চান?' : 'Need blood or want to donate?'}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">{bn ? 'Open requests দেখুন। Donor profile public করতে হলে আপনি নিজে opt-in করবেন। Public view-তে phone বা exact address দেখানো হয় না।' : 'Browse open requests. Donor visibility is always opt-in, and public views never expose a phone number or exact home address.'}</p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-[var(--fx-border)] p-1">
            <button type="button" onClick={() => setMode('requests')} className={'min-h-11 rounded-xl text-sm font-bold '+(mode==='requests'?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'text-[var(--fx-muted)]')}>{bn ? 'রক্তের request' : 'Blood requests'}</button>
            <button type="button" onClick={() => setMode('donor')} className={'min-h-11 rounded-xl text-sm font-bold '+(mode==='donor'?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'text-[var(--fx-muted)]')}>{hasDonor ? (bn ? 'আমার donor profile' : 'My donor profile') : (bn ? 'Donor হোন' : 'Become a donor')}</button>
          </div>

          {status && <div className="mt-4 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-sm">{status}</div>}

          {mode === 'requests' ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
              <div className="space-y-3">
                {requests.length ? requests.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-[var(--fx-border)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xl font-black">{item.blood_group} · {item.units} {bn ? 'unit' : 'unit(s)'}</div>
                        <div className="mt-1 text-sm font-bold">{item.hospital_name}</div>
                        <div className="mt-1 text-xs text-[var(--fx-muted)]">{[item.hospital_area, item.upazila_bn || item.upazila_en, item.area_text].filter(Boolean).join(' · ')}</div>
                      </div>
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{item.urgency}</span>
                    </div>
                    <p className="mt-3 text-xs text-[var(--fx-muted)]">{item.needed_at ? new Date(item.needed_at).toLocaleString(bn?'bn-BD':'en-BD') : (bn ? 'সময় উল্লেখ করা হয়নি' : 'Time not specified')}</p>
                    <button type="button" onClick={() => void respond(item.id)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white"><PaperPlaneRight size={15}/>{bn ? 'আমি সাহায্য করতে পারি' : 'I can help'}</button>
                  </article>
                )) : <div className="rounded-2xl border border-dashed border-[var(--fx-border)] p-8 text-center text-sm text-[var(--fx-muted)]">{bn ? 'এখন open blood request নেই।' : 'No open blood requests right now.'}</div>}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); void submitRequest() }} className="rounded-2xl border border-[var(--fx-border)] p-4">
                <div className="flex items-center gap-2"><PaperPlaneRight size={18} className="text-[var(--fx-primary-strong)]"/><h2 className="font-black">{bn ? 'Blood request দিন' : 'Post a blood request'}</h2></div>
                <div className="mt-4 grid gap-3">
                  <Select label="Blood group" value={bloodGroup} onChange={setBloodGroup} options={BLOOD_GROUPS.map((x) => [x,x])}/>
                  <label><span className="text-xs font-bold">Units</span><input type="number" min={1} max={20} value={units} onChange={(e)=>setUnits(Number(e.target.value))} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm"/></label>
                  <Field label={bn ? 'Hospital / clinic' : 'Hospital / clinic'} value={hospitalName} onChange={setHospitalName} required/>
                  <Field label={bn ? 'Hospital area' : 'Hospital area'} value={hospitalArea} onChange={setHospitalArea}/>
                  <Select label="Upazila" value={upazilaId} onChange={setUpazilaId} options={[['','Select'], ...feniUpazilas.map(x=>[x.id,x.name_bn])]}/>
                  <Field label={bn ? 'Area' : 'Area'} value={areaText} onChange={setAreaText}/>
                  <label><span className="text-xs font-bold">{bn ? 'কখন প্রয়োজন' : 'Needed at'}</span><input type="datetime-local" value={neededAt} onChange={(e)=>setNeededAt(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm"/></label>
                  <Select label={bn ? 'Urgency' : 'Urgency'} value={urgency} onChange={setUrgency} options={[['critical','Critical'],['urgent','Urgent'],['normal','Normal']]}/>
                  <Select label={bn ? 'Contact' : 'Contact'} value={contactMethod} onChange={setContactMethod} options={[['in_app','FeniX message'],['phone','Phone'],['whatsapp','WhatsApp']]}/>
                  <label><span className="text-xs font-bold">Note</span><textarea value={note} onChange={(e)=>setNote(e.target.value)} maxLength={1000} rows={3} className="mt-2 w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-6"/></label>
                  <button type="submit" disabled={busy||!hospitalName.trim()} className="min-h-11 rounded-xl bg-[var(--fx-primary-strong)] text-sm font-bold text-white disabled:opacity-40">{busy ? 'Saving…' : (bn ? 'Request পোস্ট করুন' : 'Post request')}</button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); void saveDonor() }} className="mt-6 max-w-2xl rounded-2xl border border-[var(--fx-border)] p-4">
              <div className="flex items-center gap-3"><UserCircle size={32} className="text-[var(--fx-primary-strong)]"/><div><h2 className="font-black">Donor profile</h2><p className="text-xs text-[var(--fx-muted)]">{bn ? 'আপনার choice অনুযায়ী public matching-এ দেখাবে।' : 'Only your chosen public fields appear in matching.'}</p></div></div>
              <div className="mt-4 grid gap-3">
                <Select label="Blood group" value={bloodGroup} onChange={setBloodGroup} options={BLOOD_GROUPS.map((x) => [x,x])}/>
                <Select label="Upazila" value={upazilaId} onChange={setUpazilaId} options={[['','Select'], ...feniUpazilas.map(x=>[x.id,x.name_bn])]}/>
                <Field label={bn ? 'Area / Para' : 'Area / Para'} value={areaText} onChange={setAreaText}/>
                <Select label="Availability" value={donorAvailable} onChange={setDonorAvailable} options={[['available','Available'],['paused','Paused'],['unavailable','Unavailable']]}/>
                <label><span className="text-xs font-bold">Last donation date</span><input type="date" value={donorLastDonation} onChange={(e)=>setDonorLastDonation(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm"/></label>
                <Select label="Preferred contact" value={donorContact} onChange={setDonorContact} options={[['in_app','FeniX message'],['phone','Phone'],['whatsapp','WhatsApp']]}/>
                <label className="flex items-center gap-3 rounded-xl border border-[var(--fx-border)] p-3"><input type="checkbox" checked={donorPublic} onChange={(e)=>setDonorPublic(e.target.checked)}/><span className="text-sm">{bn ? 'Public donor matching-এ দেখাতে চাই' : 'Show me in public donor matching'}</span></label>
                <button type="submit" disabled={busy} className="min-h-11 rounded-xl bg-[var(--fx-primary-strong)] text-sm font-bold text-white disabled:opacity-40">{busy ? 'Saving…' : 'Save donor profile'}</button>
              </div>
            </form>
          )}

          {donors.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-[var(--fx-primary-strong)]"/><h2 className="font-black">Available public donors</h2></div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {donors.map((donor) => (
                  <Link key={donor.user_id} href={donor.username ? ('/profile/' + donor.username) : '/profile'} className="rounded-2xl border border-[var(--fx-border)] p-4">
                    <div className="flex items-center gap-3">
                      {donor.avatar_url ? <img src={donor.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover"/> : <UserCircle size={40} className="opacity-35"/>}
                      <div><div className="text-sm font-bold">{donor.full_name || donor.username || 'FeniX donor'}</div><div className="text-xs text-[var(--fx-muted)]">{donor.blood_group} · {[donor.upazila_bn||donor.upazila_en,donor.area_text].filter(Boolean).join(' · ')}</div></div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label><span className="text-xs font-bold">{label}</span><input required={required} value={value} onChange={(e)=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm outline-none"/></label>
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value:string)=>void; options:string[][] }) {
  return <label><span className="text-xs font-bold">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
}

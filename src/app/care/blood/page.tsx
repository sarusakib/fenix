'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowClockwise, CheckCircle, ChatCircleDots, MapPin, PlusCircle, ShieldCheck, WarningCircle, WhatsappLogo } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import MessageButton from '@/components/messaging/MessageButton'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { ROUTES } from '@/lib/core/routes'

type BloodGroup = 'A+'|'A-'|'B+'|'B-'|'O+'|'O-'|'AB+'|'AB-'
type Availability = 'available'|'unavailable'|'paused'
type PreferredContact = 'in_app'|'phone'|'whatsapp'
type Gender = 'male'|'female'|'other'|'prefer_not_to_say'

type PublicDonor = {
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  blood_group: BloodGroup | null
  area_text: string | null
  upazila_bn: string | null
  upazila_en: string | null
  availability: Availability | null
  last_donation_date: string | null
  preferred_contact: PreferredContact | null
  gender: Gender | null
  emergency_available: boolean | null
  public_whatsapp: string | null
}

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  date_of_birth: string | null
  upazila_id: string | null
  area_text: string | null
}

type Donor = {
  user_id: string
  blood_group: BloodGroup
  upazila_id: string | null
  area_text: string | null
  availability: Availability
  last_donation_date: string | null
  preferred_contact: PreferredContact
  is_public: boolean
  note: string | null
  gender: Gender | null
  emergency_available: boolean
}

type BloodRequest = {
  id: string
  blood_group: BloodGroup
  units: number
  hospital_name: string
  hospital_area: string | null
  upazila_bn: string | null
  upazila_en: string | null
  area_text: string | null
  needed_at: string | null
  urgency: 'critical'|'urgent'|'normal'
  status: 'open'|'matched'|'fulfilled'|'cancelled'|'expired'
  created_at: string
}

const GROUPS: BloodGroup[] = ['A+','A-','B+','B-','O+','O-','AB+','AB-']

export default function CareBloodPage() {
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'
  const [profile,setProfile]=useState<Profile|null>(null)
  const [donors,setDonors]=useState<PublicDonor[]>([])
  const [requests,setRequests]=useState<BloodRequest[]>([])
  const [locations,setLocations]=useState<Array<{id:string;name_bn:string;name_en:string|null}>>([])
  const [filter,setFilter]=useState<BloodGroup|''>('')
  const [loading,setLoading]=useState(true)
  const [savingDonor,setSavingDonor]=useState(false)
  const [savingRequest,setSavingRequest]=useState(false)
  const [respondingId,setRespondingId]=useState<string|null>(null)
  const [notice,setNotice]=useState('')

  const [fullName,setFullName]=useState('')
  const [phone,setPhone]=useState('')
  const [dateOfBirth,setDateOfBirth]=useState('')
  const [gender,setGender]=useState<Gender|''>('')
  const [bloodGroup,setBloodGroup]=useState<BloodGroup>('A+')
  const [upazilaId,setUpazilaId]=useState('')
  const [areaText,setAreaText]=useState('')
  const [availability,setAvailability]=useState<Availability>('available')
  const [lastDonationDate,setLastDonationDate]=useState('')
  const [preferredContact,setPreferredContact]=useState<PreferredContact>('in_app')
  const [emergencyAvailable,setEmergencyAvailable]=useState(false)
  const [donorNote,setDonorNote]=useState('')

  const [requestGroup,setRequestGroup]=useState<BloodGroup>('A+')
  const [requestUnits,setRequestUnits]=useState('1')
  const [hospitalName,setHospitalName]=useState('')
  const [hospitalArea,setHospitalArea]=useState('')
  const [requestUpazila,setRequestUpazila]=useState('')
  const [requestArea,setRequestArea]=useState('')
  const [neededAt,setNeededAt]=useState('')
  const [urgency,setUrgency]=useState<'critical'|'urgent'|'normal'>('urgent')
  const [contactMethod,setContactMethod]=useState<PreferredContact>('in_app')
  const [requestNote,setRequestNote]=useState('')

  async function load() {
    const s=createClient()
    const {data:auth}=await s.auth.getUser()
    if(!auth.user){window.location.replace(ROUTES.auth.login+'?next='+encodeURIComponent('/care/blood'));return}
    const [p,d,ds,rs,ls]=await Promise.all([
      s.from('profiles').select('id,full_name,phone,date_of_birth,upazila_id,area_text').eq('id',auth.user.id).maybeSingle(),
      s.from('fenix_blood_donors').select('user_id,blood_group,upazila_id,area_text,availability,last_donation_date,preferred_contact,is_public,note,gender,emergency_available').eq('user_id',auth.user.id).maybeSingle(),
      s.from('fenix_public_blood_donors').select('user_id,username,full_name,avatar_url,blood_group,area_text,upazila_bn,upazila_en,availability,last_donation_date,preferred_contact,gender,emergency_available,public_whatsapp').order('emergency_available',{ascending:false}).order('full_name',{ascending:true}).limit(60),
      s.from('fenix_public_blood_requests').select('id,blood_group,units,hospital_name,hospital_area,upazila_bn,upazila_en,area_text,needed_at,urgency,status,created_at').order('created_at',{ascending:false}).limit(60),
      s.from('fenix_brain_locations').select('id,name_bn,name_en').eq('is_active',true).eq('level','upazila').order('name_en'),
    ])
    const pp=p.data as Profile|null
    setProfile(pp)
    if(pp){
      setFullName(pp.full_name??'');setPhone(pp.phone??'');setDateOfBirth(pp.date_of_birth??'');setUpazilaId(pp.upazila_id??'');setAreaText(pp.area_text??'')
      setRequestUpazila(pp.upazila_id??'');setRequestArea(pp.area_text??'')
    }
    if(d.data){
      const x=d.data as Donor;setBloodGroup(x.blood_group);setGender(x.gender??'');setUpazilaId(x.upazila_id??pp?.upazila_id??'');setAreaText(x.area_text??pp?.area_text??'');setAvailability(x.availability);setLastDonationDate(x.last_donation_date??'');setPreferredContact(x.preferred_contact);setEmergencyAvailable(x.emergency_available);setDonorNote(x.note??'')
    }
    setDonors((ds.data??[]) as PublicDonor[]);setRequests((rs.data??[]) as BloodRequest[]);setLocations((ls.data??[]) as typeof locations);setLoading(false)
  }

  useEffect(()=>{void load()},[])

  const donorComplete=Boolean(fullName.trim().length>=2&&phone.trim().length>=7&&/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)&&gender&&bloodGroup&&upazilaId&&areaText.trim().length>=2)
  const filtered=useMemo(()=>filter?donors.filter(x=>x.blood_group===filter):donors,[donors,filter])

  async function saveDonor(){
    if(!profile)return
    if(!donorComplete){setNotice(bn?'সব required তথ্য পূরণ করলে automatic verification হবে।':'Complete all required fields for automatic verification.');return}
    if(dateOfBirth>new Date().toISOString().slice(0,10)){setNotice(bn?'জন্মতারিখ ভবিষ্যতের হতে পারবে না।':'Date of birth cannot be in the future.');return}
    setSavingDonor(true);setNotice('')
    const s=createClient()
    const {error:pe}=await s.from('profiles').update({full_name:fullName.trim().slice(0,160),phone:phone.trim().slice(0,40),date_of_birth:dateOfBirth}).eq('id',profile.id)
    if(pe){setSavingDonor(false);setNotice(bn?'Main Profile update হয়নি।':'Main Profile could not be updated.');return}
    const {error:de}=await s.from('fenix_blood_donors').upsert({user_id:profile.id,blood_group:bloodGroup,upazila_id:upazilaId||null,area_text:areaText.trim().slice(0,200)||null,availability,last_donation_date:lastDonationDate||null,preferred_contact:preferredContact,is_public:true,note:donorNote.trim().slice(0,500)||null,gender,emergency_available:emergencyAvailable,updated_at:new Date().toISOString()},{onConflict:'user_id'})
    setSavingDonor(false)
    if(de){setNotice(bn?'Donor profile save হয়নি।':'Donor profile could not be saved.');return}
    setNotice(bn?'✅ Donor profile automatic verified হয়েছে।':'✅ Donor profile automatically verified.')
    await load()
  }

  async function createRequest(){
    if(!profile)return
    const units=Number(requestUnits)
    if(!hospitalName.trim()||!Number.isInteger(units)||units<1||units>20){setNotice(bn?'Hospital এবং 1–20 units দিন।':'Enter hospital and 1–20 units.');return}
    setSavingRequest(true);setNotice('')
    const s=createClient()
    const {error}=await s.from('fenix_blood_requests').insert({requester_id:profile.id,blood_group:requestGroup,units,hospital_name:hospitalName.trim().slice(0,180),hospital_area:hospitalArea.trim().slice(0,180)||null,upazila_id:requestUpazila||null,area_text:requestArea.trim().slice(0,200)||null,needed_at:neededAt?new Date(neededAt).toISOString():null,urgency,contact_method:contactMethod,note:requestNote.trim().slice(0,1000)||null})
    setSavingRequest(false)
    if(error){setNotice(bn?'Blood request তৈরি হয়নি।':'Could not create the blood request.');return}
    setNotice(bn?'Blood request প্রকাশিত হয়েছে।':'Blood request published.');setHospitalName('');setHospitalArea('');setNeededAt('');setRequestNote('');await load()
  }

  async function respond(id:string){
    if(!profile)return
    setRespondingId(id)
    const s=createClient()
    const {error}=await s.from('fenix_blood_responses').upsert({request_id:id,donor_id:profile.id,message:bn?'আমি রক্ত দিতে আগ্রহী।':'I am interested in donating.'},{onConflict:'request_id,donor_id'})
    setRespondingId(null);setNotice(error?(bn?'Response পাঠানো যায়নি।':'Could not send response.'):(bn?'Requester-কে response পাঠানো হয়েছে।':'Your response was sent to the requester.'))
  }

  if(loading)return <main className="fenix-shell min-h-dvh"><Navbar/><section className="mx-auto max-w-5xl px-4 py-16"><div className="fenix-surface-strong rounded-[2rem] p-8 text-sm">{bn?'রক্তদান ব্যবস্থা লোড হচ্ছে…':'Loading blood donation…'}</div></section></main>

  return <main className="fenix-shell min-h-dvh"><Navbar/><section className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
    <header className="fenix-surface-strong rounded-[2rem] p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="fenix-kicker">{bn?'জরুরি সহায়তা':'Emergency care'}</p><h1 className="mt-2 text-3xl font-black tracking-[-.05em] sm:text-5xl">{bn?'রক্তদাতা ও রক্তের অনুরোধ':'Blood donors & requests'}</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">{bn?'Main Profile-এর তথ্য auto-fill করে দ্রুত donor registration করুন।':'Register faster using your Main Profile data.'}</p></div><Link href={ROUTES.emergency} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold"><WarningCircle size={16}/> {bn?'Emergency':'Emergency'}</Link></div>
      {notice&&<div className="mt-5 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] p-4 text-sm">{notice}</div>}
    </header>

    <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
      <article className="fenix-surface-strong rounded-[2rem] p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="fenix-kicker">Donor registration</p><h2 className="mt-2 text-2xl font-black">{bn?'রক্তদাতা হিসেবে নিবন্ধন':'Become a donor'}</h2></div>{donorComplete&&<span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 text-[10px] font-black text-[var(--fx-primary-strong)]"><ShieldCheck size={14}/> {bn?'Auto verified':'Auto verified'}</span>}</div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label={bn?'নাম':'Name'} value={fullName} onChange={setFullName}/><Field label={bn?'মোবাইল':'Phone'} value={phone} onChange={setPhone} type="tel"/><DateField label={bn?'জন্মতারিখ':'Date of birth'} value={dateOfBirth} onChange={setDateOfBirth}/><SelectField label={bn?'লিঙ্গ':'Gender'} value={gender} onChange={v=>setGender(v as Gender)} options={[['','Select'],['male',bn?'পুরুষ':'Male'],['female',bn?'নারী':'Female'],['other',bn?'অন্যান্য':'Other'],['prefer_not_to_say',bn?'বলতে চাই না':'Prefer not to say']]}/><SelectField label={bn?'রক্তের গ্রুপ':'Blood group'} value={bloodGroup} onChange={v=>setBloodGroup(v as BloodGroup)} options={GROUPS.map(x=>[x,x])}/><SelectField label={bn?'উপজেলা':'Upazila'} value={upazilaId} onChange={setUpazilaId} options={[['',bn?'উপজেলা বাছাই':'Choose upazila'],...locations.map(x=>[x.id,bn?x.name_bn:(x.name_en||x.name_bn)])]}/><Field label={bn?'পাড়া/এলাকা':'Area'} value={areaText} onChange={setAreaText}/><DateField label={bn?'শেষ রক্তদানের তারিখ':'Last donation date'} value={lastDonationDate} onChange={setLastDonationDate} optional/><SelectField label={bn?'Availability':'Availability'} value={availability} onChange={v=>setAvailability(v as Availability)} options={[['available',bn?'Available':'Available'],['paused',bn?'Paused':'Paused'],['unavailable',bn?'Unavailable':'Unavailable']]}/><SelectField label={bn?'যোগাযোগের মাধ্যম':'Preferred contact'} value={preferredContact} onChange={v=>setPreferredContact(v as PreferredContact)} options={[['in_app','FeniX message'],['phone','Phone'],['whatsapp','WhatsApp']]}/>
      </div>
      <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--fx-border)] p-3 text-xs font-bold"><input type="checkbox" checked={emergencyAvailable} onChange={e=>setEmergencyAvailable(e.target.checked)}/><span>{bn?'জরুরি donor alert নিতে চাই':'Available for emergency donor alerts'}</span></label>
      <label className="mt-4 block"><span className="text-xs font-bold">{bn?'নোট':'Note'}</span><textarea value={donorNote} onChange={e=>setDonorNote(e.target.value)} maxLength={500} rows={3} className="mt-2 w-full rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3 text-sm"/></label>
      <p className="mt-3 text-[11px] leading-5 text-[var(--fx-muted)]">{bn?'FeniX verification শুধু registration completeness বোঝায়; medical eligibility hospital/qualified professional-এর কাছে নিশ্চিত করুন।':'FeniX verification only confirms registration completeness; confirm medical eligibility with a hospital or qualified professional.'}</p>
      <button type="button" disabled={savingDonor} onClick={()=>void saveDonor()} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-bold text-white disabled:opacity-50"><CheckCircle size={18}/>{savingDonor?(bn?'সংরক্ষণ হচ্ছে…':'Saving…'):(bn?'Donor profile save করুন':'Save donor profile')}</button>
      </article>

      <aside className="fenix-surface-strong rounded-[2rem] p-5 sm:p-7"><p className="fenix-kicker">{bn?'Status':'Status'}</p><div className="mt-3 rounded-2xl border border-[var(--fx-border)] p-4"><div className="flex justify-between text-sm font-bold"><span>{bn?'Automatic verification':'Automatic verification'}</span><span className="text-[var(--fx-primary-strong)]">{donorComplete?'Verified':'Incomplete'}</span></div><p className="mt-3 text-xs leading-5 text-[var(--fx-muted)]">{bn?'Required তথ্য পূর্ণ হলে admin approval ছাড়া verified হবে।':'A complete form becomes verified without admin approval.'}</p></div>{lastDonationDate&&<div className="mt-4 rounded-2xl border border-[var(--fx-border)] p-4 text-xs"><strong>{bn?'শেষ donation':'Last donation'}:</strong> {lastDonationDate}<p className="mt-1 text-[var(--fx-muted)]">{bn?'পরবর্তী donation-এর আগে medical eligibility নিশ্চিত করুন।':'Confirm medical eligibility before donating again.'}</p></div>}</aside>
    </section>

    <section className="mt-5 fenix-surface-strong rounded-[2rem] p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="fenix-kicker">{bn?'Donor list':'Donor list'}</p><h2 className="mt-2 text-2xl font-black">{bn?'Available donors':'Available donors'}</h2></div><select value={filter} onChange={e=>setFilter(e.target.value as BloodGroup|'')} className="h-10 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-xs font-bold"><option value="">{bn?'সব group':'All groups'}</option>{GROUPS.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map(d=><article key={d.user_id} className="rounded-2xl border border-[var(--fx-border)] p-4"><div className="flex items-center gap-3">{d.avatar_url?<img src={d.avatar_url} alt="" className="h-12 w-12 rounded-2xl object-cover"/>:<div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-lg">🩸</div>}<div className="min-w-0"><h3 className="truncate text-sm font-black">{d.full_name||'FeniX Donor'}</h3><p className="text-[11px] text-[var(--fx-muted)]">@{d.username||'donor'} · {d.blood_group}</p></div>{d.emergency_available?<span className="ml-auto">🚨</span>:null}</div><div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-bold"><span className="rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[var(--fx-primary-strong)]">🩸 {bn?'Verified Donor':'Verified Donor'}</span>{(d.upazila_bn||d.upazila_en)&&<span className="rounded-full border border-[var(--fx-border)] px-2.5 py-1">{bn?(d.upazila_bn||d.upazila_en):(d.upazila_en||d.upazila_bn)}</span>}</div>{d.area_text&&<p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--fx-muted)]"><MapPin size={14}/>{d.area_text}</p>}<div className="mt-3 flex flex-wrap gap-2"><MessageButton userId={d.user_id} name={d.full_name||'FeniX Donor'} label={bn?'Message':'Message'} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[var(--fx-primary-strong)] px-3 text-[10px] font-bold text-white"/>{d.public_whatsapp&&<a href={d.public_whatsapp.startsWith('http')?d.public_whatsapp:'https://wa.me/'+d.public_whatsapp.replace(/\D/g,'')} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-3 text-[10px] font-bold"><WhatsappLogo size={13}/>WhatsApp</a>}</div></article>)}{!filtered.length&&<div className="rounded-2xl border border-dashed border-[var(--fx-border)] p-8 text-center text-sm text-[var(--fx-muted)]">{bn?'কোনো available donor পাওয়া যায়নি।':'No available donor found.'}</div>}</div>
    </section>

    <section className="mt-5 grid gap-5 lg:grid-cols-2">
      <article className="fenix-surface-strong rounded-[2rem] p-5 sm:p-7"><p className="fenix-kicker">{bn?'Blood request':'Blood request'}</p><h2 className="mt-2 text-2xl font-black">{bn?'রক্তের প্রয়োজন জানান':'Request blood'}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><SelectField label={bn?'Blood group':'Blood group'} value={requestGroup} onChange={v=>setRequestGroup(v as BloodGroup)} options={GROUPS.map(x=>[x,x])}/><Field label={bn?'Units':'Units'} value={requestUnits} onChange={setRequestUnits} type="number"/><Field label={bn?'Hospital':'Hospital'} value={hospitalName} onChange={setHospitalName}/><Field label={bn?'Hospital area':'Hospital area'} value={hospitalArea} onChange={setHospitalArea}/><SelectField label={bn?'উপজেলা':'Upazila'} value={requestUpazila} onChange={setRequestUpazila} options={[['',bn?'উপজেলা বাছাই':'Choose upazila'],...locations.map(x=>[x.id,bn?x.name_bn:(x.name_en||x.name_bn)])]}/><Field label={bn?'এলাকা':'Area'} value={requestArea} onChange={setRequestArea}/><DateTimeField label={bn?'কখন প্রয়োজন':'Needed at'} value={neededAt} onChange={setNeededAt}/><SelectField label={bn?'Urgency':'Urgency'} value={urgency} onChange={v=>setUrgency(v as 'critical'|'urgent'|'normal')} options={[['critical','Critical'],['urgent','Urgent'],['normal','Normal']]}/><SelectField label={bn?'Contact method':'Contact method'} value={contactMethod} onChange={v=>setContactMethod(v as PreferredContact)} options={[['in_app','FeniX message'],['phone','Phone'],['whatsapp','WhatsApp']]}/></div><label className="mt-4 block"><span className="text-xs font-bold">{bn?'নোট':'Note'}</span><textarea value={requestNote} onChange={e=>setRequestNote(e.target.value)} maxLength={1000} rows={3} className="mt-2 w-full rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3 text-sm"/></label><button type="button" disabled={savingRequest} onClick={()=>void createRequest()} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-5 text-sm font-bold"><PlusCircle size={18}/>{savingRequest?(bn?'প্রকাশ হচ্ছে…':'Publishing…'):(bn?'Request প্রকাশ করুন':'Publish blood request')}</button></article>
      <article className="fenix-surface-strong rounded-[2rem] p-5 sm:p-7"><div className="flex items-end justify-between gap-3"><div><p className="fenix-kicker">{bn?'Open requests':'Open requests'}</p><h2 className="mt-2 text-2xl font-black">{bn?'যাদের রক্ত দরকার':'People who need blood'}</h2></div><button type="button" onClick={()=>void load()} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-3 text-[10px] font-bold"><ArrowClockwise size={13}/>Refresh</button></div><div className="mt-5 space-y-3">{requests.map(r=><article key={r.id} className="rounded-2xl border border-[var(--fx-border)] p-4"><div className="flex justify-between gap-3"><div><span className="text-lg font-black">{r.blood_group}</span><span className="ml-2 rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[10px] font-bold">{r.units} unit{r.units===1?'':'s'}</span></div><span className="text-[10px] font-black uppercase">{r.urgency}</span></div><h3 className="mt-3 text-sm font-black">{r.hospital_name}</h3><p className="mt-1 text-xs text-[var(--fx-muted)]">{[r.hospital_area,r.upazila_bn||r.upazila_en,r.area_text].filter(Boolean).join(' · ')}</p>{r.needed_at&&<p className="mt-2 text-[10px] text-[var(--fx-muted)]">Needed: {new Date(r.needed_at).toLocaleString(bn?'bn-BD':'en-BD')}</p>}<button type="button" disabled={respondingId===r.id} onClick={()=>void respond(r.id)} className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[var(--fx-primary-strong)] px-3 text-[10px] font-bold text-white disabled:opacity-50"><ChatCircleDots size={14}/>{respondingId===r.id?(bn?'পাঠানো হচ্ছে…':'Sending…'):(bn?'আমি রক্ত দিতে পারি':'I can donate')}</button></article>)}{!requests.length&&<div className="rounded-2xl border border-dashed border-[var(--fx-border)] p-8 text-center text-sm text-[var(--fx-muted)]">{bn?'এখন কোনো open request নেই।':'No open requests right now.'}</div>}</div></article>
    </section>
  </section></main>
}

function Field({label,value,onChange,type='text'}:{label:string;value:string;onChange:(v:string)=>void;type?:string}){return <label className="block"><span className="text-xs font-bold">{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm outline-none"/></label>}
function DateField({label,value,onChange,optional=false}:{label:string;value:string;onChange:(v:string)=>void;optional?:boolean}){return <label className="block"><span className="text-xs font-bold">{label}{optional?' · optional':''}</span><input type="date" value={value} max={new Date().toISOString().slice(0,10)} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm outline-none"/></label>}
function DateTimeField({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="block"><span className="text-xs font-bold">{label}</span><input type="datetime-local" value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm outline-none"/></label>}
function SelectField({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[][]}){return <label className="block"><span className="text-xs font-bold">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>}

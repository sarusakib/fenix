'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle, MapPin, Phone, ShieldCheck, Van } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

const ambulanceTypes = [['general','General'],['icu','ICU'],['neonatal','Neonatal'],['patient_transport','Patient transport']]
type Provider = { id:string; display_name:string; phone:string|null; whatsapp:string|null; base_area:string|null; service_area:string|null; ambulance_type:string; ac_available:boolean; oxygen_available:boolean; available_24_7:boolean; is_verified:boolean }
type LocationRow = { id:string; name_bn:string; name_en:string|null }

export default function AmbulancePage() {
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'
  const [providers,setProviders]=useState<Provider[]>([])
  const [upazilas,setUpazilas]=useState<LocationRow[]>([])
  const [pickupArea,setPickupArea]=useState('')
  const [pickupUpazila,setPickupUpazila]=useState('')
  const [destination,setDestination]=useState('')
  const [condition,setCondition]=useState('other')
  const [type,setType]=useState('general')
  const [oxygen,setOxygen]=useState(false)
  const [note,setNote]=useState('')
  const [providerName,setProviderName]=useState('')
  const [providerPhone,setProviderPhone]=useState('')
  const [providerWhatsapp,setProviderWhatsapp]=useState('')
  const [providerBase,setProviderBase]=useState('')
  const [providerServiceArea,setProviderServiceArea]=useState('')
  const [providerAc,setProviderAc]=useState(false)
  const [providerOxygen,setProviderOxygen]=useState(false)
  const [provider247,setProvider247]=useState(false)
  const [status,setStatus]=useState('')
  const [busy,setBusy]=useState(false)

  const load = async () => {
    const s=createClient()
    const [{data:rows},{data:locs}]=await Promise.all([
      s.from('fenix_public_ambulance_providers').select('*').order('is_verified',{ascending:false}).order('display_name',{ascending:true}).limit(50),
      s.from('fenix_brain_locations').select('id,name_bn,name_en').eq('is_active',true).eq('level','upazila').order('name_bn',{ascending:true}),
    ])
    setProviders((rows??[]) as Provider[])
    setUpazilas((locs??[]) as LocationRow[])
  }
  useEffect(()=>{void load()},[])

  async function requestAmbulance() {
    setBusy(true);setStatus('')
    const s=createClient();const {data:auth}=await s.auth.getUser()
    if(!auth.user){window.location.href='/login?next=/care/ambulance';return}
    const {error}=await s.from('fenix_ambulance_requests').insert({
      requester_id:auth.user.id,pickup_area:pickupArea.trim(),pickup_upazila_id:pickupUpazila||null,
      destination_hospital:destination.trim()||null,condition_category:condition,ambulance_type:type,oxygen_needed:oxygen,note:note.trim()||null,
    })
    setStatus(error?(bn?'Ambulance request save হয়নি।':'Ambulance request could not be saved.'):(bn?'Ambulance request পাঠানো হয়েছে।':'Ambulance request sent.'))
    if(!error){setPickupArea('');setDestination('');setNote('')}
    setBusy(false)
  }

  async function registerProvider() {
    setBusy(true);setStatus('')
    const s=createClient();const {data:auth}=await s.auth.getUser()
    if(!auth.user){window.location.href='/login?next=/care/ambulance';return}
    const {error}=await s.from('fenix_ambulance_providers').insert({
      owner_id:auth.user.id,display_name:providerName.trim(),phone:providerPhone.trim()||null,whatsapp:providerWhatsapp.trim()||null,
      base_area:providerBase.trim()||null,service_area:providerServiceArea.trim()||null,ambulance_type:type,ac_available:providerAc,
      oxygen_available:providerOxygen,available_24_7:provider247,
    })
    setStatus(error?(bn?'Provider register হয়নি।':'Provider could not be registered.'):(bn?'Provider information save হয়েছে। Admin verification-এর পর trusted label আসবে।':'Provider saved. A trusted/verified label is shown only after review.'))
    if(!error){setProviderName('');setProviderPhone('');setProviderWhatsapp('');await load()}
    setBusy(false)
  }

  return <main className="min-h-dvh bg-[var(--fx-bg)]">
    <Navbar/>
    <section className="mx-auto max-w-6xl px-4 pb-28 pt-7 sm:px-6">
      <Link href="/care" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/>Care</Link>
      <div className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]"><Van size={18}/>Ambulance</div>
        <h1 className="mt-3 text-3xl font-black sm:text-5xl">{bn?'Ambulance খুঁজুন বা request দিন':'Find an ambulance or request one'}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">{bn?'Current availability অবশ্যই provider-এর সাথে confirm করুন। FeniX dispatch system নয়।':'Always confirm current availability with the provider. FeniX is not a dispatch service.'}</p>
        {status&&<div className="mt-4 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-sm">{status}</div>}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="flex items-center gap-2"><CheckCircle size={18} className="text-[var(--fx-primary-strong)]"/><h2 className="font-black">Active providers</h2></div>
            <div className="mt-3 grid gap-3">
              {providers.length?providers.map((p)=><article key={p.id} className="rounded-2xl border border-[var(--fx-border)] p-4">
                <div className="flex items-start justify-between gap-3"><div><div className="text-base font-black">{p.display_name}</div><div className="mt-1 text-xs text-[var(--fx-muted)]">{[p.base_area,p.service_area].filter(Boolean).join(' · ')}</div></div>{p.is_verified&&<span className="rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[10px] font-black text-[var(--fx-primary-strong)]">Verified</span>}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px]"><span className="rounded-full border border-[var(--fx-border)] px-2.5 py-1">{p.ambulance_type}</span>{p.oxygen_available&&<span className="rounded-full border border-[var(--fx-border)] px-2.5 py-1">Oxygen</span>}{p.ac_available&&<span className="rounded-full border border-[var(--fx-border)] px-2.5 py-1">AC</span>}{p.available_24_7&&<span className="rounded-full border border-[var(--fx-border)] px-2.5 py-1">24/7</span>}</div>
                <div className="mt-4 flex flex-wrap gap-2">{p.phone&&<a href={'tel:'+p.phone} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-3 text-xs font-bold"><Phone size={14}/>Call</a>}{p.whatsapp&&<a href={'https://wa.me/'+p.whatsapp.replace(/\D/g,'')} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-3 text-xs font-bold">WhatsApp</a>}</div>
              </article>):<div className="rounded-2xl border border-dashed border-[var(--fx-border)] p-8 text-center text-sm text-[var(--fx-muted)]">{bn?'এখনো registered ambulance provider নেই।':'No registered ambulance providers yet.'}</div>}
            </div>
          </div>

          <form onSubmit={(e)=>{e.preventDefault();void requestAmbulance()}} className="rounded-2xl border border-[var(--fx-border)] p-4">
            <div className="flex items-center gap-2"><MapPin size={18} className="text-[var(--fx-primary-strong)]"/><h2 className="font-black">{bn?'Ambulance request':'Request an ambulance'}</h2></div>
            <div className="mt-4 grid gap-3">
              <Field label="Pickup area" value={pickupArea} onChange={setPickupArea} required/>
              <Select label="Pickup upazila" value={pickupUpazila} onChange={setPickupUpazila} options={[['','Select'],...upazilas.map(x=>[x.id,x.name_bn]) ]}/>
              <Field label="Destination hospital" value={destination} onChange={setDestination}/>
              <Select label="Patient condition" value={condition} onChange={setCondition} options={[['critical','Critical'],['accident','Accident'],['maternal','Maternal'],['child','Child'],['stable','Stable'],['other','Other']]}/>
              <Select label="Ambulance type" value={type} onChange={setType} options={ambulanceTypes}/>
              <label className="flex items-center gap-3 rounded-xl border border-[var(--fx-border)] p-3"><input type="checkbox" checked={oxygen} onChange={(e)=>setOxygen(e.target.checked)}/><span className="text-sm">{bn?'Oxygen প্রয়োজন':'Oxygen needed'}</span></label>
              <textarea value={note} onChange={(e)=>setNote(e.target.value)} maxLength={1000} rows={3} placeholder={bn?'অতিরিক্ত তথ্য':'Additional note'} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-6"/>
              <button type="submit" disabled={busy||!pickupArea.trim()} className="min-h-11 rounded-xl bg-[var(--fx-primary-strong)] text-sm font-bold text-white disabled:opacity-40">{busy?'Saving…':(bn?'Request পাঠান':'Send request')}</button>
            </div>
          </form>
        </div>

        <details className="mt-8 rounded-2xl border border-[var(--fx-border)] p-4">
          <summary className="cursor-pointer text-sm font-black">{bn?'Ambulance provider হিসেবে register করুন':'Register as an ambulance provider'}</summary>
          <form onSubmit={(e)=>{e.preventDefault();void registerProvider()}} className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Provider name" value={providerName} onChange={setProviderName} required/>
            <Field label="Phone" value={providerPhone} onChange={setProviderPhone}/>
            <Field label="WhatsApp" value={providerWhatsapp} onChange={setProviderWhatsapp}/>
            <Field label="Base area" value={providerBase} onChange={setProviderBase}/>
            <Field label="Service area" value={providerServiceArea} onChange={setProviderServiceArea}/>
            <Select label="Ambulance type" value={type} onChange={setType} options={ambulanceTypes}/>
            <label className="flex items-center gap-3 rounded-xl border border-[var(--fx-border)] p-3"><input type="checkbox" checked={providerAc} onChange={(e)=>setProviderAc(e.target.checked)}/><span className="text-sm">AC</span></label>
            <label className="flex items-center gap-3 rounded-xl border border-[var(--fx-border)] p-3"><input type="checkbox" checked={providerOxygen} onChange={(e)=>setProviderOxygen(e.target.checked)}/><span className="text-sm">Oxygen</span></label>
            <label className="flex items-center gap-3 rounded-xl border border-[var(--fx-border)] p-3"><input type="checkbox" checked={provider247} onChange={(e)=>setProvider247(e.target.checked)}/><span className="text-sm">24/7</span></label>
            <div className="md:col-span-2"><button type="submit" disabled={busy||!providerName.trim()} className="min-h-11 rounded-xl border border-[var(--fx-border)] px-4 text-sm font-bold">{busy?'Saving…':'Save provider'}</button></div>
          </form>
        </details>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--fx-border)] p-4 text-xs leading-5 text-[var(--fx-muted)]"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-[var(--fx-primary-strong)]"/><span>{bn?'Verified label admin review ছাড়া দেখাবে না। Provider-এর phone/WhatsApp প্রকাশ করা তাদের listing-এর অংশ।':'A verified label appears only after review. Provider phone/WhatsApp are displayed only as provider listing contact information.'}</span></div>
      </div>
    </section>
  </main>
}

function Field({label,value,onChange,required=false}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean}){
  return <label><span className="text-xs font-bold">{label}</span><input required={required} value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-transparent px-3 text-sm outline-none"/></label>
}
function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[][]}){
  return <label><span className="text-xs font-bold">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
}

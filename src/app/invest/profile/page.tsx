'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { INVESTMENT_CATEGORIES, UPZILAS } from '@/lib/investment'

export default function InvestmentProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({
    investor_type: 'individual', bio: '', min_budget: '0', max_budget: '0',
    preferred_sectors: [] as string[], preferred_upazilas: [] as string[],
    risk_preference: 'medium', horizon_months: '', shariah_preference: 'not_specified',
  })
  const [verificationStatus, setVerificationStatus] = useState('unverified')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) {
        router.replace('/login?next=/invest/profile')
        return
      }
      setUserId(auth.user.id)
      const { data } = await s.from('investment_profiles').select('*').eq('user_id', auth.user.id).maybeSingle()
      if (data) {
        setForm({
          investor_type: data.investor_type,
          bio: data.bio ?? '',
          min_budget: String(data.min_budget ?? 0),
          max_budget: String(data.max_budget ?? 0),
          preferred_sectors: data.preferred_sectors ?? [],
          preferred_upazilas: data.preferred_upazilas ?? [],
          risk_preference: data.risk_preference,
          horizon_months: data.horizon_months ? String(data.horizon_months) : '',
          shariah_preference: data.shariah_preference,
        })
        setVerificationStatus(data.verification_status)
      }
    }
    void load()
  }, [router])

  function toggle(list: 'preferred_sectors' | 'preferred_upazilas', value: string) {
    setForm((current) => ({
      ...current,
      [list]: current[list].includes(value) ? current[list].filter((item) => item !== value) : [...current[list], value],
    }))
  }

  async function save() {
    setMessage('')
    setBusy(true)
    const s = createClient()
    const min = Math.max(0, Number(form.min_budget) || 0)
    const max = Math.max(min, Number(form.max_budget) || 0)
    const { error } = await s.from('investment_profiles').upsert({
      user_id: userId,
      investor_type: form.investor_type,
      bio: form.bio.trim() || null,
      min_budget: min,
      max_budget: max,
      preferred_sectors: form.preferred_sectors,
      preferred_upazilas: form.preferred_upazilas,
      risk_preference: form.risk_preference,
      horizon_months: form.horizon_months ? Math.min(240, Math.max(1, Number(form.horizon_months) || 1)) : null,
      shariah_preference: form.shariah_preference,
    })
    if (error) setMessage(error.message)
    else setMessage('Investor profile saved. Smart matching is now available.')
    setBusy(false)
  }

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-4 text-sm dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17} /> Investment</Link>
        <div className="mt-7 rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045] sm:p-9">
          <div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008080]/[.08] text-[#008080]"><UserCircle size={24} /></div><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Investor</p><h1 className="mt-1 text-3xl font-black">Investment profile</h1><p className="mt-2 text-sm leading-6 opacity-55">Tell FeniX what you are looking for. Matching reflects stated preferences; it does not predict returns.</p></div></div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Select label="Investor type" value={form.investor_type} onChange={(v)=>setForm(c=>({...c,investor_type:v}))} options={['individual','business','organization']} />
            <Select label="Risk preference" value={form.risk_preference} onChange={(v)=>setForm(c=>({...c,risk_preference:v}))} options={['low','medium','high','any']} />
            <Field label="Minimum budget (BDT)" value={form.min_budget} onChange={(v)=>setForm(c=>({...c,min_budget:v}))} />
            <Field label="Maximum budget (BDT)" value={form.max_budget} onChange={(v)=>setForm(c=>({...c,max_budget:v}))} />
            <Field label="Investment horizon (months)" value={form.horizon_months} onChange={(v)=>setForm(c=>({...c,horizon_months:v}))} />
            <Select label="Shariah preference" value={form.shariah_preference} onChange={(v)=>setForm(c=>({...c,shariah_preference:v}))} options={['not_specified','preferred','not_required']} />
            <label className="block md:col-span-2"><span className="mb-2 block text-xs font-semibold opacity-60">About you</span><textarea value={form.bio} onChange={(e)=>setForm(c=>({...c,bio:e.target.value}))} rows={5} maxLength={2000} className="w-full rounded-xl border border-[#0b1736]/10 bg-transparent p-3 text-sm leading-6 dark:border-white/10" placeholder="Experience, sectors you understand, and what kind of opportunities interest you..." /></label>
          </div>

          <ChoiceGroup title="Preferred sectors" values={[...INVESTMENT_CATEGORIES]} selected={form.preferred_sectors} onToggle={(v)=>toggle('preferred_sectors',v)} />
          <ChoiceGroup title="Preferred Feni areas" values={[...UPZILAS]} selected={form.preferred_upazilas} onToggle={(v)=>toggle('preferred_upazilas',v)} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"><button disabled={busy || !userId} onClick={()=>void save()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#008080] px-5 text-sm font-bold text-white disabled:opacity-50"><CheckCircle size={18}/>{busy?'Saving...':'Save investor profile'}</button><span className="text-xs opacity-50">Verification status: <strong>{verificationStatus}</strong></span></div>
          {message && <div className="mt-5 rounded-xl border border-[#008080]/15 bg-[#008080]/[.05] p-4 text-sm">{message}</div>}
        </div>
      </section>
    </main>
  )
}

const input="h-12 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"
function Field({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="block"><span className="mb-2 block text-xs font-semibold opacity-60">{label}</span><input type="number" min="0" value={value} onChange={(e)=>onChange(e.target.value)} className={input}/></label>}
function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}){return <label className="block"><span className="mb-2 block text-xs font-semibold opacity-60">{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)} className={input}>{options.map((x)=><option key={x} value={x}>{x.replaceAll('_',' ')}</option>)}</select></label>}
function ChoiceGroup({title,values,selected,onToggle}:{title:string;values:string[];selected:string[];onToggle:(value:string)=>void}){return <div className="mt-7"><p className="mb-3 text-xs font-semibold opacity-60">{title}</p><div className="flex flex-wrap gap-2">{values.map(value=><button type="button" key={value} onClick={()=>onToggle(value)} className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${selected.includes(value)?'bg-[#008080] text-white':'bg-black/[.035] dark:bg-white/[.04]'}`}>{value}</button>)}</div></div>}

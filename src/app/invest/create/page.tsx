'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, FileText, Rocket } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { INVESTMENT_CATEGORIES, OFFER_TYPES, RISK_LEVELS, UPZILAS, moneyInput } from '@/lib/investment'

export default function InvestmentCreatePage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({
    title_bn: '', title_en: '', description_bn: '', description_en: '',
    category: 'Agriculture', district: 'Feni', upazila: 'Feni Sadar', location_details: '',
    target_amount: '', min_investment: '', offer_type: 'partnership',
    ownership_percentage: '', expected_return_pct: '', expected_term_months: '',
    risk_level: 'medium', shariah_preference: 'not_specified', risk_disclosure: '',
    funding_deadline: '', business_id: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) {
        router.replace('/login?next=/invest/create')
        return
      }
      setUserId(auth.user.id)
      const { data } = await s.from('businesses').select('id,name').eq('owner_id', auth.user.id).order('name')
      setBusinesses((data ?? []) as { id: string; name: string }[])
    }
    void load()
  }, [router])

  function set(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit() {
    setError('')
    if (!userId) return
    const target = Number(form.target_amount)
    const minimum = Number(form.min_investment)
    const ownership = form.ownership_percentage ? Number(form.ownership_percentage) : null
    const expectedReturn = form.expected_return_pct ? Number(form.expected_return_pct) : null
    const term = form.expected_term_months ? Number(form.expected_term_months) : null

    if (!form.title_bn.trim() || !form.title_en.trim() || form.description_bn.trim().length < 30 || form.description_en.trim().length < 30) {
      setError('Title এবং description পূর্ণভাবে দিন।')
      return
    }
    if (!Number.isFinite(target) || target <= 0 || !Number.isFinite(minimum) || minimum <= 0 || minimum > target) {
      setError('Target এবং minimum investment সঠিকভাবে দিন।')
      return
    }
    if (ownership != null && (ownership < 0 || ownership > 100)) {
      setError('Ownership percentage 0–100 এর মধ্যে দিন।')
      return
    }
    if (expectedReturn != null && expectedReturn < 0) {
      setError('Expected return negative হতে পারবে না।')
      return
    }
    if (term != null && (!Number.isInteger(term) || term < 1 || term > 240)) {
      setError('Term 1–240 months এর মধ্যে দিন।')
      return
    }
    if (form.risk_disclosure.trim().length < 20) {
      setError('Risk disclosure কমপক্ষে 20 characters দিন।')
      return
    }

    setBusy(true)
    const s = createClient()
    const { data, error: insertError } = await s.from('investment_opportunities').insert({
      owner_id: userId,
      business_id: form.business_id || null,
      title_bn: form.title_bn.trim(),
      title_en: form.title_en.trim(),
      description_bn: form.description_bn.trim(),
      description_en: form.description_en.trim(),
      category: form.category,
      district: form.district.trim() || 'Feni',
      upazila: form.upazila || null,
      location_details: form.location_details.trim() || null,
      target_amount: target,
      min_investment: minimum,
      offer_type: form.offer_type,
      ownership_percentage: ownership,
      expected_return_pct: expectedReturn,
      expected_term_months: term,
      risk_level: form.risk_level,
      shariah_preference: form.shariah_preference,
      risk_disclosure: form.risk_disclosure.trim(),
      funding_deadline: form.funding_deadline || null,
      status: 'draft',
      verification_status: 'unverified',
    }).select('id').single()

    if (insertError || !data) {
      setError(insertError?.message || 'Opportunity create করা যায়নি।')
      setBusy(false)
      return
    }

    const { error: submitError } = await s.rpc('submit_investment_opportunity', { p_opportunity_id: data.id })
    if (submitError) {
      setError(submitError.message || 'Review-এ পাঠানো যায়নি।')
      setBusy(false)
      return
    }

    router.push('/invest/manage?created=1')
  }

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-4 text-sm dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17} /> Investment</Link>
        <div className="mt-7 rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,.06)] dark:border-white/10 dark:bg-white/[.045] sm:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d4b879]/[.13] text-[#9c781a] dark:text-[#e8cf82]"><Rocket size={24} weight="duotone" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Entrepreneur</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Post an investment opportunity</h1><p className="mt-2 max-w-2xl text-sm leading-6 opacity-55">Submit clear business information, funding terms and risks. Every public opportunity goes through FeniX review before it becomes visible.</p></div>
          </div>

          {error && <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-sm text-red-600">{error}</div>}

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Field label="Title (Bangla)" value={form.title_bn} onChange={(v) => set('title_bn', v)} />
            <Field label="Title (English)" value={form.title_en} onChange={(v) => set('title_en', v)} />
            <TextArea label="Description (Bangla)" value={form.description_bn} onChange={(v) => set('description_bn', v)} />
            <TextArea label="Description (English)" value={form.description_en} onChange={(v) => set('description_en', v)} />
            <Select label="Sector" value={form.category} onChange={(v) => set('category', v)} options={[...INVESTMENT_CATEGORIES]} />
            <Select label="Upazila" value={form.upazila} onChange={(v) => set('upazila', v)} options={['', ...UPZILAS]} />
            <Field label="Area / location details" value={form.location_details} onChange={(v) => set('location_details', v)} />
            <Select label="Link my business (optional)" value={form.business_id} onChange={(v) => set('business_id', v)} options={['', ...businesses.map((b) => b.id)]} optionLabels={['None', ...businesses.map((b) => b.name)]} />
            <MoneyField label="Total funding target (BDT)" value={form.target_amount} onChange={(v) => set('target_amount', v)} />
            <MoneyField label="Minimum investment (BDT)" value={form.min_investment} onChange={(v) => set('min_investment', v)} />
            <Select label="Offer structure" value={form.offer_type} onChange={(v) => set('offer_type', v)} options={[...OFFER_TYPES]} />
            <Select label="Risk level" value={form.risk_level} onChange={(v) => set('risk_level', v)} options={[...RISK_LEVELS]} />
            <Field label="Ownership offered % (optional)" value={form.ownership_percentage} onChange={(v) => set('ownership_percentage', moneyInput(v))} inputMode="decimal" />
            <Field label="Expected return % (optional)" value={form.expected_return_pct} onChange={(v) => set('expected_return_pct', moneyInput(v))} inputMode="decimal" />
            <Field label="Term in months (optional)" value={form.expected_term_months} onChange={(v) => set('expected_term_months', moneyInput(v))} inputMode="numeric" />
            <label className="block"><span className="mb-2 block text-xs font-semibold opacity-60">Funding deadline</span><input value={form.funding_deadline} onChange={(e) => set('funding_deadline', e.target.value)} type="date" className={inputClass} /></label>
            <Select label="Shariah preference" value={form.shariah_preference} onChange={(v) => set('shariah_preference', v)} options={['not_specified','preferred','not_required']} />
            <TextArea label="Risk disclosure (required)" value={form.risk_disclosure} onChange={(v) => set('risk_disclosure', v)} />
          </div>

          <div className="mt-6 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-4 text-sm leading-6"><strong>Before publishing:</strong> Do not promise guaranteed profit. State material risks and use accurate figures. FeniX verification indicates information review, not investment endorsement or a guarantee of outcomes.</div>

          <button disabled={busy} onClick={() => void submit()} type="button" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#008080] px-5 text-sm font-bold text-white disabled:opacity-50"><CheckCircle size={18} />{busy ? 'Submitting...' : 'Submit for review'}</button>
          <div className="mt-4 flex items-center gap-2 text-xs opacity-45"><FileText size={15} />Documents can be added from your Investment Manager after submission.</div>
        </div>
      </section>
    </main>
  )
}

const inputClass="h-12 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm outline-none focus:border-[#008080]/45 dark:border-white/10"
function Field({label,value,onChange,inputMode}:{label:string;value:string;onChange:(v:string)=>void;inputMode?:'numeric'|'decimal'}){return <label className="block"><span className="mb-2 block text-xs font-semibold opacity-60">{label}</span><input value={value} onChange={(e)=>onChange(e.target.value)} inputMode={inputMode} className={inputClass} maxLength={200}/></label>}
function MoneyField({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <Field label={label} value={value} onChange={(v)=>onChange(moneyInput(v))} inputMode="decimal"/>}
function TextArea({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="block"><span className="mb-2 block text-xs font-semibold opacity-60">{label}</span><textarea value={value} onChange={(e)=>onChange(e.target.value)} rows={5} className="w-full rounded-xl border border-[#0b1736]/10 bg-transparent p-3 text-sm leading-6 outline-none focus:border-[#008080]/45 dark:border-white/10" maxLength={8000}/></label>}
function Select({label,value,onChange,options,optionLabels}:{label:string;value:string;onChange:(v:string)=>void;options:string[];optionLabels?:string[]}){return <label className="block"><span className="mb-2 block text-xs font-semibold opacity-60">{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)} className={inputClass}>{options.map((opt,i)=><option key={opt} value={opt}>{optionLabels?.[i] ?? (opt || 'None')}</option>)}</select></label>}

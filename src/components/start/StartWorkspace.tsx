'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Buildings,
  CheckCircle,
  FloppyDisk,
  Lightbulb,
  MapPin,
  MagnifyingGlass,
  Rocket,
  ShieldCheck,
  Storefront,
  TrendUp,
  Wallet,
  WarningCircle,
} from '@phosphor-icons/react'

import Navbar from '@/components/Navbar'
import { createBusiness } from '@/lib/db/businesses'
import {
  START_CATEGORIES,
  START_STEPS,
  START_UPAZILAS,
  calculateStartupFinance,
  createStartProject,
  getLatestStartProject,
  getStartClient,
  isStartCoreReady,
  money,
  touchStartProject,
  type StartFinance,
  type StartLegalItem,
  type StartLegalProgress,
  type StartLocation,
  type StartPlan,
  type StartPreference,
  type StartProject,
  type StartTask,
  type StartValidation,
  type StartWorkspaceStep,
} from '@/lib/start'
import { createClient as createBrowserClient } from '@/utils/supabase/client'

type Props = { step: StartWorkspaceStep }

type FormState = {
  title: string
  summary: string
  category: string
  budgetMin: string
  budgetMax: string
  experience: StartPreference['experience_level']
  risk: StartPreference['risk_preference']
  goal: StartPreference['goal']
  customer: string
  value: string
  products: string
  operations: string
  marketing: string
  planRisks: string
  evidenceNotes: string
  validationRisks: string
  demandStatus: StartValidation['demand_status']
  competitionStatus: StartValidation['competition_status']
  locationStatus: StartValidation['location_status']
  supplierStatus: StartValidation['supplier_status']
  legalStatus: StartValidation['legal_status']
  confidence: StartValidation['data_confidence']
  district: string
  upazila: string
  area: string
  market: string
  locationReason: string
  locationConfidence: StartLocation['data_confidence']
  rent: string
  interior: string
  equipment: string
  license: string
  inventory: string
  marketingCost: string
  staff: string
  utility: string
  transport: string
  other: string
  workingCapital: string
  emergencyBuffer: string
  monthlyFixed: string
  monthlySales: string
  grossMargin: string
}

const EMPTY_FORM: FormState = {
  title: '',
  summary: '',
  category: '',
  budgetMin: '',
  budgetMax: '',
  experience: 'beginner',
  risk: 'medium',
  goal: 'full_time',
  customer: '',
  value: '',
  products: '',
  operations: '',
  marketing: '',
  planRisks: '',
  evidenceNotes: '',
  validationRisks: '',
  demandStatus: 'not_started',
  competitionStatus: 'not_started',
  locationStatus: 'not_started',
  supplierStatus: 'not_started',
  legalStatus: 'not_started',
  confidence: 'low',
  district: 'Feni',
  upazila: '',
  area: '',
  market: '',
  locationReason: '',
  locationConfidence: 'low',
  rent: '0',
  interior: '0',
  equipment: '0',
  license: '0',
  inventory: '0',
  marketingCost: '0',
  staff: '0',
  utility: '0',
  transport: '0',
  other: '0',
  workingCapital: '0',
  emergencyBuffer: '0',
  monthlyFixed: '0',
  monthlySales: '0',
  grossMargin: '0',
}

const INPUT = 'h-12 w-full rounded-xl border border-[#0b1736]/10 bg-white/70 px-3 text-sm outline-none transition focus:border-[#008080]/50 dark:border-white/10 dark:bg-white/[.035]'
const TEXTAREA = 'min-h-[120px] w-full rounded-xl border border-[#0b1736]/10 bg-white/70 p-3 text-sm leading-6 outline-none transition focus:border-[#008080]/50 dark:border-white/10 dark:bg-white/[.035]'
const CARD = 'rounded-[1.7rem] border border-[#0b1736]/10 bg-white/75 shadow-[0_18px_60px_rgba(15,23,42,.05)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[.045]'
const BUTTON = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#008080] px-5 text-sm font-bold text-white transition hover:bg-[#007474] disabled:cursor-not-allowed disabled:opacity-50'
const SOFT = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#008080]/[.07] px-4 text-sm font-semibold text-[#006a6a] transition hover:bg-[#008080]/[.12] dark:bg-[#72ddda]/[.08] dark:text-[#a8fffb]'

const STEP_META: Record<string, { title: string; subtitle: string; icon: typeof Rocket }> = {
  idea: { title: 'Start with the idea', subtitle: 'Define what you want to build and your starting constraints.', icon: Lightbulb },
  validate: { title: 'Validate before you spend', subtitle: 'Record evidence, gaps and risks without inventing local facts.', icon: MagnifyingGlass },
  planner: { title: 'Build the business plan', subtitle: 'Turn your idea into a practical operating model.', icon: Buildings },
  location: { title: 'Choose the location', subtitle: 'Ground the location decision in your own evidence and Feni information.', icon: MapPin },
  legal: { title: 'Review legal requirements', subtitle: 'Use the checklist and verify each item with the relevant official source.', icon: ShieldCheck },
  finance: { title: 'Plan the money', subtitle: 'Estimate setup cost, working capital and break-even sales.', icon: Wallet },
  suppliers: { title: 'Connect suppliers', subtitle: 'Use the FeniX Directory to discover real local businesses.', icon: Storefront },
  checklist: { title: 'Finish the launch checklist', subtitle: 'Complete the practical milestones before publishing.', icon: CheckCircle },
  launch: { title: 'Launch your business profile', subtitle: 'Publish the business to the FeniX Directory when the core checklist is complete.', icon: Rocket },
  dashboard: { title: 'My Business Journey', subtitle: 'Continue from where you stopped and review your progress.', icon: TrendUp },
}

function labelize(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function numberValue(value: string) {
  return Math.max(0, Number(value) || 0)
}

export default function StartWorkspace({ step }: Props) {
  const router = useRouter()
  const client = useMemo(() => getStartClient(), [])
  const [userId, setUserId] = useState('')
  const [project, setProject] = useState<StartProject | null>(null)
  const [tasks, setTasks] = useState<StartTask[]>([])
  const [legalItems, setLegalItems] = useState<StartLegalItem[]>([])
  const [legalProgress, setLegalProgress] = useState<StartLegalProgress[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const { data } = await client.auth.getUser()
        if (!active) return
        const id = data.user?.id ?? ''
        setUserId(id)

        if (!id) {
          setLoading(false)
          return
        }

        const latest = await getLatestStartProject(client, id)
        if (!active) return

        if (!latest) {
          setLoading(false)
          return
        }

        setProject(latest)

        const [pref, plan, validation, finance, location, projectTasks, catalog, progress] = await Promise.all([
          client.from('business_start_preferences').select('*').eq('project_id', latest.id).maybeSingle(),
          client.from('business_start_plans').select('*').eq('project_id', latest.id).maybeSingle(),
          client.from('business_start_validation').select('*').eq('project_id', latest.id).maybeSingle(),
          client.from('business_start_finance').select('*').eq('project_id', latest.id).maybeSingle(),
          client.from('business_start_locations').select('*').eq('project_id', latest.id).maybeSingle(),
          client.from('business_start_tasks').select('*').eq('project_id', latest.id).order('sort_order'),
          client.from('business_start_legal_items').select('*').eq('is_active', true).order('sort_order'),
          client.from('business_start_legal_progress').select('*').eq('project_id', latest.id),
        ])

        const errors = [pref.error, plan.error, validation.error, finance.error, location.error, projectTasks.error, catalog.error, progress.error].filter(Boolean)
        if (errors.length) throw errors[0]

        if (!active) return

        const p = pref.data as StartPreference | null
        const pl = plan.data as StartPlan | null
        const v = validation.data as StartValidation | null
        const f = finance.data as StartFinance | null
        const l = location.data as StartLocation | null

        setTasks((projectTasks.data ?? []) as StartTask[])
        setLegalItems((catalog.data ?? []) as StartLegalItem[])
        setLegalProgress((progress.data ?? []) as StartLegalProgress[])
        setForm({
          ...EMPTY_FORM,
          title: latest.title,
          summary: p?.business_summary ?? '',
          category: p?.category ?? '',
          budgetMin: p ? String(p.budget_min) : '',
          budgetMax: p ? String(p.budget_max) : '',
          experience: p?.experience_level ?? 'beginner',
          risk: p?.risk_preference ?? 'medium',
          goal: p?.goal ?? 'full_time',
          customer: pl?.customer_profile ?? '',
          value: pl?.value_proposition ?? '',
          products: pl?.products_services ?? '',
          operations: pl?.operations ?? '',
          marketing: pl?.marketing ?? '',
          planRisks: pl?.risks ?? '',
          evidenceNotes: v?.evidence_notes ?? '',
          validationRisks: v?.risks ?? '',
          demandStatus: v?.demand_status ?? 'not_started',
          competitionStatus: v?.competition_status ?? 'not_started',
          locationStatus: v?.location_status ?? 'not_started',
          supplierStatus: v?.supplier_status ?? 'not_started',
          legalStatus: v?.legal_status ?? 'not_started',
          confidence: v?.data_confidence ?? 'low',
          district: l?.district ?? 'Feni',
          upazila: l?.upazila ?? '',
          area: l?.area ?? '',
          market: l?.market_name ?? '',
          locationReason: l?.selection_reason ?? '',
          locationConfidence: l?.data_confidence ?? 'low',
          rent: String(f?.rent ?? 0),
          interior: String(f?.interior ?? 0),
          equipment: String(f?.equipment ?? 0),
          license: String(f?.license_cost ?? 0),
          inventory: String(f?.inventory_cost ?? 0),
          marketingCost: String(f?.marketing_cost ?? 0),
          staff: String(f?.staff_cost ?? 0),
          utility: String(f?.utility_cost ?? 0),
          transport: String(f?.transport_cost ?? 0),
          other: String(f?.other_cost ?? 0),
          workingCapital: String(f?.working_capital ?? 0),
          emergencyBuffer: String(f?.emergency_buffer ?? 0),
          monthlyFixed: String(f?.monthly_fixed_cost ?? 0),
          monthlySales: String(f?.estimated_monthly_sales ?? 0),
          grossMargin: String(f?.gross_margin_pct ?? 0),
        })
      } catch (loadError) {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : 'Unable to load your Business Journey.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [client, step])

  const completed = tasks.filter((task) => task.status === 'completed').length
  const progressPercent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const coreReady = isStartCoreReady(tasks)
  const finance = calculateStartupFinance({
    rent: numberValue(form.rent),
    interior: numberValue(form.interior),
    equipment: numberValue(form.equipment),
    license_cost: numberValue(form.license),
    inventory_cost: numberValue(form.inventory),
    marketing_cost: numberValue(form.marketingCost),
    staff_cost: numberValue(form.staff),
    utility_cost: numberValue(form.utility),
    transport_cost: numberValue(form.transport),
    other_cost: numberValue(form.other),
    working_capital: numberValue(form.workingCapital),
    emergency_buffer: numberValue(form.emergencyBuffer),
    monthly_fixed_cost: numberValue(form.monthlyFixed),
    estimated_monthly_sales: numberValue(form.monthlySales),
    gross_margin_pct: numberValue(form.grossMargin),
  })

  async function ensureProject() {
    if (project) return project
    if (!userId) {
      setError('Login করলে Business Journey save করা যাবে.')
      router.push('/login?next=/start/idea')
      return null
    }

    setSaving(true)
    setError('')
    try {
      const created = await createStartProject(client, userId, form.title.trim() || 'My FeniX Business Plan')
      const [projectTasks, catalog] = await Promise.all([
        client.from('business_start_tasks').select('*').eq('project_id', created.id).order('sort_order'),
        client.from('business_start_legal_items').select('*').eq('is_active', true).order('sort_order'),
      ])
      if (projectTasks.error) throw projectTasks.error
      if (catalog.error) throw catalog.error
      setProject(created)
      setTasks((projectTasks.data ?? []) as StartTask[])
      setLegalItems((catalog.data ?? []) as StartLegalItem[])
      setLegalProgress([])
      setNotice('Business Journey তৈরি হয়েছে।')
      return created
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create the Business Journey.')
      return null
    } finally {
      setSaving(false)
    }
  }

  async function markTask(taskKey: string, done: boolean) {
    if (!project || !userId) return
    const now = new Date().toISOString()
    const { data, error: taskError } = await client
      .from('business_start_tasks')
      .update({ status: done ? 'completed' : 'pending', completed_at: done ? now : null, updated_at: now })
      .eq('project_id', project.id)
      .eq('task_key', taskKey)
      .select('*')
      .maybeSingle()

    if (taskError) throw taskError
    if (data) setTasks((items) => items.map((task) => task.id === data.id ? data as StartTask : task))
  }

  async function saveIdea() {
    if (form.title.trim().length < 3) {
      setError('Business name/idea কমপক্ষে ৩ অক্ষরের হতে হবে.')
      return false
    }
    const current = await ensureProject()
    if (!current) return false
    setSaving(true)
    setError('')
    try {
      const updated = await touchStartProject(client, current.id, userId, {
        title: form.title,
        business_type: form.category || null,
        status: 'planning',
        current_step: 'validate',
      })
      const { error: prefError } = await client.from('business_start_preferences').upsert(
        {
          project_id: current.id,
          business_summary: form.summary.trim() || null,
          category: form.category || null,
          budget_min: numberValue(form.budgetMin),
          budget_max: Math.max(numberValue(form.budgetMin), numberValue(form.budgetMax)),
          experience_level: form.experience,
          risk_preference: form.risk,
          goal: form.goal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' },
      )
      if (prefError) throw prefError
      setProject(updated)
      await markTask('idea_name', true)
      await markTask('idea_summary', Boolean(form.summary.trim()))
      setNotice('Idea information saved.')
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the idea.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function saveValidation() {
    const current = await ensureProject()
    if (!current) return false
    setSaving(true)
    setError('')
    try {
      const { error: validationError } = await client.from('business_start_validation').upsert(
        {
          project_id: current.id,
          demand_status: form.demandStatus,
          competition_status: form.competitionStatus,
          location_status: form.locationStatus,
          supplier_status: form.supplierStatus,
          legal_status: form.legalStatus,
          evidence_notes: form.evidenceNotes.trim() || null,
          risks: form.validationRisks.trim() || null,
          data_confidence: form.confidence,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' },
      )
      if (validationError) throw validationError
      const updated = await touchStartProject(client, current.id, userId, { status: 'validation', current_step: 'planner' })
      setProject(updated)
      await markTask('validation_demand', form.demandStatus === 'evidence_found')
      await markTask('validation_competition', form.competitionStatus === 'evidence_found')
      setNotice('Validation record saved.')
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save validation.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function savePlanner() {
    const current = await ensureProject()
    if (!current) return false
    setSaving(true)
    setError('')
    try {
      const { error: planError } = await client.from('business_start_plans').upsert(
        {
          project_id: current.id,
          customer_profile: form.customer.trim() || null,
          value_proposition: form.value.trim() || null,
          products_services: form.products.trim() || null,
          operations: form.operations.trim() || null,
          marketing: form.marketing.trim() || null,
          risks: form.planRisks.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' },
      )
      if (planError) throw planError
      const updated = await touchStartProject(client, current.id, userId, { current_step: 'location' })
      setProject(updated)
      await markTask('planning_customer', Boolean(form.customer.trim()))
      await markTask('planning_operations', Boolean(form.operations.trim()))
      setNotice('Business plan saved.')
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the business plan.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function saveLocation() {
    const current = await ensureProject()
    if (!current) return false
    setSaving(true)
    setError('')
    try {
      const { error: locationError } = await client.from('business_start_locations').upsert(
        {
          project_id: current.id,
          district: 'Feni',
          upazila: form.upazila || null,
          area: form.area.trim() || null,
          market_name: form.market.trim() || null,
          selection_reason: form.locationReason.trim() || null,
          data_confidence: form.locationConfidence,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' },
      )
      if (locationError) throw locationError
      const updated = await touchStartProject(client, current.id, userId, { current_step: 'legal' })
      setProject(updated)
      await markTask('location_choice', Boolean(form.upazila || form.area || form.market))
      setNotice('Location preference saved.')
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the location.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function saveFinance() {
    const current = await ensureProject()
    if (!current) return false
    setSaving(true)
    setError('')
    try {
      const { error: financeError } = await client.from('business_start_finance').upsert(
        {
          project_id: current.id,
          rent: numberValue(form.rent),
          interior: numberValue(form.interior),
          equipment: numberValue(form.equipment),
          license_cost: numberValue(form.license),
          inventory_cost: numberValue(form.inventory),
          marketing_cost: numberValue(form.marketingCost),
          staff_cost: numberValue(form.staff),
          utility_cost: numberValue(form.utility),
          transport_cost: numberValue(form.transport),
          other_cost: numberValue(form.other),
          working_capital: numberValue(form.workingCapital),
          emergency_buffer: numberValue(form.emergencyBuffer),
          monthly_fixed_cost: numberValue(form.monthlyFixed),
          estimated_monthly_sales: numberValue(form.monthlySales),
          gross_margin_pct: Math.min(100, numberValue(form.grossMargin)),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' },
      )
      if (financeError) throw financeError
      const updated = await touchStartProject(client, current.id, userId, { current_step: 'suppliers' })
      setProject(updated)
      await markTask('finance_budget', finance.setupCost > 0)
      await markTask('finance_buffer', finance.totalStartingCapital > finance.setupCost)
      setNotice('Startup budget saved.')
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the finance plan.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function toggleTask(task: StartTask) {
    try {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
      const now = new Date().toISOString()
      const { data, error: taskError } = await client
        .from('business_start_tasks')
        .update({ status: nextStatus, completed_at: nextStatus === 'completed' ? now : null, updated_at: now })
        .eq('id', task.id)
        .eq('project_id', project?.id ?? '')
        .select('*')
        .single()
      if (taskError) throw taskError
      setTasks((items) => items.map((item) => item.id === task.id ? data as StartTask : item))
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : 'Could not update the checklist.')
    }
  }

  async function toggleLegal(item: StartLegalItem) {
    if (!project || !userId) {
      setError('Login করে Business Journey save করুন.')
      router.push('/login?next=/start/legal')
      return
    }

    try {
      const current = legalProgress.find((entry) => entry.legal_item_id === item.id)
      const next = current?.status === 'completed' ? 'pending' : 'completed'
      const { data, error: progressError } = await client.from('business_start_legal_progress').upsert(
        {
          project_id: project.id,
          legal_item_id: item.id,
          status: next,
          notes: current?.notes ?? null,
          completed_at: next === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,legal_item_id' },
      ).select('*').single()

      if (progressError) throw progressError

      const updatedProgress = legalProgress.some((entry) => entry.id === data.id)
        ? legalProgress.map((entry) => entry.id === data.id ? data as StartLegalProgress : entry)
        : [...legalProgress, data as StartLegalProgress]
      setLegalProgress(updatedProgress)

      const done = legalItems.length > 0 && legalItems.every((legalItem) => {
        const status = legalItem.id === item.id
          ? next
          : updatedProgress.find((entry) => entry.legal_item_id === legalItem.id)?.status
        return status === 'completed' || status === 'not_applicable'
      })
      await markTask('legal_review', done)
    } catch (progressError) {
      setError(progressError instanceof Error ? progressError.message : 'Could not update the legal checklist.')
    }
  }

  async function publishBusiness() {
    if (!project || !userId) {
      setError('Business publish করতে login করা লাগবে.')
      router.push('/login?next=/start/launch')
      return
    }
    if (project.business_id) {
      setNotice('এই Journey থেকে Business profile already published হয়েছে.')
      return
    }
    if (!coreReady) {
      setError('Launch-এর আগে required milestones complete করুন.')
      return
    }
    if (form.title.trim().length < 3 || !form.category) {
      setError('Business publish করার আগে নাম ও category ঠিক করুন.')
      router.push('/start/idea')
      return
    }

    setSaving(true)
    setError('')
    try {
      const normalClient = createBrowserClient()
      const business = await createBusiness(normalClient, {
        owner_id: userId,
        name: form.title.trim(),
        title_bn: form.title.trim(),
        title_en: form.title.trim(),
        description: form.summary.trim() || form.value.trim() || null,
        category: form.category,
      })
      if (business.error || !business.data) throw business.error ?? new Error('Business profile could not be published.')

      const updated = await touchStartProject(client, project.id, userId, {
        business_id: business.data.id,
        status: 'launched',
        current_step: 'launch',
        completed_at: new Date().toISOString(),
      })
      setProject(updated)
      setNotice('Business profile published to the FeniX Directory.')
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Business profile could not be published.')
    } finally {
      setSaving(false)
    }
  }

  async function continueTo(nextPath: string) {
    let ok = true
    if (step === 'idea') ok = await saveIdea()
    if (step === 'validate') ok = await saveValidation()
    if (step === 'planner') ok = await savePlanner()
    if (step === 'location') ok = await saveLocation()
    if (step === 'finance') ok = await saveFinance()
    if (ok) router.push(nextPath)
  }

  const activeMeta = STEP_META[step] ?? STEP_META.idea
  const ActiveIcon = activeMeta.icon
  const activeIndex = START_STEPS.findIndex((item) => item.key === step)
  const previousPath = activeIndex > 0 ? START_STEPS[activeIndex - 1].path : '/start'
  const nextPath = activeIndex >= 0 && activeIndex < START_STEPS.length - 1 ? START_STEPS[activeIndex + 1].path : null

  if (loading) {
    return (
      <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
        <Navbar />
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className={CARD + ' p-8 text-sm opacity-60'}>Business Journey loading…</div>
        </section>
      </main>
    )
  }

  if (step === 'home') {
    return (
      <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
        <Navbar />
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className={CARD + ' overflow-hidden p-6 sm:p-10'}>
            <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#008080]/[.08] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.15em] text-[#007070] dark:bg-[#72ddda]/[.08] dark:text-[#9efffa]">
                  <Rocket size={14} weight="fill" />
                  FeniX Start
                </span>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Start a Business</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 opacity-65 sm:text-base">
                  আইডিয়া থেকে launch পর্যন্ত একটি structured Business Journey তৈরি করুন—আপনার নিজের তথ্য, evidence এবং FeniX ecosystem ব্যবহার করে।
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className={BUTTON}
                    disabled={saving}
                    onClick={async () => { const created = await ensureProject(); if (created) router.push('/start/idea') }}
                  >
                    <Rocket size={18} />
                    Start My Journey
                  </button>
                  <Link className={SOFT} href="/start/idea">
                    <Lightbulb size={18} />
                    Find a Business Idea
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-[#008080]/15 bg-[#008080]/[.05] p-5 dark:bg-[#72ddda]/[.05]">
                <div className="text-xs font-bold uppercase tracking-[.15em] text-[#008080] dark:text-[#72ddda]">Journey</div>
                <div className="mt-4 space-y-2">
                  {START_STEPS.map((item, index) => (
                    <div key={item.key} className="flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2.5 text-sm dark:bg-white/[.035]">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#008080]/[.08] text-[11px] font-bold text-[#008080] dark:bg-[#72ddda]/[.08] dark:text-[#72ddda]">{index + 1}</span>
                      <span className="font-semibold">{item.label}</span>
                      <span className="ml-auto text-xs opacity-40">{item.bn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <EntryCard icon={<Rocket size={22} />} title="Start from an Idea" text="আপনার নিজের business idea দিয়ে শুরু করুন।" href="/start/idea" />
            <EntryCard icon={<Lightbulb size={22} />} title="Find a Business Idea" text="Budget, experience ও goal লিখে candidate directions explore করুন।" href="/start/idea" />
            <EntryCard icon={<Storefront size={22} />} title="Open a Local Business" text="Location, legal, suppliers ও launch checklist একসাথে সাজান।" href="/start/location" />
            <EntryCard icon={<TrendUp size={22} />} title="Expand Existing Business" text="Existing business-এর জন্য structured planning journey ব্যবহার করুন।" href="/start/planner" />
          </div>

          <div className={CARD + ' mt-6 p-6 sm:p-8'}>
            <div className="flex items-start gap-3">
              <Brain size={23} className="mt-0.5 text-[#008080] dark:text-[#72ddda]" />
              <div>
                <h2 className="text-lg font-black">Feni Brain + Ecosystem</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 opacity-60">
                  Local facts-এর জন্য Feni Brain, supplier-এর জন্য Directory, funding প্রয়োজন হলে Investment এবং launch-এর পরে Commerce-এর সাথে connect করুন।
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className={SOFT} href="/guide?q=ফেনীতে ব্যবসার আইডিয়া">Ask Feni Brain</Link>
                  <Link className={SOFT} href="/directory">Find Suppliers</Link>
                  <Link className={SOFT} href="/invest">Explore Investment</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[.06] p-4 text-xs leading-6 text-amber-900 dark:text-amber-100">
            FeniX planning support দেয়; verified evidence ছাড়া local facts, legal requirements, costs বা opportunities-কে নিশ্চিত দাবি হিসেবে দেখানো হবে না।
          </div>
        </section>
      </main>
    )
  }

  if (step === 'dashboard') {
    if (!project) {
      return (
        <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
          <Navbar />
          <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <div className={CARD + ' p-7 sm:p-10'}>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008080]/[.08] text-[#008080] dark:text-[#72ddda]"><Rocket size={23} /></span>
              <h1 className="mt-5 text-3xl font-black">My Business Journey</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">এখনও কোনো saved journey নেই। প্রথম journey শুরু করুন।</p>
              <button type="button" className={BUTTON + ' mt-6'} onClick={async () => { const created = await ensureProject(); if (created) router.push('/start/idea') }}>
                <Rocket size={18} />
                Create My Journey
              </button>
            </div>
          </section>
        </main>
      )
    }

    const nextTask = tasks.find((task) => task.status !== 'completed')
    return (
      <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
        <Navbar />
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <TopBar title="My Business Journey" />
          <div className={CARD + ' mt-6 p-6 sm:p-9'}>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[.16em] text-[#008080] dark:text-[#72ddda]">Business Journey</div>
                <h1 className="mt-2 text-3xl font-black">{project.title}</h1>
                <p className="mt-2 text-sm opacity-55">{labelize(project.status)} · current step: {labelize(project.current_step)}</p>
              </div>
              <div className="min-w-[230px]">
                <div className="flex items-center justify-between text-xs font-semibold opacity-55"><span>Readiness</span><span>{progressPercent}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.08]"><div className="h-full rounded-full bg-[#008080]" style={{ width: progressPercent + '%' }} /></div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <div className={CARD + ' p-6'}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black">Your milestones</h2>
                <Link className="text-xs font-semibold text-[#008080] dark:text-[#72ddda]" href="/start/checklist">Open checklist →</Link>
              </div>
              <div className="mt-5 grid gap-3">
                {START_STEPS.map((item) => {
                  const stageDone = tasks.some((task) => task.stage === item.key && task.status === 'completed')
                  return (
                    <Link key={item.key} href={item.path} className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-black/[.06] bg-black/[.018] px-4 dark:border-white/[.07] dark:bg-white/[.025]">
                      {stageDone ? <CheckCircle size={19} weight="fill" className="text-[#008080] dark:text-[#72ddda]" /> : <span className="h-2.5 w-2.5 rounded-full bg-black/20 dark:bg-white/20" />}
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span className="ml-auto text-xs opacity-40">{item.bn}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className={CARD + ' p-6'}>
              <h2 className="text-lg font-black">Continue</h2>
              <p className="mt-2 text-sm leading-6 opacity-55">{nextTask ? nextTask.title_en : 'Core launch milestones complete.'}</p>
              <Link className={BUTTON + ' mt-5'} href={nextTask ? (START_STEPS.find((item) => item.key === nextTask.stage)?.path ?? '/start/checklist') : '/start/launch'}>
                <ArrowRight size={18} />
                Continue
              </Link>
              {project.business_id && (
                <div className="mt-5 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-4 text-sm">
                  <div className="font-semibold">Business profile published</div>
                  <Link href="/directory" className="mt-1 inline-block text-xs font-semibold text-[#008080] dark:text-[#72ddda]">Open Directory →</Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <TopBar title={activeMeta.title} />
        <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className={CARD + ' h-fit p-3 lg:sticky lg:top-24'}>
            <div className="px-3 py-3">
              <div className="text-xs font-bold uppercase tracking-[.16em] text-[#008080] dark:text-[#72ddda]">Journey</div>
              <div className="mt-1 text-sm opacity-55">{project?.title || 'New Business Plan'}</div>
            </div>
            <nav className="space-y-1">
              {START_STEPS.map((item) => (
                <Link key={item.key} href={item.path} className={'flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm transition ' + (step === item.key ? 'bg-[#008080]/[.09] font-bold text-[#007070] dark:bg-[#72ddda]/[.08] dark:text-[#a8fffb]' : 'opacity-60 hover:bg-black/[.035] dark:hover:bg-white/[.04]')}>
                  <span className="w-5 text-center text-xs">{tasks.some((task) => task.stage === item.key && task.status === 'completed') ? '✓' : '•'}</span>
                  <span>{item.label}</span>
                  <span className="ml-auto text-[10px] opacity-60">{item.bn}</span>
                </Link>
              ))}
            </nav>
            <Link href="/start/dashboard" className="mt-3 flex min-h-[44px] items-center gap-2 rounded-xl bg-black/[.035] px-3 text-xs font-semibold dark:bg-white/[.035]">
              <TrendUp size={16} />
              Dashboard
            </Link>
          </aside>

          <div className="min-w-0">
            <div className={CARD + ' p-6 sm:p-8'}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#008080]/[.08] text-[#008080] dark:text-[#72ddda]">
                  <ActiveIcon size={23} weight="duotone" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-[.15em] text-[#008080] dark:text-[#72ddda]">FeniX Start</div>
                  <h1 className="mt-1 text-3xl font-black">{activeMeta.title}</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 opacity-60">{activeMeta.subtitle}</p>
                </div>
              </div>

              {notice && <div className="mt-5 flex items-start gap-2 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-4 text-sm"><CheckCircle size={18} className="mt-0.5 shrink-0 text-[#008080] dark:text-[#72ddda]" /><span>{notice}</span></div>}
              {error && <div className="mt-5 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/[.05] p-4 text-sm text-red-800 dark:text-red-200"><WarningCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

              {step === 'idea' && (
                <div className="mt-8 grid gap-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Business name / working idea" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} placeholder="e.g. Feni Fresh Foods" />
                    <Select label="Business category" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value }))} options={['', ...START_CATEGORIES]} />
                  </div>
                  <FieldArea label="What do you want to build?" value={form.summary} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} placeholder="What will you sell or provide, and who is it for?" />
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Budget minimum (BDT)" type="number" value={form.budgetMin} onChange={(value) => setForm((current) => ({ ...current, budgetMin: value }))} />
                    <Field label="Budget maximum (BDT)" type="number" value={form.budgetMax} onChange={(value) => setForm((current) => ({ ...current, budgetMax: value }))} />
                    <Select label="Experience" value={form.experience} onChange={(value) => setForm((current) => ({ ...current, experience: value as FormState['experience'] }))} options={['beginner','some_experience','experienced']} />
                    <Select label="Risk preference" value={form.risk} onChange={(value) => setForm((current) => ({ ...current, risk: value as FormState['risk'] }))} options={['low','medium','high']} />
                    <Select label="Goal" value={form.goal} onChange={(value) => setForm((current) => ({ ...current, goal: value as FormState['goal'] }))} options={['part_time','full_time','family','growth']} />
                  </div>
                  <div className="rounded-2xl border border-[#008080]/15 bg-[#008080]/[.04] p-4 text-sm leading-6">
                    <strong>Idea guidance:</strong> FeniX can help you explore directions, but an unverified idea is never presented as guaranteed demand or profit.
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Link className={SOFT} href="/guide?q=ফেনীতে ব্যবসার আইডিয়া">Ask Feni Brain</Link>
                    <button type="button" className={BUTTON} disabled={saving} onClick={() => void continueTo('/start/validate')}><FloppyDisk size={18} /> Save & Continue <ArrowRight size={18} /></button>
                  </div>
                </div>
              )}

              {step === 'validate' && (
                <div className="mt-8 space-y-6">
                  <StatusSelect label="Demand evidence" value={form.demandStatus} onChange={(value) => setForm((current) => ({ ...current, demandStatus: value as FormState['demandStatus'] }))} />
                  <StatusSelect label="Competition evidence" value={form.competitionStatus} onChange={(value) => setForm((current) => ({ ...current, competitionStatus: value as FormState['competitionStatus'] }))} />
                  <StatusSelect label="Location evidence" value={form.locationStatus} onChange={(value) => setForm((current) => ({ ...current, locationStatus: value as FormState['locationStatus'] }))} />
                  <StatusSelect label="Supplier evidence" value={form.supplierStatus} onChange={(value) => setForm((current) => ({ ...current, supplierStatus: value as FormState['supplierStatus'] }))} />
                  <StatusSelect label="Legal evidence" value={form.legalStatus} onChange={(value) => setForm((current) => ({ ...current, legalStatus: value as FormState['legalStatus'] }))} />
                  <Select label="Overall data confidence" value={form.confidence} onChange={(value) => setForm((current) => ({ ...current, confidence: value as FormState['confidence'] }))} options={['low','medium','high']} />
                  <FieldArea label="Evidence / research notes" value={form.evidenceNotes} onChange={(value) => setForm((current) => ({ ...current, evidenceNotes: value }))} placeholder="Record actual interviews, competitor observations, quotations, public sources, etc." />
                  <FieldArea label="Known risks / unanswered questions" value={form.validationRisks} onChange={(value) => setForm((current) => ({ ...current, validationRisks: value }))} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link className={SOFT} href={'/guide?q=' + encodeURIComponent((form.title || 'business') + ' Feni market supplier location')}><Brain size={18} /> Use Feni Brain</Link>
                    <Link className={SOFT} href="/directory"><Storefront size={18} /> Check Directory</Link>
                  </div>
                  <div className="flex justify-end"><button type="button" className={BUTTON} disabled={saving} onClick={() => void continueTo('/start/planner')}><FloppyDisk size={18} /> Save & Continue <ArrowRight size={18} /></button></div>
                </div>
              )}

              {step === 'planner' && (
                <div className="mt-8 grid gap-5">
                  <FieldArea label="Target customer" value={form.customer} onChange={(value) => setForm((current) => ({ ...current, customer: value }))} placeholder="Who exactly will buy from you?" />
                  <FieldArea label="Value proposition" value={form.value} onChange={(value) => setForm((current) => ({ ...current, value: value }))} placeholder="Why would a customer choose your business?" />
                  <FieldArea label="Products / services" value={form.products} onChange={(value) => setForm((current) => ({ ...current, products: value }))} />
                  <FieldArea label="Operations" value={form.operations} onChange={(value) => setForm((current) => ({ ...current, operations: value }))} placeholder="Opening hours, staffing, delivery, etc." />
                  <FieldArea label="Marketing" value={form.marketing} onChange={(value) => setForm((current) => ({ ...current, marketing: value }))} />
                  <FieldArea label="Risks" value={form.planRisks} onChange={(value) => setForm((current) => ({ ...current, planRisks: value }))} />
                  <div className="flex justify-end"><button type="button" className={BUTTON} disabled={saving} onClick={() => void continueTo('/start/location')}><FloppyDisk size={18} /> Save & Continue <ArrowRight size={18} /></button></div>
                </div>
              )}

              {step === 'location' && (
                <div className="mt-8 space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="District" value="Feni" onChange={() => undefined} />
                    <Select label="Upazila" value={form.upazila} onChange={(value) => setForm((current) => ({ ...current, upazila: value }))} options={['', ...START_UPAZILAS]} />
                    <Field label="Area / neighbourhood" value={form.area} onChange={(value) => setForm((current) => ({ ...current, area: value }))} />
                    <Field label="Market / bazaar" value={form.market} onChange={(value) => setForm((current) => ({ ...current, market: value }))} />
                  </div>
                  <FieldArea label="Why this location?" value={form.locationReason} onChange={(value) => setForm((current) => ({ ...current, locationReason: value }))} />
                  <Select label="Location data confidence" value={form.locationConfidence} onChange={(value) => setForm((current) => ({ ...current, locationConfidence: value as FormState['locationConfidence'] }))} options={['low','medium','high']} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link className={SOFT} href={'/guide?q=' + encodeURIComponent((form.title || 'business') + ' Feni ' + (form.upazila || 'location') + ' market')}><Brain size={18} /> Check Feni Brain</Link>
                    <Link className={SOFT} href="/directory"><Storefront size={18} /> Browse local businesses</Link>
                  </div>
                  <div className="flex justify-end"><button type="button" className={BUTTON} disabled={saving} onClick={() => void continueTo('/start/legal')}><FloppyDisk size={18} /> Save & Continue <ArrowRight size={18} /></button></div>
                </div>
              )}

              {step === 'legal' && (
                <div className="mt-8">
                  <div className="grid gap-3">
                    {legalItems.map((item) => {
                      const progress = legalProgress.find((entry) => entry.legal_item_id === item.id)
                      const done = progress?.status === 'completed' || progress?.status === 'not_applicable'
                      return (
                        <button key={item.id} type="button" onClick={() => void toggleLegal(item)} className="flex w-full items-start gap-3 rounded-2xl border border-black/[.06] bg-black/[.018] p-4 text-left dark:border-white/[.07] dark:bg-white/[.025]">
                          <CheckCircle size={21} weight={done ? 'fill' : 'regular'} className={done ? 'mt-0.5 text-[#008080] dark:text-[#72ddda]' : 'mt-0.5 opacity-25'} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold">{item.title_en}</span>
                            <span className="mt-1 block text-xs leading-5 opacity-55">{item.title_bn}</span>
                            {item.guidance_en && <span className="mt-2 block text-xs leading-5 opacity-50">{item.guidance_en}</span>}
                          </span>
                          {item.official_url && <a href={item.official_url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="shrink-0 text-xs font-semibold text-[#008080] dark:text-[#72ddda]">Official source</a>}
                        </button>
                      )
                    })}
                    {!legalItems.length && <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[.05] p-4 text-sm">No legal catalogue items are available right now. Verify with the relevant authority before launch.</div>}
                  </div>
                  <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/[.05] p-4 text-xs leading-6">Checklist completion means you reviewed the item. It is not legal advice or government approval.</div>
                  <div className="mt-6 flex justify-end"><Link className={BUTTON} href="/start/finance"><ArrowRight size={18} /> Continue to Finance</Link></div>
                </div>
              )}

              {step === 'finance' && (
                <div className="mt-8">
                  <div className="grid gap-5 md:grid-cols-3">
                    <Field label="Rent / deposit" type="number" value={form.rent} onChange={(value) => setForm((current) => ({ ...current, rent: value }))} />
                    <Field label="Interior / setup" type="number" value={form.interior} onChange={(value) => setForm((current) => ({ ...current, interior: value }))} />
                    <Field label="Equipment" type="number" value={form.equipment} onChange={(value) => setForm((current) => ({ ...current, equipment: value }))} />
                    <Field label="Licensing budget" type="number" value={form.license} onChange={(value) => setForm((current) => ({ ...current, license: value }))} />
                    <Field label="Initial inventory" type="number" value={form.inventory} onChange={(value) => setForm((current) => ({ ...current, inventory: value }))} />
                    <Field label="Marketing" type="number" value={form.marketingCost} onChange={(value) => setForm((current) => ({ ...current, marketingCost: value }))} />
                    <Field label="Initial staff cost" type="number" value={form.staff} onChange={(value) => setForm((current) => ({ ...current, staff: value }))} />
                    <Field label="Utilities / setup" type="number" value={form.utility} onChange={(value) => setForm((current) => ({ ...current, utility: value }))} />
                    <Field label="Transport" type="number" value={form.transport} onChange={(value) => setForm((current) => ({ ...current, transport: value }))} />
                    <Field label="Other" type="number" value={form.other} onChange={(value) => setForm((current) => ({ ...current, other: value }))} />
                  </div>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <Field label="Working capital" type="number" value={form.workingCapital} onChange={(value) => setForm((current) => ({ ...current, workingCapital: value }))} />
                    <Field label="Emergency buffer" type="number" value={form.emergencyBuffer} onChange={(value) => setForm((current) => ({ ...current, emergencyBuffer: value }))} />
                    <Field label="Monthly fixed cost" type="number" value={form.monthlyFixed} onChange={(value) => setForm((current) => ({ ...current, monthlyFixed: value }))} />
                    <Field label="Estimated monthly sales" type="number" value={form.monthlySales} onChange={(value) => setForm((current) => ({ ...current, monthlySales: value }))} />
                    <Field label="Gross margin %" type="number" value={form.grossMargin} onChange={(value) => setForm((current) => ({ ...current, grossMargin: value }))} />
                  </div>
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <Metric label="Setup cost" value={'৳' + money(finance.setupCost)} />
                    <Metric label="Starting capital" value={'৳' + money(finance.totalStartingCapital)} />
                    <Metric label="Break-even sales" value={finance.breakEvenSales ? '৳' + money(finance.breakEvenSales) + ' / month' : 'Needs margin'} />
                  </div>
                  {finance.salesGap > 0 && <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/[.05] p-4 text-sm">Current sales assumption is about ৳{money(finance.salesGap)} below the break-even estimate.</div>}
                  <div className="mt-5 flex justify-end"><button type="button" className={BUTTON} disabled={saving} onClick={() => void continueTo('/start/suppliers')}><FloppyDisk size={18} /> Save & Continue <ArrowRight size={18} /></button></div>
                </div>
              )}

              {step === 'suppliers' && (
                <div className="mt-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-[#008080]/15 bg-[#008080]/[.04] p-5">
                      <Storefront size={22} className="text-[#008080] dark:text-[#72ddda]" />
                      <h2 className="mt-4 text-lg font-black">Find suppliers in FeniX Directory</h2>
                      <p className="mt-2 text-sm leading-6 opacity-55">Supplier recommendations should come from real business records rather than invented names.</p>
                      <Link className={BUTTON + ' mt-5'} href="/directory"><Storefront size={18} /> Open Directory</Link>
                    </div>
                    <div className="rounded-3xl border border-[#0b1736]/10 bg-black/[.02] p-5 dark:border-white/10 dark:bg-white/[.025]">
                      <ShieldCheck size={22} className="text-[#008080] dark:text-[#72ddda]" />
                      <h2 className="mt-4 text-lg font-black">Record the supplier plan</h2>
                      <p className="mt-2 text-sm leading-6 opacity-55">After you research suppliers, mark the milestone complete from the checklist.</p>
                      <button type="button" className={SOFT + ' mt-5'} onClick={() => void markTask('supplier_plan', true)}><CheckCircle size={18} /> Mark supplier plan complete</button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end"><Link className={BUTTON} href="/start/checklist"><ArrowRight size={18} /> Open checklist</Link></div>
                </div>
              )}

              {step === 'checklist' && (
                <div className="mt-8">
                  <div className="mb-5 grid gap-3 sm:grid-cols-3">
                    <Metric label="Completed" value={String(completed)} />
                    <Metric label="Total" value={String(tasks.length)} />
                    <Metric label="Progress" value={String(progressPercent) + '%'} />
                  </div>
                  <div className="grid gap-3">
                    {tasks.map((task) => (
                      <button key={task.id} type="button" onClick={() => void toggleTask(task)} className="flex w-full items-start gap-3 rounded-2xl border border-black/[.06] bg-black/[.018] p-4 text-left dark:border-white/[.07] dark:bg-white/[.025]">
                        <CheckCircle size={21} weight={task.status === 'completed' ? 'fill' : 'regular'} className={task.status === 'completed' ? 'mt-0.5 text-[#008080] dark:text-[#72ddda]' : 'mt-0.5 opacity-25'} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold uppercase tracking-[.14em] opacity-45">{labelize(task.stage)}</span>
                          <span className="mt-1 block text-sm font-semibold">{task.title_en}</span>
                          {task.description_en && <span className="mt-1 block text-xs leading-5 opacity-50">{task.description_en}</span>}
                        </span>
                        <span className="text-[10px] uppercase opacity-35">{task.priority}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.04] p-4 text-xs leading-6">Readiness percentage only reflects checklist completion; it does not predict business success, demand, profit or investment outcome.</div>
                </div>
              )}

              {step === 'launch' && (
                <div className="mt-8">
                  <div className={'rounded-3xl border p-5 ' + (coreReady ? 'border-[#008080]/20 bg-[#008080]/[.05]' : 'border-amber-500/20 bg-amber-500/[.05]')}>
                    <div className="flex items-center gap-3">
                      {coreReady ? <CheckCircle size={24} className="text-[#008080] dark:text-[#72ddda]" weight="fill" /> : <WarningCircle size={24} className="text-amber-700 dark:text-amber-200" />}
                      <div>
                        <div className="text-sm font-black">{coreReady ? 'Core launch milestones are ready' : 'Launch blockers remain'}</div>
                        <div className="mt-1 text-xs opacity-60">{coreReady ? 'You can publish your business profile to Directory.' : 'Complete the required idea, validation, planning, location, legal, finance, supplier and launch tasks first.'}</div>
                      </div>
                    </div>
                  </div>

                  {project?.business_id ? (
                    <div className="mt-6 rounded-3xl border border-[#008080]/20 bg-[#008080]/[.05] p-6">
                      <h2 className="text-xl font-black">Business profile published</h2>
                      <p className="mt-2 text-sm leading-6 opacity-60">Your Business Journey is linked to a FeniX Directory profile.</p>
                      <Link className={BUTTON + ' mt-5'} href="/directory"><Storefront size={18} /> Open Directory</Link>
                    </div>
                  ) : (
                    <button type="button" className={BUTTON + ' mt-6'} disabled={!coreReady || saving} onClick={() => void publishBusiness()}>
                      <Rocket size={18} />
                      {saving ? 'Publishing…' : 'Publish Business Profile'}
                    </button>
                  )}

                  <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[.05] p-4 text-xs leading-6">Publishing creates a FeniX business profile. It does not certify the business, guarantee customers or guarantee financing.</div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link className={SOFT} href="/invest/create">Need funding? Create Investment Opportunity</Link>
                    <Link className={SOFT} href="/commerce">Explore Shop Local</Link>
                  </div>
                </div>
              )}

              {step !== 'legal' && step !== 'suppliers' && step !== 'checklist' && (
                <div className="mt-8 border-t border-black/[.06] pt-5 dark:border-white/[.07]">
                  <div className="flex flex-wrap gap-2">
                    {activeIndex > 0 && <Link className={SOFT} href={previousPath}><ArrowLeft size={17} /> Previous</Link>}
                    {nextPath && <Link className={SOFT} href={nextPath}>Next <ArrowRight size={17} /></Link>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function TopBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link href="/start" className={SOFT}><ArrowLeft size={17} /> Back</Link>
      <Link href="/start/dashboard" className="text-xs font-semibold text-[#008080] dark:text-[#72ddda]">My Journey →</Link>
    </div>
  )
}

function EntryCard({ icon, title, text, href }: { icon: ReactNode; title: string; text: string; href: string }) {
  return (
    <Link href={href} className={CARD + ' group p-5 transition hover:-translate-y-0.5'}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#008080]/[.08] text-[#008080] dark:text-[#72ddda]">{icon}</span>
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 opacity-55">{text}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#008080] dark:text-[#72ddda]">Open <ArrowRight size={14} /></span>
    </Link>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: 'text' | 'number' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold opacity-60">{label}</span>
      <input className={INPUT} type={type} min={type === 'number' ? '0' : undefined} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function FieldArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold opacity-60">{label}</span>
      <textarea className={TEXTAREA} maxLength={6000} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold opacity-60">{label}</span>
      <select className={INPUT} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option ? labelize(option) : 'Select'}</option>)}
      </select>
    </label>
  )
}

function StatusSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Select label={label} value={value} onChange={onChange} options={['not_started', 'evidence_found', 'needs_research']} />
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/[.06] bg-black/[.018] p-4 dark:border-white/[.07] dark:bg-white/[.025]">
      <div className="text-xs font-semibold opacity-50">{label}</div>
      <div className="mt-2 text-lg font-black">{value}</div>
    </div>
  )
}

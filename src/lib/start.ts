import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

export type StartProject = {
  id: string
  user_id: string
  business_id: string | null
  title: string
  business_type: string | null
  status: 'draft' | 'planning' | 'validation' | 'ready' | 'launched' | 'archived'
  current_step: 'idea' | 'validate' | 'planner' | 'location' | 'legal' | 'finance' | 'suppliers' | 'checklist' | 'launch'
  created_at: string
  updated_at: string
  completed_at: string | null
}

export type StartPreference = {
  id: string
  project_id: string
  business_summary: string | null
  category: string | null
  budget_min: number
  budget_max: number
  experience_level: 'beginner' | 'some_experience' | 'experienced'
  risk_preference: 'low' | 'medium' | 'high'
  goal: 'part_time' | 'full_time' | 'family' | 'growth'
  created_at: string
  updated_at: string
}

export type StartPlan = {
  id: string
  project_id: string
  customer_profile: string | null
  value_proposition: string | null
  products_services: string | null
  operations: string | null
  marketing: string | null
  risks: string | null
  created_at: string
  updated_at: string
}

export type StartValidation = {
  id: string
  project_id: string
  demand_status: 'not_started' | 'evidence_found' | 'needs_research'
  competition_status: 'not_started' | 'evidence_found' | 'needs_research'
  location_status: 'not_started' | 'evidence_found' | 'needs_research'
  supplier_status: 'not_started' | 'evidence_found' | 'needs_research'
  legal_status: 'not_started' | 'evidence_found' | 'needs_research'
  evidence_notes: string | null
  risks: string | null
  data_confidence: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export type StartFinance = {
  id: string
  project_id: string
  rent: number
  interior: number
  equipment: number
  license_cost: number
  inventory_cost: number
  marketing_cost: number
  staff_cost: number
  utility_cost: number
  transport_cost: number
  other_cost: number
  working_capital: number
  emergency_buffer: number
  monthly_fixed_cost: number
  estimated_monthly_sales: number
  gross_margin_pct: number
  created_at: string
  updated_at: string
}

export type StartLocation = {
  id: string
  project_id: string
  district: string
  upazila: string | null
  area: string | null
  market_name: string | null
  selection_reason: string | null
  data_confidence: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export type StartTask = {
  id: string
  project_id: string
  task_key: string
  stage: 'idea' | 'validation' | 'planning' | 'location' | 'legal' | 'finance' | 'suppliers' | 'setup' | 'launch'
  title_bn: string
  title_en: string
  description_bn: string | null
  description_en: string | null
  status: 'pending' | 'completed' | 'skipped'
  priority: 'low' | 'normal' | 'high'
  sort_order: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type StartLegalItem = {
  id: string
  task_key: string
  title_bn: string
  title_en: string
  guidance_bn: string | null
  guidance_en: string | null
  applicability: string
  official_url: string | null
  source_name: string | null
  last_verified_at: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type StartLegalProgress = {
  id: string
  project_id: string
  legal_item_id: string
  status: 'pending' | 'completed' | 'not_applicable'
  notes: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

type TableDefinition<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type StartDatabase = {
  public: {
    Tables: {
      business_start_projects: TableDefinition<
        StartProject,
        Partial<Omit<StartProject, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<StartProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      >
      business_start_preferences: TableDefinition<
        StartPreference,
        Partial<Omit<StartPreference, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<StartPreference, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
      >
      business_start_plans: TableDefinition<
        StartPlan,
        Partial<Omit<StartPlan, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<StartPlan, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
      >
      business_start_validation: TableDefinition<
        StartValidation,
        Partial<Omit<StartValidation, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<StartValidation, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
      >
      business_start_finance: TableDefinition<
        StartFinance,
        Partial<Omit<StartFinance, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<StartFinance, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
      >
      business_start_locations: TableDefinition<
        StartLocation,
        Partial<Omit<StartLocation, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<StartLocation, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
      >
      business_start_tasks: TableDefinition<
        StartTask,
        Partial<Omit<StartTask, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<StartTask, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
      >
      business_start_legal_items: TableDefinition<
        StartLegalItem,
        Partial<Omit<StartLegalItem, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<StartLegalItem, 'id' | 'created_at' | 'updated_at'>>
      >
      business_start_legal_progress: TableDefinition<
        StartLegalProgress,
        Partial<Omit<StartLegalProgress, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<StartLegalProgress, 'id' | 'project_id' | 'legal_item_id' | 'created_at' | 'updated_at'>>
      >
      business_start_documents: TableDefinition<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>
      business_start_activity: TableDefinition<Record<string, unknown>, Record<string, unknown>, never>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type StartClient = SupabaseClient<StartDatabase>

export const START_STEPS = [
  { key: 'idea', label: 'Idea', bn: 'আইডিয়া', path: '/start/idea' },
  { key: 'validate', label: 'Validate', bn: 'যাচাই', path: '/start/validate' },
  { key: 'planner', label: 'Planner', bn: 'পরিকল্পনা', path: '/start/planner' },
  { key: 'location', label: 'Location', bn: 'লোকেশন', path: '/start/location' },
  { key: 'legal', label: 'Legal', bn: 'আইনি', path: '/start/legal' },
  { key: 'finance', label: 'Finance', bn: 'অর্থ', path: '/start/finance' },
  { key: 'suppliers', label: 'Suppliers', bn: 'Supplier', path: '/start/suppliers' },
  { key: 'checklist', label: 'Checklist', bn: 'চেকলিস্ট', path: '/start/checklist' },
  { key: 'launch', label: 'Launch', bn: 'লঞ্চ', path: '/start/launch' },
] as const

export type StartStepKey = (typeof START_STEPS)[number]['key']
export type StartWorkspaceStep = StartStepKey | 'home' | 'dashboard'

export const START_CATEGORIES = [
  'Retail',
  'Food & Beverage',
  'Services',
  'Manufacturing',
  'Agriculture',
  'Education',
  'Technology',
  'Healthcare',
  'Transport',
  'Online',
  'Other',
] as const

export const START_UPAZILAS = [
  'Feni Sadar',
  'Chhagalnaiya',
  'Daganbhuiyan',
  'Fulgazi',
  'Parshuram',
  'Sonagazi',
] as const

export function getStartClient(): StartClient {
  return createClient() as unknown as StartClient
}

export async function getLatestStartProject(client: StartClient, userId: string): Promise<StartProject | null> {
  const { data, error } = await client
    .from('business_start_projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createStartProject(client: StartClient, userId: string, title = 'My FeniX Business Plan'): Promise<StartProject> {
  const safeTitle = title.trim().slice(0, 180) || 'My FeniX Business Plan'
  const { data, error } = await client
    .from('business_start_projects')
    .insert({ user_id: userId, title: safeTitle, status: 'planning', current_step: 'idea' })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function touchStartProject(
  client: StartClient,
  projectId: string,
  userId: string,
  patch: Partial<Pick<StartProject, 'title' | 'business_type' | 'status' | 'current_step' | 'business_id' | 'completed_at'>>,
): Promise<StartProject> {
  const payload = {
    ...patch,
    ...(typeof patch.title === 'string' ? { title: patch.title.trim().slice(0, 180) } : {}),
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await client
    .from('business_start_projects')
    .update(payload)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export function money(value: number): string {
  return new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(Math.max(0, Number(value) || 0))
}

export function calculateStartupFinance(finance: Pick<
  StartFinance,
  'rent' | 'interior' | 'equipment' | 'license_cost' | 'inventory_cost' |
  'marketing_cost' | 'staff_cost' | 'utility_cost' | 'transport_cost' | 'other_cost' |
  'working_capital' | 'emergency_buffer' | 'monthly_fixed_cost' | 'estimated_monthly_sales' | 'gross_margin_pct'
>) {
  const setupCost = [
    finance.rent,
    finance.interior,
    finance.equipment,
    finance.license_cost,
    finance.inventory_cost,
    finance.marketing_cost,
    finance.staff_cost,
    finance.utility_cost,
    finance.transport_cost,
    finance.other_cost,
  ].reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0)

  const workingCapital = Math.max(0, Number(finance.working_capital) || 0)
  const emergencyBuffer = Math.max(0, Number(finance.emergency_buffer) || 0)
  const totalStartingCapital = setupCost + workingCapital + emergencyBuffer
  const margin = Math.min(100, Math.max(0, Number(finance.gross_margin_pct) || 0)) / 100
  const monthlyFixed = Math.max(0, Number(finance.monthly_fixed_cost) || 0)
  const estimatedSales = Math.max(0, Number(finance.estimated_monthly_sales) || 0)
  const breakEvenSales = margin > 0 ? monthlyFixed / margin : 0

  return {
    setupCost,
    totalStartingCapital,
    breakEvenSales,
    salesGap: Math.max(0, breakEvenSales - estimatedSales),
  }
}

export function isStartCoreReady(tasks: StartTask[]): boolean {
  const required = new Set([
    'idea_name',
    'idea_summary',
    'validation_demand',
    'validation_competition',
    'planning_customer',
    'location_choice',
    'legal_review',
    'finance_budget',
    'finance_buffer',
    'supplier_plan',
    'launch_profile',
    'launch_legal',
  ])

  const requiredTasks = tasks.filter((task) => required.has(task.task_key))
  return requiredTasks.length === required.size && requiredTasks.every((task) => task.status === 'completed')
}

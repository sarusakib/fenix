import type { InvestmentOpportunity } from '@/types/database'

export const INVESTMENT_CATEGORIES = [
  'Agriculture',
  'Fisheries',
  'Food Processing',
  'Manufacturing',
  'Retail',
  'Logistics',
  'Technology',
  'Healthcare',
  'Education',
  'Tourism & Hospitality',
  'Real Estate',
  'Services',
  'Other',
] as const

export const RISK_LEVELS = ['low', 'medium', 'high'] as const
export const OFFER_TYPES = ['equity', 'profit_share', 'loan', 'partnership', 'other'] as const

export const UPZILAS = [
  'Feni Sadar',
  'Chagalnaiya',
  'Daganbhuiyan',
  'Fulgazi',
  'Parshuram',
  'Sonagazi',
] as const

export function formatBDT(value: number | null | undefined) {
  return `৳${Number(value ?? 0).toLocaleString('en-BD', { maximumFractionDigits: 2 })}`
}

export function opportunityTitle(opportunity: Pick<InvestmentOpportunity, 'title_bn' | 'title_en'>) {
  return opportunity.title_bn || opportunity.title_en
}

export function progressPercent(opportunity: Pick<InvestmentOpportunity, 'target_amount' | 'raised_amount'>) {
  if (!opportunity.target_amount) return 0
  return Math.min(100, Math.round((Number(opportunity.raised_amount) / Number(opportunity.target_amount)) * 100))
}

export function statusLabel(status: string) {
  return {
    draft: 'Draft',
    pending_review: 'Under review',
    approved: 'Live',
    rejected: 'Changes required',
    fully_funded: 'Fully funded',
    closed: 'Closed',
    cancelled: 'Cancelled',
    interested: 'Interested',
    shortlisted: 'Shortlisted',
    meeting: 'Meeting',
    due_diligence: 'Due diligence',
    terms: 'Terms',
    agreed: 'Agreed',
    withdrawn: 'Withdrawn',
    declined: 'Declined',
    proposed: 'Proposed',
    funding_pending: 'Funding pending',
    funded: 'Funded',
    active: 'Active',
    completed: 'Completed',
  }[status] ?? status.replaceAll('_', ' ')
}

export function riskLabel(risk: string) {
  return risk === 'low' ? 'Lower' : risk === 'high' ? 'Higher' : 'Medium'
}

export function moneyInput(value: string) {
  const clean = value.replace(/[^0-9.]/g, '')
  const pieces = clean.split('.')
  return pieces.length > 2 ? pieces[0] + '.' + pieces.slice(1).join('') : clean
}

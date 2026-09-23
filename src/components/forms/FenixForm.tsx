'use client'

import type { ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { CheckCircle, WarningCircle } from '@phosphor-icons/react'

const controlBase =
  'w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-text)] outline-none transition focus:border-[var(--fx-primary)]/45 focus:ring-4 focus:ring-[var(--fx-primary)]/10 disabled:cursor-not-allowed disabled:opacity-50'

export const fenixControlClass = controlBase

export function FenixInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input {...rest} className={controlBase + ' h-12 px-3 text-sm ' + className} />
}

export function FenixSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', ...rest } = props
  return <select {...rest} className={controlBase + ' h-12 bg-[var(--fx-surface)] px-3 text-sm ' + className} />
}

export function FenixTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return <textarea {...rest} className={controlBase + ' min-h-28 resize-y p-3 text-sm leading-6 ' + className} />
}

export function FenixField({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-2 flex items-center gap-1 text-xs font-bold text-[var(--fx-text)]">
        {label}
        {required && <span aria-hidden="true" className="text-[var(--fx-primary-strong)]">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] leading-5 text-[var(--fx-muted)]">{hint}</span>}
    </label>
  )
}

export function FenixFormMessage({
  tone,
  children,
}: {
  tone: 'error' | 'success'
  children: ReactNode
}) {
  const success = tone === 'success'
  return (
    <div
      role={success ? 'status' : 'alert'}
      className={
        'flex items-start gap-2 rounded-xl border p-3 text-sm ' +
        (success
          ? 'border-[var(--fx-primary)]/20 bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]'
          : 'border-red-500/20 bg-red-500/[.06] text-red-700 dark:text-red-200')
      }
    >
      {success ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <WarningCircle size={18} className="mt-0.5 shrink-0" />}
      <span>{children}</span>
    </div>
  )
}

export function FenixSubmitButton({
  loading = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      type={props.type ?? 'submit'}
      disabled={loading || props.disabled}
      className={
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 ' +
        (props.className ?? '')
      }
    >
      {loading && (
        <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {loading ? 'Please wait…' : children}
    </button>
  )
}

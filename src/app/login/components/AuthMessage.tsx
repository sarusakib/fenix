import {
  CheckCircle,
  XCircle,
} from '@phosphor-icons/react'

interface AuthMessageProps {
  error: string
  success: string
}

export default function AuthMessage({
  error,
  success,
}: AuthMessageProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3.5 text-sm text-red-200"
      >
        <XCircle
          size={20}
          className="mt-0.5 shrink-0"
        />

        <p>{error}</p>
      </div>
    )
  }

  if (success) {
    return (
      <div
        role="status"
        className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3.5 text-sm text-emerald-200"
      >
        <CheckCircle
          size={20}
          className="mt-0.5 shrink-0"
        />

        <p>{success}</p>
      </div>
    )
  }

  return null
}

import { ShieldCheck } from '@phosphor-icons/react'

export default function SecurityNotice() {
  return (
    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/25">
      <ShieldCheck size={15} />

      <span>
        Your authentication is securely handled by Supabase
      </span>
    </div>
  )
}

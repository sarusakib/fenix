import {
  ArrowUpRight,
  Brain,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Sparkle,
} from '@phosphor-icons/react'

export default function LoginVisual() {
  return (
    <section className="relative hidden min-h-screen overflow-hidden bg-[#0b1736] lg:flex lg:w-[52%] xl:w-[55%]">
      <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_15%_20%,rgba(99,216,212,.20),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(215,188,127,.11),transparent_25%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      <div className="absolute left-[12%] top-[13%] h-44 w-44 rounded-full border border-teal-200/10" />
      <div className="absolute right-[12%] top-[28%] h-56 w-56 rounded-full border border-white/10" />
      <div className="absolute bottom-[18%] left-[23%] h-28 w-28 rounded-full border border-amber-200/10" />

      <div className="relative z-10 flex w-full flex-col justify-between p-8 xl:p-12 2xl:p-16">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[.08] text-lg font-black text-white">
            F<span className="text-teal-200">X</span>
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-white">Feni<span className="text-teal-200">X</span></p>
            <p className="text-[9px] font-bold uppercase tracking-[.24em] text-white/40">Feni Business Ecosystem</p>
          </div>
        </div>

        <div className="max-w-2xl pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3.5 py-2 text-xs font-semibold text-white/80 backdrop-blur-xl">
            <Sparkle size={14} weight="fill" className="text-teal-200" />
            One account · one ecosystem
          </div>

          <h1 className="mt-6 text-5xl font-black leading-[.96] tracking-[-.055em] text-white xl:text-6xl 2xl:text-7xl">
            Build.
            <br />
            Connect.
            <br />
            <span className="text-teal-200">Grow.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/60 xl:text-base">
            ফেনীর উদ্যোক্তা, ব্যবসায়ী ও বিনিয়োগকারীদের জন্য একটি calm, trusted এবং connected digital ecosystem.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <VisualCard icon={<Brain size={19} />} title="Feni Brain" body="Ask → understand → act." />
            <VisualCard icon={<MapPin size={19} />} title="Local Intelligence" body="Business + place context." />
            <VisualCard icon={<ShieldCheck size={19} />} title="Trust Layer" body="Clear verification rules." />
          </div>

          <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold text-white/45">
            <CheckCircle size={15} className="text-teal-200" />
            Designed for compact phones, desktop and everything between.
            <ArrowUpRight size={14} className="ml-auto opacity-50" />
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[.24em] text-white/25">
          FeniX — Feni Business Ecosystem
        </p>
      </div>
    </section>
  )
}

function VisualCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-xl">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.08] text-teal-200">{icon}</div>
      <p className="mt-3 text-xs font-black text-white">{title}</p>
      <p className="mt-1 text-[11px] leading-5 text-white/40">{body}</p>
    </div>
  )
}

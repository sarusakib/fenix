export default function LoginVisual() {
  return (
    <section className="relative hidden min-h-screen overflow-hidden lg:flex lg:w-[52%] xl:w-[55%]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/fenix-login-desktop.png')",
        }}
      />

      <div className="absolute inset-0 bg-[#05070b]/10" />

      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b]/20 via-[#05070b]/8 to-[#008080]/12" />

      <div className="relative z-10 flex w-full flex-col justify-between p-8 xl:p-12 2xl:p-16">
        <div className="flex items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl">
            <span className="text-lg font-black">
              F<span className="text-[#008080]">X</span>
            </span>
          </div>

          <div className="ml-3">
            <p className="text-lg font-black tracking-tight">
              Feni<span className="text-[#008080]">X</span>
            </p>

            <p className="text-[9px] uppercase tracking-[0.28em] text-white/45">
              Business Ecosystem
            </p>
          </div>
        </div>

        <div className="max-w-2xl pb-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/75 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[#008080] shadow-[0_0_12px_rgba(0,128,128,0.9)]" />
            Feni&apos;s digital business ecosystem
          </div>

          <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white xl:text-5xl 2xl:text-7xl">
            Build.
            <br />
            Connect.
            <br />
            <span className="text-[#008080]">Grow.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/65 xl:text-base 2xl:text-lg">
            ফেনীর উদ্যোক্তা, ব্যবসায়ী ও বিনিয়োগকারীদের জন্য
            একটি আধুনিক ডিজিটাল ecosystem।
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Ecosystem
              </p>

              <p className="mt-1 text-sm font-bold">
                Local Business
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Powered by
              </p>

              <p className="mt-1 text-sm font-bold">
                FeniX Brain
              </p>
            </div>
          </div>
        </div>

        <p className="text-[10px] uppercase tracking-[0.25em] text-white/25">
          FeniX — Feni Business Ecosystem
        </p>
      </div>
    </section>
  )
    }

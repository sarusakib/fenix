'use client'

export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#030506]"
    >
      {/* =====================================================
          BASE
      ====================================================== */}
      <div className="absolute inset-0 bg-[#030506]" />

      {/* =====================================================
          MOBILE — PORTRAIT
          Full image visible. NO crop.
      ====================================================== */}
      <div className="absolute inset-0 flex items-center justify-center md:hidden">
        <img
          src="/images/IMG_20260907_032431.png"
          alt=""
          className="h-full w-full object-contain object-center"
          draggable={false}
          decoding="async"
        />
      </div>

      {/* =====================================================
          DESKTOP — LANDSCAPE
          Full image visible. NO crop.
      ====================================================== */}
      <div className="absolute inset-0 hidden items-center justify-center md:flex">
        <img
          src="/images/fenix-login-desktop.png"
          alt=""
          className="h-full w-full object-contain object-center"
          draggable={false}
          decoding="async"
        />
      </div>

      {/* =====================================================
          CINEMATIC DARKNESS
      ====================================================== */}
      <div className="absolute inset-0 bg-[#030506]/55" />

      {/* Top depth */}
      <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/55 via-black/15 to-transparent" />

      {/* Bottom depth */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#030506] via-[#030506]/55 to-transparent" />

      {/* =====================================================
          ATMOSPHERE
      ====================================================== */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,128,128,0.12),transparent_45%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_55%,rgba(212,184,121,0.025),transparent_34%)]" />

      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.28)_100%)]" />

      {/* =====================================================
          VERY SUBTLE GRID
      ====================================================== */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  )
}

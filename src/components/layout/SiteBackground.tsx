'use client'

export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-0
        -z-50
        overflow-hidden
        bg-[#030506]
      "
    >
      {/* =====================================================
          PORTRAIT BACKGROUND
          Used whenever viewport is portrait
          ===================================================== */}
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          bg-[#030506]
        "
        style={{
          backgroundImage:
            "url('/images/IMG_20260907_032431.png')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      />

      {/* =====================================================
          LANDSCAPE BACKGROUND
          Used whenever viewport is landscape
          ===================================================== */}
      <div
        className="
          absolute
          inset-0
          hidden
          items-center
          justify-center
          bg-[#030506]
        "
        style={{
          backgroundImage:
            "url('/images/fenix-login-desktop.png')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      />

      {/* =====================================================
          CINEMATIC OVERLAY
          ===================================================== */}
      <div
        className="
          absolute
          inset-0
          bg-white/10
          dark:bg-black/45
        "
      />

      {/* =====================================================
          PREMIUM VIGNETTE
          ===================================================== */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.18)_100%)]
          dark:bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.55)_100%)]
        "
      />
    </div>
  )
}

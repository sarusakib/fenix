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
      {/* PORTRAIT */}
      <div
        className="
          fenix-portrait-background
          absolute
          inset-0
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

      {/* LANDSCAPE */}
      <div
        className="
          fenix-landscape-background
          absolute
          inset-0
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

      {/* OVERLAY */}
      <div
        className="
          absolute
          inset-0
          bg-white/10
          dark:bg-black/45
        "
      />

      {/* VIGNETTE */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.18)_100%)]
          dark:bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.55)_100%)]
        "
      />

      {/* TEAL GLOW */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_20%,rgba(0,128,128,0.16),transparent_45%)]
          opacity-20
          dark:opacity-15
        "
      />
    </div>
  )
}

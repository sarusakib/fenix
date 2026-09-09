'use client'

export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        left-0
        top-0
        z-0
        h-[100svh]
        w-screen
        overflow-hidden
        bg-[#eef3f5]
        dark:bg-[#030506]
      "
    >
      {/* =========================================================
          PORTRAIT BACKGROUND
          ========================================================= */}
      <div
        className="
          fenix-portrait-background
          absolute
          inset-0
          h-full
          w-full
          bg-[#eef3f5]
          bg-center
          bg-no-repeat
          dark:bg-[#030506]
        "
        style={{
          backgroundImage:
            "url('/images/IMG_20260907_032431.png')",
          backgroundSize: 'contain',
        }}
      />

      {/* =========================================================
          LANDSCAPE BACKGROUND
          ========================================================= */}
      <div
        className="
          fenix-landscape-background
          absolute
          inset-0
          h-full
          w-full
          bg-[#eef3f5]
          bg-center
          bg-no-repeat
          dark:bg-[#030506]
        "
        style={{
          backgroundImage:
            "url('/images/fenix-login-desktop.png')",
          backgroundSize: 'contain',
        }}
      />

      {/* =========================================================
          BACKGROUND OVERLAY
          LIGHT = 0% WHITE
          DARK = 40% BLACK
          ========================================================= */}
      <div
        className="
          absolute
          inset-0
          bg-transparent
          dark:bg-black/40
        "
      />

      {/* =========================================================
          CINEMATIC VIGNETTE
          ========================================================= */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.06)_100%)]
          dark:bg-[radial-gradient(circle_at_center,transparent_12%,rgba(0,0,0,0.62)_100%)]
        "
      />

      {/* =========================================================
          SUBTLE TEAL ATMOSPHERE
          ========================================================= */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_18%,rgba(0,128,128,0.07),transparent_45%)]
          dark:bg-[radial-gradient(circle_at_50%_18%,rgba(0,128,128,0.08),transparent_45%)]
        "
      />
    </div>
  )
}

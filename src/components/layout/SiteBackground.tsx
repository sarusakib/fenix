'use client'

import Image from 'next/image'

export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-0
        z-0
        overflow-hidden
        bg-[#030506]
      "
    >
      {/* =====================================================
          PORTRAIT IMAGE

          Active when viewport is portrait.
          Mobile desktop-site mode does NOT force this
          to become landscape if the viewport remains portrait.
      ====================================================== */}
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          portrait:flex
          landscape:hidden
        "
      >
        <Image
          src="/images/IMG_20260907_032431.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            object-contain
            object-center
          "
          draggable={false}
        />
      </div>

      {/* =====================================================
          LANDSCAPE IMAGE

          Active when viewport is landscape.
      ====================================================== */}
      <div
        className="
          absolute
          inset-0
          hidden
          items-center
          justify-center
          portrait:hidden
          landscape:flex
        "
      >
        <Image
          src="/images/fenix-login-desktop.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            object-contain
            object-center
          "
          draggable={false}
        />
      </div>

      {/* =====================================================
          CINEMATIC DARK LAYER
      ====================================================== */}
      <div className="absolute inset-0 bg-[#030506]/55" />

      {/* Top depth */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-[32%]
          bg-gradient-to-b
          from-black/60
          via-black/20
          to-transparent
        "
      />

      {/* Bottom depth */}
      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-[52%]
          bg-gradient-to-t
          from-[#030506]
          via-[#030506]/65
          to-transparent
        "
      />

      {/* Teal atmosphere */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_20%,rgba(0,128,128,0.12),transparent_45%)]
        "
      />

      {/* Gold atmosphere */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_78%_58%,rgba(212,184,121,0.025),transparent_35%)]
        "
      />

      {/* Vignette */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_32%,rgba(0,0,0,0.30)_100%)]
        "
      />

      {/* Very subtle texture */}
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

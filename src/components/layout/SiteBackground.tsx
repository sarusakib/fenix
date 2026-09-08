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
        bg-[#eef3f5]
        dark:bg-[#030506]
      "
    >
      {/* Portrait */}

      <div
        className="
          fenix-portrait-background
          absolute
          inset-0
          items-center
          justify-center
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

      {/* Landscape */}

      <div
        className="
          fenix-landscape-background
          absolute
          inset-0
          items-center
          justify-center
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

      {/* Light / dark cinematic overlay */}

      <div
        className="
          absolute
          inset-0
          bg-white/35
          dark:bg-black/35
        "
      />

      {/* Vignette */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.10)_100%)]
          dark:bg-[radial-gradient(circle_at_center,transparent_12%,rgba(0,0,0,0.58)_100%)]
        "
      />

      {/* Teal cinematic glow */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_18%,rgba(0,128,128,0.12),transparent_45%)]
          opacity-80
          dark:opacity-30
        "
      />
    </div>
  )
}

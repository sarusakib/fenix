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
      {/* Portrait */}
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

      {/* Landscape */}
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

      {/* Controlled cinematic overlay */}
      <div
        className="
          absolute
          inset-0
          bg-white/15
          dark:bg-black/40
        "
      />

      {/* Stable vignette */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.08)_100%)]
          dark:bg-[radial-gradient(circle_at_center,transparent_12%,rgba(0,0,0,0.62)_100%)]
        "
      />

      {/* Subtle teal atmosphere */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_18%,rgba(0,128,128,0.08),transparent_45%)]
          dark:bg-[radial-gradient(circle_at_50%_18%,rgba(0,128,128,0.08),transparent_45%)]
        "
      />
    </div>
  )
}

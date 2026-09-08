export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-0
        z-0
        h-[100dvh]
        w-full
        overflow-hidden
        bg-[#eef3f5]
        dark:bg-[#030506]
      "
    >
      {/* Portrait Background */}
      <div
        className="
          fenix-portrait-background
          absolute
          inset-0
          h-full
          w-full
          bg-[#eef3f5]
          bg-center
          bg-cover
          bg-no-repeat
          dark:bg-[#030506]
        "
        style={{
          backgroundImage:
            "url('/images/IMG_20260907_032431.png')",
        }}
      />

      {/* Landscape Background */}
      <div
        className="
          fenix-landscape-background
          absolute
          inset-0
          h-full
          w-full
          bg-[#030506]
          bg-center
          bg-cover
          bg-no-repeat
          dark:bg-[#030506]
        "
        style={{
          backgroundImage:
            "url('/images/fenix-login-desktop.png')",
        }}
      />

      {/* Very Light Overlay */}
      <div
        className="
          absolute
          inset-0
          bg-white/[0.005]
          dark:bg-black/[0.06]
        "
      />

      {/* Soft Vignette */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.025)_100%)]
          dark:bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.25)_100%)]
        "
      />

      {/* Subtle FeniX Atmosphere */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_15%,rgba(0,128,128,0.045),transparent_42%)]
        "
      />
    </div>
  )
}

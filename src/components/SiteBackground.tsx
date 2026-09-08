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
          bg-cover
          bg-no-repeat
          dark:bg-[#030506]
        "
        style={{
          backgroundImage:
            "url('/images/IMG_20260907_032431.png')",
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
          bg-white/[0.025]
          dark:bg-black/[0.10]
        "
      />

      {/* Soft Vignette */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.055)_100%)]
          dark:bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.35)_100%)]
        "
      />

      {/* Subtle Teal Atmosphere */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_15%,rgba(0,128,128,0.055),transparent_42%)]
        "
      />
    </div>
  )
}

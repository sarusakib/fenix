export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030506]"
    >
      {/* Portrait */}
      <div
        className="
          fenix-portrait-background
          absolute inset-0
          items-center justify-center
          bg-[#030506]
        "
        style={{
          backgroundImage: "url('/images/IMG_20260907_032431.png')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />

      {/* Landscape */}
      <div
        className="
          fenix-landscape-background
          absolute inset-0
          items-center justify-center
          bg-[#030506]
        "
        style={{
          backgroundImage: "url('/images/fenix-login-desktop.png')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />

      {/* Base overlay */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/45" />

      {/* Vignette */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.18)_100%)]
          dark:bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.55)_100%)]
        "
      />

      {/* Teal glow */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_50%_20%,rgba(0,128,128,0.16),transparent_45%)]
          opacity-30
          dark:opacity-20
        "
      />
    </div>
  )
}

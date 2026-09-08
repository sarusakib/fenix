'use client'

import {
  Monitor,
  Moon,
  Sun,
} from '@phosphor-icons/react'

import {
  HomeTheme,
  useHomeTheme,
} from './HomeThemeProvider'

const options: {
  value: HomeTheme
  label: string
}[] = [
  {
    value: 'light',
    label: 'Light',
  },
  {
    value: 'dark',
    label: 'Dark',
  },
  {
    value: 'system',
    label: 'System',
  },
]

function ThemeIcon({
  theme,
}: {
  theme: HomeTheme
}) {
  if (theme === 'light') {
    return (
      <Sun
        size={17}
        weight="duotone"
        aria-hidden="true"
      />
    )
  }

  if (theme === 'dark') {
    return (
      <Moon
        size={17}
        weight="duotone"
        aria-hidden="true"
      />
    )
  }

  return (
    <Monitor
      size={17}
      weight="duotone"
      aria-hidden="true"
    />
  )
}

export default function HomeThemeSwitch() {
  const {
    theme,
    setTheme,
  } = useHomeTheme()

  return (
    <div
      className="
        inline-flex
        items-center
        gap-1
        rounded-full
        border
        border-black/10
        bg-white/80
        p-1
        shadow-sm
        backdrop-blur-xl
        dark:border-white/10
        dark:bg-black/40
      "
      role="group"
      aria-label="Theme selection"
    >
      {options.map((option) => {
        const active =
          theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              setTheme(option.value)
            }
            aria-pressed={active}
            aria-label={`Use ${option.label} theme`}
            title={option.label}
            className={`
              flex
              min-h-10
              min-w-10
              items-center
              justify-center
              gap-1.5
              rounded-full
              px-3
              text-sm
              font-medium
              transition-all
              duration-200
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-teal-500

              ${
                active
                  ? `
                    bg-black
                    text-white
                    shadow-md
                    dark:bg-white
                    dark:text-black
                  `
                  : `
                    text-black/60
                    hover:bg-black/5
                    hover:text-black
                    dark:text-white/60
                    dark:hover:bg-white/10
                    dark:hover:text-white
                  `
              }
            `}
          >
            <ThemeIcon
              theme={option.value}
            />

            <span className="hidden sm:inline">
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
              }

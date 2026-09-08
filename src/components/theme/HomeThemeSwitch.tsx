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

const options: Array<{
  value: HomeTheme
  label: string
  shortLabel: string
  icon: typeof Sun
}> = [
  {
    value: 'light',
    label: 'Light',
    shortLabel: 'Light',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    shortLabel: 'Dark',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    shortLabel: 'Auto',
    icon: Monitor,
  },
]

export default function HomeThemeSwitch() {
  const {
    theme,
    setTheme,
  } = useHomeTheme()

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className="
        inline-flex
        items-center
        gap-1
        rounded-2xl
        border
        border-black/10
        bg-white/80
        p-1
        shadow-lg
        backdrop-blur-xl
        dark:border-white/10
        dark:bg-black/40
      "
    >
      {options.map((option) => {
        const Icon = option.icon
        const active = theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-label={`Use ${option.label} theme`}
            aria-pressed={active}
            title={option.label}
            className={`
              inline-flex
              min-h-10
              min-w-10
              items-center
              justify-center
              gap-2
              rounded-xl
              px-3
              text-sm
              font-medium
              transition-all
              duration-200
              ease-out
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-teal-500
              focus-visible:ring-offset-2
              dark:focus-visible:ring-offset-black

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
            <Icon
              size={18}
              weight={active ? 'fill' : 'regular'}
              aria-hidden="true"
            />

            <span className="hidden sm:inline">
              {option.shortLabel}
            </span>
          </button>
        )
      })}
    </div>
  )
}

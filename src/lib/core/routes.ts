/**
 * FeniX — Central Route Registry
 *
 * Keep application routes in one place.
 * Future services can be added here without scattering
 * hard-coded paths throughout the application.
 */

export const ROUTES = {
  home: '/',

  auth: {
    login: '/login',
    callback: '/auth/callback',
    resetPassword: '/auth/reset-password',
  },

  core: {
    guide: '/guide',
    directory: '/directory',
    business: '/business',
    brain: '/brain',
  },

  future: {
    startBusiness: '/start',
    investment: '/invest',
    marketplace: '/marketplace',
    deals: '/deals',
    jobs: '/jobs',
    requests: '/requests',
    messages: '/messages',
    notifications: '/notifications',
    payments: '/payments',
  },

  dashboard: {
    root: '/dashboard',
    business: '/dashboard/business',
    settings: '/dashboard/settings',
  },
} as const

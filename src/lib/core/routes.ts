/**
 * FeniX — Central Route Registry
 *
 * Single source of truth for application routes.
 *
 * Rules:
 * - Keep active routes aligned with real App Router pages.
 * - Keep future modules organized without scattering paths.
 * - Avoid hard-coded routes where ROUTES can be used.
 * - Route changes should normally happen in this file only.
 *
 * Current foundation:
 *   /login
 *   /auth/callback
 *   /auth/reset-password
 *   /guide
 *   /directory
 *   /start
 *   /invest
 *
 * Future modules are registered here for architecture planning,
 * but registering a route does NOT create the page automatically.
 */

export const ROUTES = {
  /* ============================================================
     HOME
     ============================================================ */

  home: '/',

  /* ============================================================
     AUTHENTICATION
     ============================================================ */

  auth: {
    login: '/login',
    callback: '/auth/callback',
    resetPassword: '/auth/reset-password',
  },

  /* ============================================================
     CURRENT CORE
     ============================================================ */

  core: {
    /**
     * Feni Brain / Business Guide
     */
    guide: '/guide',

    /**
     * Business and local service directory
     */
    directory: '/directory',

    /**
     * Start a Business
     */
    start: '/start',

    /**
     * Investment / opportunity discovery
     */
    invest: '/invest',

    /**
     * Backward-compatible aliases.
     *
     * These are kept temporarily so existing code that may still
     * reference the older registry names does not break.
     *
     * They point to real active routes instead of nonexistent pages.
     */
    business: '/start',
    brain: '/guide',
  },

  /* ============================================================
     COMMERCE
     *
     * Commerce is kept as a separate module so it can grow into
     * a complete multi-vendor marketplace without coupling its
     * routes to the main FeniX core.
     *
     * Registering these paths does NOT mean every page exists yet.
     * Pages will be activated phase-by-phase.
     * ============================================================ */

  commerce: {
    root: '/commerce',

    shop: '/shop',
    product: '/product',

    cart: '/cart',
    checkout: '/checkout',

    orders: '/orders',
    order: (id: string) => `/orders/${encodeURIComponent(id)}`,

    seller: '/seller',

    sellerProducts: '/seller/products',
    sellerNewProduct: '/seller/products/new',
    sellerProduct: (id: string) =>
      `/seller/products/${encodeURIComponent(id)}`,

    sellerOrders: '/seller/orders',
    sellerOrder: (id: string) =>
      `/seller/orders/${encodeURIComponent(id)}`,

    sellerInventory: '/seller/inventory',
    sellerSettings: '/seller/settings',

    /**
     * Dynamic public URLs.
     *
     * Slugs are encoded so spaces/special characters cannot
     * accidentally create malformed URLs.
     */
    shopBySlug: (slug: string) =>
      `/shop/${encodeURIComponent(slug)}`,

    productBySlug: (slug: string) =>
      `/product/${encodeURIComponent(slug)}`,
  },

  /* ============================================================
     FUTURE ECOSYSTEM MODULES
     *
     * These are intentionally separated from the active core.
     * They can be activated later without restructuring ROUTES.
     * ============================================================ */

  future: {
    /**
     * Business
     */
    startBusiness: '/start',

    /**
     * Investment
     */
    investment: '/invest',

    /**
     * Commerce compatibility alias.
     *
     * Old marketplace references can move toward /commerce
     * without pointing to a nonexistent route.
     */
    marketplace: '/commerce',

    /**
     * Future opportunity/deal discovery
     */
    deals: '/deals',

    /**
     * Jobs and career ecosystem
     */
    jobs: '/jobs',

    /**
     * Business/customer requests
     */
    requests: '/requests',

    /**
     * Messaging
     */
    messages: '/messages',

    /**
     * Notifications
     */
    notifications: '/notifications',

    /**
     * Future payment module.
     *
     * This is a route registry entry only.
     * Payment processing must never be implemented by trusting
     * client-side route access.
     */
    payments: '/payments',
  },

  /* ============================================================
     DASHBOARD
     * ============================================================ */

  dashboard: {
    root: '/dashboard',

    business: '/dashboard/business',

    settings: '/dashboard/settings',
  },
} as const

/* ==============================================================
   TYPE HELPERS
   ==============================================================
   These types allow future code to derive route keys from the
   central registry without duplicating string unions manually.
   ============================================================== */

export type RouteRegistry = typeof ROUTES

export type CoreRoute = keyof RouteRegistry['core']

export type CommerceRoute = keyof RouteRegistry['commerce']

export type FutureRoute = keyof RouteRegistry['future']

export type DashboardRoute = keyof RouteRegistry['dashboard']

/* ==============================================================
   COMMON ROUTE HELPERS
   ============================================================== */

/**
 * Safely create a query URL for FeniX search.
 *
 * Example:
 *   buildSearchRoute('mobile shops')
 *   -> /guide?q=mobile%20shops
 */
export function buildSearchRoute(query: string): string {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return ROUTES.core.guide
  }

  return `${ROUTES.core.guide}?q=${encodeURIComponent(
    normalizedQuery,
  )}`
}

/**
 * Safely create an authentication callback URL.
 *
 * Useful when an absolute URL is required by an auth provider.
 */
export function buildAuthCallbackUrl(origin: string): string {
  const normalizedOrigin = origin.replace(/\/+$/, '')

  return `${normalizedOrigin}${ROUTES.auth.callback}`
}

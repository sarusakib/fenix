/**
 * FeniX — Central Route Registry
 *
 * Single source of truth for application routes.
 *
 * Rules:
 * - Keep routes centralized.
 * - Keep active routes aligned with the App Router.
 * - Keep future modules organized from the beginning.
 * - Avoid scattering hard-coded paths across the application.
 * - Adding a route here does NOT create a page automatically.
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
     CORE FENIX
     ============================================================ */

  core: {
    /**
     * Feni Brain / Business Guide
     */
    guide: '/guide',

    /**
     * Local business and service directory
     */
    directory: '/directory',

    /**
     * Start a Business
     */
    start: '/start',

    /**
     * Investment and opportunity discovery
     */
    invest: '/invest',
  },

  /* ============================================================
     COMMERCE
     *
     * Complete commerce module.
     *
     * Public:
     *   /commerce
     *   /shop/[slug]
     *   /product/[slug]
     *   /cart
     *   /checkout
     *   /orders
     *
     * Seller:
     *   /seller
     *   /seller/products
     *   /seller/products/new
     *   /seller/products/[id]
     *   /seller/orders
     *   /seller/orders/[id]
     *   /seller/inventory
     *   /seller/settings
     * ============================================================ */

  commerce: {
    root: '/commerce',

    shop: '/shop',

    product: '/product',

    cart: '/cart',

    checkout: '/checkout',

    orders: '/orders',

    order: (id: string) =>
      `/orders/${encodeURIComponent(id)}`,

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
     * Public shop URL
     */
    shopBySlug: (slug: string) =>
      `/shop/${encodeURIComponent(slug)}`,

    /**
     * Public product URL
     */
    productBySlug: (slug: string) =>
      `/product/${encodeURIComponent(slug)}`,
  },

  /* ============================================================
     ECOSYSTEM
     *
     * These routes are part of the planned FeniX ecosystem.
     * They will be implemented in their respective phases.
     * ============================================================ */

  ecosystem: {
    deals: '/deals',

    jobs: '/jobs',

    requests: '/requests',

    messages: '/messages',

    notifications: '/notifications',

    payments: '/payments',
  },

  /* ============================================================
     DASHBOARD
     ============================================================ */

  dashboard: {
    root: '/dashboard',

    business: '/dashboard/business',

    settings: '/dashboard/settings',
  },
} as const

/* ==============================================================
   ROUTE TYPES
   ============================================================== */

export type RouteRegistry = typeof ROUTES

export type CoreRoute = keyof RouteRegistry['core']

export type CommerceRoute = keyof RouteRegistry['commerce']

export type EcosystemRoute = keyof RouteRegistry['ecosystem']

export type DashboardRoute = keyof RouteRegistry['dashboard']

/* ==============================================================
   ROUTE HELPERS
   ============================================================== */

/**
 * Build a Feni Brain search URL.
 *
 * Example:
 *   buildSearchRoute('mobile shops')
 *
 * Result:
 *   /guide?q=mobile%20shops
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
 * Build an authentication callback URL.
 *
 * Example:
 *   buildAuthCallbackUrl('https://example.com')
 *
 * Result:
 *   https://example.com/auth/callback
 */
export function buildAuthCallbackUrl(origin: string): string {
  const normalizedOrigin = origin.replace(/\/+$/, '')

  return `${normalizedOrigin}${ROUTES.auth.callback}`
}

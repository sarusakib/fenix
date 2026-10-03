/**
 * FeniX — Central Route Registry.
 *
 * Canonical user-facing routes live here. Feature links should use this
 * registry instead of inventing parallel paths.
 *
 * Legacy routes are kept only for backwards compatibility and should
 * redirect to their canonical destinations when a route is obsolete.
 */
export const ROUTES = {
  home: '/feed',
  feed: '/feed',
  search: '/search',
  services: '/services',
  settings: '/settings',
  help: '/help',
  emergency: '/emergency',
  blood: '/care/blood',
  admin: '/admin',
  policy: '/policy',

  auth: {
    login: '/login',
    callback: '/auth/callback',
    resetPassword: '/auth/reset-password',
  },

  core: {
    feed: '/feed',
    search: '/search',
    network: '/services',
    guide: '/guide',
    directory: '/directory',
    start: '/start',
    invest: '/invest',
    profile: '/profile',
    messages: '/messages',
    notifications: '/notifications',
  },

  directory: {
    root: '/directory',
    business: (slugOrId: string) => '/directory/' + encodeURIComponent(slugOrId),
    map: '/directory/map',
    suppliers: '/directory/suppliers',
    join: '/directory/join',
    manage: '/directory/manage',
    claim: '/directory/claim',
    verify: '/directory/verify',
    qr: (slugOrId: string) => '/directory/' + encodeURIComponent(slugOrId) + '/qr',
  },

  start: {
    root: '/start',
    idea: '/start/idea',
    validate: '/start/validate',
    planner: '/start/planner',
    location: '/start/location',
    legal: '/start/legal',
    finance: '/start/finance',
    suppliers: '/start/suppliers',
    checklist: '/start/checklist',
    launch: '/start/launch',
    dashboard: '/start/dashboard',
  },

  investment: {
    root: '/invest',
    create: '/invest/create',
    profile: '/invest/profile',
    dashboard: '/invest/dashboard',
    manage: '/invest/manage',
    calculator: '/invest/calculator',
    dueDiligence: '/invest/due-diligence',
    opportunity: (id: string) => '/invest/' + encodeURIComponent(id),
  },

  commerce: {
    root: '/commerce',
    shop: '/shop',
    product: '/product',
    cart: '/commerce/cart',
    checkout: '/commerce/checkout',
    orders: '/commerce/orders',
    order: (id: string) => '/commerce/orders/' + encodeURIComponent(id),
    seller: '/commerce/seller',
    sellerProducts: '/commerce/seller/products',
    sellerNewProduct: '/commerce/seller/products/new',
    sellerProduct: (id: string) => '/commerce/seller/products/' + encodeURIComponent(id),
    sellerOrders: '/commerce/seller/orders',
    sellerOrder: (id: string) => '/commerce/seller/orders/' + encodeURIComponent(id),
    sellerInventory: '/commerce/seller/inventory',
    sellerSettings: '/commerce/seller/settings',
    admin: '/commerce/admin',
    shopBySlug: (slug: string) => '/shop/' + encodeURIComponent(slug),
    productBySlug: (slug: string) => '/product/' + encodeURIComponent(slug),
  },

  ecosystem: {
    radar: '/radar',
    deals: '/deals',
    jobs: '/jobs',
    requests: '/requests',
    messages: '/messages',
    notifications: '/notifications',
    settings: '/settings',
    blocked: '/settings/blocked',
    saved: '/saved',
    news: '/news',
  },

  dashboard: {
    root: '/dashboard',
    business: '/dashboard/business',
    /**
     * Kept as a registry alias for old dashboard links. The canonical
     * settings route is /settings.
     */
    settings: '/settings',
  },

  legacy: {
    home: '/',
    dashboardSettings: '/dashboard/settings',
    feni: '/feni',
  },
} as const

export type RouteRegistry = typeof ROUTES
export type CoreRoute = keyof RouteRegistry['core']
export type StartRoute = keyof RouteRegistry['start']
export type InvestmentRoute = keyof RouteRegistry['investment']
export type CommerceRoute = keyof RouteRegistry['commerce']
export type EcosystemRoute = keyof RouteRegistry['ecosystem']
export type DashboardRoute = keyof RouteRegistry['dashboard']

export function buildSearchRoute(query: string): string {
  const normalizedQuery = query.trim()
  return normalizedQuery
    ? ROUTES.search + '?q=' + encodeURIComponent(normalizedQuery)
    : ROUTES.search
}

export function buildAuthCallbackUrl(origin: string): string {
  return origin.replace(/\/+$/, '') + ROUTES.auth.callback
}

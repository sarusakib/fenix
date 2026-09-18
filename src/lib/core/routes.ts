/**
 * FeniX — Central Route Registry.
 * Keep navigation paths in one place so feature routes remain consistent.
 */
export const ROUTES = {
  home: '/',
  admin: '/admin',
  auth: {
    login: '/login',
    callback: '/auth/callback',
    resetPassword: '/auth/reset-password',
  },
  core: {
    guide: '/guide',
    directory: '/directory',
    start: '/start',
    invest: '/invest',
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

export type RouteRegistry = typeof ROUTES
export type CoreRoute = keyof RouteRegistry['core']
export type StartRoute = keyof RouteRegistry['start']
export type InvestmentRoute = keyof RouteRegistry['investment']
export type CommerceRoute = keyof RouteRegistry['commerce']
export type EcosystemRoute = keyof RouteRegistry['ecosystem']
export type DashboardRoute = keyof RouteRegistry['dashboard']

export function buildSearchRoute(query: string): string {
  const normalizedQuery = query.trim()
  return normalizedQuery ? ROUTES.core.guide + '?q=' + encodeURIComponent(normalizedQuery) : ROUTES.core.guide
}

export function buildAuthCallbackUrl(origin: string): string {
  return origin.replace(/\/+$/, '') + ROUTES.auth.callback
}

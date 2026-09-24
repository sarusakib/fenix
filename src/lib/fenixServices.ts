/**
 * FeniX service graph
 *
 * Keep the visible navigation small and intentional. A group is the first
 * decision; its children are the second decision. "planned" entries remain
 * only includes workflows that have a real route behind them.
 */
export type FeniXServiceStatus = 'live' | 'planned'

export type FeniXServiceIcon =
  | 'rocket'
  | 'storefront'
  | 'trend'
  | 'brain'
  | 'shop'
  | 'briefcase'
  | 'shield'
  | 'account'
  | 'map'
  | 'users'
  | 'newspaper'

export type FeniXService = {
  id: string
  label: string
  labelBn: string
  description: string
  href?: string
  status: FeniXServiceStatus
  icon: FeniXServiceIcon
  tag?: string
}

export type FeniXServiceGroup = {
  id: string
  label: string
  labelBn: string
  description: string
  icon: FeniXServiceIcon
  services: readonly FeniXService[]
}

export const FENIX_SERVICE_GROUPS: readonly FeniXServiceGroup[] = [
  {
    id: 'build',
    label: 'Build',
    labelBn: 'শুরু করুন',
    description: 'Idea থেকে launch পর্যন্ত business journey এক জায়গায়।',
    icon: 'rocket',
    services: [
      { id: 'start-business', label: 'Start a Business', labelBn: 'ব্যবসা শুরু', description: 'Idea, validation, planning, location and launch.', href: '/start', status: 'live', icon: 'rocket', tag: 'Core' },
      { id: 'business-journey', label: 'Business Journey', labelBn: 'বিজনেস জার্নি', description: 'Continue saved planning and launch work.', href: '/start/dashboard', status: 'live', icon: 'rocket' },
      { id: 'business-identity', label: 'Business Identity', labelBn: 'বিজনেস প্রোফাইল', description: 'Create a local business presence people can discover.', href: '/directory/join', status: 'live', icon: 'storefront' },
      { id: 'business-guide', label: 'Business Guide', labelBn: 'ব্যবসা গাইড', description: 'Ask Feni Brain for the next practical step.', href: '/guide', status: 'live', icon: 'brain' },
    ],
  },
  {
    id: 'connect',
    label: 'Connect',
    labelBn: 'কানেক্ট',
    description: 'Business, supplier, partner and request discovery.',
    icon: 'users',
    services: [
      { id: 'directory', label: 'Business Directory', labelBn: 'ব্যবসা ডিরেক্টরি', description: 'Discover local businesses and services.', href: '/directory', status: 'live', icon: 'storefront', tag: 'Core' },
      { id: 'suppliers', label: 'Find Suppliers', labelBn: 'সাপ্লায়ার খুঁজুন', description: 'Find relevant suppliers and local business relationships.', href: '/directory/suppliers', status: 'live', icon: 'storefront' },
      { id: 'requests', label: 'Requests', labelBn: 'রিকোয়েস্ট', description: 'Track investment and ecosystem requests.', href: '/requests', status: 'live', icon: 'users' },
      { id: 'messages', label: 'Messages', labelBn: 'মেসেজ', description: 'Protected conversations inside eligible workflows.', href: '/messages', status: 'live', icon: 'account' },
      { id: 'feed', label: 'Community Feed', labelBn: 'কমিউনিটি ফিড', description: 'Ask, share and discover local conversations.', href: '/feed', status: 'live', icon: 'users' },
    ],
  },
  {
    id: 'invest',
    label: 'Invest',
    labelBn: 'ইনভেস্ট',
    description: 'Opportunity discovery with verification and due-diligence context.',
    icon: 'trend',
    services: [
      { id: 'investment', label: 'Invest in Feni', labelBn: 'ফেনীতে বিনিয়োগ', description: 'Browse published opportunities.', href: '/invest', status: 'live', icon: 'trend', tag: 'Core' },
      { id: 'investor-profile', label: 'Investor Profile', labelBn: 'ইনভেস্টর প্রোফাইল', description: 'Keep investor preferences and verification together.', href: '/invest/profile', status: 'live', icon: 'account' },
      { id: 'investment-workspace', label: 'Investment Workspace', labelBn: 'ইনভেস্টমেন্ট ওয়ার্কস্পেস', description: 'Manage interests, records and workflow.', href: '/invest/dashboard', status: 'live', icon: 'trend' },
      { id: 'scenario-calculator', label: 'Scenario Calculator', labelBn: 'সিনারিও ক্যালকুলেটর', description: 'Explore assumptions without promising returns.', href: '/invest/calculator', status: 'live', icon: 'trend' },
      { id: 'due-diligence', label: 'Due Diligence Center', labelBn: 'ডিউ ডিলিজেন্স', description: 'Structured evidence review before an investment decision.', href: '/invest/due-diligence', status: 'live', icon: 'shield' },
    ],
  },
  {
    id: 'shop',
    label: 'Shop',
    labelBn: 'শপ',
    description: 'Local commerce for discovery, buying and selling.',
    icon: 'shop',
    services: [
      { id: 'shop-local', label: 'Shop Local', labelBn: 'লোকাল শপ', description: 'Browse published local products.', href: '/commerce', status: 'live', icon: 'shop', tag: 'Core' },
      { id: 'cart', label: 'Cart', labelBn: 'কার্ট', description: 'Review selected items before checkout.', href: '/commerce/cart', status: 'live', icon: 'shop' },
      { id: 'orders', label: 'Orders', labelBn: 'অর্ডার', description: 'Follow your local commerce orders.', href: '/commerce/orders', status: 'live', icon: 'shop' },
      { id: 'sell', label: 'Sell on FeniX', labelBn: 'বিক্রি করুন', description: 'Apply to become an approved local seller.', href: '/commerce/sell', status: 'live', icon: 'storefront' },
    ],
  },
  {
    id: 'discover',
    label: 'Discover',
    labelBn: 'ডিসকভার',
    description: 'Explore places, work and local opportunity signals.',
    icon: 'map',
    services: [
      { id: 'search', label: 'Search FeniX', labelBn: 'ফেনিক্স সার্চ', description: 'Search businesses, products and places in one place.', href: '/search', status: 'live', icon: 'search', tag: 'Core' },
      { id: 'brain', label: 'Feni Brain', labelBn: 'ফেনি ব্রেইন', description: 'Ask natural questions and get source-aware guidance.', href: '/guide', status: 'live', icon: 'brain', tag: 'Core' },
      { id: 'jobs', label: 'Jobs & Work', labelBn: 'চাকরি ও কাজ', description: 'Explore the work and opportunity direction.', href: '/jobs', status: 'live', icon: 'briefcase' },
      { id: 'radar', label: 'Opportunity Radar', labelBn: 'অপর্চুনিটি রাডার', description: 'Surface local opportunity signals by place and intent.', href: '/radar', status: 'live', icon: 'trend' },
      { id: 'map', label: 'Feni Map', labelBn: 'ফেনি ম্যাপ', description: 'Map-first local discovery and business context.', href: '/directory/map', status: 'live', icon: 'map' },
    ],
  },
  {
    id: 'news',
    label: 'News',
    labelBn: 'নিউজ',
    description: 'FeniX-controlled public news with clear source and verification context.',
    icon: 'newspaper',
    services: [
      { id: 'news', label: 'FeniX News', labelBn: 'ফেনিক্স নিউজ', description: 'Public local news, business updates, notices and FeniX updates.', href: '/news', status: 'live', icon: 'newspaper', tag: 'Public' },
      { id: 'news-latest', label: 'Latest News', labelBn: 'সর্বশেষ খবর', description: 'Read the latest published stories.', href: '/news?sort=latest', status: 'live', icon: 'newspaper' },
      { id: 'news-notices', label: 'Public Notices', labelBn: 'জনসাধারণের নোটিশ', description: 'FeniX-published public notices and announcements.', href: '/news?category=public_notice', status: 'live', icon: 'newspaper' },
      { id: 'news-policy', label: 'News Standards', labelBn: 'নিউজ নীতিমালা', description: 'See source, verification and publication standards.', href: '/policy#news', status: 'live', icon: 'shield' },
    ],
  },
  {
    id: 'trust',
    label: 'Trust',
    labelBn: 'ট্রাস্ট',
    description: 'Verification, safety, policy and responsible-use controls.',
    icon: 'shield',
    services: [
      { id: 'policy', label: 'FeniX Policy', labelBn: 'ফেনিক্স পলিসি', description: 'Trust, privacy, anti-scam and AI rules.', href: '/policy', status: 'live', icon: 'shield' },
      { id: 'verification', label: 'Verification', labelBn: 'ভেরিফিকেশন', description: 'Understand how public verification labels work.', href: '/directory/verify', status: 'live', icon: 'shield' },
      { id: 'claim', label: 'Claim a Business', labelBn: 'বিজনেস ক্লেইম', description: 'Start an ownership/claim workflow.', href: '/directory/claim', status: 'live', icon: 'shield' },
      { id: 'admin-trust', label: 'Trust Center', labelBn: 'ট্রাস্ট সেন্টার', description: 'Admin moderation and review controls.', href: '/admin/trust', status: 'live', icon: 'shield' },
      { id: 'qr', label: 'QR Business Identity', labelBn: 'QR বিজনেস আইডি', description: 'Open Directory, choose a business profile, then share its QR identity.', href: '/directory', status: 'live', icon: 'shield' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    labelBn: 'অ্যাকাউন্ট',
    description: 'Your profile, workspace, notifications and preferences.',
    icon: 'account',
    services: [
      { id: 'workspace', label: 'My Workspace', labelBn: 'আমার ওয়ার্কস্পেস', description: 'Business, journeys, orders and activity together.', href: '/dashboard', status: 'live', icon: 'account', tag: 'Core' },
      { id: 'business', label: 'My Business', labelBn: 'আমার ব্যবসা', description: 'Open your business workspace.', href: '/dashboard/business', status: 'live', icon: 'storefront' },
      { id: 'notifications', label: 'Notifications', labelBn: 'নোটিফিকেশন', description: 'Trust, account and ecosystem activity.', href: '/notifications', status: 'live', icon: 'account' },
      { id: 'settings', label: 'Settings', labelBn: 'সেটিংস', description: 'Appearance, accessibility and safety preferences.', href: '/dashboard/settings', status: 'live', icon: 'account' },
      { id: 'profile', label: 'My Profile', labelBn: 'আমার প্রোফাইল', description: 'Manage your identity, public profile and privacy.', href: '/profile', status: 'live', icon: 'account' },
      { id: 'help', label: 'Help & Safety', labelBn: 'হেল্প ও সেফটি', description: 'Practical answers for using FeniX safely.', href: '/help', status: 'live', icon: 'shield' },
    ],
  },
]

export const FENIX_PRIMARY_SERVICE_GROUPS = FENIX_SERVICE_GROUPS.filter((group) =>
  ['build', 'connect', 'invest', 'shop', 'discover', 'news'].includes(group.id),
)

export function getFeniXServiceGroup(id: string) {
  return FENIX_SERVICE_GROUPS.find((group) => group.id === id) ?? FENIX_SERVICE_GROUPS[0]
}

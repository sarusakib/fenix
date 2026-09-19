/**
 * FeniX Service Map
 *
 * The product surface stays intentionally small while the service graph
 * remains extensible. "planned" entries are discoverable without creating
 * broken links until their backend workflow is ready.
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
    description: 'Turn an idea into a practical business journey.',
    icon: 'rocket',
    services: [
      {
        id: 'start-business',
        label: 'Start a Business',
        labelBn: 'ব্যবসা শুরু',
        description: 'Idea, validation, planning, location and launch.',
        href: '/start',
        status: 'live',
        icon: 'rocket',
        tag: 'Core',
      },
      {
        id: 'business-journey',
        label: 'Business Journey',
        labelBn: 'বিজনেস জার্নি',
        description: 'Continue your saved planning and launch work.',
        href: '/start/dashboard',
        status: 'live',
        icon: 'rocket',
      },
      {
        id: 'business-directory',
        label: 'Create Business Identity',
        labelBn: 'বিজনেস প্রোফাইল',
        description: 'Create a local business identity for discovery.',
        href: '/directory/join',
        status: 'live',
        icon: 'storefront',
      },
      {
        id: 'business-guide',
        label: 'Business Guide',
        labelBn: 'ব্যবসা গাইড',
        description: 'Ask Feni Brain for a guided next step.',
        href: '/guide',
        status: 'live',
        icon: 'brain',
      },
    ],
  },
  {
    id: 'connect',
    label: 'Connect',
    labelBn: 'কানেক্ট',
    description: 'Find businesses, suppliers and people around the ecosystem.',
    icon: 'storefront',
    services: [
      {
        id: 'directory',
        label: 'Business Directory',
        labelBn: 'ব্যবসা ডিরেক্টরি',
        description: 'Discover local businesses and services.',
        href: '/directory',
        status: 'live',
        icon: 'storefront',
      },
      {
        id: 'supplier-discovery',
        label: 'Find Suppliers',
        labelBn: 'সাপ্লায়ার খুঁজুন',
        description: 'Explore suppliers and local business relationships.',
        href: '/directory/suppliers',
        status: 'live',
        icon: 'storefront',
      },
      {
        id: 'requests',
        label: 'Requests',
        labelBn: 'রিকোয়েস্ট',
        description: 'Track your investment interest requests.',
        href: '/requests',
        status: 'live',
        icon: 'trend',
      },
      {
        id: 'messages',
        label: 'Messages',
        labelBn: 'মেসেজ',
        description: 'Protected conversations inside eligible workflows.',
        href: '/messages',
        status: 'live',
        icon: 'account',
      },
    ],
  },
  {
    id: 'invest',
    label: 'Invest',
    labelBn: 'ইনভেস্ট',
    description: 'Explore opportunities with verification and due-diligence context.',
    icon: 'trend',
    services: [
      {
        id: 'invest',
        label: 'Invest in Feni',
        labelBn: 'ফেনীতে বিনিয়োগ',
        description: 'Browse published investment opportunities.',
        href: '/invest',
        status: 'live',
        icon: 'trend',
        tag: 'Core',
      },
      {
        id: 'investor-profile',
        label: 'Investor Profile',
        labelBn: 'ইনভেস্টর প্রোফাইল',
        description: 'Keep your investor preferences and verification flow together.',
        href: '/invest/profile',
        status: 'live',
        icon: 'account',
      },
      {
        id: 'invest-dashboard',
        label: 'Investment Workspace',
        labelBn: 'ইনভেস্টমেন্ট ড্যাশবোর্ড',
        description: 'Manage interests, deal records and workflow.',
        href: '/invest/dashboard',
        status: 'live',
        icon: 'trend',
      },
      {
        id: 'investment-calculator',
        label: 'Scenario Calculator',
        labelBn: 'ক্যালকুলেটর',
        description: 'Model scenarios without promising returns.',
        href: '/invest/calculator',
        status: 'live',
        icon: 'trend',
      },
      {
        id: 'due-diligence',
        label: 'Due Diligence Center',
        labelBn: 'ডিউ ডিলিজেন্স',
        description: 'Structured document and evidence review surface.',
        status: 'planned',
        icon: 'shield',
        tag: 'Planned',
      },
    ],
  },
  {
    id: 'shop',
    label: 'Shop',
    labelBn: 'শপ',
    description: 'Buy, sell and manage local commerce from one place.',
    icon: 'shop',
    services: [
      {
        id: 'shop-local',
        label: 'Shop Local',
        labelBn: 'লোকাল শপ',
        description: 'Browse published local products.',
        href: '/commerce',
        status: 'live',
        icon: 'shop',
        tag: 'Core',
      },
      {
        id: 'cart',
        label: 'Cart',
        labelBn: 'কার্ট',
        description: 'Review selected items before checkout.',
        href: '/commerce/cart',
        status: 'live',
        icon: 'shop',
      },
      {
        id: 'orders',
        label: 'Orders',
        labelBn: 'অর্ডার',
        description: 'Follow your local commerce order history.',
        href: '/commerce/orders',
        status: 'live',
        icon: 'shop',
      },
      {
        id: 'sell',
        label: 'Sell on FeniX',
        labelBn: 'বিক্রি করুন',
        description: 'Apply to become an approved local seller.',
        href: '/commerce/sell',
        status: 'live',
        icon: 'storefront',
      },
    ],
  },
  {
    id: 'discover',
    label: 'Discover',
    labelBn: 'ডিসকভার',
    description: 'Use the Brain and future local intelligence tools to decide what to do next.',
    icon: 'brain',
    services: [
      {
        id: 'brain',
        label: 'Feni Brain',
        labelBn: 'ফেনি ব্রেইন',
        description: 'Ask natural questions and get source-aware guidance.',
        href: '/guide',
        status: 'live',
        icon: 'brain',
        tag: 'Core',
      },
      {
        id: 'jobs',
        label: 'Jobs & Work',
        labelBn: 'চাকরি ও কাজ',
        description: 'Explore the verified-work direction of the ecosystem.',
        href: '/jobs',
        status: 'live',
        icon: 'briefcase',
      },
      {
        id: 'opportunity-radar',
        label: 'Opportunity Radar',
        labelBn: 'অপর্চুনিটি রাডার',
        description: 'Surface local opportunity signals by place and intent.',
        status: 'planned',
        icon: 'trend',
        tag: 'Planned',
      },
      {
        id: 'local-map',
        label: 'Feni Map Intelligence',
        labelBn: 'লোকেশন ইন্টেলিজেন্স',
        description: 'Map-first local discovery with business context.',
        status: 'planned',
        icon: 'storefront',
        tag: 'Planned',
      },
    ],
  },
  {
    id: 'trust',
    label: 'Trust',
    labelBn: 'ট্রাস্ট',
    description: 'Understand verification, safety, privacy and responsible AI rules.',
    icon: 'shield',
    services: [
      {
        id: 'policy',
        label: 'FeniX Policy',
        labelBn: 'ফেনিক্স পলিসি',
        description: 'Read trust, privacy, anti-scam and AI policy.',
        href: '/policy',
        status: 'live',
        icon: 'shield',
      },
      {
        id: 'trust-center',
        label: 'Admin Trust Center',
        labelBn: 'ট্রাস্ট সেন্টার',
        description: 'Administrative moderation and ownership review.',
        href: '/admin/trust',
        status: 'live',
        icon: 'shield',
      },
      {
        id: 'qr-identity',
        label: 'QR Business Identity',
        labelBn: 'QR বিজনেস আইডি',
        description: 'A shareable verified identity surface for businesses.',
        status: 'planned',
        icon: 'shield',
        tag: 'Planned',
      },
      {
        id: 'voice-search',
        label: 'Bangla Voice Search',
        labelBn: 'বাংলা ভয়েস সার্চ',
        description: 'Voice-first Bangla/Banglish discovery.',
        status: 'planned',
        icon: 'brain',
        tag: 'Planned',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    labelBn: 'অ্যাকাউন্ট',
    description: 'One account for your connected FeniX activity.',
    icon: 'account',
    services: [
      {
        id: 'workspace',
        label: 'My Workspace',
        labelBn: 'আমার ওয়ার্কস্পেস',
        description: 'Businesses, journeys, orders and notifications together.',
        href: '/dashboard',
        status: 'live',
        icon: 'account',
        tag: 'Core',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        labelBn: 'নোটিফিকেশন',
        description: 'Trust, account and ecosystem activity.',
        href: '/notifications',
        status: 'live',
        icon: 'account',
      },
      {
        id: 'settings',
        label: 'Settings',
        labelBn: 'সেটিংস',
        description: 'Theme, privacy guidance and app preferences.',
        href: '/dashboard/settings',
        status: 'live',
        icon: 'account',
      },
      {
        id: 'help',
        label: 'Help & Safety',
        labelBn: 'হেল্প ও সেফটি',
        description: 'Quick answers for using FeniX safely.',
        href: '/help',
        status: 'live',
        icon: 'shield',
      },
    ],
  },
]

export const FENIX_PRIMARY_SERVICE_GROUPS = FENIX_SERVICE_GROUPS.filter((group) =>
  ['build', 'connect', 'invest', 'shop', 'discover'].includes(group.id),
)

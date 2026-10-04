import type { MetadataRoute } from 'next'
import { FENI_ARTICLES } from '@/data/feniArticles'
import { createClient } from '@/utils/supabase/server'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fenix-saru-sakib.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '/',
    '/feni',
    '/guide',
    '/directory',
    '/invest',
    '/commerce',
    '/services',
    '/policy',
    '/help',
    '/emergency',
    '/care/blood',
    '/feed',
    '/news',
  ]

  const articles = FENI_ARTICLES.map((article) => `/feni/${article.slug}`)

  const supabase = await createClient()
  const { data: newsPosts } = await supabase
    .from('news_posts')
    .select('slug, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1000)

  const newsUrls = (newsPosts ?? []).map((post) => ({
    url: `${base}/news/${encodeURIComponent(post.slug)}`,
    ...(post.published_at ? { lastModified: new Date(post.published_at) } : {}),
  }))

  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}` })),
    ...articles.map((path) => ({ url: `${base}${path}` })),
    ...newsUrls,
  ]
}

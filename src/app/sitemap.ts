import type { MetadataRoute } from 'next'
import { FENI_ARTICLES } from '@/data/feniArticles'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fenix-saru-sakib.vercel.app'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

type NewsSitemapRow = { slug: string; published_at: string | null }

async function getPublishedNews(): Promise<NewsSitemapRow[]> {
  if (!supabaseUrl || !supabaseAnonKey) return []
  try {
    const url = new URL('/rest/v1/news_posts', supabaseUrl)
    url.searchParams.set('select', 'slug,published_at')
    url.searchParams.set('status', 'eq.published')
    url.searchParams.set('order', 'published_at.desc')
    url.searchParams.set('limit', '5000')
    const response = await fetch(url, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
      next: { revalidate: 3600 },
    })
    if (!response.ok) return []
    const rows = (await response.json()) as unknown
    return Array.isArray(rows)
      ? rows.filter((row): row is NewsSitemapRow => typeof row === 'object' && row !== null && typeof (row as NewsSitemapRow).slug === 'string')
      : []
  } catch { return [] }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['/', '/feni', '/guide', '/directory', '/invest', '/commerce', '/services', '/policy', '/help', '/emergency', '/care/blood', '/feed', '/news']
  const generatedAt = new Date()
  const staticEntries = staticRoutes.map(path => ({ url: `${base}${path}`, lastModified: generatedAt }))
  const guideEntries = FENI_ARTICLES.map(article => ({ url: `${base}/feni/${article.slug}`, lastModified: generatedAt }))
  const newsEntries = (await getPublishedNews()).map(article => ({
    url: `${base}/news/${encodeURIComponent(article.slug)}`,
    ...(article.published_at ? { lastModified: new Date(article.published_at) } : {}),
  }))
  return [...staticEntries, ...guideEntries, ...newsEntries]
}

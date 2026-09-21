import type { MetadataRoute } from 'next'
import { FENI_ARTICLES } from '@/data/feniArticles'

const base=process.env.NEXT_PUBLIC_SITE_URL || 'https://fenix-saru.vercel.app'

export default function sitemap():MetadataRoute.Sitemap{
 const staticRoutes=['/','/feni','/guide','/directory','/directory/map','/invest','/commerce','/services','/radar','/jobs','/pulse','/care','/care/blood','/care/ambulance','/policy','/help','/feed']
 const articles=FENI_ARTICLES.map(a=>`/feni/${a.slug}`)
 return [...staticRoutes,...articles].map(path=>({url:`${base}${path}`,lastModified:new Date()}))
}

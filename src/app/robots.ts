import type { MetadataRoute } from 'next'

const base=process.env.NEXT_PUBLIC_SITE_URL || 'https://fenix-saru.vercel.app'

export default function robots():MetadataRoute.Robots{
 return {
  rules:[
   {userAgent:'*',allow:['/','/feni','/guide','/directory','/directory/map','/invest','/commerce','/services','/radar','/jobs','/pulse','/care','/care/blood','/care/ambulance','/policy','/help','/feed'],disallow:['/admin/','/dashboard/','/messages/','/auth/','/api/']},
   {userAgent:'OAI-SearchBot',allow:['/','/feni','/guide','/directory','/directory/map','/invest','/commerce','/services','/radar','/jobs','/pulse','/care','/care/blood','/care/ambulance','/policy','/help','/feed']},
  ],
  sitemap:`${base}/sitemap.xml`,
 }
}

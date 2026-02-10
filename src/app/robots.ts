import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile/settings/',
          '/_next/',
          '/auth/error/',
        ],
      },
    ],
    sitemap: 'https://resistproject.com/sitemap.xml',
  }
}

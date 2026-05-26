const normalizeSiteUrl = (raw) => {
  if (!raw) return 'https://example.com'
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return `https://${trimmed}`
}

const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SERVER_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL,
)

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/pages-sitemap.xml', '/admin/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/*', '/api/*'],
      },
    ],
    additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`],
  },
}

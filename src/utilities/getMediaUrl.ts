/**
 * Builds a URL for media assets.
 *
 * **Relative paths** (`/media/...`): returned as-is (plus optional cache-bust query).
 * Do not prepend the site origin here: Next.js `<Image>` would treat a full URL as
 * *remote*, which requires `images.remotePatterns` to match exactly — easy to break
 * in dev (`localhost` vs `127.0.0.1`, port changes) and causes 400s from the optimizer.
 *
 * **Absolute URLs** (http/https): returned unchanged except for an optional `v=` param.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  const withCacheBust = (href: string) => {
    if (cacheTag == null || cacheTag === '') return href
    const encoded = encodeURIComponent(cacheTag)
    const sep = href.includes('?') ? '&' : '?'
    return `${href}${sep}v=${encoded}`
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return withCacheBust(url)
  }

  return withCacheBust(url)
}

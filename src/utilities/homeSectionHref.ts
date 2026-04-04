/**
 * Maps common CMS “custom URL” values for home page sections to a single canonical
 * path so links work from any route (hash-only URLs are relative to the current path).
 */
const HOME_SECTION_ALIASES: Record<string, `/#${string}`> = {
  'about-me': '/#about-me',
  '#about-me': '/#about-me',
  '/#about-me': '/#about-me',
  about: '/#about-me',
  '#about': '/#about-me',
  '/about': '/#about-me',
  '/#about': '/#about-me',

  services: '/#services',
  '#services': '/#services',
  '/#services': '/#services',

  work: '/#work',
  '#work': '/#work',
  '/#work': '/#work',
  '/work': '/#work',
}

export function normalizeHomeSectionHref(raw?: string | null): `/#${string}` | null {
  if (!raw) return null
  const key = raw.trim().toLowerCase()
  return HOME_SECTION_ALIASES[key] ?? null
}

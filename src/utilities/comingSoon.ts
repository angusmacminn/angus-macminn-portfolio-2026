export const COMING_SOON_SLUGS = ['writing', 'playground']

export const isComingSoon = (
  url?: string | null,
  reference?: { relationTo: string; value: { slug?: string } | string | number } | null,
): boolean => {
  if (url) {
    const normalized = url.trim().toLowerCase().replace(/^\//, '')
    if (COMING_SOON_SLUGS.some((slug) => normalized === slug || normalized.startsWith(`${slug}/`))) {
      return true
    }
  }
  if (reference && typeof reference.value === 'object' && 'slug' in reference.value) {
    const slug = reference.value.slug?.toLowerCase() ?? ''
    if (COMING_SOON_SLUGS.some((s) => slug === s || slug.startsWith(`${s}/`))) {
      return true
    }
  }
  return false
}

import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Playground } from '../../../payload-types'

export const revalidatePlayground: CollectionAfterChangeHook<Playground> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/playground/${doc.slug}`

      payload.logger.info(`Revalidating playground item at path: ${path}`)

      revalidatePath(path)
      revalidatePath('/playground')
      revalidateTag('playground-sitemap', 'max')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/playground/${previousDoc.slug}`

      payload.logger.info(`Revalidating old playground item at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePath('/playground')
      revalidateTag('playground-sitemap', 'max')
    }
  }

  return doc
}

export const revalidatePlaygroundDelete: CollectionAfterDeleteHook<Playground> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/playground/${doc?.slug}`)
    revalidatePath('/playground')
    revalidateTag('playground-sitemap', 'max')
  }

  return doc
}

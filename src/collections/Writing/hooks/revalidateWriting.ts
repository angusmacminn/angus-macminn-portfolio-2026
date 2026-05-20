import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Writing } from '../../../payload-types'

export const revalidateWriting: CollectionAfterChangeHook<Writing> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/writing/${doc.slug}`

      payload.logger.info(`Revalidating writing post at path: ${path}`)

      revalidatePath(path)
      revalidatePath('/writing')
      revalidateTag('writing-sitemap', 'max')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/writing/${previousDoc.slug}`

      payload.logger.info(`Revalidating old writing post at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePath('/writing')
      revalidateTag('writing-sitemap', 'max')
    }
  }

  return doc
}

export const revalidateWritingDelete: CollectionAfterDeleteHook<Writing> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/writing/${doc?.slug}`)
    revalidatePath('/writing')
    revalidateTag('writing-sitemap', 'max')
  }

  return doc
}

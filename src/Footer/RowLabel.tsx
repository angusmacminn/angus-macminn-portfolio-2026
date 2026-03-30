'use client'
import { Footer } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<
    | NonNullable<Footer['pageLinks']>[number]
    | NonNullable<NonNullable<Footer['pageLinks']>[number]['links']>[number]
    | NonNullable<Footer['socialLinks']>[number]
  >()

  const linkLabel = (data?.data as any)?.link?.label as string | undefined
  const heading = (data?.data as any)?.heading as string | undefined
  const platform = (data?.data as any)?.platform as string | undefined

  const label =
    linkLabel?.trim()
      ? linkLabel
      : heading?.trim()
        ? heading
        : platform?.trim()
          ? platform
          : `Row ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}`.trim()

  return <div>{label}</div>
}

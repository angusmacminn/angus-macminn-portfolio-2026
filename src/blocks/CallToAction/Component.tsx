import React from 'react'

import type { CallToActionBlock as CTABlockProps, Header } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { ContactPopover } from '@/Header/ContactPopover'
import './component.scss'

type Props = CTABlockProps & {
  contactPanel?: Header['contactPanel'] | null
}

export const CallToActionBlock: React.FC<Props> = ({ links, linksBehavior, richText, contactPanel }) => {
  const useContact = linksBehavior === 'contact'

  return (
    <section className="cta-block container">
      <div className="cta-block__inner">
        <div className="cta-block__content">
          {richText && <RichText className="cta-block__rich-text" data={richText} enableGutter={false} />}
        </div>
        <div className="cta-block__links">
          {(links || []).map(({ link }, i) => {
            const btnLabel = link?.label?.trim()
            if (useContact) {
              if (!btnLabel) return null
              return (
                <ContactPopover
                  key={i}
                  appearance="default"
                  label={btnLabel}
                  panel={contactPanel}
                  size="lg"
                  variant="desktop"
                />
              )
            }
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </section>
  )
}

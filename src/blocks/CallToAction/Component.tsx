import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import './component.scss'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <section className="cta-block container">
      <div className="cta-block__inner">
        <div className="cta-block__content">
          {richText && <RichText className="cta-block__rich-text" data={richText} enableGutter={false} />}
        </div>
        <div className="cta-block__links">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </section>
  )
}

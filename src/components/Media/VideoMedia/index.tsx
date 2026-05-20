'use client'

import { cn } from '@/utilities/ui'
import React, { useEffect, useRef } from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const {
    onClick,
    resource,
    videoClassName,
    videoAutoPlay = true,
    videoLoop = true,
    videoMuted = true,
    videoControls = false,
    videoPlaysInline = true,
  } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  // const [showFallback] = useState<boolean>()

  useEffect(() => {
    const { current: video } = videoRef
    if (video) {
      video.addEventListener('suspend', () => {
        // setShowFallback(true);
        // console.warn('Video was suspended, rendering fallback image.')
      })
    }
  }, [])

  if (resource && typeof resource === 'object') {
    const { filename, url } = resource
    const src = url ? getMediaUrl(url) : getMediaUrl(`/media/${filename}`)

    return (
      <video
        autoPlay={videoAutoPlay}
        className={cn(videoClassName)}
        controls={videoControls}
        loop={videoLoop}
        muted={videoMuted}
        onClick={onClick}
        playsInline={videoPlaysInline}
        ref={videoRef}
      >
        <source src={src} />
      </video>
    )
  }

  return null
}

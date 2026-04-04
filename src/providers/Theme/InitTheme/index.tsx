'use client'

import { useServerInsertedHTML } from 'next/navigation'
import React from 'react'

import { defaultTheme, themeLocalStorageKey } from '../shared'

/**
 * Injects the blocking theme script during SSR via useServerInsertedHTML so React 19 never sees a
 * <script> in the client component tree (avoids "Encountered a script tag while rendering").
 */
export const InitTheme: React.FC = () => {
  useServerInsertedHTML(() => {
    const key = JSON.stringify(themeLocalStorageKey)
    const fallback = JSON.stringify(defaultTheme)

    const code = `(function () {
  function getImplicitPreference() {
    var mediaQuery = '(prefers-color-scheme: dark)'
    var mql = window.matchMedia(mediaQuery)
    var hasImplicitPreference = typeof mql.matches === 'boolean'
    if (hasImplicitPreference) {
      return mql.matches ? 'dark' : 'light'
    }
    return null
  }
  function themeIsValid(theme) {
    return theme === 'light' || theme === 'dark'
  }
  var themeToSet = ${fallback}
  var preference = window.localStorage.getItem(${key})
  if (themeIsValid(preference)) {
    themeToSet = preference
  } else {
    var implicitPreference = getImplicitPreference()
    if (implicitPreference) {
      themeToSet = implicitPreference
    }
  }
  document.documentElement.setAttribute('data-theme', themeToSet)
})();`

    return (
      <script
        id="theme-script"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: code }}
      />
    )
  })

  return null
}

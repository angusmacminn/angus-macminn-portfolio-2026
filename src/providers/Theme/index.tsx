'use client'

import React, { createContext, useCallback, use, useEffect, useRef, useState } from 'react'

import type { Theme, ThemeContextType } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void) => {
    ready: Promise<void>
    finished: Promise<void>
  }
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  )
  const isThemeTransitionRunningRef = useRef(false)

  const setTheme = useCallback((themeToSet: Theme | null) => {
    const nextTheme = themeToSet ?? getImplicitPreference()

    const applyTheme = () => {
      if (themeToSet === null) {
        window.localStorage.removeItem(themeLocalStorageKey)
      } else {
        window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      }

      document.documentElement.setAttribute('data-theme', nextTheme || '')
      if (nextTheme) setThemeState(nextTheme)
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const vtDocument = document as DocumentWithViewTransition

    if (
      !vtDocument.startViewTransition ||
      reduceMotion ||
      isThemeTransitionRunningRef.current
    ) {
      applyTheme()
      return
    }

    let transition: ReturnType<NonNullable<DocumentWithViewTransition['startViewTransition']>>
    try {
      isThemeTransitionRunningRef.current = true
      transition = vtDocument.startViewTransition(() => {
        applyTheme()
      })
    } catch {
      isThemeTransitionRunningRef.current = false
      applyTheme()
      return
    }

    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: ['inset(0 0 100% 0)', 'inset(0)'] },
          {
            duration: 600,
            easing: 'cubic-bezier(.22,1,.36,1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      .catch(() => {
        // If transition setup fails, theme is already applied in update callback.
      })

    transition.finished.finally(() => {
      isThemeTransitionRunningRef.current = false
    })
  }, [])

  useEffect(() => {
    let themeToSet: Theme = defaultTheme
    const preference = window.localStorage.getItem(themeLocalStorageKey)

    if (themeIsValid(preference)) {
      themeToSet = preference
    } else {
      const implicitPreference = getImplicitPreference()

      if (implicitPreference) {
        themeToSet = implicitPreference
      }
    }

    document.documentElement.setAttribute('data-theme', themeToSet)
    setThemeState(themeToSet)
  }, [])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)

'use client'

import React, { useState } from 'react'

import type { Theme } from './types'

import { cn } from '@/utilities/ui'
import { useTheme } from '..'
import { themeLocalStorageKey } from './types'
import './index.scss'

const LightModeIcon = () => (
  <svg aria-hidden fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4.069 13h-4.069v-2h4.069c-.041.328-.069.661-.069 1s.028.672.069 1zm3.034-7.312l-2.881-2.881-1.414 1.414 2.881 2.881c.411-.529.885-1.003 1.414-1.414zm11.209 1.414l2.881-2.881-1.414-1.414-2.881 2.881c.528.411 1.002.886 1.414 1.414zm-6.312-3.102c.339 0 .672.028 1 .069v-4.069h-2v4.069c.328-.041.661-.069 1-.069zm0 16c-.339 0-.672-.028-1-.069v4.069h2v-4.069c-.328.041-.661.069-1 .069zm7.931-9c.041.328.069.661.069 1s-.028.672-.069 1h4.069v-2h-4.069zm-3.033 7.312l2.88 2.88 1.415-1.414-2.88-2.88c-.412.528-.886 1.002-1.415 1.414zm-11.21-1.415l-2.88 2.88 1.414 1.414 2.88-2.88c-.528-.411-1.003-.885-1.414-1.414zm6.312-10.897c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z"
      fill="currentColor"
    />
  </svg>
)

const DarkModeIcon = () => (
  <svg aria-hidden fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 0c-1.109 0-2.178.162-3.197.444 3.826 5.933-2.026 13.496-8.781 11.128l-.022.428c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12z"
      fill="currentColor"
    />
  </svg>
)

export const ThemeSelector: React.FC<{ className?: string }> = ({ className }) => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState<Theme | 'auto'>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<Theme>('light')

  const onThemeChange = (themeToSet: Theme | 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
      setValue('auto')
    } else {
      setTheme(themeToSet)
      setValue(themeToSet)
    }
  }

  React.useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    setValue((preference as Theme | null) ?? 'auto')
  }, [])

  React.useEffect(() => {
    const updateResolvedTheme = () => {
      const htmlTheme = document.documentElement.getAttribute('data-theme')
      if (htmlTheme === 'light' || htmlTheme === 'dark') {
        setResolvedTheme(htmlTheme)
        return
      }

      setResolvedTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }

    updateResolvedTheme()

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', updateResolvedTheme)

    return () => mql.removeEventListener('change', updateResolvedTheme)
  }, [value])

  const nextTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark'
  const iconVariant = resolvedTheme === 'dark' ? 'light' : 'dark'

  return (
    <div className={cn('theme-selector', className)}>
      <button
        aria-label={`Switch to ${nextTheme} mode`}
        className="theme-selector__toggle"
        onClick={() => onThemeChange(nextTheme)}
        type="button"
      >
        <span aria-hidden className="theme-selector__icon">
          {iconVariant === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
        </span>
      </button>
    </div>
  )
}

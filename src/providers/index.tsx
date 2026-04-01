import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { LenisProvider } from './LenisProvider'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <LenisProvider>{children}</LenisProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}

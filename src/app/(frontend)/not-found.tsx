import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import './not-found.scss'

export default function NotFound() {
  return (
    <div className="not-found container">
      <div className="not-found__content">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="not-found__message">This page could not be found.</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )
}

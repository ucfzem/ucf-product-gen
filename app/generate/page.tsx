'use client'

import { Suspense } from 'react'
import GeneratePageContent from './content'

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Chargement...</p>
      </main>
    }>
      <GeneratePageContent />
    </Suspense>
  )
}

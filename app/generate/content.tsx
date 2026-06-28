'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface GeneratedProduct {
  title: string
  metaDescription: string
  shortDescription: string
  fullDescription: string
  keyFeatures: string[]
  seoKeywords: string[]
  altTextImages: string[]
}

export default function GeneratePageContent() {
  const searchParams = useSearchParams()

  const parseAttributes = (): Record<string, string> => {
    const attrs: Record<string, string> = {}
    const attrsStr = searchParams.get('attrs') || ''
    if (attrsStr) {
      attrsStr.split(',').forEach(pair => {
        const [k, ...v] = pair.split(':')
        if (k && v.length) attrs[k.trim()] = v.join(':').trim()
      })
    }
    return attrs
  }

  const [formData, setFormData] = useState({
    productName: searchParams.get('name') || '',
    category: searchParams.get('category') || '',
    tone: searchParams.get('tone') || 'professional',
    language: searchParams.get('lang') || 'fr',
    targetAudience: searchParams.get('audience') || '',
    attributes: parseAttributes(),
  })
  const [attrKey, setAttrKey] = useState('')
  const [attrVal, setAttrVal] = useState('')
  const [result, setResult] = useState<GeneratedProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addAttribute = () => {
    if (attrKey && attrVal) {
      setFormData({ ...formData, attributes: { ...formData.attributes, [attrKey]: attrVal } })
      setAttrKey('')
      setAttrVal('')
    }
  }

  const removeAttribute = (key: string) => {
    const attrs = { ...formData.attributes }
    delete attrs[key]
    setFormData({ ...formData, attributes: attrs })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <a href="https://ucfzem.github.io/ucfzem-blog/" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← Retour au blog
      </a>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.5rem' }}>
        🚀 Générateur de Fiches Produit
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        IA-powered · Next.js + GPT-4o · SEO optimisé
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <input className="input" placeholder="Nom du produit" value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })} required />
          <input className="input" placeholder="Catégorie" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <select className="input" value={formData.tone} onChange={e => setFormData({ ...formData, tone: e.target.value })}>
            <option value="professional">Professionnel</option>
            <option value="casual">Décontracté</option>
            <option value="luxury">Luxe</option>
            <option value="technical">Technique</option>
          </select>
          <select className="input" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })}>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <input className="input" placeholder="Public cible (optionnel)" value={formData.targetAudience} onChange={e => setFormData({ ...formData, targetAudience: e.target.value })} style={{ marginBottom: '1rem' }} />

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Attributs techniques :</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input className="input" placeholder="Clé" value={attrKey} onChange={e => setAttrKey(e.target.value)} style={{ flex: 1 }} />
            <input className="input" placeholder="Valeur" value={attrVal} onChange={e => setAttrVal(e.target.value)} style={{ flex: 1 }} />
            <button type="button" onClick={addAttribute} className="btn-gold" style={{ padding: '0.5rem 1rem' }}>+</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.entries(formData.attributes).map(([k, v]) => (
              <span key={k} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeAttribute(k)}>
                {k}: {v} ✕
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-gold" style={{ width: '100%' }}>
          {loading ? '⏳ Génération en cours...' : '🚀 Générer la fiche produit'}
        </button>
      </form>

      <div style={{ margin: '1rem 0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => {
          const params = new URLSearchParams()
          if (formData.productName) params.set('name', formData.productName)
          if (formData.category) params.set('category', formData.category)
          if (formData.tone !== 'professional') params.set('tone', formData.tone)
          if (formData.language !== 'fr') params.set('lang', formData.language)
          if (formData.targetAudience) params.set('audience', formData.targetAudience)
          const attrs = Object.entries(formData.attributes).map(([k, v]) => `${k}:${v}`).join(',')
          if (attrs) params.set('attrs', attrs)
          const url = `${window.location.origin}/generate?${params.toString()}`
          navigator.clipboard.writeText(url)
          alert('Lien copié !')
        }} className="btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          📋 Copier le lien
        </button>
      </div>

      {error && <div className="card" style={{ padding: '1rem', borderColor: '#ef4444', color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

      {result && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '1rem' }}>📄 Résultat</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Titre SEO</h3>
            <p style={{ color: 'var(--text-muted)' }}>{result.title}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Meta Description</h3>
            <p style={{ color: 'var(--text-muted)' }}>{result.metaDescription}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Description Courte</h3>
            <p style={{ color: 'var(--text-muted)' }}>{result.shortDescription}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Description Complète</h3>
            <div style={{ color: 'var(--text-muted)' }} dangerouslySetInnerHTML={{ __html: result.fullDescription }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Caractéristiques Clés</h3>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
              {result.keyFeatures.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Mots-clés SEO</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {result.seoKeywords.map((k, i) => <span key={i} className="tag">{k}</span>)}
            </div>
          </div>

          <div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Alt Text Images</h3>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
              {result.altTextImages.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>
      )}
    </main>
  )
}

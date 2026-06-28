import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ padding: '3rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '1rem' }}>
          ⚡ UcfZem Tech — Outils
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Outils techniques pour e-commerce et développement
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/generate" className="btn-gold" style={{ textAlign: 'center', textDecoration: 'none' }}>
            🚀 Générer une fiche produit
          </Link>
          <a href="https://ucfzem.github.io/ucfzem-blog/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            📖 Retour au blog →
          </a>
        </div>
      </div>
    </main>
  )
}

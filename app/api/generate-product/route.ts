import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ProductInputSchema = z.object({
  productName: z.string().min(2).max(200),
  category: z.string().min(2),
  attributes: z.record(z.string()).optional(),
  tone: z.enum(['professional', 'casual', 'luxury', 'technical']).default('professional'),
  language: z.enum(['fr', 'en', 'es', 'de']).default('fr'),
  targetAudience: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const body = await request.json()
    const input = ProductInputSchema.parse(body)

    const langMap: Record<string, string> = { fr: 'français', en: 'anglais', es: 'espagnol', de: 'allemand' }

    const systemPrompt = `Tu es un rédacteur SEO expert spécialisé dans l'e-commerce ${langMap[input.language] || input.language}.

RÈGLES ABSOLUES :
- Génère UNIQUEMENT du JSON valide.
- Le titre doit contenir le mot-clé principal naturellement.
- La meta description doit inciter au clic (CTA implicite).
- La description complète doit utiliser des balises HTML basiques (<p>, <ul>, <li>, <strong>).
- Les caractéristiques clés doivent être des arguments de vente, pas des specs techniques brutes.
- Les mots-clés SEO doivent être classés par volume de recherche estimé.
- Le ton doit être : ${input.tone}.
- Public cible : ${input.targetAudience || 'grand public'}.

FORMAT DE SORTIE OBLIGATOIRE (JSON) :
{
  "title": "string (10-150 chars)",
  "metaDescription": "string (50-160 chars)",
  "shortDescription": "string (50-300 chars)",
  "fullDescription": "string (200+ chars, HTML)",
  "keyFeatures": ["string", "string", "string"] (3-7 items),
  "seoKeywords": ["string", "string", "string"] (3-10 items),
  "altTextImages": ["string", "string"] (2-5 items)
}`

    const attrsText = input.attributes
      ? Object.entries(input.attributes).map(([k, v]) => `${k}: ${v}`).join('\n')
      : 'Aucun attribut fourni'

    const userPrompt = `Produit : ${input.productName}
Catégorie : ${input.category}
Attributs techniques :
${attrsText}

Génère la fiche produit complète selon le format JSON demandé.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const rawContent = completion.choices[0].message.content
    if (!rawContent) throw new Error('Réponse vide de l\'API')

    const parsed = JSON.parse(rawContent)

    const OutputSchema = z.object({
      title: z.string().min(10).max(150),
      metaDescription: z.string().min(50).max(160),
      shortDescription: z.string().min(50).max(300),
      fullDescription: z.string().min(200),
      keyFeatures: z.array(z.string()).min(3).max(7),
      seoKeywords: z.array(z.string()).min(3).max(10),
      altTextImages: z.array(z.string()),
    })

    const validated = OutputSchema.parse(parsed)

    return NextResponse.json({
      success: true,
      data: validated,
      tokensUsed: completion.usage?.total_tokens,
    })
  } catch (error) {
    console.error('Erreur génération fiche produit:', error)
    return NextResponse.json(
      { success: false, error: 'Échec de la génération. Vérifiez vos paramètres.' },
      { status: 500 }
    )
  }
}

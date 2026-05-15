import { supabase } from '@/lib/supabase'
import indianMedicines from '@/data/indianMedicines'

export async function POST(request) {
  const body = await request.json()
  const { drugs } = body

  // Validate — need at least 2 drugs
  if (!drugs || drugs.length < 2) {
    return Response.json({ error: 'Please provide at least 2 drug names' }, { status: 400 })
  }

  // Convert all drug names through Indian medicine mapping
  const genericDrugs = drugs.map(drug => {
    const lower = drug.toLowerCase().trim()
    return indianMedicines[lower] || lower
  })

  console.log('Checking interactions for:', genericDrugs)

  const results = []

  // Check every pair combination
  for (let i = 0; i < genericDrugs.length; i++) {
    for (let j = i + 1; j < genericDrugs.length; j++) {
      const drugA = genericDrugs[i]
      const drugB = genericDrugs[j]

      // Search Supabase both ways (A+B and B+A)
      const { data: interaction } = await supabase
        .from('drug_interactions')
        .select('*')
        .or(
          `and(drug_a.eq.${drugA},drug_b.eq.${drugB}),and(drug_a.eq.${drugB},drug_b.eq.${drugA})`
        )
        .single()

      if (interaction) {
        // Found in our database — real verified data
        results.push({
          drug_a: drugA,
          drug_b: drugB,
          severity: interaction.severity,
          what_happens: interaction.what_happens,
          what_to_do: interaction.what_to_do,
          source: interaction.source,
          data_source: 'verified_database'
        })
      } else {
        // Not in database — ask Gemini with disclaimer
        console.log(`No DB entry for ${drugA} + ${drugB}, asking Gemini...`)

        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `You are a medical information assistant. A user wants to know if taking ${drugA} and ${drugB} together is safe.

Respond in this exact JSON format only, no extra text:
{
  "severity": "minor" or "moderate" or "major" or "unknown",
  "what_happens": "one sentence explaining what might happen",
  "what_to_do": "one sentence of advice"
}

Base your answer on general medical knowledge. If you are not sure, use severity "unknown".`
                  }]
                }]
              })
            }
          )
        const geminiData = await geminiRes.json()
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

        if (!rawText) throw new Error('Empty Gemini response')

        // Find JSON object in response even if there is extra text
        const jsonMatch = rawText.replace(/```json|```/g, '').match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')
        const parsed = JSON.parse(jsonMatch[0])

        results.push({
          drug_a: drugA,
          drug_b: drugB,
          severity: parsed.severity,
          what_happens: parsed.what_happens,
          what_to_do: parsed.what_to_do,
          source: 'AI estimate',
          data_source: 'ai_fallback',
          disclaimer: '⚠️ This is an AI estimate, not verified medical data. Consult your doctor or pharmacist.'
        })
        } catch (e) {
          console.log('Gemini fallback failed:', e.message)
          results.push({
            drug_a: drugA,
            drug_b: drugB,
            severity: 'unknown',
            what_happens: 'Interaction data not available for this combination.',
            what_to_do: 'Please consult your doctor or pharmacist.',
            source: 'none',
            data_source: 'not_found',
            disclaimer: '⚠️ No data found. Always consult a healthcare professional.'
          })
        }
      }
    }
  }

  return Response.json({
    drugs: genericDrugs,
    interactions: results,
    disclaimer: '⚠️ This tool is for information only. Always consult your doctor before changing medications.'
  })
}
import { supabase } from '@/lib/supabase'
import indianMedicines from '@/data/indianMedicines'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rawName = searchParams.get('drug')

  if (!rawName) {
    return Response.json({ error: 'No drug name provided' }, { status: 400 })
  }

  const drugName = rawName.toLowerCase().trim()
  const genericName = indianMedicines[drugName] || drugName
  console.log(`Searching for: ${drugName} → using: ${genericName}`)

  // Check Supabase cache
  try {
    const { data: cached, error: cacheError } = await supabase
      .from('drug_cache')
      .select('*')
      .eq('drug_name', genericName)
      .single()

    if (cacheError) {
      console.log('Cache miss or error:', cacheError.message)
    }

    if (cached) {
      console.log('Cache hit!')
      return Response.json({ source: 'cache', data: cached.data })
    }
  } catch (e) {
    console.log('Cache check failed:', e.message)
  }

  // RxNorm lookup
  const rxnormRes = await fetch(
    `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(genericName)}&search=1`
  )
  const rxnormData = await rxnormRes.json()
  const rxcui = rxnormData?.idGroup?.rxnormId?.[0]

  if (!rxcui) {
    return Response.json({
      error: `Medicine "${rawName}" not found. Try the generic name.`
    }, { status: 404 })
  }

  console.log(`RxCUI found: ${rxcui}`)

  // FDA lookup
  const fdaRes = await fetch(
    `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(genericName)}"&limit=1`
  )
  const fdaData = await fdaRes.json()

  if (!fdaData.results || fdaData.results.length === 0) {
    return Response.json({ error: `No detailed data found for "${rawName}".` }, { status: 404 })
  }

  const label = fdaData.results[0]

  const drugInfo = {
    name: genericName,
    brand_name: label.openfda?.brand_name?.[0] || rawName,
    purpose: label.purpose?.[0] || label.indications_and_usage?.[0] || 'Not specified',
    warnings: label.warnings?.[0] || label.boxed_warning?.[0] || 'See package insert',
    dosage: label.dosage_and_administration?.[0] || 'Consult your doctor',
    side_effects: label.adverse_reactions?.[0] || label.side_effects?.[0] || 'See package insert',
    who_should_avoid: label.contraindications?.[0] || 'See package insert',
    interactions: label.drug_interactions?.[0] || 'See package insert',
  }

  // Gemini explanation
  try {
    const geminiRes = await fetch(
   `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful medical assistant. Explain this medicine in simple plain English anyone can understand. Be friendly and concise. Always end with: "⚠️ Always consult your doctor or pharmacist before taking any medication."

Medicine: ${drugInfo.name}
Purpose: ${drugInfo.purpose}
Warnings: ${drugInfo.warnings}
Dosage: ${drugInfo.dosage}

Write a simple 4-5 sentence summary.`
            }]
          }]
        })
      }
    )
    const geminiData = await geminiRes.json()
    console.log('Gemini status:', geminiRes.status)
    console.log('Gemini response:', JSON.stringify(geminiData).slice(0, 300))
    drugInfo.simple_explanation = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 'Explanation not available.'
  } catch (e) {
    console.log('Gemini failed:', e.message)
    drugInfo.simple_explanation = 'Explanation not available.'
  }

  // Save to Supabase cache
  try {
    const { error: insertError } = await supabase.from('drug_cache').insert({
      drug_name: genericName,
      data: drugInfo,
      source: 'fda+rxnorm+gemini'
    })
    if (insertError) {
      console.log('Supabase insert error:', insertError.message)
    } else {
      console.log('Saved to Supabase cache successfully!')
    }
  } catch (e) {
    console.log('Supabase insert failed:', e.message)
  }

  return Response.json({ source: 'live', data: drugInfo })
}
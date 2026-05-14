import { supabase } from '@/lib/supabase'
import indianMedicines from '@/data/indianMedicines'

// Smart FDA text parser — no AI needed
function parseIntoStructured(drugInfo) {
  const name = drugInfo.name
  const purposeClean = drugInfo.purpose?.replace(/^Purpose\s*/i, '').trim() || ''
  const dosageClean = drugInfo.dosage?.replace(/^Directions\s*/i, '').trim() || ''
  const warningsClean = drugInfo.warnings?.replace(/^Warnings\s*/i, '').trim() || ''

  // Parse dosage into clean steps
  const dosageSteps = []
  const dosageText = dosageClean.toLowerCase()

  const adultMatch = dosageClean.match(/adults?[^.]+\./i)
  if (adultMatch) dosageSteps.push({ label: 'Adult Dose', value: adultMatch[0].trim() })

  const everyMatch = dosageClean.match(/every \d+[^.]+hours?[^.]*/i)
  if (everyMatch) dosageSteps.push({ label: 'Frequency', value: everyMatch[0].trim() })

  const maxMatch = dosageClean.match(/do not (use|take|exceed)[^.]+24 hours?[^.]*/i)
  if (maxMatch) dosageSteps.push({ label: 'Maximum Per Day', value: maxMatch[0].trim() })

  const childMatch = dosageClean.match(/children (under|below)[^.]+\./i)
  if (childMatch) dosageSteps.push({ label: 'Children', value: childMatch[0].trim() })

  const durationMatch = dosageClean.match(/do not (use|take)[^.]+days?[^.]*/i)
  if (durationMatch) dosageSteps.push({ label: 'Duration', value: durationMatch[0].trim() })

  if (dosageSteps.length === 0 && dosageClean) {
    const sentences = dosageClean.split('.').filter(s => s.trim().length > 10).slice(0, 4)
    sentences.forEach((s, i) => {
      const labels = ['Dosage', 'Frequency', 'Duration', 'Important']
      dosageSteps.push({ label: labels[i] || 'Note', value: s.trim() + '.' })
    })
  }

  if (dosageSteps.length === 0) {
    dosageSteps.push({ label: 'Dosage', value: 'Consult your doctor or pharmacist.' })
  }

  // Parse warnings into cards
  const warningCards = []
  const warningPatterns = [
    { pattern: /allerg[^.]{20,200}\./i, level: 'high', title: 'Allergy Alert' },
    { pattern: /liver[^.]{20,200}\./i, level: 'high', title: 'Liver Warning' },
    { pattern: /kidney[^.]{20,200}\./i, level: 'moderate', title: 'Kidney Warning' },
    { pattern: /heart[^.]{20,200}\./i, level: 'high', title: 'Heart Warning' },
    { pattern: /bleed[^.]{20,200}\./i, level: 'high', title: 'Bleeding Warning' },
    { pattern: /pregnan[^.]{20,200}\./i, level: 'moderate', title: 'Pregnancy' },
    { pattern: /alcohol[^.]{20,200}\./i, level: 'moderate', title: 'Alcohol Warning' },
    { pattern: /overdose[^.]{20,200}\./i, level: 'high', title: 'Overdose' },
    { pattern: /children[^.]{20,200}\./i, level: 'low', title: 'Children' },
    { pattern: /stroke[^.]{20,200}\./i, level: 'high', title: 'Stroke Risk' },
  ]

  for (const wp of warningPatterns) {
    const match = warningsClean.match(wp.pattern)
    if (match && warningCards.length < 4) {
      const body = match[0].trim()
      if (!warningCards.find(w => w.body.slice(0, 30) === body.slice(0, 30))) {
        warningCards.push({ level: wp.level, title: wp.title, body })
      }
    }
  }

  if (warningCards.length === 0 && warningsClean) {
    const sentences = warningsClean.split('.').filter(s => s.trim().length > 20).slice(0, 3)
    sentences.forEach((s, i) => {
      warningCards.push({
        level: i === 0 ? 'high' : i === 1 ? 'moderate' : 'low',
        title: `Warning ${i + 1}`,
        body: s.trim() + '.'
      })
    })
  }

  if (warningCards.length === 0) {
    warningCards.push({
      level: 'low',
      title: 'General Warning',
      body: 'Read the full package insert. Consult your doctor if symptoms persist or worsen.'
    })
  }

  // Parse side effects
  const sideEffectsClean = drugInfo.side_effects || ''
  let commonEffects = []
  let seriousEffects = []

  if (sideEffectsClean && sideEffectsClean !== 'See package insert') {
    const allEffects = sideEffectsClean.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 2 && s.length < 60)
    commonEffects = allEffects.slice(0, 5)
    seriousEffects = allEffects.slice(5, 8)
  }

  if (commonEffects.length === 0) {
    // Generate sensible defaults based on drug class
    const purposeLower = purposeClean.toLowerCase()
    if (purposeLower.includes('pain') || purposeLower.includes('fever')) {
      commonEffects = ['Nausea', 'Stomach upset', 'Headache', 'Dizziness']
      seriousEffects = ['Allergic reaction', 'Severe stomach bleeding']
    } else if (purposeLower.includes('antibiotic') || purposeLower.includes('infect')) {
      commonEffects = ['Nausea', 'Diarrhea', 'Stomach cramps', 'Loss of appetite']
      seriousEffects = ['Allergic reaction', 'Severe diarrhea (C. diff)']
    } else if (purposeLower.includes('diabet') || purposeLower.includes('sugar')) {
      commonEffects = ['Nausea', 'Diarrhea', 'Stomach upset', 'Metallic taste']
      seriousEffects = ['Lactic acidosis (rare)', 'Vitamin B12 deficiency']
    } else {
      commonEffects = ['Nausea', 'Headache', 'Dizziness', 'Stomach upset']
      seriousEffects = ['Allergic reaction', 'Contact doctor if symptoms worsen']
    }
  }

  return {
    clinical_overview: `${name.charAt(0).toUpperCase() + name.slice(1)} is classified as a ${purposeClean}. ${warningsClean.split('.')[0] || 'Use as directed'}. Consult prescribing information for full clinical details.`,
    simple_overview: drugInfo.simple_explanation || `${name.charAt(0).toUpperCase() + name.slice(1)} is used to ${purposeClean.toLowerCase()}. Always take as directed and read the warnings carefully.`,
    mechanism: `Acts as a ${purposeClean.toLowerCase()} to provide relief from symptoms.`,
    approved_for: purposeClean || 'See prescribing information.',
    dosage_steps: dosageSteps,
    dosage_plain: dosageClean
      ? `Take ${name} exactly as directed. ${dosageSteps[0]?.value || ''} Never exceed the recommended dose.`
      : 'Follow your doctor\'s instructions carefully.',
    side_effects_common: commonEffects,
    side_effects_serious: seriousEffects,
    side_effects_note: 'Stop taking and contact your doctor if you experience any serious or unusual side effects.',
    warnings: warningCards,
    who_should_avoid: drugInfo.who_should_avoid || 'Consult your doctor before use if you have any medical conditions.'
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rawName = searchParams.get('drug')

  if (!rawName) {
    return Response.json({ error: 'No drug name provided' }, { status: 400 })
  }

  const drugName = rawName.toLowerCase().trim()
  const genericName = indianMedicines[drugName] || drugName
  console.log(`Searching for: ${drugName} → using: ${genericName}`)

  // Check cache
  try {
    const { data: cached, error: cacheError } = await supabase
      .from('drug_cache')
      .select('*')
      .eq('drug_name', genericName)
      .single()
    if (cacheError) console.log('Cache miss:', cacheError.message)
    if (cached) {
      console.log('Cache hit!')
      return Response.json({ source: 'cache', data: cached.data })
    }
  } catch (e) {
    console.log('Cache check failed:', e.message)
  }

  // RxNorm
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

  // FDA
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
    warnings: label.warnings?.[0] || label.boxed_warning?.[0] || '',
    dosage: label.dosage_and_administration?.[0] || '',
    side_effects: label.adverse_reactions?.[0] || label.side_effects?.[0] || '',
    who_should_avoid: label.contraindications?.[0] || '',
    interactions: label.drug_interactions?.[0] || '',
  }

  // Gemini ONLY for simple plain English summary — short fast task
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `In 3 simple friendly sentences, explain what ${genericName} is used for, who takes it, and one important thing to remember. Write for a patient with no medical background. End with: "⚠️ Always consult your doctor before taking any medication."

Drug purpose: ${drugInfo.purpose?.slice(0, 200)}`
            }]
          }]
        })
      }
    )
    clearTimeout(timeoutId)
    const geminiData = await geminiRes.json()
    drugInfo.simple_explanation = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('Gemini plain English ready!')
  } catch (e) {
    console.log('Gemini skipped:', e.message)
    drugInfo.simple_explanation = ''
  }

  // Build structured data from FDA — always works, no AI needed
  drugInfo.structured = parseIntoStructured(drugInfo)

  // Save to cache
  try {
    const { error: insertError } = await supabase.from('drug_cache').insert({
      drug_name: genericName,
      data: drugInfo,
      source: 'fda+rxnorm+gemini'
    })
    if (insertError) console.log('Cache insert error:', insertError.message)
    else console.log('Saved to cache!')
  } catch (e) {
    console.log('Cache save failed:', e.message)
  }

  return Response.json({ source: 'live', data: drugInfo })
}
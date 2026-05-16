import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import normalRanges from '@/data/normalRanges'

async function getSupabaseWithAuth() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

function parseReportText(text) {
  const results = []
  const lines = text.split('\n')

  for (const line of lines) {
    const pattern = /([a-zA-Z][a-zA-Z\s\(\)\/\-]{2,40})[:\s]+(\d+\.?\d*)/g
    let match

    while ((match = pattern.exec(line)) !== null) {
      const testName = match[1].trim().toLowerCase()
        .replace(/\(.*?\)/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      let value = parseFloat(match[2])

      if (isNaN(value) || testName.length < 2) continue

      const lineLower = line.toLowerCase()
      const isCumm = lineLower.includes('cumm') || 
                     lineLower.includes('mm3') || 
                     lineLower.includes('/mm') ||
                     lineLower.includes('cells/µl') ||
                     lineLower.includes('cells/ul')

      // Smart unit conversion based on value magnitude
      // WBC: normal is 4-11 thousand. If value > 100, it's in absolute units
      if (testName.includes('wbc') || testName.includes('leukocyte') || 
          testName.includes('white blood') || testName.includes('total wbc')) {
        if (value > 100) value = Math.round((value / 1000) * 10) / 10
      }

      // Platelet: normal is 150-400 thousand. If value > 10000, convert
      if (testName.includes('platelet') || testName.includes('plt')) {
        if (value > 10000) value = Math.round(value / 1000)
      }

      // RBC: normal is 4-6 million. If value > 10, it's in absolute units
      if ((testName.includes('rbc') || testName.includes('red blood')) && value > 10) {
        value = Math.round((value / 1000000) * 10) / 10
      }

      results.push({ testName, value, rawLine: line.trim() })
    }
  }

  return results
}
// function flagValues(parsedResults) {
//   const flagged = []
//   const notFound = []

//   for (const result of parsedResults) {
//     const range = normalRanges[result.testName]
//     if (range) {
//       let status = 'NORMAL'
//       if (result.value < range.min) status = 'LOW'
//       if (result.value > range.max) status = 'HIGH'
//       flagged.push({
//         name: range.fullName,
//         value: result.value,
//         unit: range.unit,
//         normal_range: `${range.min} - ${range.max}`,
//         status,
//         raw_line: result.rawLine
//       })
//     } else {
//       // Test found in report but not in our database
//       notFound.push({
//         name: result.testName,
//         value: result.value,
//         unit: 'unknown',
//         normal_range: 'Not in our database',
//         status: 'UNKNOWN',
//         raw_line: result.rawLine
//       })
//     }
//   }

//   return { flagged, notFound }
// }
function getSeverityLabel(value, min, max) {
  const range = max - min
  const percentOver = ((value - max) / range) * 100
  const percentUnder = ((min - value) / range) * 100

  if (value > max) {
    if (percentOver > 50) return 'CRITICALLY HIGH'
    if (percentOver > 20) return 'HIGH'
    return 'BORDERLINE HIGH'
  }
  if (value < min) {
    if (percentUnder > 50) return 'CRITICALLY LOW'
    if (percentUnder > 20) return 'LOW'
    return 'BORDERLINE LOW'
  }
  return 'NORMAL'
}

function flagValues(parsedResults) {
  const flagged = []
  const notFound = []

  for (const result of parsedResults) {
    const range = normalRanges[result.testName]
    if (range) {
      const status = getSeverityLabel(result.value, range.min, range.max)
      const condition = status !== 'NORMAL'
        ? (result.value > range.max
          ? range.condition?.high
          : range.condition?.low) || null
        : null

      flagged.push({
        name: range.fullName,
        value: result.value,
        unit: range.unit,
        normal_range: `${range.min} - ${range.max}`,
        status,
        condition,
        raw_line: result.rawLine
      })
    } else {
      notFound.push({
        name: result.testName,
        value: result.value,
        unit: 'unknown',
        normal_range: 'Not in our database',
        status: 'UNKNOWN',
        condition: null,
        raw_line: result.rawLine
      })
    }
  }

  return { flagged, notFound }
}

async function extractTextFromImageWithGemini(base64Image, mimeType) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              },
              {
                text: `This is a medical blood test report image. Extract ONLY the test names and their numeric result values. Ignore hospital name, patient name, instruments, dates, addresses, and reference ranges.

Return ONLY in this exact format, one test per line, nothing else:
TestName VALUE

Examples:
Hemoglobin 13.5
TSH 0.17
FT4 2.68
Glucose 95
WBC 7.2`
              }
            ]
          }]
        })
      }
    )

    clearTimeout(timeoutId)
    const data = await response.json()
    console.log('Gemini Vision status:', response.status)
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('Gemini Vision extracted:', text)
    return text
  } catch (e) {
    clearTimeout(timeoutId)
    console.log('Gemini Vision failed:', e.message)
    throw e
  }
}

export async function POST(request) {
  const supabase = await getSupabaseWithAuth()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Login required to analyze reports' }, { status: 401 })
  }

  const contentType = request.headers.get('content-type') || ''
  let extractedText = ''

  if (contentType.includes('application/json')) {
    // Text paste mode
    const body = await request.json()
    extractedText = body.extracted_text || ''
  } else if (contentType.includes('multipart/form-data')) {
    // File upload mode
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type

    console.log('File received:', file.name, mimeType)

    if (mimeType === 'application/pdf') {
      return Response.json({
        error: 'For PDF files, please open the PDF, select all text (Ctrl+A), copy and paste it in the text box below.'
      }, { status: 400 })
    } else if (mimeType.startsWith('image/')) {
      console.log('Sending image to Gemini Vision...')
      extractedText = await extractTextFromImageWithGemini(base64, mimeType)
      console.log('Gemini extracted:', extractedText)
    } else {
      return Response.json({ error: 'Please upload an image file (JPG, PNG)' }, { status: 400 })
    }
  }

  if (!extractedText || extractedText.trim().length < 3) {
    return Response.json({ error: 'Could not extract any text from the file.' }, { status: 400 })
  }

  const parsedValues = parseReportText(extractedText)
  const { flagged: flaggedValues, notFound: unknownValues } = flagValues(parsedValues)
  if (flaggedValues.length === 0 && unknownValues.length === 0) {
  return Response.json({
    // error: 'Could not find any blood test values in the text.',
     error: 'Could not match any values to known blood tests. The report may use different test names.',
    raw_extracted: extractedText
  }, { status: 400 })
}
  
     
      

  const abnormalValues = flaggedValues.filter(v => v.status !== 'NORMAL')
  let geminiExplanation = 'All values appear to be within normal range.'
  let doctorQuestions = []
if (abnormalValues.length > 0) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a friendly medical assistant explaining blood test results to a patient.

These values are OUTSIDE normal range:
${abnormalValues.map(v => `- ${v.name}: ${v.value} ${v.unit} (${v.status}, normal: ${v.normal_range})${v.condition ? ', suggests: ' + v.condition : ''}`).join('\n')}

Respond in this exact JSON format only, no extra text:
{
  "explanation": "Write 3-4 crisp sentences. First sentence: what the report overall shows. Second sentence: which values need most attention and why. Third sentence: what the patient should do next. Be warm, clear, and reassuring. No medical jargon.",
  "doctor_questions": [
    "Specific question 1 mentioning exact test name and value",
    "Specific question 2 about treatment or next steps",
    "Specific question 3 about lifestyle or diet changes",
    "Specific question 4 about follow-up tests if needed"
  ]
}

Make each doctor question specific — mention the actual test name and value. Example: 'My hemoglobin is 8.5 g/dL — do I need iron supplements or further tests?' NOT generic questions like 'What do my results mean?'`
              }]
            }]
          })
        }
      )

      const geminiData = await geminiRes.json()
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const cleanText = rawText.replace(/```json|```/g, '').trim()
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        geminiExplanation = parsed.explanation
        doctorQuestions = parsed.doctor_questions
      }
    } catch (e) {
      console.log('Gemini explanation failed:', e.message)
      // Smart fallback explanation
      const criticals = abnormalValues.filter(v => v.status.includes('CRITICALLY'))
      const highs = abnormalValues.filter(v => v.status.includes('HIGH'))
      const lows = abnormalValues.filter(v => v.status.includes('LOW'))

      geminiExplanation = `Your report shows ${abnormalValues.length} value${abnormalValues.length > 1 ? 's' : ''} outside the normal range. ${criticals.length > 0 ? `${criticals.map(v => v.name).join(' and ')} need${criticals.length === 1 ? 's' : ''} immediate attention. ` : ''}${highs.length > 0 ? `${highs.map(v => v.name).join(', ')} ${highs.length === 1 ? 'is' : 'are'} elevated. ` : ''}${lows.length > 0 ? `${lows.map(v => v.name).join(', ')} ${lows.length === 1 ? 'is' : 'are'} low. ` : ''}Please share this report with your doctor for proper evaluation and guidance.`

      doctorQuestions = abnormalValues.slice(0, 4).map(v =>
        `My ${v.name} is ${v.value} ${v.unit} which is ${v.status.toLowerCase()} — what does this mean and what should I do?`
      )
    }
  }

  const analysisResult = {
    all_values: flaggedValues,
    unknown_values: unknownValues,
    abnormal_count: abnormalValues.length,
    explanation: geminiExplanation,
    doctor_questions: doctorQuestions,
    disclaimer: '⚠️ This analysis is for information only. Always consult a qualified doctor for medical advice.'
  }

  try {
    await supabase.from('report_cache').insert({
      user_id: user.id,
      extracted_text: extractedText,
      analysis_result: analysisResult
    })
  } catch (e) {
    console.log('Report cache save failed:', e.message)
  }

  return Response.json(analysisResult)
}
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
    const pattern = /([a-zA-Z][a-zA-Z\s]{2,30})[:\s]+(\d+\.?\d*)/g
    let match
    while ((match = pattern.exec(line)) !== null) {
      const testName = match[1].trim().toLowerCase()
      const value = parseFloat(match[2])
      if (!isNaN(value) && testName.length > 2) {
        results.push({ testName, value, rawLine: line.trim() })
      }
    }
  }
  return results
}

function flagValues(parsedResults) {
  const flagged = []
  const notFound = []

  for (const result of parsedResults) {
    const range = normalRanges[result.testName]
    if (range) {
      let status = 'NORMAL'
      if (result.value < range.min) status = 'LOW'
      if (result.value > range.max) status = 'HIGH'
      flagged.push({
        name: range.fullName,
        value: result.value,
        unit: range.unit,
        normal_range: `${range.min} - ${range.max}`,
        status,
        raw_line: result.rawLine
      })
    } else {
      // Test found in report but not in our database
      notFound.push({
        name: result.testName,
        value: result.value,
        unit: 'unknown',
        normal_range: 'Not in our database',
        status: 'UNKNOWN',
        raw_line: result.rawLine
      })
    }
  }

  return { flagged, notFound }
}
async function extractTextFromImageWithGemini(base64Image, mimeType) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
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
              text: `This is a medical blood test report. Extract ONLY the test names and their result values. 
Ignore everything else like hospital name, instruments, doctor names, dates, reference ranges.

Return the data in this exact simple format, one test per line:
TestName VALUE

Example output:
Hemoglobin 13.5
TSH 0.17
FT4 2.68
Glucose 95

Only return the test name and value pairs, nothing else.`
            }
          ]
        }]
      })
    }
  )

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
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
                text: `You are a helpful medical assistant explaining blood test results to a patient in simple English.

The following values are OUTSIDE normal range:
${abnormalValues.map(v => `- ${v.name}: ${v.value} ${v.unit} (${v.status}, normal is ${v.normal_range})`).join('\n')}

Please respond in this exact JSON format only, no extra text:
{
  "explanation": "2-3 sentences explaining what these abnormal values might mean in simple everyday language",
  "doctor_questions": ["question 1", "question 2", "question 3"]
}

Keep language simple. Do not diagnose. Always suggest seeing a doctor.`
              }]
            }]
          })
        }
      )

      const geminiData = await geminiRes.json()
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const cleanText = rawText.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleanText)
      geminiExplanation = parsed.explanation
      doctorQuestions = parsed.doctor_questions
    } catch (e) {
      console.log('Gemini explanation failed:', e.message)
      geminiExplanation = 'Some values are outside normal range. Please consult your doctor.'
      doctorQuestions = ['What do my abnormal values mean?', 'Do I need follow-up tests?', 'Should I change my diet?']
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
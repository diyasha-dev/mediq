import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
export async function PATCH(request) {
  const supabase = await getSupabaseWithAuth()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()

  const updateData = {}
  if (body.reminder_time !== undefined) updateData.reminder_time = body.reminder_time
  if (body.dosage !== undefined) updateData.dosage = body.dosage
  if (body.frequency !== undefined) updateData.frequency = body.frequency
  if (body.drug_name !== undefined) updateData.drug_name = body.drug_name
  if (body.generic_name !== undefined) updateData.generic_name = body.generic_name

  const { error } = await supabase
    .from('user_medications')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ message: 'Updated successfully' })
}

export async function GET() {
  const supabase = await getSupabaseWithAuth()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_medications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ medications: data })
}

export async function POST(request) {
  const supabase = await getSupabaseWithAuth()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const body = await request.json()
  const { drug_name, generic_name, dosage, frequency, reminder_time } = body

  if (!drug_name) {
    return Response.json({ error: 'Drug name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('user_medications')
    .insert({
      user_id: user.id,
      drug_name,
      generic_name: generic_name || drug_name,
      dosage: dosage || '',
      frequency: frequency || '',
      reminder_time: reminder_time || []
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Auto-check interactions with existing medicines
  const { data: existing } = await supabase
    .from('user_medications')
    .select('generic_name')
    .eq('user_id', user.id)
    .neq('id', data.id)

  let interactionWarnings = []

  if (existing && existing.length > 0) {
    const existingNames = existing.map(m => m.generic_name)
    const newDrug = generic_name || drug_name

    for (const existingDrug of existingNames) {
      const { data: interaction } = await supabase
        .from('drug_interactions')
        .select('*')
        .or(
          `and(drug_a.eq.${newDrug},drug_b.eq.${existingDrug}),and(drug_a.eq.${existingDrug},drug_b.eq.${newDrug})`
        )
        .single()

      if (interaction) {
        interactionWarnings.push({
          drug_a: newDrug,
          drug_b: existingDrug,
          severity: interaction.severity,
          what_happens: interaction.what_happens,
          what_to_do: interaction.what_to_do
        })
      }
    }
  }

  return Response.json({
    medication: data,
    warnings: interactionWarnings,
    message: interactionWarnings.length > 0
      ? `Warning: ${interactionWarnings.length} interaction(s) found with your existing medicines!`
      : 'Medicine added successfully!'
  })
}

export async function DELETE(request) {
  const supabase = await getSupabaseWithAuth()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'Medicine ID required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('user_medications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ message: 'Medicine removed successfully!' })
}
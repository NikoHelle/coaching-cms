'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { drillSchema, sessionSchema } from '@/lib/schemas'
import { createClient } from '@/lib/supabase/server'

function formatZodError(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
}

export async function saveDrill(
  id: string | null,
  input: unknown
): Promise<{ error: string } | void> {
  const parsed = drillSchema.safeParse(input)
  if (!parsed.success) return { error: formatZodError(parsed.error.issues) }

  const supabase = await createClient()
  const { error } = id
    ? await supabase.from('drills').update(parsed.data).eq('id', id)
    : await supabase.from('drills').insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/admin/drills')
}

export async function deleteDrill(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('drills').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/', 'layout')
}

export async function saveSession(
  id: string | null,
  input: unknown
): Promise<{ error: string } | void> {
  const parsed = sessionSchema.safeParse(input)
  if (!parsed.success) return { error: formatZodError(parsed.error.issues) }

  const { drills, ...sessionData } = parsed.data
  const supabase = await createClient()

  let sessionId = id
  const created = !id
  if (id) {
    const { error } = await supabase.from('sessions').update(sessionData).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select('id')
      .single()
    if (error) return { error: error.message }
    sessionId = data.id
  }

  const { error: drillsError } = await supabase.rpc('replace_session_drills', {
    p_session_id: sessionId!,
    p_items: drills,
  })
  if (drillsError) {
    if (created) {
      await supabase.from('sessions').delete().eq('id', sessionId!)
    }
    return { error: drillsError.message }
  }

  revalidatePath('/', 'layout')
  redirect('/admin/sessions')
}

export async function deleteSession(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/', 'layout')
}

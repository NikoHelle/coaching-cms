'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { drillSchema } from '@/lib/schemas'
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

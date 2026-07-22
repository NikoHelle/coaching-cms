import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Drill, Session, SessionWithDrills } from '@/lib/types'

const SESSION_WITH_DRILLS_SELECT =
  '*, session_drills(position, note, video_indexes, drill:drills(*))'

type SessionRow = Session & {
  session_drills: {
    position: number
    note: string | null
    video_indexes: number[] | null
    drill: Drill
  }[]
}

function toSessionWithDrills(row: SessionRow): SessionWithDrills {
  const { session_drills, ...session } = row
  return {
    ...session,
    items: [...session_drills].sort((a, b) => a.position - b.position),
  }
}

export async function getPublicSessions(): Promise<Session[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'public')
    .order('session_date', { ascending: false, nullsFirst: false })
  if (error) throw error
  return data
}

export async function getPublicDrills(tag?: string): Promise<Drill[]> {
  const supabase = await createClient()
  let query = supabase.from('drills').select('*').eq('status', 'public').order('title')
  if (tag) query = query.contains('tags', [tag])
  const { data, error } = await query
  if (error) throw error
  return data
}

export const getPublicDrillBySlug = cache(async (slug: string): Promise<Drill | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('drills')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'public')
    .maybeSingle()
  if (error) throw error
  return data
})

export const getPublicSessionBySlug = cache(async (slug: string): Promise<SessionWithDrills | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_WITH_DRILLS_SELECT)
    .eq('slug', slug)
    .eq('status', 'public')
    .maybeSingle()
  if (error) throw error
  return data ? toSessionWithDrills(data as unknown as SessionRow) : null
})

export async function getAllDrills(): Promise<Drill[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('drills').select('*').order('title')
  if (error) throw error
  return data
}

export async function getDrillById(id: string): Promise<Drill | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('drills').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getAllSessions(): Promise<Session[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getSessionById(id: string): Promise<SessionWithDrills | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_WITH_DRILLS_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? toSessionWithDrills(data as unknown as SessionRow) : null
}

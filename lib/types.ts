export type Drill = {
  id: string
  slug: string
  title: string
  description: string
  purpose: string
  player_count: string
  duration_minutes: number
  focus_points: string[]
  dos: string[]
  donts: string[]
  video_urls: string[]
  tags: string[]
  status: 'public' | 'draft'
  created_at: string
  updated_at: string
}

export type Session = {
  id: string
  slug: string
  title: string
  session_date: string | null
  notes: string
  status: 'public' | 'draft'
  created_at: string
  updated_at: string
}

export type SessionDrillItem = {
  position: number
  note: string | null
  visible_videos: string[] | null
  drill: Drill
}

export type SessionWithDrills = Session & { items: SessionDrillItem[] }

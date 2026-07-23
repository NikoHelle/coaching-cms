import { z } from 'zod'

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const drillSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().regex(SLUG_REGEX, 'Slug must be lowercase-hyphenated'),
  description: z.string().default(''),
  purpose: z.string().default(''),
  player_count: z.string().default(''),
  duration_minutes: z.coerce.number().int().min(0).default(0),
  focus_points: z.array(z.string().min(1)).default([]),
  dos: z.array(z.string().min(1)).default([]),
  donts: z.array(z.string().min(1)).default([]),
  video_urls: z.array(z.url()).default([]),
  tags: z.array(z.string().min(1)).default([]),
  status: z.enum(['public', 'draft']).default('draft'),
})

export type DrillInput = z.infer<typeof drillSchema>

export const sessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().regex(SLUG_REGEX, 'Slug must be lowercase-hyphenated'),
  session_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .nullable()
    .default(null),
  notes: z.string().default(''),
  status: z.enum(['public', 'draft']).default('draft'),
  drills: z
    .array(
      z.object({
        drill_id: z.uuid(),
        note: z.string().default(''),
        // URLs from the drill's video_urls to show in this session;
        // null = show all (robust to drill video reordering/deletion).
        visible_videos: z.array(z.url()).nullable().default(null),
      })
    )
    .default([]),
})

export type SessionInput = z.infer<typeof sessionSchema>

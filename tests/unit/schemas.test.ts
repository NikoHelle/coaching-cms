import { describe, it, expect } from 'vitest'
import { drillSchema, sessionSchema } from '@/lib/schemas'

describe('drillSchema', () => {
  it('parses a minimal drill and applies defaults', () => {
    const result = drillSchema.parse({ title: 'Rondo 4v2', slug: 'rondo-4v2' })
    expect(result.status).toBe('draft')
    expect(result.focus_points).toEqual([])
    expect(result.duration_minutes).toBe(0)
  })

  it('coerces duration from string input', () => {
    const result = drillSchema.parse({ title: 'X', slug: 'x', duration_minutes: '15' })
    expect(result.duration_minutes).toBe(15)
  })

  it('rejects invalid slugs', () => {
    expect(drillSchema.safeParse({ title: 'X', slug: 'Bad Slug!' }).success).toBe(false)
  })

  it('rejects invalid status', () => {
    expect(drillSchema.safeParse({ title: 'X', slug: 'x', status: 'hidden' }).success).toBe(false)
  })

  it('rejects non-URL video entries', () => {
    expect(drillSchema.safeParse({ title: 'X', slug: 'x', video_urls: ['not a url'] }).success).toBe(false)
  })
})

describe('sessionSchema', () => {
  it('parses a session with drill items', () => {
    const result = sessionSchema.parse({
      title: 'U12 Tuesday',
      slug: 'u12-tuesday',
      drills: [{ drill_id: '2c1f4c9e-4b7a-4b0e-9f3e-1a2b3c4d5e6f', note: 'weak foot' }],
    })
    expect(result.drills).toHaveLength(1)
    expect(result.session_date).toBeNull()
  })

  it('rejects non-uuid drill ids', () => {
    expect(
      sessionSchema.safeParse({
        title: 'X',
        slug: 'x',
        drills: [{ drill_id: 'nope', note: '' }],
      }).success
    ).toBe(false)
  })

  it('accepts an ISO date string', () => {
    const result = sessionSchema.parse({ title: 'X', slug: 'x', session_date: '2026-07-22' })
    expect(result.session_date).toBe('2026-07-22')
  })

  it('defaults video_indexes to null (show all)', () => {
    const result = sessionSchema.parse({
      title: 'X',
      slug: 'x',
      drills: [{ drill_id: '2c1f4c9e-4b7a-4b0e-9f3e-1a2b3c4d5e6f', note: '' }],
    })
    expect(result.drills[0].video_indexes).toBeNull()
  })

  it('accepts explicit video_indexes and an empty list', () => {
    const result = sessionSchema.parse({
      title: 'X',
      slug: 'x',
      drills: [
        { drill_id: '2c1f4c9e-4b7a-4b0e-9f3e-1a2b3c4d5e6f', note: '', video_indexes: [0, 2] },
        { drill_id: '3c1f4c9e-4b7a-4b0e-9f3e-1a2b3c4d5e6f', note: '', video_indexes: [] },
      ],
    })
    expect(result.drills[0].video_indexes).toEqual([0, 2])
    expect(result.drills[1].video_indexes).toEqual([])
  })

  it('rejects negative video indexes', () => {
    expect(
      sessionSchema.safeParse({
        title: 'X',
        slug: 'x',
        drills: [{ drill_id: '2c1f4c9e-4b7a-4b0e-9f3e-1a2b3c4d5e6f', video_indexes: [-1] }],
      }).success
    ).toBe(false)
  })
})

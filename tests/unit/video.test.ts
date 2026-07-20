import { describe, it, expect } from 'vitest'
import { parseVideoUrl } from '@/lib/video'

describe('parseVideoUrl', () => {
  it('parses youtube watch URLs', () => {
    expect(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      kind: 'youtube',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
  })

  it('parses youtu.be short URLs', () => {
    expect(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      kind: 'youtube',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
  })

  it('parses youtube shorts URLs', () => {
    expect(parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toEqual({
      kind: 'youtube',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
  })

  it('parses instagram reel URLs', () => {
    expect(parseVideoUrl('https://www.instagram.com/reel/Cxyz123abcd/')).toEqual({
      kind: 'instagram',
      embedUrl: 'https://www.instagram.com/reel/Cxyz123abcd/embed',
    })
  })

  it('parses instagram post URLs', () => {
    expect(parseVideoUrl('https://www.instagram.com/p/Cxyz123abcd/')).toEqual({
      kind: 'instagram',
      embedUrl: 'https://www.instagram.com/p/Cxyz123abcd/embed',
    })
  })

  it('falls back to link for unknown URLs', () => {
    expect(parseVideoUrl('https://example.com/video')).toEqual({ kind: 'link' })
  })
})

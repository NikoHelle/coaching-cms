import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/slug'

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Rondo 4v2')).toBe('rondo-4v2')
  })

  it('strips diacritics', () => {
    expect(slugify('Syöttöharjoitus')).toBe('syottoharjoitus')
  })

  it('collapses punctuation runs into single hyphens', () => {
    expect(slugify("Dos & Don'ts!!")).toBe('dos-don-ts')
  })

  it('trims leading and trailing separators', () => {
    expect(slugify('  Hello  ')).toBe('hello')
  })

  it('returns empty string for symbol-only input', () => {
    expect(slugify('!!!')).toBe('')
  })
})

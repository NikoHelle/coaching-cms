'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Drill, SessionWithDrills } from '@/lib/types'
import type { SessionInput } from '@/lib/schemas'
import { slugify } from '@/lib/slug'
import { saveSession } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

type Item = { drill_id: string; note: string; video_indexes: number[] | null }
type PickerDrill = Pick<Drill, 'id' | 'title' | 'duration_minutes' | 'status' | 'video_urls'>

export function SessionForm({
  session,
  allDrills,
}: {
  session: SessionWithDrills | null
  allDrills: PickerDrill[]
}) {
  const [title, setTitle] = useState(session?.title ?? '')
  const [slug, setSlug] = useState(session?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(session))
  const [date, setDate] = useState(session?.session_date ?? '')
  const [notes, setNotes] = useState(session?.notes ?? '')
  const [status, setStatus] = useState<SessionInput['status']>(session?.status ?? 'draft')
  const [items, setItems] = useState<Item[]>(
    session?.items.map((i) => ({
      drill_id: i.drill.id,
      note: i.note ?? '',
      video_indexes: i.video_indexes,
    })) ?? []
  )
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const drillById = useMemo(() => new Map(allDrills.map((d) => [d.id, d])), [allDrills])

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allDrills
      .filter((d) => !items.some((i) => i.drill_id === d.id))
      .filter((d) => !q || d.title.toLowerCase().includes(q))
  }, [search, allDrills, items])

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
  }

  function toggleVideo(itemIndex: number, videoIndex: number, videoCount: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) return item
        const current = item.video_indexes ?? Array.from({ length: videoCount }, (_, v) => v)
        const next = current.includes(videoIndex)
          ? current.filter((v) => v !== videoIndex)
          : [...current, videoIndex].sort((a, b) => a - b)
        // All checked = no restriction, so videos added to the drill later
        // show automatically.
        return { ...item, video_indexes: next.length === videoCount ? null : next }
      })
    )
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault()
    setPending(true)
    const payload: SessionInput = {
      title,
      slug,
      session_date: date || null,
      notes,
      status,
      drills: items,
    }
    try {
      const result = await saveSession(session?.id ?? null, payload)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
        setPending(false)
      }
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'digest' in err &&
        String((err as { digest?: string }).digest).startsWith('NEXT_REDIRECT')
      ) {
        throw err
      }
      const message = 'Save failed — check your connection and try again.'
      setError(message)
      toast.error(message)
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          required
          onChange={(e) => {
            setTitle(e.target.value)
            if (!slugTouched) setSlug(slugify(e.target.value))
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          required
          onChange={(e) => {
            setSlugTouched(true)
            setSlug(e.target.value)
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="h-9 rounded-md border px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as SessionInput['status'])}
          >
            <option value="draft">Draft</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Intro notes (markdown)</Label>
        <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <fieldset className="flex flex-col gap-3 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold">Drills in this session</legend>

        {items.length === 0 && (
          <p className="text-sm text-neutral-500">No drills yet — search below to add.</p>
        )}

        <ol className="flex flex-col gap-3">
          {items.map((item, index) => {
            const drill = drillById.get(item.drill_id)
            return (
              <li key={item.drill_id} className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold">{index + 1}.</span>
                  <span className="flex-1 font-medium">{drill?.title ?? 'Unknown drill'}</span>
                  {drill?.status === 'draft' && <Badge variant="secondary">draft</Badge>}
                  <Button type="button" variant="ghost" size="sm" onClick={() => move(index, -1)}>
                    ↑
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => move(index, 1)}>
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                  >
                    ✕
                  </Button>
                </div>
                <Input
                  value={item.note}
                  placeholder="Session-specific note (optional)"
                  onChange={(e) =>
                    setItems(items.map((it, i) => (i === index ? { ...it, note: e.target.value } : it)))
                  }
                />
                {drill && drill.video_urls.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="font-medium text-neutral-500">Videos shown:</span>
                    {drill.video_urls.map((_, vi) => {
                      const checked =
                        item.video_indexes === null || item.video_indexes.includes(vi)
                      return (
                        <label key={vi} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleVideo(index, vi, drill.video_urls.length)}
                          />
                          Variaatio {vi + 1}
                        </label>
                      )
                    })}
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        <div className="flex flex-col gap-1">
          <Input
            value={search}
            placeholder="Search drills to add…"
            onChange={(e) => setSearch(e.target.value)}
          />
          {matches.length > 0 && (
            <ul className="flex flex-col rounded-md border">
              {matches.map((drill) => (
                <li key={drill.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-100"
                    onClick={() => {
                      setItems([...items, { drill_id: drill.id, note: '', video_indexes: null }])
                      setSearch('')
                    }}
                  >
                    <span className="flex-1">{drill.title}</span>
                    {drill.duration_minutes > 0 && (
                      <span className="text-xs text-neutral-500">{drill.duration_minutes} min</span>
                    )}
                    {drill.status === 'draft' && <Badge variant="secondary">draft</Badge>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save session'}
      </Button>
    </form>
  )
}

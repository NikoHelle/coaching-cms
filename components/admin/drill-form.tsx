'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Drill } from '@/lib/types'
import type { DrillInput } from '@/lib/schemas'
import { slugify } from '@/lib/slug'
import { saveDrill } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ListFieldEditor } from '@/components/admin/list-field-editor'

const EMPTY: DrillInput = {
  title: '',
  slug: '',
  description: '',
  purpose: '',
  player_count: '',
  duration_minutes: 0,
  focus_points: [],
  dos: [],
  donts: [],
  video_urls: [],
  tags: [],
  status: 'draft',
}

export function DrillForm({ drill }: { drill: Drill | null }) {
  const [form, setForm] = useState<DrillInput>(() =>
    drill
      ? {
          title: drill.title,
          slug: drill.slug,
          description: drill.description,
          purpose: drill.purpose,
          player_count: drill.player_count,
          duration_minutes: drill.duration_minutes,
          focus_points: drill.focus_points,
          dos: drill.dos,
          donts: drill.donts,
          video_urls: drill.video_urls,
          tags: drill.tags,
          status: drill.status,
        }
      : EMPTY
  )
  const [tagsText, setTagsText] = useState(drill ? drill.tags.join(', ') : '')
  const [slugTouched, setSlugTouched] = useState(Boolean(drill))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof DrillInput>(key: K, value: DrillInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault()
    setPending(true)
    const payload = {
      ...form,
      tags: tagsText.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    }
    try {
      const result = await saveDrill(drill?.id ?? null, payload)
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
          value={form.title}
          required
          onChange={(e) => {
            set('title', e.target.value)
            if (!slugTouched) set('slug', slugify(e.target.value))
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={form.slug}
          required
          onChange={(e) => {
            setSlugTouched(true)
            set('slug', e.target.value)
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Input id="purpose" value={form.purpose} onChange={(e) => set('purpose', e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (markdown)</Label>
        <Textarea
          id="description"
          rows={8}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="player_count">Player count</Label>
          <Input
            id="player_count"
            value={form.player_count}
            placeholder="e.g. 8–12"
            onChange={(e) => set('player_count', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            value={form.duration_minutes}
            onChange={(e) => set('duration_minutes', Number(e.target.value))}
          />
        </div>
      </div>

      <ListFieldEditor
        label="Focus points"
        values={form.focus_points}
        onChange={(v) => set('focus_points', v)}
      />
      <ListFieldEditor label="Dos" values={form.dos} onChange={(v) => set('dos', v)} />
      <ListFieldEditor label="Don'ts" values={form.donts} onChange={(v) => set('donts', v)} />
      <ListFieldEditor
        label="Video URLs (YouTube / Instagram)"
        values={form.video_urls}
        onChange={(v) => set('video_urls', v)}
        placeholder="https://…"
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tagsText}
          placeholder="passing, warm-up"
          onChange={(e) => setTagsText(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          className="h-9 rounded-md border px-3 text-sm"
          value={form.status}
          onChange={(e) => set('status', e.target.value as DrillInput['status'])}
        >
          <option value="draft">Draft</option>
          <option value="public">Public</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save drill'}
      </Button>
    </form>
  )
}

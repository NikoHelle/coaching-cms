'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ListFieldEditor({
  label,
  values,
  onChange,
  placeholder,
  draft: controlledDraft,
  onDraftChange,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  /** Provide both draft and onDraftChange to control the pending-input text
      from the parent (e.g. to warn about unadded text on save). */
  draft?: string
  onDraftChange?: (value: string) => void
}) {
  const [internalDraft, setInternalDraft] = useState('')
  const draft = controlledDraft ?? internalDraft
  const setDraft = onDraftChange ?? setInternalDraft

  function add() {
    const value = draft.trim()
    if (!value) return
    onChange([...values, value])
    setDraft('')
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= values.length) return
    const next = [...values]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <ul className="flex flex-col gap-1">
        {values.map((value, index) => (
          <li key={`${value}-${index}`} className="flex items-center gap-1 text-sm">
            <span className="flex-1 rounded border bg-neutral-50 px-2 py-1">{value}</span>
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
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              ✕
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  )
}

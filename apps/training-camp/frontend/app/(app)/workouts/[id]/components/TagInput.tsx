'use client'

import { KeyboardEvent, useState } from 'react'

interface TagInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

export function TagInput({ value, onChange, placeholder = 'Ajouter...', label }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : []

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag]
      onChange(newTags.join(', '))
    }
    setInputValue('')
  }

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove)
    onChange(newTags.join(', '))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}

      <div className="flex flex-wrap gap-2 min-h-[46px] p-3 border border-slate-700 rounded-xl bg-slate-900/50">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500/15 text-orange-400 rounded-lg text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-orange-500/25 rounded-full p-0.5 transition-colors"
            >
              <span className="text-xs">×</span>
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue.trim() && addTag(inputValue.trim())}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-0 text-white placeholder:text-slate-500 outline-none text-sm"
        />
      </div>

      <p className="text-xs text-slate-500">
        Appuyez sur Entrée ou cliquez ailleurs pour ajouter
      </p>
    </div>
  )
}

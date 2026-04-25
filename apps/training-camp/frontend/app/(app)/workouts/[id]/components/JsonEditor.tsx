'use client'

import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  rows?: number
}

export function JsonEditor({ value, onChange, label, placeholder, rows = 8 }: JsonEditorProps) {
  const [isValid, setIsValid] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isTouched, setIsTouched] = useState(false)

  useEffect(() => {
    if (!value.trim()) {
      setIsValid(true)
      setErrorMessage('')
      return
    }

    try {
      JSON.parse(value)
      setIsValid(true)
      setErrorMessage('')
    } catch (error) {
      setIsValid(false)
      setErrorMessage((error as Error).message)
    }
  }, [value])

  const formatJson = () => {
    if (!value.trim()) return

    try {
      const parsed = JSON.parse(value)
      const formatted = JSON.stringify(parsed, null, 2)
      onChange(formatted)
    } catch {
      // If invalid, don't format
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <label className="text-sm font-medium">{label}</label>}

        <div className="flex items-center gap-2">
          {value.trim() && (
            <>
              {isValid ? (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>JSON valide</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  <span>JSON invalide</span>
                </div>
              )}
            </>
          )}

          <button
            type="button"
            onClick={formatJson}
            disabled={!isValid || !value.trim()}
            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            Formater
          </button>
        </div>
      </div>

      <Textarea
        value={value}
        onChange={(e) => {
          setIsTouched(true)
          onChange(e.target.value)
        }}
        placeholder={placeholder}
        rows={rows}
        className={`font-mono text-xs ${
          isTouched && !isValid ? 'border-red-500 focus-visible:ring-red-500' : ''
        }`}
      />

      {isTouched && !isValid && errorMessage && (
        <p className="text-xs text-red-600">{errorMessage}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Format JSON requis. Utilisez le bouton "Formater" pour améliorer la lisibilité.
      </p>
    </div>
  )
}

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="px-3 py-1 text-sm border rounded shadow hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      {theme === 'dark' ? '☀ Light Mode' : '🌙 Dark Mode'}
    </button>
  )
}

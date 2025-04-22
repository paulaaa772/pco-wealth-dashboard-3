'use client'

import { useState } from 'react'

type MaximizeProps = {
  label: string
  children: React.ReactNode
}

export default function MaximizeWrapper({ label, children }: MaximizeProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative border border-gray-300 rounded-lg p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold">{label}</h2>
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-blue-600 underline"
        >
          Maximize
        </button>
      </div>
      {children}

      {expanded && (
        <div className="absolute inset-0 z-50 bg-white p-4 shadow-xl border border-blue-400 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">{label}</h2>
            <button
              onClick={() => setExpanded(false)}
              className="text-sm text-blue-600 underline"
            >
              Close
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  )
}

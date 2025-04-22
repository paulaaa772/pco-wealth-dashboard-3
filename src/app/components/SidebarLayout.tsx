'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { useAdmin } from '../../context/AdminProvider'

const tabs = [
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Brokerage', href: '/brokerage' },
  { name: 'Congress', href: '/congress' },
]

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAdmin, toggleAdmin } = useAdmin()

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-900 text-black dark:text-white">
      <div className="w-60 flex flex-col justify-between border-r border-gray-200 dark:border-zinc-800 p-4">
        <div>
          <h1 className="text-lg font-bold mb-6">AI Wealth Dashboard</h1>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`block px-3 py-2 rounded ${
                  pathname === tab.href
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6 space-y-2">
          <ThemeToggle />
          <button
            onClick={toggleAdmin}
            className={`text-xs border rounded px-3 py-1 w-full ${
              isAdmin
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 dark:bg-zinc-800 dark:text-white'
            }`}
          >
            {isAdmin ? 'Admin: ON' : 'Admin: OFF'}
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

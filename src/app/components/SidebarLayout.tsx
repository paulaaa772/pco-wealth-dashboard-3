'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ManualAccountsProvider } from '@/context/ManualAccountsContext'

const tabs = [
  { name: 'Dashboard', href: '/' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Brokerage', href: '/brokerage' },
  { name: 'Tax Center', href: '/tax' },
  { name: 'Congress', href: '/congress' },
  { name: 'News', href: '/news' },
  { name: 'Funding', href: '/funding' },
  { name: 'Settings', href: '/settings' },
]

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <ManualAccountsProvider>
      <div className="flex min-h-screen">
        <nav className="w-64 bg-[#2A3C61] p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">FINANCIAL ENGINE</h2>
            </div>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`block px-4 py-2 rounded-lg ${
                    pathname === tab.href
                      ? 'bg-[#1B2B4B] text-white'
                      : 'text-gray-300 hover:bg-[#344571] hover:text-white'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    </ManualAccountsProvider>
  )
}

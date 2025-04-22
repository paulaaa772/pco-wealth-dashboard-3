import './globals.css'
import { ReactNode } from 'react'
import { ThemeProvider } from './components/ThemeProvider'
import { AdminProvider } from '../context/AdminProvider'
import SidebarLayout from './components/SidebarLayout'

export const metadata = {
  title: 'AI Wealth Dashboard',
  description: 'Track and optimize your portfolio with AI insights.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <AdminProvider>
            <SidebarLayout>
              {children}
            </SidebarLayout>
          </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

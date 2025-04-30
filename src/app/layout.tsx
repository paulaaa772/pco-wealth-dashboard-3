import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import SidebarLayout from './components/SidebarLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FINANCIAL ENGINE',
  description: 'AI-Powered Long-Term Wealth Building Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  )
}

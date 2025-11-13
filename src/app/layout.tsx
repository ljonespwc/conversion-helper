import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConsoleFilter } from '@/components/ConsoleFilter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EasyAsk',
  description: 'AI-powered assistant for your website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ConsoleFilter />
        {children}
      </body>
    </html>
  )
}
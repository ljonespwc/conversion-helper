import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConsoleFilter } from '@/components/ConsoleFilter'
import { PostHogProvider } from '@/components/PostHogProvider'

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
        <PostHogProvider>
          <ConsoleFilter />
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
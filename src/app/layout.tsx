import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/components/PostHogProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EasyAsk - Voice-First AI Assistant for Your Website',
  description: 'Give your site the persuasive power of voice. Instant, accurate answers for your visitors—no scrolling, no waiting. Voice-first sales assistant for B2B websites.',
  metadataBase: new URL('https://easyask.io'),
  icons: {
    icon: [
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/images/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/images/icon-192.png', sizes: '192x192' },
      { rel: 'icon', url: '/images/icon-512.png', sizes: '512x512' },
    ],
  },
  openGraph: {
    title: 'EasyAsk - Voice-First AI Assistant for Your Website',
    description: 'Give your site the persuasive power of voice. Instant, accurate answers for your visitors—no scrolling, no waiting.',
    url: 'https://easyask.io',
    siteName: 'EasyAsk',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EasyAsk - Your site speaks now. No more scrolling.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EasyAsk - Voice-First AI Assistant for Your Website',
    description: 'Give your site the persuasive power of voice. Instant, accurate answers—no scrolling, no waiting.',
    images: ['/images/twitter-image.png'],
  },
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
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
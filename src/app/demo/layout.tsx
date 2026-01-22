import { Suspense } from 'react'

export const metadata = {
  title: 'EasyAsk Demo',
  description: 'Demo of EasyAsk chat widget',
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading demo...
      </div>
    }>
      {children}
    </Suspense>
  )
}

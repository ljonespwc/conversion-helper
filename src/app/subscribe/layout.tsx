import { Suspense } from 'react'

export const metadata = {
  title: 'Subscribe - EasyAsk',
}

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      {children}
    </Suspense>
  )
}

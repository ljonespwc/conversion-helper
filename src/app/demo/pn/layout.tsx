import { Suspense } from 'react'

export const metadata = {
  title: 'EasyAsk Demo - Precision Nutrition',
  description: 'Demo of EasyAsk voice widget on Precision Nutrition pages',
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

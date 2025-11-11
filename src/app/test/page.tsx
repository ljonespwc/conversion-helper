'use client'

import VoiceWidget from '@/components/widget/VoiceWidget'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Blank white page with widget */}
      <p className="text-gray-400 text-sm">Testing widget against indexed PN page</p>
      <VoiceWidget testPageUrl="https://www.precisionnutrition.com/nutrition-certification-level-1-register-now" />
    </div>
  )
}

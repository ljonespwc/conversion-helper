'use client'

import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '../login/actions'
import VoiceWidget from '@/components/widget/VoiceWidget'

export default function TestPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserEmail(user.email || null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative">
      {/* User Info & Sign Out */}
      {userEmail && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-4 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
          <div className="text-right">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-medium text-gray-900">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}

      {/* Blank white page with widget */}
      <p className="text-gray-400 text-sm">Testing widget against indexed PN page</p>
      <VoiceWidget
        embedded={true}
        testPageUrl="https://www.precisionnutrition.com/nutrition-certification-level-1-register-now"
      />
    </div>
  )
}

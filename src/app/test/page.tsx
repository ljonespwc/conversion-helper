'use client'

import { useEffect, useState } from 'react'
import { LogOut, Building2, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '../login/actions'
import VoiceWidget from '@/components/widget/VoiceWidget'

interface Deployment {
  id: string
  deployment_id: string
  deployment_key: string
  company_name: string
  company_domain: string | null
  file_search_store_name: string
  status: string
}

export default function TestPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    fetchDeployments()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserEmail(user.email || null)
    }
  }

  const fetchDeployments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/deployments')
      const data = await response.json()
      const activeDeployments = (data.deployments || []).filter((d: Deployment) => d.status === 'active')
      setDeployments(activeDeployments)

      // Auto-select first deployment
      if (activeDeployments.length > 0) {
        setSelectedDeployment(activeDeployments[0])
      }
    } catch (error) {
      console.error('Error fetching deployments:', error)
    } finally {
      setLoading(false)
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

      {/* Deployment Selector - Top Left */}
      <div className="fixed top-4 left-4 z-40 bg-white rounded-lg shadow-lg px-4 py-3 border border-gray-200 min-w-[300px]">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-medium text-gray-700">Testing Deployment</span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading deployments...</p>
        ) : deployments.length === 0 ? (
          <div>
            <p className="text-sm text-red-600 mb-2">No deployments found</p>
            <a href="/admin/deployments" className="text-xs text-indigo-600 hover:text-indigo-700">
              Create a deployment →
            </a>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg flex items-center justify-between hover:border-indigo-300 transition-colors"
            >
              {selectedDeployment ? (
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{selectedDeployment.company_name}</p>
                  <p className="text-xs text-gray-600">{selectedDeployment.deployment_key}</p>
                </div>
              ) : (
                <span className="text-sm text-gray-600">Select deployment...</span>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {deployments.map((deployment) => (
                  <button
                    key={deployment.id}
                    onClick={() => {
                      setSelectedDeployment(deployment)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedDeployment?.id === deployment.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{deployment.company_name}</p>
                    <p className="text-xs text-gray-600">{deployment.deployment_key}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedDeployment && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Deployment ID:</span>
              <br />
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded mt-1 inline-block">
                {selectedDeployment.deployment_id}
              </code>
            </p>
          </div>
        )}
      </div>

      {/* Test Instructions */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">Testing widget with deployment</p>
        {selectedDeployment && (
          <p className="text-indigo-600 text-xs font-medium">
            {selectedDeployment.company_name}
          </p>
        )}
      </div>

      {/* Widget */}
      <VoiceWidget
        embedded={true}
        deploymentId={selectedDeployment?.deployment_id}
      />
    </div>
  )
}

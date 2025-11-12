'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Building2, ExternalLink } from 'lucide-react'

interface Deployment {
  id: string
  deployment_id: string
  deployment_key: string
  company_name: string
  company_domain: string | null
  file_search_store_name: string
  status: string
}

interface DeploymentSelectorProps {
  onDeploymentChange: (deployment: Deployment | null) => void
  selectedDeployment: Deployment | null
}

export default function DeploymentSelector({ onDeploymentChange, selectedDeployment }: DeploymentSelectorProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchDeployments()
  }, [])

  const fetchDeployments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/deployments')
      const data = await response.json()
      const activeDeployments = (data.deployments || []).filter((d: Deployment) => d.status === 'active')
      setDeployments(activeDeployments)

      // Auto-select first deployment if none selected
      if (!selectedDeployment && activeDeployments.length > 0) {
        onDeploymentChange(activeDeployments[0])
      }
    } catch (error) {
      console.error('Error fetching deployments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-indigo-100">
        <p className="text-sm text-gray-600">Loading deployments...</p>
      </div>
    )
  }

  if (deployments.length === 0) {
    return (
      <div className="bg-yellow-50 rounded-lg shadow-md p-4 border border-yellow-200">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900 mb-1">No Active Deployments</p>
            <p className="text-sm text-yellow-700 mb-2">
              You need to create a deployment before managing content.
            </p>
            <a
              href="/admin/deployments"
              className="inline-flex items-center gap-1 text-sm text-yellow-800 hover:text-yellow-900 font-medium"
            >
              Go to Deployments
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-indigo-100">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Current Deployment
        </label>
        <a
          href="/admin/deployments"
          className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          Manage Deployments
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg flex items-center justify-between hover:border-indigo-300 transition-colors"
        >
          {selectedDeployment ? (
            <div className="text-left">
              <p className="font-medium text-gray-900">{selectedDeployment.company_name}</p>
              <p className="text-xs text-gray-600">
                {selectedDeployment.deployment_key}
              </p>
            </div>
          ) : (
            <span className="text-gray-600">Select a deployment...</span>
          )}
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {deployments.map((deployment) => (
              <button
                key={deployment.id}
                onClick={() => {
                  onDeploymentChange(deployment)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  selectedDeployment?.id === deployment.id ? 'bg-indigo-50' : ''
                }`}
              >
                <p className="font-medium text-gray-900">{deployment.company_name}</p>
                <p className="text-xs text-gray-600 mt-1">{deployment.deployment_key}</p>
                {deployment.company_domain && (
                  <p className="text-xs text-gray-500 mt-0.5">{deployment.company_domain}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedDeployment && (
        <div className="mt-3 text-xs text-gray-600">
          <p>
            <span className="font-medium">Deployment ID:</span>{' '}
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              {selectedDeployment.deployment_id}
            </code>
          </p>
        </div>
      )}
    </div>
  )
}

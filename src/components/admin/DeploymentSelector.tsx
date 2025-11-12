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
      <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
        <p className="text-sm text-gray-400">Loading deployments...</p>
      </div>
    )
  }

  if (deployments.length === 0) {
    return (
      <div className="bg-yellow-900/20 rounded-lg shadow-md p-4 border border-yellow-700/50">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-300 mb-1">No Active Deployments</p>
            <p className="text-sm text-yellow-400/80 mb-2">
              You need to create a deployment before managing content.
            </p>
            <a
              href="/admin/deployments"
              className="inline-flex items-center gap-1 text-sm text-yellow-300 hover:text-yellow-200 font-medium"
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
    <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          Current Deployment
        </label>
        <a
          href="/admin/deployments"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          Manage Deployments
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-between hover:border-gray-500 transition-colors"
        >
          {selectedDeployment ? (
            <div className="text-left">
              <p className="font-medium text-white">{selectedDeployment.company_name}</p>
              <p className="text-xs text-gray-400">
                {selectedDeployment.deployment_key}
              </p>
            </div>
          ) : (
            <span className="text-gray-400">Select a deployment...</span>
          )}
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {deployments.map((deployment) => (
              <button
                key={deployment.id}
                onClick={() => {
                  onDeploymentChange(deployment)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 ${
                  selectedDeployment?.id === deployment.id ? 'bg-gray-700' : ''
                }`}
              >
                <p className="font-medium text-white">{deployment.company_name}</p>
                <p className="text-xs text-gray-400 mt-1">{deployment.deployment_key}</p>
                {deployment.company_domain && (
                  <p className="text-xs text-gray-500 mt-0.5">{deployment.company_domain}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedDeployment && (
        <div className="mt-3 text-xs text-gray-400">
          <p>
            <span className="font-medium">Deployment ID:</span>{' '}
            <code className="bg-gray-700 px-1 py-0.5 rounded text-gray-300">
              {selectedDeployment.deployment_id}
            </code>
          </p>
        </div>
      )}
    </div>
  )
}

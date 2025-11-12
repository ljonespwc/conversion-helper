'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import { Plus, Trash2, Edit, Copy, CheckCircle, XCircle } from 'lucide-react'

interface Deployment {
  id: string
  deployment_id: string
  deployment_key: string
  company_name: string
  company_domain: string | null
  file_search_store_name: string
  config: any
  allowed_domains: string[] | null
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    deployment_key: '',
    company_name: '',
    company_domain: '',
    file_search_store_name: '',
    allowed_domains: ''
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)

  useEffect(() => {
    checkUser()
    fetchDeployments()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email })
    }
  }

  const fetchDeployments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/deployments')
      const data = await response.json()
      setDeployments(data.deployments || [])
    } catch (error) {
      console.error('Error fetching deployments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDeployment = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const payload = {
        ...formData,
        allowed_domains: formData.allowed_domains
          ? formData.allowed_domains.split(',').map(d => d.trim()).filter(Boolean)
          : []
      }

      const response = await fetch('/api/admin/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create deployment')
      }

      // Reset form and refresh list
      setFormData({
        deployment_key: '',
        company_name: '',
        company_domain: '',
        file_search_store_name: '',
        allowed_domains: ''
      })
      setShowCreateForm(false)
      await fetchDeployments()
    } catch (error) {
      console.error('Error creating deployment:', error)
      setError(error instanceof Error ? error.message : 'Failed to create deployment')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteDeployment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deployment? This will also delete all associated indexed pages.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/deployments/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete deployment')
      }

      await fetchDeployments()
    } catch (error) {
      console.error('Error deleting deployment:', error)
      alert('Failed to delete deployment')
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Widget Deployments</h1>
          <p className="text-gray-400">
            Manage your widget deployments. Each deployment has its own File Search store and can be embedded on specific domains.
          </p>
        </div>

        {/* Create Deployment Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Deployment
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Deployment</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateDeployment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Deployment Key *
                </label>
                <input
                  type="text"
                  value={formData.deployment_key}
                  onChange={(e) => setFormData({ ...formData, deployment_key: e.target.value })}
                  placeholder="precision-nutrition-prod"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Unique identifier (e.g., company-name-prod). Use lowercase with hyphens.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Precision Nutrition"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Company Domain
                </label>
                <input
                  type="text"
                  value={formData.company_domain}
                  onChange={(e) => setFormData({ ...formData, company_domain: e.target.value })}
                  placeholder="precisionnutrition.com"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  File Search Store Name *
                </label>
                <input
                  type="text"
                  value={formData.file_search_store_name}
                  onChange={(e) => setFormData({ ...formData, file_search_store_name: e.target.value })}
                  placeholder="fileSearchStores/your-store-id"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Google File Search store resource name (from Google AI Studio)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Allowed Domains (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.allowed_domains}
                  onChange={(e) => setFormData({ ...formData, allowed_domains: e.target.value })}
                  placeholder="precisionnutrition.com, www.precisionnutrition.com"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Optional: Restrict widget to specific domains
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Deployment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setError(null)
                  }}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Deployments List */}
        {loading ? (
          <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700">
            <p className="text-gray-400">Loading deployments...</p>
          </div>
        ) : deployments.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700">
            <p className="text-gray-400">No deployments yet. Create your first deployment to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {deployments.map((deployment) => (
              <div
                key={deployment.id}
                className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {deployment.company_name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Key: <code className="bg-gray-700 px-2 py-1 rounded text-gray-300">{deployment.deployment_key}</code>
                    </p>
                    {deployment.company_domain && (
                      <p className="text-sm text-gray-400 mt-1">
                        Domain: {deployment.company_domain}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      deployment.status === 'active'
                        ? 'bg-green-900/30 text-green-400'
                        : deployment.status === 'inactive'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {deployment.status === 'active' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {deployment.status === 'suspended' && <XCircle className="w-3 h-3 inline mr-1" />}
                      {deployment.status}
                    </span>
                    <button
                      onClick={() => handleDeleteDeployment(deployment.id)}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete deployment"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium">Deployment ID:</span>
                    <code className="bg-gray-700 px-2 py-1 rounded text-xs flex-1 text-gray-300">{deployment.deployment_id}</code>
                    <button
                      onClick={() => copyToClipboard(deployment.deployment_id, deployment.id)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Copy deployment ID"
                    >
                      {copiedId === deployment.id ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div>
                    <span className="text-gray-400 font-medium">File Search Store:</span>
                    <code className="bg-gray-700 px-2 py-1 rounded text-xs ml-2 text-gray-300">{deployment.file_search_store_name}</code>
                  </div>

                  {deployment.allowed_domains && deployment.allowed_domains.length > 0 && (
                    <div>
                      <span className="text-gray-400 font-medium">Allowed Domains:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {deployment.allowed_domains.map((domain, idx) => (
                          <span key={idx} className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs border border-blue-700/50">
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-3">
                    Created: {new Date(deployment.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

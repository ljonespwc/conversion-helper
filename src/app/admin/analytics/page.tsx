'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Users, TrendingUp, Activity, ThumbsUp, ThumbsDown, MousePointerClick, ArrowRightLeft, ShoppingBag, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import StatsCard from '@/components/admin/StatsCard'
import PageSelector from '@/components/admin/PageSelector'
import { usePostHog } from 'posthog-js/react'
import type { Stats, WidgetPage } from '@/components/admin/types'

export const dynamic = 'force-dynamic'

function formatDuration(seconds: number): string {
  if (!seconds) return '0s'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export default function AnalyticsPage(): React.ReactElement {
  const posthog = usePostHog()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)
  const [widgetPages, setWidgetPages] = useState<WidgetPage[]>([])
  const [selectedPage, setSelectedPage] = useState<WidgetPage | null>(null)

  useEffect(() => {
    checkUser()
    fetchWidgetPages()
  }, [])

  useEffect(() => {
    fetchStats()
  }, [selectedPage, widgetPages.length])

  async function checkUser(): Promise<void> {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email })
    }
  }

  async function fetchWidgetPages(): Promise<void> {
    try {
      const response = await fetch('/api/admin/widget-pages', { cache: 'no-store' })
      const data = await response.json()
      setWidgetPages(data.pages || [])
    } catch (error) {
      console.error('Error fetching widget pages:', error)
    }
  }

  async function fetchStats(): Promise<void> {
    try {
      setLoading(true)
      const timestamp = Date.now()
      const url = selectedPage
        ? `/api/stats?pageUrl=${encodeURIComponent(selectedPage.page_url)}&_t=${timestamp}`
        : `/api/stats?_t=${timestamp}`
      const response = await fetch(url, { cache: 'no-store' })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePageSelect(page: WidgetPage | null): void {
    setSelectedPage(page)
    posthog?.capture('analytics_page_filtered', {
      page_title: page?.page_title ?? 'All Pages',
      page_url: page?.page_url ?? null
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Analytics
              </h1>
              <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
                Monitor widget engagement and visitor metrics
              </p>
            </div>

            <PageSelector
              pages={widgetPages}
              selectedPage={selectedPage}
              onPageSelect={handlePageSelect}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatsCard
            title="Widget Opens"
            value={loading ? '...' : (
              <div className="flex flex-col items-center leading-tight">
                <span>{stats?.totalOpens || 0}</span>
                <div className="text-xs text-gray-500">
                  {stats?.todayOpens || 0} today
                </div>
              </div>
            )}
            icon={<MousePointerClick className="w-5 h-5" />}
          />
          <StatsCard
            title="Unique Visitors"
            value={loading ? '...' : stats?.uniqueOpeners || 0}
            icon={<Users className="w-5 h-5" />}
          />
          <StatsCard
            title="Open → Chat Rate"
            value={loading ? '...' : `${stats?.conversionRate || 0}%`}
            icon={<ArrowRightLeft className="w-5 h-5" />}
          />
          <StatsCard
            title="Active Now"
            value={loading ? '...' : stats?.activeNow || 0}
            icon={<Activity className="w-5 h-5" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Conversations"
            value={loading ? '...' : stats?.total || 0}
            icon={<MessageCircle className="w-5 h-5" />}
          />
          <StatsCard
            title="Today's Conversations"
            value={loading ? '...' : stats?.today || 0}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatsCard
            title="Avg Session Duration"
            value={loading ? '...' : formatDuration(stats?.avgDuration || 0)}
            icon={<Activity className="w-5 h-5" />}
          />
          <StatsCard
            title="User Feedback"
            value={
              loading ? '...' : (
                <div className="flex flex-col items-center leading-tight">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{stats?.positiveRatings || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ThumbsDown className="w-4 h-4" />
                      <span>{stats?.negativeRatings || 0}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats?.totalRatings || 0} total
                  </div>
                </div>
              )
            }
            icon={<ThumbsUp className="w-5 h-5" />}
          />
          <StatsCard
            title="Purchases Influenced"
            value={loading ? '...' : stats?.purchasesInfluenced || 0}
            icon={<ShoppingBag className="w-5 h-5" />}
          />
          {!loading && (stats?.revenueInfluenced ?? 0) > 0 && (
            <StatsCard
              title="Revenue Influenced"
              value={`$${(stats?.revenueInfluenced || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              icon={<DollarSign className="w-5 h-5" />}
            />
          )}
        </div>
      </div>
    </div>
  )
}

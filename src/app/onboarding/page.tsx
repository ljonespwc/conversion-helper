import { completeOnboarding } from './actions'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login?error=Not authenticated')
  }

  // Use service role to bypass RLS when checking if user has organization
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check if user already has organization (shouldn't be here if they do)
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (userData?.organization_id) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
          Complete Your Setup
        </h1>
        <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm sm:text-base">
          Tell us about your organization to get started
        </p>

        {searchParams?.error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm text-center">{searchParams.error}</p>
          </div>
        )}

        <form className="space-y-4">
          {/* Display user's email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Signed in as
            </label>
            <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-lg text-sm sm:text-base">
              {user.email}
            </div>
          </div>

          {/* Organization Name */}
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300 mb-2">
              Organization Name <span className="text-red-400">*</span>
            </label>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              required
              autoFocus
              minLength={2}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm sm:text-base"
              placeholder="My Company"
            />
            <p className="text-xs text-gray-500 mt-2">Your company or organization name</p>
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-300 mb-2">
              Website URL <span className="text-red-400">*</span>
            </label>
            <input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              required
              pattern="https?://.*"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm sm:text-base"
              placeholder="https://example.com"
            />
            <p className="text-xs text-gray-500 mt-2">Where your chat assistant will be deployed</p>
          </div>

          {/* Submit Button */}
          <button
            formAction={completeOnboarding}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all shadow-lg text-sm sm:text-base"
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  )
}

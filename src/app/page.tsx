import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/Header'
import { Mic, BarChart3, FileText } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Welcome to Conversion Helper
          </h1>
          <p className="text-xl text-gray-300">
            {user
              ? 'Manage your AI voice assistant and view analytics'
              : 'AI-powered voice assistant for your website'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Widget Demo - Always visible */}
          <Link
            href="/widget"
            className="group relative bg-gray-800 border border-gray-700 hover:border-blue-500 transition-all px-8 py-8 rounded-2xl shadow-xl hover:shadow-2xl"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-xl text-white block mb-2">
                  {user ? 'My Widget Demo' : 'Widget Demo'}
                </span>
                <span className="text-sm text-gray-400">
                  {user ? 'Try your personalized voice assistant' : 'Try the voice assistant demo'}
                </span>
              </div>
            </div>
          </Link>

          {/* Reports - Only visible when authenticated */}
          {user && (
            <Link
              href="/admin"
              className="group relative bg-gray-800 border border-gray-700 hover:border-blue-500 transition-all px-8 py-8 rounded-2xl shadow-xl hover:shadow-2xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-xl text-white block mb-2">
                    Reports
                  </span>
                  <span className="text-sm text-gray-400">
                    View analytics & conversations
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Content Admin - Only visible when authenticated */}
          {user && (
            <Link
              href="/admin/content"
              className="group relative bg-gray-800 border border-gray-700 hover:border-blue-500 transition-all px-8 py-8 rounded-2xl shadow-xl hover:shadow-2xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-xl text-white block mb-2">
                    Content Admin
                  </span>
                  <span className="text-sm text-gray-400">
                    Manage knowledge base content
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>

        {!user && (
          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">
              Want to create your own voice assistant?
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              Get Started
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

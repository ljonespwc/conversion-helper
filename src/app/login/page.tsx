'use client'

import { login, signup } from './actions'
import { useState } from 'react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string }
}) {
  const [isSignup, setIsSignup] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Welcome
        </h1>
        <p className="text-gray-400 text-center mb-8">
          {isSignup ? 'Create your account to get started' : 'Sign in to manage your content'}
        </p>

        {searchParams?.message && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm text-center">{searchParams.message}</p>
          </div>
        )}

        {searchParams?.error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm text-center">{searchParams.error}</p>
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          {isSignup && (
            <>
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300 mb-2">
                  Organization Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="My Company"
                />
              </div>

              <div>
                <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Website URL <span className="text-red-400">*</span>
                </label>
                <input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="https://example.com"
                />
                <p className="text-xs text-gray-500 mt-2">Where your widget will be deployed</p>
              </div>
            </>
          )}

          <button
            formAction={isSignup ? signup : login}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg"
          >
            {isSignup ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {isSignup ? 'Already have an account? Sign in' : 'Need an account? Create one'}
          </button>
        </form>
      </div>
    </div>
  )
}

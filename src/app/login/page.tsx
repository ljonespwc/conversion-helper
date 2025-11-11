'use client'

import { login, signup, signInWithMagicLink } from './actions'
import { useState } from 'react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Admin Access
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Enter your email to sign in or create an account
        </p>

        {searchParams?.message && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm text-center">{searchParams.message}</p>
          </div>
        )}

        {/* Magic Link Form (Primary) */}
        <form className="space-y-4">
          <div>
            <label htmlFor="magic-email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              placeholder="you@example.com"
            />
          </div>

          <button
            formAction={signInWithMagicLink}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Continue with Email
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-3">
          We'll email you a magic link for instant sign-in
        </p>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 py-1 bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPassword ? 'Hide password option' : 'Use password instead'}
            </button>
          </div>
        </div>

        {/* Password Form (Secondary/Hidden) */}
        {showPassword && (
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex gap-3">
              <button
                formAction={login}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                formAction={signup}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

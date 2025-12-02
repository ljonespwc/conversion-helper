'use client'

import { login, signup, signInWithGoogle } from './actions'
// import { useState } from 'react'  // SIGNUP DISABLED

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string }
}) {
  // SIGNUP DISABLED - uncomment to re-enable
  // const [isSignup, setIsSignup] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
          Welcome
        </h1>
        <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm sm:text-base">
          {/* SIGNUP DISABLED: {isSignup ? 'Create your account to get started' : 'Sign in to manage your content'} */}
          Sign in to manage your content
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

        {/* Google OAuth Button */}
        <form action={signInWithGoogle} className="mb-6">
          <button
            type="submit"
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all shadow-lg border border-gray-300 flex items-center justify-center gap-3 text-sm sm:text-base"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">OR</span>
          </div>
        </div>

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
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm sm:text-base"
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
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm sm:text-base"
              placeholder="••••••••"
            />
          </div>

          {/* SIGNUP DISABLED - uncomment to re-enable signup fields
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm sm:text-base"
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm sm:text-base"
                  placeholder="https://example.com"
                />
                <p className="text-xs text-gray-500 mt-2">Where your assistant will be deployed</p>
              </div>
            </>
          )}
          */}

          {/* SIGNUP DISABLED: formAction was {isSignup ? signup : login} */}
          <button
            formAction={login}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all shadow-lg text-sm sm:text-base"
          >
            {/* SIGNUP DISABLED: {isSignup ? 'Create Account' : 'Sign In'} */}
            Sign In
          </button>

          {/* SIGNUP DISABLED - uncomment to re-enable toggle
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {isSignup ? 'Already have an account? Sign in' : 'Need an account? Create one'}
          </button>
          */}
        </form>
      </div>
    </div>
  )
}

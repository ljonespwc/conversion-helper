import { login, signup, signInWithMagicLink } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-huberman-dark to-huberman-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Sign in to access your admin dashboard
        </p>

        {searchParams?.message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm text-center">{searchParams.message}</p>
          </div>
        )}

        {/* Email/Password Form */}
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-huberman-secondary focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-huberman-secondary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-3">
            <button
              formAction={login}
              className="flex-1 bg-huberman-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#0099D4] transition-colors"
            >
              Sign In
            </button>
            <button
              formAction={signup}
              className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Magic Link Form */}
        <form>
          <input
            id="magic-email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-huberman-secondary focus:border-transparent outline-none transition-all mb-3"
            placeholder="Enter email for magic link"
          />
          <button
            formAction={signInWithMagicLink}
            className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
            Send Magic Link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Protected content requires authentication
        </p>
      </div>
    </div>
  )
}

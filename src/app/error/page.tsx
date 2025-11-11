import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-huberman-dark to-huberman-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Authentication Error
        </h1>

        <p className="text-gray-600 mb-6">
          There was a problem signing you in. This could be due to:
        </p>

        <ul className="text-left text-gray-600 mb-8 space-y-2">
          <li className="flex items-start">
            <span className="text-huberman-secondary mr-2">•</span>
            <span>Invalid email or password</span>
          </li>
          <li className="flex items-start">
            <span className="text-huberman-secondary mr-2">•</span>
            <span>Expired or invalid magic link</span>
          </li>
          <li className="flex items-start">
            <span className="text-huberman-secondary mr-2">•</span>
            <span>Account hasn't been confirmed yet</span>
          </li>
        </ul>

        <Link
          href="/login"
          className="inline-block w-full bg-huberman-secondary text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#0099D4] transition-colors"
        >
          Try Again
        </Link>

        <Link
          href="/"
          className="inline-block w-full mt-3 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

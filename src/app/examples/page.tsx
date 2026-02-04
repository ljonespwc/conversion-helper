import { createClient } from '@/lib/supabase/server'
import { LandingNav } from '@/components/LandingNav'
import { ExamplesClient } from './ExamplesClient'
import Script from 'next/script'
import '../landing.css'
import '../new-landing.css'

export const metadata = {
  title: 'Examples | EasyAsk',
  description: 'See EasyAsk in action across different industries and use cases. Real conversations showing how AI chat converts visitors into customers.',
}

export default async function ExamplesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="blog-landing">
      <LandingNav user={user} />

      <main>
        {/* Hero Section */}
        <section className="examples-hero">
          <div className="blog-container">
            <h1>See EasyAsk in action</h1>
            <p className="examples-subtitle">
              Real conversations showing how AI chat handles sales, lead capture, and support across different industries.
            </p>
          </div>
        </section>

        {/* Examples Grid */}
        <section className="blog-section">
          <div className="examples-container">
            <ExamplesClient />
          </div>
        </section>
      </main>

      <Script
        src="https://www.easyask.io/widget.js"
        data-key="pk_live_77d79847449d815d284ec68564a121d5c39362637819eaab"
      />
    </div>
  )
}

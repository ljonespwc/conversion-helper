import { createClient } from '@/lib/supabase/server'
import Script from 'next/script'
import { LandingNav } from '@/components/LandingNav'
import { NicheFAQ } from './NicheFAQ'
import '../../app/landing.css'
import '../../app/new-landing.css'

// =============================================================================
// Types
// =============================================================================

export interface NichePageData {
  /** Meta: used for canonical slug, e.g. "solar" */
  nicheSlug: string
  /** Small tag above hero headline */
  nicheLabel: string
  /** Hero headline */
  headline: string
  /** Hero subheadline */
  subhead: string
  /** 3 problem bullets */
  problems: [string, string, string]
  /** How it works — 3 steps */
  howItWorks: [
    { heading: string; body: string },
    { heading: string; body: string },
    { heading: string; body: string },
  ]
  /** A realistic niche-specific chat exchange */
  chatDemo: {
    badLabel: string
    badQuestion: string
    badAnswer: string
    badFlag: string
    goodQuestion: string
    goodAnswer: string
  }
  /** Social proof stat */
  socialProof: {
    stat: string
    context: string
  }
  /** CTA button text */
  ctaText: string
  /** Microcopy under hero CTA */
  heroMicrocopy: string
  /** Final microcopy */
  finalMicrocopy: string
  /** Optional niche-specific FAQ items */
  faqItems?: Array<{ question: string; answer: string }>
  /** Heading for the FAQ section — shown only when faqItems is provided */
  faqHeading?: string
}

// =============================================================================
// Component
// =============================================================================

export async function NicheLandingPage({ data }: { data: NichePageData }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="blog-landing">
      <Script src="https://www.easyask.io/widget.js" data-key="pk_live_77d79847449d815d284ec68564a121d5c39362637819eaab" />
      <LandingNav user={user} />

      <main>
        {/* ============================================================
            1. HERO
            ============================================================ */}
        <section className="blog-hero">
          <div className="blog-container">
            <span className="blog-section-tag" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              {data.nicheLabel}
            </span>
            <h1>{data.headline}</h1>
            <p className="blog-subtitle">{data.subhead}</p>
            <div className="blog-cta-wrapper">
              <a href="/pricing" className="landing-button-cta landing-button-large landing-button-pulse">
                {data.ctaText} &rarr;
              </a>
              <p className="blog-hero-microcopy">{data.heroMicrocopy}</p>
            </div>
          </div>
        </section>

        {/* ============================================================
            2. THE PROBLEM — 3 bullets
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <span className="blog-section-tag">THE PROBLEM</span>
            <h2 className="blog-feature-heading">
              Every wrong answer is a <span className="blog-heading-accent">deal you don&rsquo;t close.</span>
            </h2>

            <div className="blog-proof-block">
              <ul>
                {data.problems.map((problem, i) => (
                  <li key={i}>{problem}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ============================================================
            3. CHAT DEMO — hallucination vs. honest answer
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <span className="blog-section-tag">SEE THE DIFFERENCE</span>
            <h2 className="blog-feature-heading">
              One invents the answer. The other <span className="blog-heading-accent">captures the lead.</span>
            </h2>

            <div className="blog-demo-row blog-grounding-demo">
              <div className="blog-grounding-card blog-grounding-card--other">
                <span className="blog-badge blog-grounding-badge--other">{data.chatDemo.badLabel}</span>
                <div className="blog-grounding-chat">
                  <div className="blog-context-bubble blog-context-bubble--user">
                    {data.chatDemo.badQuestion}
                  </div>
                  <div className="blog-context-bubble blog-grounding-bubble--hallucination">
                    {data.chatDemo.badAnswer}
                    <span className="blog-grounding-flag">&#x26a0; {data.chatDemo.badFlag}</span>
                  </div>
                </div>
              </div>
              <div className="blog-grounding-card blog-grounding-card--easyask">
                <span className="blog-badge blog-grounding-badge--easyask">EasyAsk</span>
                <div className="blog-grounding-chat">
                  <div className="blog-context-bubble blog-context-bubble--user">
                    {data.chatDemo.goodQuestion}
                  </div>
                  <div className="blog-context-bubble blog-grounding-bubble--honest">
                    {data.chatDemo.goodAnswer}
                  </div>
                  <div className="blog-grounding-escalation">
                    <span className="blog-grounding-escalation-icon" />
                    Answered from your docs &mdash; zero fabrication
                  </div>
                </div>
              </div>
            </div>
            <p className="blog-page-context-caption">Answered from your actual content. Never invented.</p>
          </div>
        </section>

        {/* ============================================================
            4. HOW IT WORKS
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-section-heading" style={{ textAlign: 'center', marginBottom: '0.3em' }}>
              Live in an afternoon. No dev team needed.
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--landing-color-text-secondary)', fontWeight: 600, marginBottom: '1.5em' }}>
              Three steps from signup to your first grounded answer.
            </p>

            <ol className="blog-steps blog-steps--icons">
              {data.howItWorks.map((step, i) => (
                <li key={i}>
                  <div className={`blog-step-icon blog-step-icon--${['upload', 'assign', 'launch'][i]}`} />
                  <div className="blog-step-content">
                    <h3>{step.heading}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="blog-before-lunch">Most teams go live before lunch.</p>
          </div>
        </section>

        {/* ============================================================
            5. SOCIAL PROOF / DATA POINT
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <div className="blog-pullquote">
              <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.5em' }}>
                {data.socialProof.stat}
              </p>
              <p style={{ fontSize: '1.1rem', opacity: 0.85 }}>
                {data.socialProof.context}
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            6. FAQ / OBJECTIONS (optional, niche-specific)
            ============================================================ */}
        {data.faqItems && data.faqItems.length > 0 && (
          <section className="blog-section">
            <div className="blog-container">
              <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
                {data.faqHeading ?? 'Common questions.'}
              </h2>
              <NicheFAQ items={data.faqItems} />
            </div>
          </section>
        )}

        {/* ============================================================
            7. FINAL CTA
            ============================================================ */}
        <section className="blog-final-cta">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ marginBottom: '0.3em' }}>
              Your content. Your voice. Zero fabrication.
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--landing-color-text-secondary)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '1.5em' }}>
              {data.finalMicrocopy}
            </p>

            <div className="blog-cta-wrapper">
              <a href="/pricing" className="landing-button-cta landing-button-large landing-button-pulse">
                {data.ctaText} &rarr;
              </a>
              <p className="blog-final-microcopy">No dev team. No contract. Live this week.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

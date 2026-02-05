import { createClient } from '@/lib/supabase/server'
import { Check, Target, Mail, MessageSquare, Code, BarChart3, Zap } from 'lucide-react'
import { LandingNav } from '@/components/LandingNav'
import { PartnerButton } from '@/components/landing'
import { EarningsCalculator } from './EarningsCalculator'
import Script from 'next/script'
import '../landing.css'
import '../new-landing.css'

const valueProps = [
  {
    icon: Target,
    title: 'Higher conversion',
    description: 'Answers objections in real-time. Captures buying signals before prospects bounce.',
  },
  {
    icon: Mail,
    title: 'Lead capture',
    description: 'Grabs emails before prospects leave. Smart escalation when AI can\'t answer.',
  },
  {
    icon: MessageSquare,
    title: '24/7 AI support',
    description: 'Instant answers grounded in their content. Zero hallucinations.',
  },
  {
    icon: Code,
    title: 'Live in an afternoon',
    description: 'No dev team needed. Scrape pages, paste embed code. Done.',
  },
  {
    icon: BarChart3,
    title: 'Knows who\'s ready to buy',
    description: 'Detects purchase intent and buying signals in every conversation. Surfaces the hottest leads.',
  },
  {
    icon: Zap,
    title: 'Replaces tools, not adds one',
    description: 'Cuts FAQ pages, live chat staffing, and basic support tickets. Clients save money from day one.',
  },
]

const offerItems = [
  { bold: 'Use EasyAsk free', detail: 'Growth plan ($299/mo value)' },
  { bold: 'Your referrals save 20%', detail: 'Off any plan for 12 months' },
  { bold: 'You earn 40% revenue share', detail: 'For the life of every customer you refer' },
  { bold: 'Show EasyAsk branding', detail: '"Powered by EasyAsk" footer stays on widget' },
]

export default async function PartnersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="blog-landing">
      <LandingNav user={user} />

      <main>
        {/* Hero */}
        <section className="pricing-hero">
          <div className="blog-container">
            <h1>Earn recurring revenue by sharing EasyAsk.</h1>
            <p className="pricing-subtitle">
              Free account. 40% revenue share. Lifetime commissions on every referral.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <PartnerButton className="landing-button-cta landing-button-large landing-button-pulse">
                Become a Partner
              </PartnerButton>
            </div>
          </div>
        </section>

        {/* Why Businesses Love EasyAsk */}
        <section className="blog-section">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              Why businesses love EasyAsk
            </h2>

            <div className="pricing-features-grid" style={{ maxWidth: '52rem', margin: '0 auto' }}>
              {valueProps.map((prop, index) => (
                <div key={index} className="pricing-feature-card">
                  <prop.icon className="pricing-feature-icon" size={24} />
                  <h3 className="pricing-feature-title">{prop.title}</h3>
                  <p className="pricing-feature-description">{prop.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Screenshot Placeholder */}
        <section className="blog-section" style={{ paddingTop: 0 }}>
          <div className="blog-container">
            <div className="partner-placeholder">
              <span className="image-placeholder-text">Widget screenshot coming soon</span>
            </div>
          </div>
        </section>

        {/* The Partner Deal */}
        <section className="blog-section">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              The partner deal
            </h2>

            <div className="partner-offer-card">
              {offerItems.map((item, index) => (
                <div key={index} className="partner-offer-item">
                  <Check size={20} style={{ color: 'rgb(234, 88, 12)', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0 }}>
                    <strong>{item.bold}</strong>
                    <span style={{ color: 'var(--landing-color-text-secondary)' }}> — {item.detail}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Earnings Calculator */}
        <section className="blog-section">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              See what you could earn
            </h2>
            <p style={{
              textAlign: 'center',
              color: 'var(--landing-color-text-secondary)',
              fontSize: 'var(--landing-font-size-x-small)',
              marginBottom: '2rem',
            }}>
              Drag the slider. Pick a plan. Watch the numbers grow.
            </p>

            <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
              <EarningsCalculator />
            </div>
          </div>
        </section>

        {/* Second Screenshot Placeholder */}
        <section className="blog-section" style={{ paddingTop: 0 }}>
          <div className="blog-container">
            <div className="partner-placeholder">
              <span className="image-placeholder-text">Partner dashboard screenshot coming soon</span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="blog-final-cta">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ marginBottom: '0.3em' }}>
              Start earning. Help businesses grow.
            </h2>
            <p style={{
              textAlign: 'center',
              color: 'var(--landing-color-text-secondary)',
              fontWeight: 600,
              fontSize: '1.25rem',
              marginBottom: '1.5em',
            }}>
              No quotas. No exclusivity. Just share EasyAsk with businesses that need it.
            </p>

            <div className="pricing-final-cta-buttons">
              <PartnerButton className="landing-button-cta landing-button-large landing-button-pulse">
                Apply to Partner Program
              </PartnerButton>
            </div>
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

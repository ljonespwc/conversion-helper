import { createClient } from '@/lib/supabase/server'
import { Check, MessageSquare, FileText, Target, Mail, BarChart3, Code } from 'lucide-react'
import { LandingNav } from '@/components/LandingNav'
import { EarlyAccessButton } from '@/components/landing'
import { PricingFAQ } from './PricingFAQ'
import Script from 'next/script'
import '../landing.css'
import '../new-landing.css'

// =============================================================================
// Types
// =============================================================================

interface PricingFeature {
  text: string
  highlight?: boolean
}

interface PricingTier {
  name: string
  price: string
  priceNote?: string
  description: string
  pageLimit: string
  cta: string
  ctaType: 'primary' | 'secondary' | 'contact'
  popular?: boolean
  features: (string | PricingFeature)[]
}

export interface FAQItem {
  question: string
  answer: string[]
}

// =============================================================================
// Data
// =============================================================================

const tiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$129',
    priceNote: '/mo',
    description: 'Everything you need to start closing from your site.',
    pageLimit: 'Up to 50 pages',
    cta: 'Get Early Access',
    ctaType: 'primary',
    popular: true,
    features: [
      'Buying signal detection',
      'Purchase attribution',
      'Lead capture when AI can\'t answer',
      'Instant answers from your content',
      'Zero hallucinations',
      'Conversation analytics',
      '50+ languages supported',
      'Live in an afternoon',
    ],
  },
  {
    name: 'Growth',
    price: '$299',
    priceNote: '/mo',
    description: 'For teams turning every page into pipeline.',
    pageLimit: 'Unlimited pages',
    cta: 'Get Early Access',
    ctaType: 'primary',
    features: [
      'Buying signal detection',
      'Purchase attribution',
      'Lead capture when AI can\'t answer',
      'Instant answers from your content',
      'Zero hallucinations',
      'Conversation analytics',
      '50+ languages supported',
      { text: 'Auto rescrape keeps content current', highlight: true },
      'Live in an afternoon',
    ],
  },
]

const includedFeatures = [
  {
    icon: Target,
    title: 'Buying signal detection',
    description: 'Knows the difference between browsing and ready to buy. Responds accordingly.',
  },
  {
    icon: BarChart3,
    title: 'Purchase attribution',
    description: 'See which conversations led to sales. Dollar amount, product, full journey.',
  },
  {
    icon: Mail,
    title: 'Captures leads before they bounce',
    description: 'When AI can\'t answer, it grabs their email and question.',
  },
  {
    icon: MessageSquare,
    title: 'Answers in seconds, not scrolls',
    description: 'Visitors ask a question. They get the answer. No hunting through pages.',
  },
  {
    icon: FileText,
    title: 'Sells with your voice, not generic AI',
    description: 'Grounded in your docs. If it doesn\'t know, it says so.',
  },
  {
    icon: Code,
    title: 'Live in an afternoon',
    description: 'Scrape pages, upload docs, paste embed code. No dev team needed.',
  },
]

const faqItems: FAQItem[] = [
  {
    question: 'How does EasyAsk help me sell more?',
    answer: [
      'EasyAsk answers objections in real time, right when a prospect is deciding. It detects buying signals, captures leads before they bounce, and attributes revenue back to specific conversations.',
      'You see exactly which questions led to purchases and where prospects drop off.',
    ],
  },
  {
    question: 'How long does setup take?',
    answer: [
      'Most teams are live in under an hour. Scrape your pages, upload any additional docs, paste the embed code. That\'s it.',
    ],
  },
  {
    question: 'What file types can I upload?',
    answer: [
      'PDFs, Word docs, text files, and more. Anything that contains your product info, pricing, policies, or sales materials.',
      'The AI extracts and indexes the content automatically.',
    ],
  },
  {
    question: 'How does page-specific targeting work?',
    answer: [
      'You assign specific content to specific pages. Your pricing page gets pricing docs. Your features page gets product specs.',
      'The AI only answers from content you\'ve assigned to that page—plus your global knowledge base.',
    ],
  },
  {
    question: 'Can I change plans later?',
    answer: [
      'Yes. Upgrade or downgrade anytime. Changes take effect immediately.',
      'No long-term contracts. No cancellation fees.',
    ],
  },
  {
    question: 'What happens when I hit the page limit?',
    answer: [
      'On Starter, the widget works on your first 50 configured pages. Need more? Upgrade to Growth for unlimited.',
      'You can always reconfigure which pages are active without losing any content.',
    ],
  },
]

// =============================================================================
// Components
// =============================================================================

function PricingCard({ tier }: { tier: PricingTier }) {
  const isPopular = tier.popular
  const isEnterprise = tier.ctaType === 'contact'

  return (
    <div className={`pricing-card ${isPopular ? 'pricing-card--popular' : ''}`}>
      {isPopular && (
        <div className="pricing-badge">Most Popular</div>
      )}

      <div className="pricing-card-header">
        <h3 className="pricing-tier-name">{tier.name}</h3>
        <div className="pricing-price">
          <span className="pricing-amount">{tier.price}</span>
          {tier.priceNote && <span className="pricing-period">{tier.priceNote}</span>}
        </div>
        <p className="pricing-description">{tier.description}</p>
        <p className="pricing-page-limit">{tier.pageLimit}</p>
      </div>

      <div className="pricing-card-body">
        {isEnterprise ? (
          <a
            href="mailto:lance@conversionhelper.io?subject=EasyAsk Enterprise Inquiry"
            className="pricing-cta pricing-cta--secondary"
          >
            {tier.cta}
          </a>
        ) : (
          <EarlyAccessButton
            className={`pricing-cta ${isPopular ? 'pricing-cta--primary landing-button-pulse' : 'pricing-cta--primary'}`}
          >
            {tier.cta}
          </EarlyAccessButton>
        )}


        <ul className="pricing-features">
          {tier.features.map((feature, index) => {
            const isObj = typeof feature === 'object'
            const text = isObj ? feature.text : feature
            const highlight = isObj && feature.highlight
            return (
              <li key={index} className={highlight ? 'pricing-feature-highlight' : ''}>
                <Check className="pricing-check" size={16} />
                {text}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// =============================================================================
// Page Component
// =============================================================================

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="blog-landing">
      <LandingNav user={user} />

      <main>
        {/* Hero Section */}
        <section className="pricing-hero">
          <div className="blog-container">
            <h1>One extra conversion a month pays for itself.</h1>
            <p className="pricing-subtitle">
              Sales, leads, and answers. Running 24/7.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pricing-cards-section">
          <div className="pricing-container">
            <div className="pricing-grid">
              {tiers.map((tier) => (
                <PricingCard key={tier.name} tier={tier} />
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="blog-section">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              Full power, either tier.
            </h2>

            <div className="pricing-features-grid">
              {includedFeatures.map((feature, index) => (
                <div key={index} className="pricing-feature-card">
                  <feature.icon className="pricing-feature-icon" size={24} />
                  <h3 className="pricing-feature-title">{feature.title}</h3>
                  <p className="pricing-feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="blog-section">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              Questions we'd ask too.
            </h2>

            <PricingFAQ items={faqItems} />
          </div>
        </section>

        {/* Final CTA */}
        <section className="blog-final-cta">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ marginBottom: '0.3em' }}>
              Ready to turn visitors into buyers?
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--landing-color-text-secondary)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '1.5em' }}>
              By tonight, your site could be closing.
            </p>

            <div className="pricing-final-cta-buttons">
              <EarlyAccessButton className="landing-button-cta landing-button-large landing-button-pulse">
                Get Early Access
              </EarlyAccessButton>
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

import type { ReactNode } from 'react'

import { createClient } from '@/lib/supabase/server'
import Script from 'next/script'
import { LandingNav } from '@/components/LandingNav'
import { FAQAccordion } from '@/components/FAQAccordion'
import {
  ComparisonColumn,
  DifferentiatorCard,
  EarlyAccessButton,
  FinalCtaItem,
  RotatingWord,
  StatCard,
  StepCard,
  UseCaseCard,
  WidgetButtonDemo,
} from '@/components/landing'
import './landing.css'

// =============================================================================
// Data Constants
// =============================================================================

interface StatData {
  number: string
  label: string
}

const STATS: StatData[] = [
  { number: '24/7', label: 'available when your sales team isn\'t' },
  { number: '60%', label: 'of traffic is mobile (TL;DR)' },
  { number: '0', label: 'visibility into visitor intent' },
]

interface DifferentiatorData {
  heading: string
  subhead: string
  features: ReactNode[]
  image?: {
    src: string
    alt: string
    width: number
    height: number
    caption: string
  }
  reverse?: boolean
  textOnly?: boolean
  children?: ReactNode
}

const DIFFERENTIATORS: DifferentiatorData[] = [
  {
    heading: 'Lower friction than forms. Smarter than search.',
    subhead: 'Visitors ask in natural language. No digging through FAQs or filling out contact forms.',
    features: [
      <><strong>Conversational.</strong> Ask follow-ups, get clarifications, have a real back-and-forth.</>,
      <><strong>Instant.</strong> No queue. No "an agent will be with you shortly."</>,
      <><strong>Mobile-friendly.</strong> Works great on any device. No tiny form fields.</>,
    ],
    textOnly: true,
  },
  {
    heading: 'AI that sells with YOUR words. Not generic fluff.',
    subhead: 'Every answer comes from your actual content. Nothing invented. Nothing off-brand.',
    features: [
      <><strong>Grounded.</strong> Scrape pages in seconds. Upload any doc. The AI only references what you give it.</>,
      <><strong>Always current.</strong> Change your pricing Monday, the AI knows Tuesday.</>,
      <><strong>Beyond the fold.</strong> Give the AI more content than the page can show—pricing edge cases, role-specific explainers, niche use cases. It pulls the right answer on demand.</>,
    ],
    image: {
      src: '/images/differentiator-2.png',
      alt: 'Documents and web pages flowing into a central AI knowledge hub',
      width: 400,
      height: 267,
      caption: 'Feed it your content. It becomes your expert.',
    },
    reverse: true,
  },
  {
    heading: 'It knows what matters on every page.',
    subhead: 'Different pages = different visitor intent. EasyAsk adapts.',
    features: [
      <><strong>Contextual.</strong> Pricing page talks pricing. Features page demonstrates value. No generic answers.</>,
      <><strong>Configurable.</strong> You control which content the AI can access on each page.</>,
      <><strong>Intent-matched.</strong> Every response matches where the visitor is in their journey.</>,
    ],
    image: {
      src: '/images/contextual-brain.png',
      alt: 'AI brain with multiple web pages orbiting around it, showing selective knowledge routing',
      width: 400,
      height: 299,
      caption: 'Different pages, different context. Always relevant.',
    },
  },
  {
    heading: 'Didn\'t get their answer? Got their email.',
    subhead: 'If AI can\'t fully answer, it captures the question AND the contact.',
    features: [
      <><strong>Graceful fallback.</strong> AI hits a limit? It captures their email and the exact question.</>,
      <><strong>Full context handoffs.</strong> Sales sees the whole conversation, not just "someone wants to talk."</>,
      <><strong>Strike while hot.</strong> Your team follows up while the question—and the intent—is still fresh.</>,
    ],
    image: {
      src: '/images/assistant-handoff.png',
      alt: 'AI assistant gracefully handing off a lead with full conversation context to a human sales rep',
      width: 400,
      height: 299,
      caption: 'No lead left behind. Every question becomes an opportunity.',
    },
    reverse: true,
  },
  {
    heading: 'See what visitors care about before they fill out a form.',
    subhead: 'Every conversation is captured. Every question is a signal.',
    features: [
      <><strong>Content intelligence.</strong> See what visitors ask, which pages spark engagement, and where your answers fall short.</>,
      <><strong>Real market research.</strong> Patterns from actual conversations. Not surveys people lie on.</>,
    ],
    image: {
      src: '/images/differentiator-5.png',
      alt: 'Analytics dashboard with conversation data and insights',
      width: 400,
      height: 268,
      caption: 'Every question is a signal. Every pattern is an insight.',
    },
  },
  {
    heading: 'Live in 10 minutes. Not 10 weeks.',
    subhead: 'No developers. No integrations. No enterprise sales cycle.',
    features: [
      <><strong>Self-serve setup.</strong> Scrape your site, upload docs, assign content to pages, paste one embed code.</>,
      <><strong>No training required.</strong> No flows. No chatbot builder. Point it at your content and go.</>,
      <><strong>Works on any site.</strong> No redesign. No migration. Add it without touching your codebase.</>,
    ],
    textOnly: true,
    children: (
      <div className="landing-image-centered" style={{ marginTop: '2em' }}>
        <div className="landing-image-wrapper-large" style={{ margin: '0 auto' }}>
          <img
            src="/images/four-steps.png"
            alt="Four-step setup process: Scrape, Upload, Assign, Launch"
            width={800}
            height={300}
            className="landing-differentiator-img"
          />
          <p className="landing-image-caption">
            Scrape &rarr; Upload &rarr; Assign &rarr; Launch
          </p>
        </div>
      </div>
    ),
  },
]

const TEAM_BENEFITS = [
  '24/7 sales coverage',
  'Qualified leads with context',
  'Insight into visitor questions',
  'Content that converts',
  'Live in minutes',
]

const VISITOR_BENEFITS = [
  'Instant, accurate answers',
  'No scrolling or searching',
  'A conversation, not a monologue',
  'Ask naturally, get answers',
  'Help when they need it',
]

interface UseCaseData {
  iconSrc: string
  iconAlt: string
  heading: string
  body: string
}

const USE_CASES: UseCaseData[] = [
  {
    iconSrc: '/images/persona1.png',
    iconAlt: 'Complex product icon',
    heading: 'Your product takes 4 pages to explain. Your prospects have 2 minutes.',
    body: 'Chat makes dense info digestible. Page-specific AI delivers relevant answers and shortens sales cycles.',
  },
  {
    iconSrc: '/images/persona2.png',
    iconAlt: 'Comparison shopping icon',
    heading: 'Prospects are comparing 2+ options. Small unanswered questions become deal-breakers.',
    body: 'Instant answers to "Does it integrate with X?" keep them on your site instead of bouncing.',
  },
  {
    iconSrc: '/images/persona3.png',
    iconAlt: 'Mobile traffic icon',
    heading: '60% of your traffic is mobile. Nobody reads your 1,200-word page on a phone.',
    body: 'Chat eliminates scroll fatigue. Visitors ask instead of hunt. Higher mobile conversion.',
  },
  {
    iconSrc: '/images/persona4.png',
    iconAlt: 'Sales team efficiency icon',
    heading: 'Your reps spend 40% of their time on "What\'s the price?" questions.',
    body: 'AI handles the basics. Your team focuses on conversations that close deals.',
  },
]

interface StepData {
  iconSrc: string
  iconAlt: string
  heading: string
  body: string
}

const STEPS: StepData[] = [
  {
    iconSrc: '/images/step1.png',
    iconAlt: 'Scrape icon',
    heading: 'Step 1: Scrape',
    body: 'Enter your URLs. EasyAsk reads your pages and learns your content in seconds. Pricing page, features page, product docs—whatever you point it at.',
  },
  {
    iconSrc: '/images/step2.png',
    iconAlt: 'Upload icon',
    heading: 'Step 2: Upload',
    body: 'Add anything else the AI should know. Sales decks, case studies, battle cards, pricing sheets, FAQ docs. Drag, drop, done.',
  },
  {
    iconSrc: '/images/step3.png',
    iconAlt: 'Assign icon',
    heading: 'Step 3: Assign',
    body: 'Choose which content the AI can access on which pages. Pricing page gets pricing docs. Features page gets product specs. You control the context.',
  },
  {
    iconSrc: '/images/step4.png',
    iconAlt: 'Launch icon',
    heading: 'Step 4: Launch',
    body: 'Paste one embed code. Your chat assistant is live. Visitors can start asking questions immediately.',
  },
]

interface FinalCtaData {
  heading: string
  body: string
}

const FINAL_CTA_ITEMS: FinalCtaData[] = [
  {
    heading: 'Instant answers',
    body: 'No scrolling, no searching. Visitors ask and get answers in seconds.',
  },
  {
    heading: 'Grounded in YOUR content',
    body: 'No hallucinations. No off-brand answers. Every response comes from pages you scraped and docs you uploaded.',
  },
  {
    heading: 'Built for sales, not support',
    body: 'Capture purchase intent. Handle objections in real-time. Escalate to your sales team, not a ticket queue.',
  },
]

// =============================================================================
// Page Component
// =============================================================================

export default async function Home(): Promise<JSX.Element> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="landing-page">
      <Script src="/widget.js" data-position="bottom-left" data-key="pk_live_77d79847449d815d284ec68564a121d5c39362637819eaab" strategy="lazyOnload" />
      <LandingNav user={user} />

      <main className="landing-main">
        {/* SECTION 1: HERO */}
        <section className="landing-hero">
          <div className="landing-container">
            <div className="landing-hero-grid">
              <div className="landing-hero-content">
                <h1 className="landing-h1">
                  Give your site the power of conversation.
                </h1>
                <h2 className="landing-h2">
                  Don't make visitors scroll. Give them instant, 100% accurate answers—at the perfect moment—and get the <RotatingWord />
                </h2>
                <div className="landing-cta-wrapper">
                  <EarlyAccessButton className="landing-button-cta landing-button-large landing-button-pulse">
                    Get Early Access &rarr;
                  </EarlyAccessButton>
                </div>
              </div>
              <div className="landing-hero-image">
                <div className="landing-image-wrapper-small">
                  <img
                    src="/images/hero.png"
                    alt="EasyAsk chat widget showing an AI-generated answer"
                    width={500}
                    height={403}
                    className="landing-differentiator-img"
                  />
                  <p className="landing-image-caption">
                    Your site answers now. Visitors love it. No more scrolling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE PROBLEM */}
        <section className="landing-section landing-section-problem">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading">
              Your website is a monologue. Visitors want a conversation.
            </h2>

            <div className="landing-stat-callouts">
              {STATS.map((stat) => (
                <StatCard key={stat.number} number={stat.number} label={stat.label} />
              ))}
            </div>

            <div className="landing-text-block">
              <p>
                You built great content—case studies, comparison pages, an FAQ with 30 questions. Nobody reads it. Especially on mobile.
              </p>

              <p>
                What if every visitor could just <em>ask</em>—and get an instant, accurate answer? Not a chatbot. Not live chat with a 4-minute wait. Not generic AI that hallucinates.
              </p>

              <p className="landing-callout landing-callout-purple">
                Every silent bounce is a conversation that never happened.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: WHAT EASYASK IS */}
        <section className="landing-section landing-section-product">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading">
              EasyAsk turns your site into a conversation.
            </h2>

            <div className="landing-widget-demo-centered">
              <WidgetButtonDemo />
            </div>

            <div className="landing-text-block">
              <ul className="landing-icon-list">
                <li>
                  <span className="icon">&rsaquo;</span>
                  <span>Feed it your pages, sales decks, pricing sheets. It learns your product in minutes.</span>
                </li>
                <li>
                  <span className="icon">&rsaquo;</span>
                  <span>Answers in <em>your</em> words—never inventing, never hallucinating.</span>
                </li>
                <li>
                  <span className="icon">&rsaquo;</span>
                  <span>Can't answer? Captures their email and flags it for sales.</span>
                </li>
              </ul>

              <p className="landing-callout landing-callout-purple">
                Your best sales rep, on every page, 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: THE 6 DIFFERENTIATORS */}
        <section className="landing-section landing-section-differentiators">
          <div className="landing-container">
            <div className="landing-section-intro">
              <h2 className="landing-section-heading">
                What makes EasyAsk deliciously different.
              </h2>
            </div>

            {DIFFERENTIATORS.map((diff, index) => (
              <DifferentiatorCard
                key={index}
                heading={diff.heading}
                subhead={diff.subhead}
                features={diff.features}
                image={diff.image}
                reverse={diff.reverse}
                textOnly={diff.textOnly}
              >
                {diff.children}
              </DifferentiatorCard>
            ))}
          </div>
        </section>

        {/* SECTION 5: EVERYONE WINS */}
        <section className="landing-section landing-section-clarity">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading">
              Built for both sides of the conversation.
            </h2>

            <div className="landing-comparison-table">
              <ComparisonColumn
                header="Your Team Gets"
                items={TEAM_BENEFITS}
                variant="owners"
              />
              <ComparisonColumn
                header="Your Visitors Get"
                items={VISITOR_BENEFITS}
                variant="visitors"
              />
            </div>
          </div>
        </section>

        {/* SECTION 6: USE CASE SPOTLIGHTS */}
        <section className="landing-section landing-section-use-cases">
          <div className="landing-container">
            <h2 className="landing-section-heading" style={{ textAlign: 'center' }}>
              If this is you, we should talk.
            </h2>

            <div className="landing-use-case-grid">
              {USE_CASES.map((useCase, index) => (
                <UseCaseCard
                  key={index}
                  iconSrc={useCase.iconSrc}
                  iconAlt={useCase.iconAlt}
                  heading={useCase.heading}
                  body={useCase.body}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7: HOW IT WORKS */}
        <section className="landing-section landing-section-how-it-works">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading">
              From zero to live in 4 steps.
            </h2>
            <p className="landing-subhead">
              No dev team. No integrations. No waiting.
            </p>

            <div className="landing-steps">
              {STEPS.map((step, index) => (
                <StepCard
                  key={index}
                  iconSrc={step.iconSrc}
                  iconAlt={step.iconAlt}
                  heading={step.heading}
                  body={step.body}
                />
              ))}
            </div>

            <p className="landing-callout landing-callout-purple" style={{ marginTop: '3em' }}>
              Most teams go live before lunch.
            </p>
          </div>
        </section>

        {/* SECTION 8: FAQ */}
        <section className="landing-section landing-section-faq">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading" style={{ textAlign: 'center' }}>
              Questions you're probably asking.
            </h2>

            <FAQAccordion />
          </div>
        </section>

        {/* SECTION 8.5: THE END OF SCROLL (MANIFESTO) */}
        <section className="landing-section landing-section-manifesto">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading" style={{ textAlign: 'center' }}>
              The end of scrolling.
            </h2>

            <div className="landing-text-block landing-manifesto-text landing-manifesto-with-image">
              <img
                src="/images/library-as-voice.png"
                alt="AI assistant pulling threads of information from a massive library of floating documents"
                width={140}
                height={140}
                className="landing-manifesto-img"
              />
              <p>
                We think the next UX shift isn't a new page layout—it's the end of scroll-first websites.
              </p>

              <p>
                Most visitors don't read your pages—they hunt for one answer. With EasyAsk, you're no longer limited by what fits above the fold. Feed it the full story—pricing edge cases, role-specific explainers, niche use cases—and it pulls the right answer on demand.
              </p>

              <p>
                In 1-2 years, most serious products will have a conversational layer on top of a massive library of answers. EasyAsk is our way of letting you do that today, without rewriting your whole site.
              </p>

              <p className="landing-manifesto-signature">
                — Lance Jones, Founder
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 9: FINAL CTA */}
        <section className="landing-section landing-section-final-cta">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading" style={{ textAlign: 'center' }}>
              Ready to turn your website into a conversation?
            </h2>

            <div className="landing-final-cta-grid">
              {FINAL_CTA_ITEMS.map((item, index) => (
                <FinalCtaItem key={index} heading={item.heading} body={item.body} />
              ))}
            </div>

            <p className="landing-callout landing-callout-purple">
              By tonight, your site could be answering questions.
            </p>

            <p className="landing-final-cta-summary" style={{ marginTop: '2.5em' }}>
              Turn browsers into buyers. Answer questions in real-time. Capture leads before they bounce.
            </p>

            <div className="landing-final-cta-button-wrapper">
              <EarlyAccessButton className="landing-button-cta landing-button-large landing-button-pulse">
                Get Early Access &rarr;
              </EarlyAccessButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

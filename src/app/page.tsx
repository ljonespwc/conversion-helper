import { createClient } from '@/lib/supabase/server'
import { LandingNav } from '@/components/LandingNav'
import { FAQAccordion } from '@/components/FAQAccordion'
import WidgetButtonDemo from '@/components/landing/WidgetButtonDemo'
import { RotatingWord } from '@/components/landing/RotatingWord'
import { EarlyAccessButton } from '@/components/landing/EarlyAccessButton'
import './landing.css'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="landing-page">
      <LandingNav user={user} />

      <main className="landing-main">
        {/* SECTION 1: HERO */}
        <section className="landing-hero">
          <div className="landing-container">
            <div className="landing-hero-grid">
              <div className="landing-hero-content">
                <h1 className="landing-h1">
                  Give your site the persuasive power of voice.
                </h1>
                <h2 className="landing-h2">
                  Don't make visitors scroll. Give them instant, 100% accurate answers—at the perfect moment—and get the <RotatingWord />
                </h2>
                <div className="landing-cta-wrapper">
                  <EarlyAccessButton className="landing-button-green landing-button-large landing-button-pulse">
                    Get Early Access →
                  </EarlyAccessButton>
                </div>
              </div>
              <div className="landing-hero-image">
                <div className="landing-image-wrapper-small">
                  <div className="image-placeholder image-placeholder-hero">
                    <div className="image-placeholder-text">
                      <strong>assistant_speaking.jpg</strong>
                      <br />
                      500w x 400h
                      <br /><br />
                      EasyAsk widget in "Speaking..." state, showing cyan audio icon, response bubble, and "Was this helpful?" feedback prompt
                    </div>
                  </div>
                  <p className="landing-image-caption">
                    Voice-first sales assistant for B2B websites. No chatbot. No support tool. No dev required.
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

            {/* Stat Callouts */}
            <div className="landing-stat-callouts">
              <div className="landing-stat">
                <span className="landing-stat-number">24/7</span>
                <span className="landing-stat-label">available when your sales team isn't</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-number">60%</span>
                <span className="landing-stat-label">of traffic is mobile (TL;DR)</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-number">0</span>
                <span className="landing-stat-label">visibility into visitor intent</span>
              </div>
            </div>

            <div className="landing-text-block">
              <p>
                You built great content—case studies, comparison pages, an FAQ with 30 questions. Nobody reads it. Especially on mobile.
              </p>

              <p>
                What if every visitor could just <em>ask</em>—out loud—and get an instant, accurate answer? Not a chatbot. Not live chat with a 4-minute wait. Not generic AI that hallucinates.
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
              EasyAsk gives your site a voice.
            </h2>

            <div className="landing-widget-demo-centered">
              <WidgetButtonDemo />
            </div>

            <div className="landing-text-block">
              <ul className="landing-icon-list">
                <li>
                  <span className="icon">›</span>
                  <span>Feed it your pages, sales decks, pricing sheets. It learns your product in minutes.</span>
                </li>
                <li>
                  <span className="icon">›</span>
                  <span>Answers in <em>your</em> words—never inventing, never hallucinating.</span>
                </li>
                <li>
                  <span className="icon">›</span>
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

            {/* Differentiator 1: Voice-First */}
            <div className="differentiator-card">
              <div className="landing-differentiator">
                <div className="landing-differentiator-content">
                  <h3 className="landing-differentiator-heading">
                    Don't make them type. Let them talk.
                  </h3>
                  <p className="landing-differentiator-subhead">
                    Speaking is 3x faster than typing. Lower friction = higher engagement.
                  </p>
                  <ul className="landing-sub-diff-list">
                    <li><strong>Interruptible.</strong> Talk to it like a human. Interrupt, redirect, follow up.</li>
                    <li><strong>Instant.</strong> No queue. No "an agent will be with you shortly."</li>
                    <li><strong>Mobile-native.</strong> Thumbs-free. Because nobody types paragraphs on their phone.</li>
                  </ul>
                </div>
                <div className="landing-differentiator-image">
                  <div className="landing-image-wrapper-small">
                    <div className="image-placeholder image-placeholder-tall">
                      <div className="image-placeholder-text">
                        <strong>assistant_active.png</strong>
                        <br />
                        240w x 300h
                        <br /><br />
                        Widget in "Speaking..." state with audio visualization active
                      </div>
                    </div>
                    <p className="landing-image-caption">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Differentiator 2: Your Content */}
            <div className="differentiator-card">
              <div className="landing-differentiator landing-differentiator-reverse">
              <div className="landing-differentiator-content">
                <h3 className="landing-differentiator-heading">
                  AI that sells with YOUR words. Not generic fluff.
                </h3>
                <p className="landing-differentiator-subhead">
                  Every answer comes from your actual content. Nothing invented. Nothing off-brand.
                </p>
                <ul className="landing-sub-diff-list">
                  <li><strong>Grounded.</strong> Scrape pages in seconds. Upload any doc. The AI only references what you give it.</li>
                  <li><strong>Always current.</strong> Change your pricing Monday, the AI knows Tuesday.</li>
                </ul>
              </div>
              <div className="landing-differentiator-image">
                <div className="landing-image-wrapper-small">
                  <div className="image-placeholder image-placeholder-landscape">
                    <div className="image-placeholder-text">
                      <strong>easyask_backend__assistant_knowledgebase.png</strong>
                      <br />
                      400w x 267h
                      <br /><br />
                      Knowledgebase management screen showing scraped pages, uploaded docs
                    </div>
                  </div>
                  <p className="landing-image-caption">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit.
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* Differentiator 3: Page-Specific */}
            <div className="differentiator-card">
              <div className="landing-differentiator">
              <div className="landing-differentiator-content">
                <h3 className="landing-differentiator-heading">
                  It knows what matters on every page.
                </h3>
                <p className="landing-differentiator-subhead">
                  Different pages = different visitor intent. EasyAsk adapts.
                </p>
                <ul className="landing-sub-diff-list">
                  <li><strong>Contextual.</strong> Pricing page talks pricing. Features page demonstrates value. No generic answers.</li>
                  <li><strong>Configurable.</strong> You control which content the AI can access on each page.</li>
                  <li><strong>Intent-matched.</strong> Every response matches where the visitor is in their journey.</li>
                </ul>
              </div>
              <div className="landing-differentiator-image">
                <div className="landing-image-wrapper-small">
                  <div className="image-placeholder image-placeholder-square">
                    <div className="image-placeholder-text">
                      <strong>easyask_backend__assistant_pages.png</strong>
                      <br />
                      400w x 300h
                      <br /><br />
                      Assistant Pages screen showing page list with tags (Sell, Lead, Support) and active/inactive toggles
                    </div>
                  </div>
                  <p className="landing-image-caption">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit.
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* Differentiator 4: Smart Lead Capture */}
            <div className="differentiator-card">
              <div className="landing-differentiator landing-differentiator-reverse">
              <div className="landing-differentiator-content">
                <h3 className="landing-differentiator-heading">
                  Didn't get their answer? Got their email.
                </h3>
                <p className="landing-differentiator-subhead">
                  If AI can't fully answer, it captures the question AND the contact.
                </p>
                <ul className="landing-sub-diff-list">
                  <li><strong>Graceful fallback.</strong> AI hits a limit? It captures their email and the exact question.</li>
                  <li><strong>Full context handoffs.</strong> Sales sees the whole conversation, not just "someone wants to talk."</li>
                  <li><strong>Strike while hot.</strong> Your team follows up while the question—and the intent—is still fresh.</li>
                </ul>
              </div>
              <div className="landing-differentiator-image">
                <div className="landing-image-wrapper-small">
                  <div className="image-placeholder image-placeholder-landscape">
                    <div className="image-placeholder-text">
                      <strong>easyask_backend__sales_leads.png</strong>
                      <br />
                      400w x 267h
                      <br /><br />
                      Sales Leads / Escalations dashboard showing email, conversation preview, resolved/unresolved status, flagged messages
                    </div>
                  </div>
                  <p className="landing-image-caption">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit.
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* Differentiator 5: Conversation Intelligence */}
            <div className="differentiator-card">
              <div className="landing-differentiator">
              <div className="landing-differentiator-content">
                <h3 className="landing-differentiator-heading">
                  See what visitors care about before they fill out a form.
                </h3>
                <p className="landing-differentiator-subhead">
                  Every conversation is captured. Every question is a signal.
                </p>
                <ul className="landing-sub-diff-list">
                  <li><strong>Content intelligence.</strong> See what visitors ask, which pages spark engagement, and where your answers fall short.</li>
                  <li><strong>Real market research.</strong> Patterns from actual conversations. Not surveys people lie on.</li>
                </ul>
              </div>
              <div className="landing-differentiator-image">
                <div className="landing-image-wrapper-small">
                  <div className="image-placeholder image-placeholder-landscape-wide">
                    <div className="image-placeholder-text">
                      <strong>easyask_backend__reporting.png</strong>
                      <br />
                      400w x 267h
                      <br /><br />
                      Reports & Analytics dashboard showing Total Conversations, Session Duration, User Feedback (thumbs up/down), Recent Conversations with transcript previews
                    </div>
                  </div>
                  <p className="landing-image-caption">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit.
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* Differentiator 6: Self-Serve Setup */}
            <div className="differentiator-card">
              <div className="landing-differentiator landing-differentiator-text-only">
              <div className="landing-differentiator-content-full">
                <h3 className="landing-differentiator-heading">
                  Live in 10 minutes. Not 10 weeks.
                </h3>
                <p className="landing-differentiator-subhead">
                  No developers. No integrations. No enterprise sales cycle.
                </p>
                <ul className="landing-sub-diff-list">
                  <li><strong>Self-serve setup.</strong> Scrape your site, upload docs, assign content to pages, paste one embed code.</li>
                  <li><strong>No training required.</strong> No flows. No chatbot builder. Point it at your content and go.</li>
                  <li><strong>Works on any site.</strong> No redesign. No migration. Add it without touching your codebase.</li>
                </ul>
                <div className="landing-image-centered" style={{ marginTop: '2em' }}>
                  <div className="landing-image-wrapper-large" style={{ margin: '0 auto' }}>
                    <div className="image-placeholder image-placeholder-ultrawide">
                      <div className="image-placeholder-text">
                        <strong>4-step process diagram</strong>
                        <br />
                        800w x 200h
                        <br /><br />
                        Simple horizontal flow: Scrape → Upload → Assign → Launch (clean, minimal icons)
                      </div>
                    </div>
                    <p className="landing-image-caption">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: EVERYONE WINS */}
        <section className="landing-section landing-section-clarity">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading">
              Built for both sides of the conversation.
            </h2>

            <div className="landing-comparison-table">
              <div className="landing-comparison-column landing-comparison-owners">
                <h3 className="landing-comparison-header">Your Team Gets</h3>
                <ul className="landing-comparison-list">
                  <li>24/7 sales coverage</li>
                  <li>Qualified leads with context</li>
                  <li>Insight into visitor questions</li>
                  <li>Content that converts</li>
                  <li>Live in minutes</li>
                </ul>
              </div>
              <div className="landing-comparison-column landing-comparison-visitors">
                <h3 className="landing-comparison-header">Your Visitors Get</h3>
                <ul className="landing-comparison-list">
                  <li>Instant, accurate answers</li>
                  <li>No scrolling or searching</li>
                  <li>A conversation, not a monologue</li>
                  <li>Voice-first, no typing</li>
                  <li>Help when they need it</li>
                </ul>
              </div>
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
              {/* Card 1 */}
              <div className="landing-use-case-card">
                <div className="landing-use-case-header">
                  <div className="landing-use-case-icon">
                    <div className="image-placeholder image-placeholder-icon">
                      <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                        Puzzle
                      </div>
                    </div>
                  </div>
                  <h3 className="landing-use-case-heading">
                    Your product takes 4 pages to explain. Your prospects have 2 minutes.
                  </h3>
                </div>
                <p className="landing-use-case-body">
                  Voice makes dense info digestible. Page-specific AI delivers relevant answers and shortens sales cycles.
                </p>
              </div>

              {/* Card 2 */}
              <div className="landing-use-case-card">
                <div className="landing-use-case-header">
                  <div className="landing-use-case-icon">
                    <div className="image-placeholder image-placeholder-icon">
                      <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                        Scale
                      </div>
                    </div>
                  </div>
                  <h3 className="landing-use-case-heading">
                    Prospects are comparing 2+ options. Small unanswered questions become deal-breakers.
                  </h3>
                </div>
                <p className="landing-use-case-body">
                  Instant answers to "Does it integrate with X?" keep them on your site instead of bouncing.
                </p>
              </div>

              {/* Card 3 */}
              <div className="landing-use-case-card">
                <div className="landing-use-case-header">
                  <div className="landing-use-case-icon">
                    <div className="image-placeholder image-placeholder-icon">
                      <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                        Mobile
                      </div>
                    </div>
                  </div>
                  <h3 className="landing-use-case-heading">
                    60% of your traffic is mobile. Nobody reads your 1,200-word page on a phone.
                  </h3>
                </div>
                <p className="landing-use-case-body">
                  Voice eliminates scroll fatigue. Visitors ask instead of hunt. Higher mobile conversion.
                </p>
              </div>

              {/* Card 4 */}
              <div className="landing-use-case-card">
                <div className="landing-use-case-header">
                  <div className="landing-use-case-icon">
                    <div className="image-placeholder image-placeholder-icon">
                      <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                        Team
                      </div>
                    </div>
                  </div>
                  <h3 className="landing-use-case-heading">
                    Your reps spend 40% of their time on "What's the price?" questions.
                  </h3>
                </div>
                <p className="landing-use-case-body">
                  AI handles the basics. Your team focuses on conversations that close deals.
                </p>
              </div>
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
              <div className="landing-step">
                <div className="landing-step-icon">
                  <div className="image-placeholder image-placeholder-icon-large">
                    <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                      Globe
                    </div>
                  </div>
                </div>
                <div className="landing-step-content">
                  <h3 className="landing-step-heading">Step 1: Scrape</h3>
                  <p className="landing-step-body">
                    Enter your URLs. EasyAsk reads your pages and learns your content in seconds. Pricing page, features page, product docs—whatever you point it at.
                  </p>
                </div>
              </div>

              <div className="landing-step">
                <div className="landing-step-icon">
                  <div className="image-placeholder image-placeholder-icon-large">
                    <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                      Upload
                    </div>
                  </div>
                </div>
                <div className="landing-step-content">
                  <h3 className="landing-step-heading">Step 2: Upload</h3>
                  <p className="landing-step-body">
                    Add anything else the AI should know. Sales decks, case studies, battle cards, pricing sheets, FAQ docs. Drag, drop, done.
                  </p>
                </div>
              </div>

              <div className="landing-step">
                <div className="landing-step-icon">
                  <div className="image-placeholder image-placeholder-icon-large">
                    <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                      Tag
                    </div>
                  </div>
                </div>
                <div className="landing-step-content">
                  <h3 className="landing-step-heading">Step 3: Assign</h3>
                  <p className="landing-step-body">
                    Choose which content the AI can access on which pages. Pricing page gets pricing docs. Features page gets product specs. You control the context.
                  </p>
                </div>
              </div>

              <div className="landing-step">
                <div className="landing-step-icon">
                  <div className="image-placeholder image-placeholder-icon-large">
                    <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                      Rocket
                    </div>
                  </div>
                </div>
                <div className="landing-step-content">
                  <h3 className="landing-step-heading">Step 4: Launch</h3>
                  <p className="landing-step-body">
                    Paste one embed code. Your voice assistant is live. Visitors can start asking questions immediately.
                  </p>
                </div>
              </div>
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

        {/* SECTION 9: FINAL CTA */}
        <section className="landing-section landing-section-final-cta">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading" style={{ textAlign: 'center' }}>
              Ready to turn your website into a conversation?
            </h2>

            <div className="landing-final-cta-grid">
              <div className="landing-final-cta-item">
                <h3 className="landing-final-cta-heading">Voice-first</h3>
                <p className="landing-final-cta-body">
                  Way easier than typing. Especially on mobile. Visitors ask out loud and get answers in seconds.
                </p>
              </div>

              <div className="landing-final-cta-item">
                <h3 className="landing-final-cta-heading">Grounded in YOUR content</h3>
                <p className="landing-final-cta-body">
                  No hallucinations. No off-brand answers. Every response comes from pages you scraped and docs you uploaded.
                </p>
              </div>

              <div className="landing-final-cta-item">
                <h3 className="landing-final-cta-heading">Built for sales, not support</h3>
                <p className="landing-final-cta-body">
                  Capture purchase intent. Handle objections in real-time. Escalate to your sales team, not a ticket queue.
                </p>
              </div>
            </div>

            <p className="landing-callout landing-callout-purple">
              By tonight, your site could be answering questions.
            </p>

            <p className="landing-final-cta-summary" style={{ marginTop: '2.5em' }}>
              Turn browsers into buyers. Answer questions in real-time. Capture leads before they bounce.
            </p>

            <div className="landing-final-cta-button-wrapper">
              <EarlyAccessButton className="landing-button-green landing-button-large landing-button-pulse">
                Get Early Access →
              </EarlyAccessButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

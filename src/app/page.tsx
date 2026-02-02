import { createClient } from '@/lib/supabase/server'
import Script from 'next/script'
import { LandingNav } from '@/components/LandingNav'
import { FAQAccordion } from '@/components/FAQAccordion'
import { EarlyAccessButton } from '@/components/landing'
import './landing.css'
import './new-landing.css'

// =============================================================================
// Image Placeholder Component
// =============================================================================

function ImagePlaceholder({
  dimensions,
  caption,
  className = '',
}: {
  dimensions: string
  caption: string
  className?: string
}) {
  return (
    <div>
      <div className={`blog-image-placeholder ${className}`}>
        <span>{dimensions} &mdash; {caption}</span>
      </div>
      <p className="blog-image-caption">{caption}</p>
    </div>
  )
}

// =============================================================================
// Page Component
// =============================================================================

export default async function LandingPage(): Promise<JSX.Element> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="blog-landing">
      <Script src="/widget.js" data-key="pk_live_77d79847449d815d284ec68564a121d5c39362637819eaab" strategy="lazyOnload" />
      <LandingNav user={user} />

      <main>
        {/* ============================================================
            1. HERO
            ============================================================ */}
        <section className="blog-hero">
          <div className="blog-container">
            <h1>Your product didn&rsquo;t lose them.<br />Your page did.</h1>
            <p className="blog-subtitle">Turn your pages, case studies, and sales decks into an AI assistant that answers instantly, learns what visitors want, and closes sales.</p>
            <div className="blog-cta-wrapper">
              <EarlyAccessButton className="landing-button-cta landing-button-large landing-button-pulse">
                Get Early Access &rarr;
              </EarlyAccessButton>
              <p className="blog-hero-microcopy">Your content. No hallucinations.</p>
            </div>
            <div>
              <img
                src="/images/hero.png"
                alt="Paper craft illustration of visitors hiking up a winding mountain path versus taking a direct cable car — representing the difference between scrolling through content and asking EasyAsk"
                width={1200}
                height={805}
                className="blog-hero-image"
              />
              <p className="blog-image-caption">Your visitors have to work to get answers. Give them a lift.</p>
            </div>
          </div>
        </section>

        {/* ============================================================
            2. THE PROBLEM — "The Library Metaphor"
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              Your visitors don&rsquo;t want to climb a mountain of content. They want to get to the top.
            </h2>

            <p>
              <span className="blog-lead">You built great content&mdash;case studies, comparison pages, pricing tables, a 30-question FAQ.</span> The content was never the problem. The format was.
            </p>

            <p>
              <strong>60% of traffic is mobile.</strong> Nobody reads 1,200 words on a phone. They have one question. If they can&rsquo;t find the answer in seconds, they bounce.
            </p>

            <p>
              They didn&rsquo;t bounce because your product was wrong. They bounced because your page <strong>made them work for the answer.</strong>
            </p>

            <p>
              What if every visitor could just <em>ask</em>&mdash;and get an instant, accurate answer from your own content?
            </p>

            <div className="blog-demo-row blog-comparison">
              <div className="blog-comparison-card blog-comparison-card--before">
                <span className="blog-badge blog-comparison-tag blog-comparison-tag--before">BEFORE</span>
                <div className="blog-comparison-lines">
                  <div /><div /><div /><div /><div />
                </div>
                <p>Wall of text. One question. No answer.</p>
              </div>
              <div className="blog-comparison-card blog-comparison-card--after">
                <span className="blog-badge blog-comparison-tag blog-comparison-tag--after">AFTER</span>
                <div className="blog-comparison-chat">
                  <div className="blog-chat-bubble blog-chat-bubble--user" />
                  <div className="blog-chat-bubble blog-chat-bubble--assistant" />
                </div>
                <p>Ask a question. Get the answer.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            3. THE REFRAME (short bridge)
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <p>
              <span className="blog-lead">EasyAsk doesn&rsquo;t replace your content. It makes your content reachable.</span>
            </p>

            <p>
              Feed it your pages, sales decks, pricing sheets. It learns your product in minutes. Answers in your words&mdash;<strong>never inventing, never hallucinating.</strong>
            </p>

            <p>
              Here&rsquo;s what changes when visitors can ask instead of scroll.
            </p>
          </div>
        </section>

        {/* ============================================================
            4. FEATURE: Answer in Seconds, Not Scrolls
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <span className="blog-section-tag">INSTANT ANSWERS</span>
            <h2 className="blog-feature-heading">
              Answer in Seconds, <span className="blog-heading-accent">Not Scrolls</span>
            </h2>

            <p>
              <span className="blog-lead">Your visitor is on your pricing page right now. They have one question. If they can&rsquo;t get the answer in seconds, they&rsquo;re gone.</span>
            </p>

            <p>
              Page-scoped context means your pricing page talks pricing, your features page demonstrates value. You control what the AI knows on each page.
            </p>

            <p>
              But visitors ask about products that aren&rsquo;t on the current page&mdash;and that&rsquo;s <strong>purchase intent.</strong> EasyAsk answers from everything you give it: your full suite, your pricing, how products complement each other.
            </p>

            <p>
              Built-in comprehension tools let visitors translate, simplify, summarize, or define terms inside the chat. Complex doesn&rsquo;t have to mean confusing.
            </p>

            <p>
              The visitor who was going to bounce after 8 seconds gets their answer and stays. Every page becomes as helpful as <strong>your best salesperson on their best day</strong>&mdash;except it&rsquo;s 2 AM and the visitor is on their phone.
            </p>

            <div className="blog-proof-block">
              <h4>How it works:</h4>
              <ul>
                <li><strong>Semantic search, not keyword matching.</strong> &ldquo;How much does it cost?&rdquo; matches your pricing doc even if &ldquo;cost&rdquo; never appears.</li>
                <li><strong>Page-scoped context.</strong> You choose which documents the AI can access on each page&mdash;nothing more.</li>
                <li><strong>Cross-product intelligence.</strong> The page is the starting point. The conversation goes wherever the buyer wants.</li>
                <li><strong>Comprehension tools.</strong> Translate, simplify, summarize, define&mdash;right inside the chat.</li>
              </ul>
            </div>

            <div className="blog-demo-row blog-page-context-demo">
              <div className="blog-page-context-card">
                <span className="blog-badge blog-page-context-badge--pricing">Pricing Page</span>
                <div className="blog-page-context-chat">
                  <div className="blog-context-bubble blog-context-bubble--user">
                    Does the Business plan include SSO?
                  </div>
                  <div className="blog-context-bubble blog-context-bubble--assistant">
                    Yes &mdash; SSO is included on Business and Enterprise. Business starts at $49/seat/mo.
                  </div>
                </div>
              </div>
              <div className="blog-page-context-card">
                <span className="blog-badge blog-page-context-badge--features">Features Page</span>
                <div className="blog-page-context-chat">
                  <div className="blog-context-bubble blog-context-bubble--user">
                    Does it integrate with Salesforce?
                  </div>
                  <div className="blog-context-bubble blog-context-bubble--assistant">
                    Yes &mdash; native Salesforce integration with two-way sync. Setup takes about 10 minutes.
                  </div>
                </div>
              </div>
            </div>
            <p className="blog-page-context-caption">Same widget. Different intelligence per page.</p>
          </div>
        </section>

        {/* ============================================================
            5. FEATURE: It Knows What It Doesn't Know
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <span className="blog-section-tag">GROUNDING</span>
            <h2 className="blog-feature-heading">
              It Knows What It <span className="blog-heading-accent">Doesn&rsquo;t Know</span>
            </h2>

            <p>
              <span className="blog-lead">Most chatbots guess when they&rsquo;re stumped. EasyAsk doesn&rsquo;t.</span>
            </p>

            <p>
              When the AI can&rsquo;t answer from your approved content, it tells the visitor honestly&mdash;then <strong>captures their email and question</strong> before they leave.
            </p>

            <p>
              Your team gets a warm lead with the exact question that needs answering. <strong>No hallucination. No lost prospect.</strong>
            </p>

            <p>
              Every honest &ldquo;I don&rsquo;t know&rdquo; is a signal&mdash;a question your visitors keep asking that your content doesn&rsquo;t answer. And every captured email is a lead your team would have lost entirely.
            </p>

            <div className="blog-pullquote">
              <p>The AI assistant that never goes off-script.</p>
            </div>

            <div className="blog-proof-block">
              <h4>How it works:</h4>
              <ul>
                <li><strong>Two-layer hallucination defense.</strong> The AI only uses retrieved content&mdash;never training data. After generation, every response is checked against your documents. If it can&rsquo;t trace the answer, honesty replaces the response before the visitor sees it.</li>
                <li><strong>Semantic search, not keyword matching.</strong> Understands what the visitor means, not just what they typed.</li>
                <li><strong>Honest escalation.</strong> Captures email + question, routes to your team with full context. Warm lead, not cold.</li>
              </ul>
            </div>

            <div className="blog-demo-row blog-grounding-demo">
              <div className="blog-grounding-card blog-grounding-card--other">
                <span className="blog-badge blog-grounding-badge--other">Other Chatbots</span>
                <div className="blog-grounding-chat">
                  <div className="blog-context-bubble blog-context-bubble--user">
                    Can I pay annually for a discount?
                  </div>
                  <div className="blog-context-bubble blog-grounding-bubble--hallucination">
                    Yes! We offer a 20% discount on all annual plans. Just select &ldquo;Annual&rdquo; at checkout.
                    <span className="blog-grounding-flag">&#x26a0; Made up &mdash; no source</span>
                  </div>
                </div>
              </div>
              <div className="blog-grounding-card blog-grounding-card--easyask">
                <span className="blog-badge blog-grounding-badge--easyask">EasyAsk</span>
                <div className="blog-grounding-chat">
                  <div className="blog-context-bubble blog-context-bubble--user">
                    Can I pay annually for a discount?
                  </div>
                  <div className="blog-context-bubble blog-grounding-bubble--honest">
                    I don&rsquo;t have information about annual billing in the docs I&rsquo;ve been given. Want me to pass your question to the team?
                  </div>
                  <div className="blog-grounding-escalation">
                    <span className="blog-grounding-escalation-icon" />
                    Email captured &rarr; routed to sales
                  </div>
                </div>
              </div>
            </div>
            <p className="blog-page-context-caption">One invents an answer. The other captures a lead.</p>
          </div>
        </section>

        {/* ============================================================
            6. FEATURE: Your Visitors Are Already Telling You What's Missing
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <span className="blog-section-tag">ANALYTICS</span>
            <h2 className="blog-feature-heading">
              Your Visitors Are Already Telling You <span className="blog-heading-accent">What&rsquo;s Missing</span>
            </h2>

            <p>
              <span className="blog-lead">Google Analytics tells you what people clicked. Heatmaps tell you where they scrolled. Neither tells you what they were thinking. EasyAsk does.</span>
            </p>

            <p>
              Every chat is an <strong>unprompted, unbiased focus group.</strong> Zero survey friction. Visitors tell you, in their own words, what&rsquo;s confusing, what&rsquo;s missing, and what almost convinced them. No survey to design. No 3% response rate to pray for.
            </p>

            <p>
              You <strong>stop guessing</strong> what to put on your pricing page and <strong>start knowing.</strong> You see that 40% of questions on your features page are about integrations&mdash;so you add an integrations section and watch bounce rate drop.
            </p>

            <p>
              Your site gets <strong>sharper every week</strong> because your visitors are telling you exactly how to fix it.
            </p>

            <div className="blog-pullquote">
              <p>This isn&rsquo;t analytics. It&rsquo;s your customers rewriting your copy for you.</p>
            </div>


            <div className="blog-proof-block">
              <h4>How it works:</h4>
              <ul>
                <li><strong>AI-clustered question themes.</strong> Groups visitor questions into themes automatically, per page, using their own language. You don&rsquo;t define categories. Patterns emerge.</li>
                <li><strong>Grounding status on every response.</strong> Tagged as grounded (answered from your content) or fallback (couldn&rsquo;t find a match). A cluster of fallbacks = a content gap you can fix.</li>
                <li><strong>Exact words, not interpretations.</strong> The literal phrasing visitors used&mdash;ready-made language for your copy.</li>
                <li><strong>Per-page analytics.</strong> Widget opens, unique visitors, open-to-chat conversion, active sessions, duration, thumbs up/down&mdash;all broken down per page.</li>
              </ul>
            </div>

            <div className="blog-demo-row blog-analytics-demo">
              <div className="blog-analytics-card blog-analytics-card--traditional">
                <span className="blog-badge blog-analytics-badge--traditional">Traditional Analytics</span>
                <div className="blog-analytics-metrics">
                  <div className="blog-analytics-metric">
                    <span className="blog-analytics-metric-value">2,847</span>
                    <span className="blog-analytics-metric-label">Pageviews</span>
                  </div>
                  <div className="blog-analytics-metric">
                    <span className="blog-analytics-metric-value">68%</span>
                    <span className="blog-analytics-metric-label">Bounce rate</span>
                  </div>
                  <div className="blog-analytics-metric">
                    <span className="blog-analytics-metric-value">0:42</span>
                    <span className="blog-analytics-metric-label">Avg. time</span>
                  </div>
                </div>
                <div className="blog-analytics-bars">
                  <div style={{ width: '80%' }} /><div style={{ width: '55%' }} /><div style={{ width: '35%' }} /><div style={{ width: '20%' }} />
                </div>
                <p className="blog-analytics-verdict">They left. You don&rsquo;t know why.</p>
              </div>
              <div className="blog-analytics-card blog-analytics-card--easyask">
                <span className="blog-badge blog-grounding-badge--easyask">EasyAsk</span>
                <div className="blog-analytics-themes">
                  <div className="blog-analytics-theme">
                    <span className="blog-analytics-theme-label">Integrations</span>
                    <span className="blog-analytics-theme-count">40%</span>
                  </div>
                  <ul className="blog-analytics-questions">
                    <li>&ldquo;Does it connect to Salesforce?&rdquo;</li>
                    <li>&ldquo;Any Zapier integration?&rdquo;</li>
                    <li>&ldquo;Can I sync with HubSpot?&rdquo;</li>
                  </ul>
                  <div className="blog-analytics-theme" style={{ marginTop: '0.75em' }}>
                    <span className="blog-analytics-theme-label">Pricing clarity</span>
                    <span className="blog-analytics-theme-count">25%</span>
                  </div>
                  <ul className="blog-analytics-questions">
                    <li>&ldquo;What happens after the trial?&rdquo;</li>
                    <li>&ldquo;Is there a free tier?&rdquo;</li>
                  </ul>
                </div>
                <p className="blog-analytics-verdict blog-analytics-verdict--positive">They told you exactly what&rsquo;s missing.</p>
              </div>
            </div>
            <p className="blog-page-context-caption">One counts clicks. The other reads minds.</p>
          </div>
        </section>

        {/* ============================================================
            7. FEATURE: From Support Mode to Sales Mode
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <span className="blog-section-tag">SALES MODE</span>
            <h2 className="blog-feature-heading">
              From Support Mode to <span className="blog-heading-accent">Sales Mode</span>
            </h2>

            <p>
              <span className="blog-lead">Someone asking &ldquo;what do you do?&rdquo; and someone asking &ldquo;does the Business plan include SSO?&rdquo; are not the same visitor.</span> The second one is <strong>five minutes from pulling out their credit card.</strong> EasyAsk knows the difference.
            </p>

            <p>
              Tag a page as a sales page and the AI shifts from support to consultative selling. It picks up on buying cues: pricing, comparisons, implementation. It responds with answers that address objections while qualifying intent. It doesn&rsquo;t push. It guides.
            </p>

            <p>
              And when they buy, you see it. Not in a separate dashboard you have to cross-reference&mdash;<strong>right next to their conversation.</strong> Dollar amount, product, every question they asked before they bought.
            </p>

            <p>
              That&rsquo;s not a vanity metric. That&rsquo;s <strong>proof your content is generating revenue</strong>&mdash;and a blueprint for generating more. You stop wondering whether the widget is &ldquo;working&rdquo; and start seeing exactly how much revenue it&rsquo;s driving.
            </p>

            <div className="blog-proof-block">
              <h4>How it works:</h4>
              <ul>
                <li><strong>Two-call AI architecture.</strong> A fast classification call reads every message, determines conversation stage and intent. The response call gets stage-specific instructions.</li>
                <li><strong>Buying signal detection.</strong> When signals fire, the AI shifts from informational to action-oriented&mdash;&ldquo;Here&rsquo;s how to get started&rdquo; instead of &ldquo;Here&rsquo;s more to read.&rdquo;</li>
                <li><strong>Persistent visitor identity.</strong> First-party cookie tracks visitors across sessions. Tuesday&rsquo;s pricing question and Thursday&rsquo;s return visit&mdash;one visitor, full journey.</li>
                <li><strong>Purchase attribution.</strong> Lightweight API connects purchases to visitor records. Transaction amount, product, and the chat sessions that preceded it. No UTM guesswork.</li>
              </ul>
            </div>

            <div className="blog-demo-row blog-sales-demo">
              <div className="blog-sales-card blog-sales-card--support">
                <span className="blog-badge blog-sales-badge--support">Support Mode</span>
                <div className="blog-sales-signal">
                  <span className="blog-sales-signal-dot blog-sales-signal-dot--low" />
                  <span className="blog-sales-signal-label">Low intent</span>
                </div>
                <div className="blog-grounding-chat">
                  <div className="blog-context-bubble blog-context-bubble--user">
                    What does your product do?
                  </div>
                  <div className="blog-context-bubble blog-sales-bubble--support">
                    EasyAsk turns your existing content into a conversational AI assistant. Visitors ask questions and get instant answers from your docs, pages, and files.
                  </div>
                </div>
                <p className="blog-sales-outcome">Informed &rarr; may return later</p>
              </div>
              <div className="blog-sales-card blog-sales-card--sales">
                <span className="blog-badge blog-sales-badge--sales">Sales Mode</span>
                <div className="blog-sales-signal">
                  <span className="blog-sales-signal-dot blog-sales-signal-dot--high" />
                  <span className="blog-sales-signal-label">Buying signal detected</span>
                </div>
                <div className="blog-grounding-chat">
                  <div className="blog-context-bubble blog-context-bubble--user">
                    Does the Business plan include SSO?
                  </div>
                  <div className="blog-context-bubble blog-sales-bubble--sales">
                    Yes &mdash; SSO is included on Business and Enterprise. Business is $49/seat/mo. Want me to walk you through getting started?
                  </div>
                </div>
                <div className="blog-sales-attribution">
                  <div className="blog-sales-attribution-row">
                    <span className="blog-sales-attribution-label">Purchase</span>
                    <span className="blog-sales-attribution-value">$2,940/yr</span>
                  </div>
                  <div className="blog-sales-attribution-row">
                    <span className="blog-sales-attribution-label">Product</span>
                    <span className="blog-sales-attribution-value">Business &middot; 5 seats</span>
                  </div>
                  <div className="blog-sales-attribution-row">
                    <span className="blog-sales-attribution-label">Sessions before purchase</span>
                    <span className="blog-sales-attribution-value">3</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="blog-page-context-caption">Same widget. Different conversation. Attributed revenue.</p>
          </div>
        </section>

        {/* ============================================================
            8. HOW IT WORKS
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-section-heading" style={{ textAlign: 'center', marginBottom: '0.3em' }}>
              From zero to live in 4 steps.
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--landing-color-text-secondary)', fontWeight: 600, marginBottom: '1.5em' }}>
              No dev team. No integrations. No waiting.
            </p>

            <ol className="blog-steps blog-steps--icons">
              <li>
                <div className="blog-step-icon blog-step-icon--scrape" />
                <div className="blog-step-content">
                  <h3>Scrape</h3>
                  <p>Enter your URLs. EasyAsk reads your pages and learns your content in seconds. Pricing page, features page, product docs&mdash;whatever you point it at.</p>
                </div>
              </li>
              <li>
                <div className="blog-step-icon blog-step-icon--upload" />
                <div className="blog-step-content">
                  <h3>Upload</h3>
                  <p>Add anything else the AI should know. Sales decks, case studies, battle cards, pricing sheets, FAQ docs. Drag, drop, done.</p>
                </div>
              </li>
              <li>
                <div className="blog-step-icon blog-step-icon--assign" />
                <div className="blog-step-content">
                  <h3>Assign</h3>
                  <p>Choose which content the AI can access on which pages. Pricing page gets pricing docs. Features page gets product specs. You control the context.</p>
                </div>
              </li>
              <li>
                <div className="blog-step-icon blog-step-icon--launch" />
                <div className="blog-step-content">
                  <h3>Launch</h3>
                  <p>Paste one embed code. Your chat assistant is live. Visitors can start asking questions immediately.</p>
                </div>
              </li>
            </ol>

            <p className="blog-before-lunch">Most teams go live before lunch.</p>
          </div>
        </section>

        {/* ============================================================
            9. MANIFESTO
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container">
            <div className="blog-manifesto-wrapper">
              <div className="landing-manifesto-text landing-manifesto-with-image">
                <img
                  src="/images/manifesto.png"
                  alt="Paper craft illustration of documents funneling into a single chat bubble"
                  width={280}
                  height={280}
                  className="blog-manifesto-image"
                />
                <h3 className="blog-manifesto-heading">The end of the scroll.</h3>
                <p>
                  We think the next UX shift isn&rsquo;t a new page layout&mdash;it&rsquo;s the end of scroll-first websites.
                </p>

                <p>
                  Most visitors don&rsquo;t read your pages&mdash;they have one question. With EasyAsk, you can feed it everything: pricing edge cases, role-specific explainers, niche use cases. It pulls the right answer on demand.
                </p>

                <p>
                  In 1-2 years, most serious products will have a conversational layer on top of a massive library of answers. EasyAsk is our way of letting you do that today, without rewriting your whole site.
                </p>

                <p className="blog-manifesto-attribution">&mdash; Lance Jones, Founder</p>

              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            10. FAQ
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              Questions you&rsquo;re probably asking.
            </h2>

            <FAQAccordion />
          </div>
        </section>

        {/* ============================================================
            11. FINAL CTA
            ============================================================ */}
        <section className="blog-final-cta">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ marginBottom: '0.3em' }}>
              Ready to turn your website into a conversation?
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--landing-color-text-secondary)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '1.5em' }}>
              By tonight, your site could be answering questions.
            </p>

            <div className="blog-cta-wrapper">
              <EarlyAccessButton className="landing-button-cta landing-button-large landing-button-pulse">
                Get Early Access &rarr;
              </EarlyAccessButton>
              <p className="blog-final-microcopy">The AI assistant that never goes off-script.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

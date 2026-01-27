import { createClient } from '@/lib/supabase/server'
import Script from 'next/script'
import { LandingNav } from '@/components/LandingNav'
import { FAQAccordion } from '@/components/FAQAccordion'
import { EarlyAccessButton } from '@/components/landing'
import '../landing.css'
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

export default async function NewLandingPage(): Promise<JSX.Element> {
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
            <h1>Nobody reads your sales page.<br />Now they don&rsquo;t have to.</h1>
            <p className="blog-subtitle">Visitors ask. Your content answers. Every page, instantly.</p>
            <div className="blog-cta-wrapper">
              <EarlyAccessButton className="landing-button-cta landing-button-large landing-button-pulse">
                Get Early Access &rarr;
              </EarlyAccessButton>
              <p className="blog-hero-microcopy">Your content. Your rules. Zero hallucinations.</p>
            </div>
            <ImagePlaceholder
              dimensions="600 &times; 400"
              caption="Widget screenshot mockup showing a visitor asking a product question and getting an instant answer"
              className="blog-placeholder-600x400"
            />
          </div>
        </section>

        {/* ============================================================
            2. THE PROBLEM
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              Your website is a monologue. Visitors want a conversation.
            </h2>

            <p>
              <span className="blog-lead">You built great content&mdash;case studies, comparison pages, an FAQ with 30 questions.</span> Nobody reads it. Especially on mobile. 60% of your traffic is scrolling on a phone, and they&rsquo;re not going to read your 1,200-word sales page.
            </p>

            <p>
              They have one question. Maybe two. If they can&rsquo;t find the answer in seconds, they bounce. Not because your product isn&rsquo;t right&mdash;because your content didn&rsquo;t meet them where they were.
            </p>

            <p>
              What if every visitor could just <em>ask</em>&mdash;and get an instant, accurate answer? Not a chatbot. Not live chat with a 4-minute wait. Not generic AI that hallucinates.
            </p>

            <div className="blog-pullquote">
              <p>Every silent bounce is a conversation that never happened.</p>
            </div>

            <ImagePlaceholder
              dimensions="720 &times; 200"
              caption="Before/after: a wall of unread text vs. a chat conversation answering the visitor's exact question"
              className="blog-placeholder-720x200"
            />
          </div>
        </section>

        {/* ============================================================
            3. THE SOLUTION (bridge)
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <p>
              <span className="blog-lead">EasyAsk turns your website into a conversation.</span> Feed it your pages, sales decks, pricing sheets. It learns your product in minutes. Then it answers visitors in <em>your</em> words&mdash;never inventing, never hallucinating.
            </p>

            <p>
              Can&rsquo;t answer? It captures their email and flags it for sales. Every question becomes a signal. Every conversation becomes data you can act on.
            </p>

            <p>
              Here&rsquo;s what that looks like in practice.
            </p>
          </div>
        </section>

        {/* ============================================================
            4. FEATURE: Right Context, Every Page
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-feature-heading">
              <span className="blog-feature-number">01</span>
              Right Context, Every Page
            </h2>

            <p>
              <span className="blog-lead">Scrape pages, upload docs, and assign what the AI knows&mdash;per page or across your whole site.</span> Broad or focused, you decide.
            </p>

            <p>
              Give it your entire knowledge base, or just one sales deck. The AI answers from exactly what you allow&mdash;nothing more, nothing less. Your pricing page talks pricing. Your features page demonstrates value. No generic answers.
            </p>

            <ImagePlaceholder
              dimensions="720 &times; 400"
              caption="Content assignment UI: pages on the left, knowledge sources on the right, drag-and-drop to connect them"
              className="blog-placeholder-720x400"
            />
          </div>
        </section>

        {/* ============================================================
            5. FEATURE: One Page. The Whole Story.
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-feature-heading">
              <span className="blog-feature-number">02</span>
              One Page. The Whole Story.
            </h2>

            <p>
              <span className="blog-lead">Visitors ask about products that aren&rsquo;t on the page they&rsquo;re looking at.</span> That&rsquo;s not a problem&mdash;it&rsquo;s purchase intent.
            </p>

            <p>
              EasyAsk answers from everything you give it: your full suite, your pricing, how products complement each other. The page is the starting point. The conversation goes wherever the buyer wants.
            </p>

            <ImagePlaceholder
              dimensions="720 &times; 360"
              caption="Multi-product knowledge graph: one page connects to docs about the full product suite"
              className="blog-placeholder-720x360"
            />
          </div>
        </section>

        {/* ============================================================
            6. FEATURE: One Unanswered Question Kills the Deal
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-feature-heading">
              <span className="blog-feature-number">03</span>
              One Unanswered Question Kills the Deal
            </h2>

            <p>
              <span className="blog-lead">Your visitor is on your pricing page right now, ready to buy&mdash;but they have one question.</span> If they have to search for it, email you, or &ldquo;come back later,&rdquo; they won&rsquo;t.
            </p>

            <p>
              Answer it now.
            </p>

            <div className="blog-scenario">
              <p>
                <strong>The pricing page scenario:</strong> A prospect is comparing your three plans. They want to know if the mid-tier includes SSO. They can&rsquo;t find it on the page. In the old world, they email you, wait 24 hours, and by then they&rsquo;ve signed with a competitor who answered faster.
              </p>
              <p>
                With EasyAsk, they type &ldquo;Does the Business plan include SSO?&rdquo; and get an accurate answer in 2 seconds. Deal alive.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            7. FEATURE: AI That Sells the Way Your Best Rep Does
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-feature-heading">
              <span className="blog-feature-number">04</span>
              AI That Sells the Way Your Best Rep Does
            </h2>

            <p>
              <span className="blog-lead">Tag any page as a sales page, and EasyAsk shifts from support mode to consultative selling.</span> It picks up on buying cues&mdash;questions about pricing, comparisons, implementation&mdash;and responds with answers that address objections while asking questions that qualify intent.
            </p>

            <p>
              It doesn&rsquo;t push. It guides. The same way a great salesperson would: answer, then ask, then advance.
            </p>

            <ImagePlaceholder
              dimensions="720 &times; 300"
              caption="Conversation stage diagram: visitor asks about pricing → AI answers → AI asks qualifying question → visitor reveals intent"
              className="blog-placeholder-720x300"
            />
          </div>
        </section>

        {/* ============================================================
            8. FEATURE: It Knows What It Doesn't Know
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-feature-heading">
              <span className="blog-feature-number">05</span>
              It Knows What It Doesn&rsquo;t Know
            </h2>

            <p>
              <span className="blog-lead">Most chatbots guess when they&rsquo;re stumped. EasyAsk doesn&rsquo;t.</span> When the AI can&rsquo;t answer from your approved content, it tells the visitor honestly&mdash;then captures their email and question before they leave.
            </p>

            <p>
              Your team gets a warm lead with the exact question that needs answering. No hallucination. No lost prospect.
            </p>

            <ImagePlaceholder
              dimensions="720 &times; 300"
              caption="Escalation flow: AI says 'I don't have that answer' → captures email → team gets a lead with the full conversation"
              className="blog-placeholder-720x300"
            />
          </div>
        </section>

        {/* ============================================================
            9. FEATURE: They Don't Just Read It. They Get It.
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-feature-heading">
              <span className="blog-feature-number">06</span>
              They Don&rsquo;t Just Read It. They Get It.
            </h2>

            <p>
              <span className="blog-lead">Built-in tools let visitors translate, simplify, summarize, or define terms&mdash;right inside the chat.</span> Complex product? Technical specs? Long-form content? Your visitors can break it down on their own terms, in their own language.
            </p>

            <p>
              No more bouncing because the page was too dense to digest.
            </p>

            <ImagePlaceholder
              dimensions="720 &times; 300"
              caption="Comprehension toolbar: buttons for Translate, Simplify, Summarize, Define inside the chat interface"
              className="blog-placeholder-720x300"
            />
          </div>
        </section>

        {/* ============================================================
            10. USE CASES
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              Sound familiar?
            </h2>

            <div className="blog-use-case">
              <h3>Your product takes 4 pages to explain. Your prospects have 2 minutes.</h3>
              <p>Chat makes dense info digestible. Page-specific AI delivers relevant answers and shortens sales cycles. Complex features become a conversation, not a reading assignment.</p>
            </div>

            <div className="blog-use-case">
              <h3>Prospects are comparing 2+ options. Small unanswered questions become deal-breakers.</h3>
              <p>Instant answers to &ldquo;Does it integrate with X?&rdquo; or &ldquo;What&rsquo;s included in Enterprise?&rdquo; keep them on your site instead of bouncing to a competitor who answered faster.</p>
            </div>

            <div className="blog-use-case">
              <h3>60% of your traffic is mobile. Nobody reads your 1,200-word page on a phone.</h3>
              <p>Chat eliminates scroll fatigue. Visitors ask instead of hunt. The result: higher mobile conversion from visitors who would have left.</p>
            </div>

            <div className="blog-use-case">
              <h3>Your reps spend 40% of their time on &ldquo;What&rsquo;s the price?&rdquo; questions.</h3>
              <p>AI handles the basics. Your team focuses on conversations that close deals. Scale support without scaling headcount.</p>
            </div>
          </div>
        </section>

        {/* ============================================================
            11. HOW IT WORKS
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container blog-body">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              From zero to live in 4 steps.
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--landing-color-text-secondary)', fontWeight: 600, marginBottom: '1.5em' }}>
              No dev team. No integrations. No waiting.
            </p>

            <ol className="blog-steps">
              <li>
                <div className="blog-step-content">
                  <h3>Scrape</h3>
                  <p>Enter your URLs. EasyAsk reads your pages and learns your content in seconds. Pricing page, features page, product docs&mdash;whatever you point it at.</p>
                </div>
              </li>
              <li>
                <div className="blog-step-content">
                  <h3>Upload</h3>
                  <p>Add anything else the AI should know. Sales decks, case studies, battle cards, pricing sheets, FAQ docs. Drag, drop, done.</p>
                </div>
              </li>
              <li>
                <div className="blog-step-content">
                  <h3>Assign</h3>
                  <p>Choose which content the AI can access on which pages. Pricing page gets pricing docs. Features page gets product specs. You control the context.</p>
                </div>
              </li>
              <li>
                <div className="blog-step-content">
                  <h3>Launch</h3>
                  <p>Paste one embed code. Your chat assistant is live. Visitors can start asking questions immediately.</p>
                </div>
              </li>
            </ol>

            <ImagePlaceholder
              dimensions="720 &times; 200"
              caption="4-step flow diagram: Scrape → Upload → Assign → Launch"
              className="blog-placeholder-720x200"
            />

            <p className="landing-callout landing-callout-purple" style={{ marginTop: '2em' }}>
              Most teams go live before lunch.
            </p>
          </div>
        </section>

        {/* ============================================================
            12. MANIFESTO
            ============================================================ */}
        <section className="blog-section">
          <div className="blog-container">
            <h2 className="blog-section-heading" style={{ textAlign: 'center' }}>
              The end of scrolling.
            </h2>

            <div className="blog-manifesto-wrapper">
              <div className="landing-manifesto-text landing-manifesto-with-image">
                <img
                  src="/images/library-as-voice.png"
                  alt="AI assistant pulling threads of information from a massive library of floating documents"
                  width={140}
                  height={140}
                  className="landing-manifesto-img"
                />
                <p>
                  We think the next UX shift isn&rsquo;t a new page layout&mdash;it&rsquo;s the end of scroll-first websites.
                </p>

                <p>
                  Most visitors don&rsquo;t read your pages&mdash;they hunt for one answer. With EasyAsk, you&rsquo;re no longer limited by what fits above the fold. Feed it the full story&mdash;pricing edge cases, role-specific explainers, niche use cases&mdash;and it pulls the right answer on demand.
                </p>

                <p>
                  In 1-2 years, most serious products will have a conversational layer on top of a massive library of answers. EasyAsk is our way of letting you do that today, without rewriting your whole site.
                </p>

                <p className="landing-manifesto-signature">
                  &mdash; Lance Jones, Founder
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            13. FAQ
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
            14. FINAL CTA
            ============================================================ */}
        <section className="blog-final-cta">
          <div className="blog-container">
            <h2 className="blog-section-heading">
              Ready to turn your website into a conversation?
            </h2>

            <p className="landing-callout landing-callout-purple">
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

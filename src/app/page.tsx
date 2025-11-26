import { createClient } from '@/lib/supabase/server'
import { LandingNav } from '@/components/LandingNav'
import { FAQAccordion } from '@/components/FAQAccordion'
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
                  Don't make them read. Let them ask.
                </h1>
                <h2 className="landing-h2">
                  Answer every question, capture every lead, with AI that knows your product.
                </h2>
                <div className="landing-cta-wrapper">
                  <a href="#" className="landing-button-green landing-button-large">
                    Get Early Access →
                  </a>
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
            <p className="landing-subhead">
              And right now, you're losing them.
            </p>

            <div className="landing-text-block">
              <p>
                Your pricing page has a 73% bounce rate. Your features page gets traffic but no demo requests. Your sales team spends half their day answering "What's the difference between Pro and Enterprise?" over email.
              </p>

              <p>
                Meanwhile, prospects land on your site with real questions—and leave because finding answers takes too long.
              </p>

              <p>
                You built great content. Case studies. Comparison pages. A 2,000-word "How It Works" section. Nobody reads it. Especially not on mobile, where 60% of your traffic comes from.
              </p>

              <p>
                You have zero visibility into what anonymous visitors actually care about. By the time they fill out a form—if they fill out a form—half your competitors have already talked to them.
              </p>

              <p className="landing-closing-line">
                Every silent bounce is a conversation that never happened.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE SHIFT */}
        <section className="landing-section">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading">
              What if your website could answer back?
            </h2>

            <div className="landing-text-block">
              <p>
                Not with a chatbot that makes visitors type paragraphs into a tiny box. Not with live chat that says "Average wait time: 4 minutes." Not with a generic AI that hallucinates answers and damages your brand.
              </p>

              <p>
                What if every visitor could just <em>ask</em>—out loud—and get an instant, accurate answer based on your actual content?
              </p>

              <p>
                Imagine: A prospect lands on your pricing page at 11pm. They have one question about enterprise features. Instead of bouncing to a competitor, they tap a button, ask their question, and get a real answer in 3 seconds. They're satisfied. They're engaged. And you captured their intent before they ever filled out a form.
              </p>

              <p className="landing-closing-line">
                That's not a better chatbot. That's a different category entirely.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: WHAT EASYASK IS */}
        <section className="landing-section landing-section-product">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading">
              Meet EasyAsk
            </h2>
            <p className="landing-subhead">
              The voice sales assistant that turns your website into a buying experience.
            </p>

            <div className="landing-text-block">
              <p>
                EasyAsk is a voice-enabled AI assistant built for B2B websites. It replaces static content with real-time conversation—answering product questions, handling objections, and capturing purchase intent while your prospects are still on the page.
              </p>

              <p>
                Feed it your website pages, sales decks, pricing sheets, and battle cards. It learns your product in minutes. Then it answers visitor questions using <em>your</em> words, grounded in <em>your</em> content—never inventing, never hallucinating.
              </p>

              <p>
                When the AI can't fully answer? It captures the visitor's email and question, then flags the conversation for your sales team. No hot prospect slips through.
              </p>

              <p>
                This isn't a chatbot. It's not customer support. It's not another enterprise tool that takes 6 months to implement.
              </p>

              <p className="landing-category">
                It's a new category: <strong>Voice Sales Assistant.</strong>
              </p>

              <p>
                Built for growth and marketing teams who need to turn website traffic into pipeline—without waiting for engineering, without enterprise complexity, without the "let me get back to you" delays that kill deals.
              </p>
            </div>

            <div className="landing-image-centered">
              <div className="landing-image-wrapper-medium" style={{ margin: '0 auto' }}>
                <div className="image-placeholder image-placeholder-wide">
                  <div className="image-placeholder-text">
                    <strong>assistant_launcher.png</strong>
                    <br />
                    600w x 150h
                    <br /><br />
                    The launcher widget in idle state: "Don't feel like reading? Just ask!" pill showing entry point
                  </div>
                </div>
                <p className="landing-image-caption">
                  Lorem ipsum dolor sit amet consectetur adipiscing elit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: THE 7 DIFFERENTIATORS */}
        <section className="landing-section landing-section-differentiators">
          <div className="landing-container">
            <div className="landing-section-intro">
              <h2 className="landing-section-heading">
                Why EasyAsk works.
              </h2>
              <p className="landing-subhead">
                Seven things we do differently—and why they matter.
              </p>
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
                  <div className="landing-text-block">
                    <p>
                      Your visitors have questions. Typing them into a chat box is a chore—especially on mobile, where thumbs are slow and autocorrect is aggressive.
                    </p>
                    <p>
                      Voice changes everything. Visitors tap a button, ask their question out loud, and get an answer in seconds. They say more than they'd ever type. Richer questions mean better answers. And because there's no friction, they actually engage instead of bouncing.
                    </p>
                    <ul className="landing-sub-diff-list">
                      <li><strong>Interruptible conversation</strong> — Talk to it like a human. Interrupt mid-sentence, redirect, ask follow-ups. No waiting for it to finish.</li>
                      <li><strong>Zero wait time</strong> — Instant answers. No queue. No "an agent will be with you shortly."</li>
                      <li><strong>Mobile-native</strong> — Built for thumbs-free interaction. Because nobody types paragraphs on their phone.</li>
                    </ul>
                  </div>
                </div>
                <div className="landing-differentiator-image">
                  <div className="landing-image-wrapper-small">
                    <div className="image-placeholder image-placeholder-tall">
                      <div className="image-placeholder-text">
                        <strong>assistant_active.png</strong>
                        <br />
                        340w x 500h
                        <br /><br />
                        Widget in "Speaking..." state with audio visualization active and "(Feel free to interrupt)" text visible
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
                <div className="landing-text-block">
                  <p>
                    Generic AI tools make things up. They sound confident while saying something completely wrong about your product. That's not a sales tool—it's a liability.
                  </p>
                  <p>
                    EasyAsk only answers from content you provide. Scrape your website pages in seconds. Upload your sales decks, case studies, pricing sheets, battle cards. The AI learns your product, your messaging, your voice—then uses it to answer questions accurately.
                  </p>
                  <ul className="landing-sub-diff-list">
                    <li><strong>Grounded in your content</strong> — Scrape pages in seconds. Upload any doc. The AI references only what you give it.</li>
                    <li><strong>Always current</strong> — Daily auto-sync keeps the AI up to date. Change your pricing? Update a feature? The AI knows tomorrow.</li>
                  </ul>
                </div>
              </div>
              <div className="landing-differentiator-image">
                <div className="landing-image-wrapper-medium">
                  <div className="image-placeholder image-placeholder-landscape">
                    <div className="image-placeholder-text">
                      <strong>easyask_backend__assistant_knowledgebase.png</strong>
                      <br />
                      600w x 400h
                      <br /><br />
                      Knowledgebase management screen showing "28 in registry," scraped pages, uploaded docs
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
                <div className="landing-text-block">
                  <p>
                    A visitor on your pricing page has different questions than one on your features page. Generic chatbots don't know the difference. EasyAsk does.
                  </p>
                  <p>
                    You control which content the AI can access on each page. Pricing page? It talks pricing, plans, and ROI. Features page? It demonstrates value and explains how things work. Comparison page? It handles objections against competitors.
                  </p>
                  <p>
                    No generic answers. Every response matches where the visitor is in their journey.
                  </p>
                </div>
              </div>
              <div className="landing-differentiator-image">
                <div className="landing-image-wrapper-medium">
                  <div className="image-placeholder image-placeholder-square">
                    <div className="image-placeholder-text">
                      <strong>easyask_backend__assistant_pages.png</strong>
                      <br />
                      600w x 450h
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
                  If AI can't fully answer, it captures the question AND the contact. No hot prospect left behind.
                </p>
                <div className="landing-text-block">
                  <p>
                    Every AI has limits. The question is what happens when it hits one.
                  </p>
                  <p>
                    Most tools just say "I don't know" and let the visitor leave. EasyAsk captures their email and the exact question they asked, then flags the conversation in your sales queue. Your team sees the full context—what they asked, what the AI said, where it fell short.
                  </p>
                  <p>
                    That "I'll think about it" visitor? Now they're a warm lead with a specific question you can answer directly.
                  </p>
                  <ul className="landing-sub-diff-list">
                    <li><strong>Context-rich handoffs</strong> — Your sales team sees the whole conversation, not just "someone wants to talk." They know exactly what to address.</li>
                  </ul>
                </div>
              </div>
              <div className="landing-differentiator-image">
                <div className="landing-image-wrapper-medium">
                  <div className="image-placeholder image-placeholder-landscape">
                    <div className="image-placeholder-text">
                      <strong>easyask_backend__sales_leads.png</strong>
                      <br />
                      600w x 400h
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
                  Know what they care about before they tell you who they are.
                </h3>
                <p className="landing-differentiator-subhead">
                  See what anonymous visitors are asking—before they fill out a form.
                </p>
                <div className="landing-text-block">
                  <p>
                    Right now, you don't know what prospects care about until they book a demo. By then, you've already lost the ones who didn't.
                  </p>
                  <p>
                    EasyAsk captures every conversation. You see what questions visitors ask, which pages trigger the most engagement, where your content has gaps, and how satisfied visitors are with the answers they get.
                  </p>
                  <p>
                    Intent signals from prospects who never would have filled out a form. Market research from real conversations, not surveys.
                  </p>
                  <ul className="landing-sub-diff-list">
                    <li><strong>Content gap discovery</strong> — See exactly where your content fails. Fix it before you lose another lead.</li>
                    <li><strong>Anonymous visitor intent</strong> — Know what they're thinking before they identify themselves. Prioritize follow-ups based on real signals.</li>
                  </ul>
                </div>
              </div>
              <div className="landing-differentiator-image">
                <div className="landing-image-wrapper-medium">
                  <div className="image-placeholder image-placeholder-landscape-wide">
                    <div className="image-placeholder-text">
                      <strong>easyask_backend__reporting.png</strong>
                      <br />
                      650w x 450h
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

            {/* Differentiator 6: Built for Sales */}
            <div className="differentiator-card">
              <div className="landing-differentiator landing-differentiator-text-only">
              <div className="landing-differentiator-content-full">
                <h3 className="landing-differentiator-heading">
                  This isn't customer support. It's revenue generation.
                </h3>
                <p className="landing-differentiator-subhead">
                  EasyAsk is for pre-purchase prospects, not post-purchase tickets.
                </p>
                <div className="landing-text-block">
                  <p>
                    Most website AI tools are designed to deflect support tickets. Reduce costs. Handle complaints. That's not what you need on your marketing pages.
                  </p>
                  <p>
                    EasyAsk is built for the moment before someone buys. It answers product questions, handles objections in real-time, captures purchase intent, and escalates to your sales team—not your support queue.
                  </p>
                  <p>
                    Every conversation is a sales opportunity, not a cost center.
                  </p>
                  <ul className="landing-sub-diff-list">
                    <li><strong>Buyer-led, not seller-led</strong> — Let prospects lead the conversation. No scripts. No funnels. Answer what they actually care about, not what you want to pitch.</li>
                  </ul>
                </div>
              </div>
              </div>
            </div>

            {/* Differentiator 7: Self-Serve Setup */}
            <div className="differentiator-card">
              <div className="landing-differentiator landing-differentiator-text-only">
              <div className="landing-differentiator-content-full">
                <h3 className="landing-differentiator-heading">
                  Live in 10 minutes. Not 10 weeks.
                </h3>
                <p className="landing-differentiator-subhead">
                  No developers. No integrations. No enterprise sales cycle.
                </p>
                <div className="landing-text-block">
                  <p>
                    Enterprise tools like Drift and Qualified take months to implement. You need IT, engineering, procurement, and a six-figure budget.
                  </p>
                  <p>
                    EasyAsk is self-serve. Scrape your site, upload your docs, assign content to pages, paste one embed code. You're live. Update your content anytime—no dev tickets, no waiting.
                  </p>
                  <p>
                    Built for growth and marketing teams who move fast and don't have time for "implementation phases."
                  </p>
                  <ul className="landing-sub-diff-list">
                    <li><strong>No training required</strong> — No intents. No flows. No chatbot builder. Just point it at your content and go.</li>
                    <li><strong>Works on your existing site</strong> — No redesign. No migration. Add it in 5 minutes without touching your codebase.</li>
                  </ul>
                </div>
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

        {/* SECTION 6: WE ARE / WE ARE NOT TABLE */}
        <section className="landing-section landing-section-clarity">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading">
              Let's be clear about what this is.
            </h2>

            <div className="landing-comparison-table">
              <div className="landing-comparison-column landing-comparison-is">
                <h3 className="landing-comparison-header">EasyAsk IS...</h3>
                <ul className="landing-comparison-list">
                  <li>Voice sales assistant for B2B websites</li>
                  <li>Pre-purchase buyer enablement</li>
                  <li>Conversation-first engagement</li>
                  <li>Self-serve, mid-market friendly</li>
                  <li>Grounded in your content only</li>
                  <li>Built to capture and convert leads</li>
                </ul>
              </div>
              <div className="landing-comparison-column landing-comparison-not">
                <h3 className="landing-comparison-header">EasyAsk is NOT...</h3>
                <ul className="landing-comparison-list">
                  <li>A chatbot you have to type into</li>
                  <li>Post-purchase customer support</li>
                  <li>Ticket deflection tool</li>
                  <li>Enterprise-only, 6-month implementation</li>
                  <li>Generic AI that makes things up</li>
                  <li>Built to reduce support costs</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: USE CASE SPOTLIGHTS */}
        <section className="landing-section landing-section-use-cases">
          <div className="landing-container">
            <h2 className="landing-section-heading" style={{ textAlign: 'center' }}>
              EasyAsk is built for...
            </h2>

            <div className="landing-use-case-grid">
              {/* Card 1 */}
              <div className="landing-use-case-card">
                <div className="landing-use-case-icon">
                  <div className="image-placeholder image-placeholder-icon">
                    <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                      Puzzle
                    </div>
                  </div>
                </div>
                <h3 className="landing-use-case-heading">
                  Your product takes 10 pages to explain. Your prospects have 2 minutes.
                </h3>
                <p className="landing-use-case-body">
                  Voice makes complex information digestible. Page-specific AI delivers relevant answers based on where visitors are. Result: shorter sales cycles, fewer "I don't get it" objections.
                </p>
              </div>

              {/* Card 2 */}
              <div className="landing-use-case-card">
                <div className="landing-use-case-icon">
                  <div className="image-placeholder image-placeholder-icon">
                    <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                      Scale
                    </div>
                  </div>
                </div>
                <h3 className="landing-use-case-heading">
                  Prospects are comparing 3-5 options. Small unanswered questions become deal-breakers.
                </h3>
                <p className="landing-use-case-body">
                  Instant answers to "Does it integrate with X?" or "What's included in Enterprise?" keep them on your site instead of your competitor's. Win more deals by being the one who actually answered.
                </p>
              </div>

              {/* Card 3 */}
              <div className="landing-use-case-card">
                <div className="landing-use-case-icon">
                  <div className="image-placeholder image-placeholder-icon">
                    <div className="image-placeholder-text" style={{ fontSize: '0.625rem', padding: '0.5em' }}>
                      Mobile
                    </div>
                  </div>
                </div>
                <h3 className="landing-use-case-heading">
                  60% of your traffic is mobile. Nobody reads your 5,000-word page on a phone.
                </h3>
                <p className="landing-use-case-body">
                  Voice eliminates scroll fatigue. Visitors ask what they care about instead of hunting for it. Higher mobile conversion without rewriting your content.
                </p>
              </div>

              {/* Card 4 */}
              <div className="landing-use-case-card">
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
                <p className="landing-use-case-body">
                  AI handles the basics—pricing, features, comparisons. Your sales team focuses on high-value conversations that actually close deals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: HOW IT WORKS */}
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

            <p className="landing-closing-line" style={{ textAlign: 'center', marginTop: '3em' }}>
              Update anytime. No tickets. No waiting. Change your pricing on Monday, the AI knows by Tuesday.
            </p>
          </div>
        </section>

        {/* SECTION 9: IS THIS FOR YOU? */}
        <section className="landing-section landing-section-qualification">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading" style={{ textAlign: 'center' }}>
              Is EasyAsk right for you?
            </h2>

            <div className="landing-qualification-grid">
              <div className="landing-qualification-column landing-qualification-yes">
                <h3 className="landing-qualification-header">This is for you if...</h3>
                <ul className="landing-qualification-list">
                  <li>You sell a B2B product that takes more than a tagline to explain</li>
                  <li>Your website gets traffic but not enough demo requests</li>
                  <li>You want to capture leads, not deflect support tickets</li>
                  <li>You need something live this week, not this quarter</li>
                  <li>You're tired of prospects bouncing before they understand your value</li>
                  <li>Your sales team wastes time on questions your website should answer</li>
                </ul>
              </div>

              <div className="landing-qualification-column landing-qualification-no">
                <h3 className="landing-qualification-header">This is NOT for you if...</h3>
                <ul className="landing-qualification-list">
                  <li>You need post-purchase customer support — use Intercom or Zendesk</li>
                  <li>You want to build custom AI workflows from scratch — check out Voiceflow or Retell</li>
                  <li>You're looking for a developer platform — Layercode is built for that</li>
                  <li>You won't try anything without deep CRM/MAP integrations on day one</li>
                  <li>Your product is simple enough that nobody has questions</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: FAQ */}
        <section className="landing-section landing-section-faq">
          <div className="landing-container-narrow">
            <h2 className="landing-section-heading" style={{ textAlign: 'center' }}>
              Questions you're probably asking.
            </h2>

            <FAQAccordion />
          </div>
        </section>

        {/* SECTION 11: WHAT HAPPENS NEXT */}
        <section className="landing-section landing-section-next-steps">
          <div className="landing-container-narrow">
            <div className="landing-next-steps-grid">
              <div className="landing-next-steps-content">
                <h2 className="landing-section-heading">
                  Here's what happens next.
                </h2>

                <div className="landing-text-block">
                  <p>
                    No sales calls. No "implementation kickoff." No waiting.
                  </p>

                  <ul className="landing-next-steps-list">
                    <li><strong>Immediate access</strong> — You'll get your EasyAsk dashboard the moment you sign up.</li>
                    <li><strong>Live in 5 minutes</strong> — Scrape your first page, see the assistant working on your actual content. Not a demo. Your product.</li>
                    <li><strong>Quick-start guide</strong> — We'll send a short guide to help you go live fast. Skim it in 2 minutes.</li>
                    <li><strong>Real humans if you need them</strong> — Questions? Just reply to any email. No ticket queue. Actual responses from people who built this.</li>
                  </ul>

                  <p className="landing-closing-line" style={{ marginTop: '2em' }}>
                    You could have your first conversation with a real visitor today.
                  </p>
                </div>
              </div>

              <div className="landing-next-steps-icon">
                <div className="image-placeholder image-placeholder-icon-xlarge">
                  <div className="image-placeholder-text" style={{ fontSize: '0.6875rem', padding: '0.8em' }}>
                    <strong>Icon</strong>
                    <br />
                    120x120
                    <br />
                    Dashboard/Rocket
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 12: FINAL CTA */}
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

            <p className="landing-final-cta-summary">
              EasyAsk is the voice sales assistant that turns browsing into buying—answering prospect questions in real-time and capturing leads before they bounce.
            </p>

            <div className="landing-final-cta-button-wrapper">
              <a href="#" className="landing-button-green landing-button-large">
                Get Early Access →
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

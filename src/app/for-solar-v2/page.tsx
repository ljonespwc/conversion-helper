'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function ForSolarV2Page() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <Image src="/images/main-logo.png" alt="EasyAsk" width={32} height={32} className="h-8 w-auto" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">EasyAsk</span>
              <span className="text-xs text-gray-400 hidden sm:block">Your content. Your closer.</span>
            </div>
          </a>
          <a
            href="#cta-form"
            className="text-xs sm:text-sm font-medium text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md"
          >
            See it on your site
          </a>
        </div>
      </nav>

      {/* ── Hero (dark) ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-6 pt-36 pb-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400 mb-6">
            FOR BC SOLAR INSTALLERS
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.1] tracking-tight">
            They&apos;ve decided to go solar. Now they&apos;re deciding who to trust.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            EasyAsk answers your homeowners&apos; BC-specific questions — rebates, warranties, net metering — from your actual documentation, so the first impression is expertise, not silence.
          </p>
          <a
            href="#cta-form"
            className="mt-10 inline-block text-lg font-semibold text-white px-10 py-4 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto text-center"
          >
            Show me on my site
          </a>
          <p className="mt-4 text-sm text-gray-500">
            Built in Vancouver · No credit card required · Personalized demo in 24 hours
          </p>
          <Image
            src="/images/solar-v2-hero.png"
            alt="Paper craft illustration of a BC home with solar panels at sunset with an EasyAsk chat widget"
            width={1200}
            height={630}
            className="mt-12 w-full max-w-3xl mx-auto rounded-2xl shadow-2xl"
            priority
          />
        </div>
      </section>

      {/* ── The Buying Context ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            They&apos;re not asking if solar makes sense. They&apos;re asking if you do.
          </h2>
          <div className="mt-8 space-y-6 text-lg text-gray-600 leading-relaxed">
            <p>
              By the time a homeowner lands on your website, they&apos;ve done the research. They know solar saves money in BC. They&apos;ve watched the YouTube videos, looked at the CleanBC programs, heard from a neighbor. The decision to go solar is mostly made.
            </p>
            <p>
              What they&apos;re deciding now: which installer to call.
            </p>
            <p>
              That decision comes down to one thing: which company seems like they know what they&apos;re doing. And the fastest signal of expertise isn&apos;t your certifications page or your number of installs. It&apos;s whether your website can answer their actual questions.
            </p>
          </div>
          <div className="my-10 py-6 px-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 text-xl font-semibold text-gray-900 leading-snug">
            The installer who answers &ldquo;how does BC Hydro net metering work for my specific house?&rdquo; at 10 PM wins the Tuesday appointment. The installer whose website offers a contact form wins nothing.
          </div>
        </div>
      </section>

      {/* ── What They're Actually Asking ── */}
      <section className="py-20 lg:py-28 bg-[#FFFBF5]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-4">
            WHAT THEY&apos;RE ASKING
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            These are the questions standing between you and the sale.
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              '"Do I qualify for the Canada Greener Homes Grant, and how does it work alongside CleanBC?"',
              '"How long does permitting take in Victoria? What about Nanaimo or Kelowna?"',
              '"What panel brand do you install, and what\'s the warranty?"',
              '"What happens to my BC Hydro bill — how does net metering actually work?"',
              '"Is my roof suitable, or do I need work done first?"',
              '"How does financing work — what\'s the monthly payment on a $25,000 system?"',
              '"Are you HRAI certified? What credentials should I be checking for?"',
              '"Do you handle the interconnection paperwork, or do I?"',
            ].map((question) => (
              <div
                key={question}
                className="relative p-5 rounded-2xl bg-white shadow-sm border border-gray-100 text-base text-gray-700 leading-relaxed"
              >
                {question}
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg text-gray-600 leading-relaxed max-w-3xl">
            These aren&apos;t general solar questions. They&apos;re BC-specific, installer-specific, deal-deciding questions. The homeowner who gets accurate answers to these buys. The one who doesn&apos;t gets back on Google.
          </p>
        </div>
      </section>

      {/* ── Two Problems (Not One) ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-center">
            Silence loses leads. Wrong answers lose trust.
          </h2>
          <div className="mt-10 space-y-6 text-lg text-gray-600 leading-relaxed">
            <p>
              Most solar installer websites have no way to answer these questions after hours. A contact form. A phone number. A &ldquo;we&apos;ll get back to you.&rdquo; The homeowner researching on a Sunday evening fills out the form, waits, and books a site visit with whoever called first Monday morning.
            </p>
            <p>
              But there&apos;s a worse outcome than silence: a generic AI chatbot that makes things up.
            </p>
            <p>
              Solar is an industry with documented, widespread problems around incentive misrepresentation. The FTC has warned about it. Provincial regulators have flagged it. Homeowners have been burned. When a generic chatbot invents a CleanBC rebate amount or describes a BC Hydro net metering rule that doesn&apos;t apply to their situation, it loses the deal and signals your company can&apos;t be trusted to give straight answers about something this expensive.
            </p>
          </div>
          <div className="my-10 p-6 rounded-2xl bg-rose-50 border border-rose-200 text-xl font-semibold text-rose-900 text-center">
            One confident wrong answer about incentives and they&apos;re gone. You&apos;ll never know why.
          </div>
          <p className="text-lg font-medium text-gray-900">
            The fix is chat that answers from your content, not whatever the AI learned on the internet.
          </p>
        </div>
      </section>

      {/* ── Value Props (dark section) ── */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400 mb-4">
            WHY EASYASK
          </p>
          <div className="mt-12 space-y-12">
            {[
              {
                num: '1',
                title: 'Grounded in your documentation, not the internet',
                body: 'EasyAsk only knows what you give it: your panel specs, your warranties, your BC rebate guide, your net metering explainer. It answers from that. If you didn\'t give it the answer, it can\'t give the wrong one.',
              },
              {
                num: '2',
                title: 'Handles the trust-critical questions accurately',
                body: 'BC Hydro net metering, CleanBC eligibility, Canada Greener Homes Grant, municipal permitting timelines. These are the questions where a confident wrong answer ends the relationship. EasyAsk answers them from your actual materials.',
              },
              {
                num: '3',
                title: 'When it can\'t answer, it captures the lead',
                body: 'No invented answer. No lost prospect. EasyAsk tells the homeowner honestly, then captures their name and their exact question so you can follow up with the right information.',
              },
              {
                num: '4',
                title: 'Live in an afternoon, no developer needed',
                body: 'Upload your content, paste one embed code. Most BC installers have the materials already. Getting EasyAsk live is an afternoon of work, not an integration project.',
              },
            ].map((vp) => (
              <div key={vp.num} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
                  {vp.num}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{vp.title}</h3>
                  <p className="mt-2 text-base text-gray-300 leading-relaxed">{vp.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Your Content Is the Product ── */}
      <section className="py-20 lg:py-28 bg-[#FFFBF5]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-center">
            You&apos;re better documented than you think.
          </h2>
          <p className="mt-6 text-lg text-gray-600 text-center max-w-2xl mx-auto">
            Solar installers are more thoroughly documented than most small businesses. You already have:
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Panel spec sheets from your manufacturer',
              'A BC Hydro net metering guide',
              'A CleanBC and Canada Greener Homes Grant FAQ',
              'Financing terms from your lending partner',
              'Permitting and interconnection documentation',
              'Warranty information for panels and inverters',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm flex-shrink-0">
                  ✓
                </div>
                <span className="text-base text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <Image
            src="/images/solar-v2-content.png"
            alt="Paper craft illustration of business documents flowing into a central knowledge hub"
            width={1200}
            height={630}
            className="mt-12 w-full max-w-2xl mx-auto rounded-xl"
          />
          <p className="mt-8 text-lg text-gray-600 leading-relaxed text-center max-w-2xl mx-auto">
            This content is sitting in your Dropbox, your email drafts, your sales folder. It&apos;s what your best salesperson knows cold. EasyAsk puts it to work on your website, 24/7.
          </p>
          <p className="mt-6 text-xl font-semibold text-gray-900 text-center">
            Your knowledge. Their question. An answer that sounds like you wrote it — because you did.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 text-center mb-4">
            HOW IT WORKS
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: 'Gather your materials',
                body: 'Panel specs, rebate guides, BC Hydro net metering explainer, financing terms, warranty documentation, permitting FAQ. Most installers have these already — it\'s a few hours the first time to pull them together.',
              },
              {
                num: '2',
                title: 'Upload to EasyAsk',
                body: 'It reads your content and builds a knowledge base from your actual documentation. It doesn\'t go looking for anything else. What you give it is what it knows.',
              },
              {
                num: '3',
                title: 'EasyAsk is live on your site',
                body: 'Homeowners get accurate, specific answers from your content — at midnight, on weekends, while you\'re commissioning a system across town. Questions it can\'t answer get routed to you with the homeowner\'s contact info and the exact question they asked.',
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white text-xl font-bold flex items-center justify-center shadow-md">
                  {step.num}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-base text-gray-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 text-center mb-4">
            THE DIFFERENCE
          </p>
          <Image
            src="/images/solar-v2-before-after.png"
            alt="Split comparison: left shows frustrated homeowner with contact form, right shows EasyAsk answering BC Hydro question"
            width={1200}
            height={630}
            className="w-full max-w-3xl mx-auto rounded-2xl mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-gray-200">
              <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold uppercase tracking-wider mb-4">
                WITHOUT EASYASK
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                What happens now when someone asks about BC Hydro net metering at 10 PM:
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                They land on your FAQ page. They scroll. They don&apos;t find it, or they find a paragraph that doesn&apos;t answer their specific situation. They submit a contact form. They get an autoresponder. Monday morning comes. They&apos;ve already booked a site visit with someone else.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-orange-50 border border-orange-200">
              <span className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold uppercase tracking-wider mb-4">
                WITH EASYASK
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                What happens with EasyAsk:
              </h3>
              <p className="text-base text-gray-700 leading-relaxed">
                They type their question into the chat widget. EasyAsk answers from your net metering explainer — accurate, specific, in your language. They book a call. You see the full conversation in your dashboard Monday morning with context on where they are in the decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ / Objections ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center">
            You&apos;re probably thinking&hellip;
          </h2>
          <div className="mt-12 space-y-4">
            {[
              {
                q: 'A chatbot feels impersonal — I built my business on personal service.',
                a: "The homeowner at 10 PM on a Sunday isn't getting personal service from you right now. They're getting nothing. A tool that answers from your own documentation — and tells them honestly when it can't help — is closer to personal than a contact form. The personalized service starts when you call them back Monday with the exact context on what they're trying to figure out.",
              },
              {
                q: 'I had a chatbot once and it gave wrong answers.',
                a: "That's the core problem with generic AI tools — trained on the internet, they'll invent answers when they don't know something. EasyAsk only uses content you provide. If it doesn't have an answer, it says so and captures the homeowner's information instead of guessing. That's a different category of tool.",
              },
              {
                q: 'What if it says something wrong about BC rebates?',
                a: "It can't invent information you didn't give it. If you gave it an accurate BC Hydro net metering document, it answers BC Hydro net metering questions accurately. If you didn't give it a document on something, it says it can't find that information and routes the question to you. The accuracy is a function of your materials, which you control.",
              },
              {
                q: 'My team follows up on all leads — we have a process.',
                a: "Your process probably runs during business hours. EasyAsk handles the questions that come in when your process is offline — evenings, weekends, statutory holidays. It doesn't change how you handle the warm leads it sends you. It creates warm leads your process was never reaching before.",
              },
              {
                q: 'How long does setup actually take?',
                a: "Most BC solar installers have the content already. Uploading it and getting the widget live takes an afternoon. If you share your materials as part of the demo request, we can show you EasyAsk working from your actual documents before you commit to anything.",
              },
              {
                q: 'What does it cost?',
                a: 'EasyAsk for solar starts at $199/month. No setup fee, no annual contract. The personalized demo is free — there\'s nothing to buy until you\'ve seen it working on your actual site.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors rounded-xl font-semibold text-gray-900 text-base sm:text-lg list-none">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-45 transition-transform duration-200 ml-4 flex-shrink-0">
                    +
                  </span>
                </summary>
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Form (dark) ── */}
      <section id="cta-form" className="py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            See what your documentation can do at midnight
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
            Fill in the form below with your name, email, and website URL. If you want to include any of your materials — your rebate guide, your panel specs, your financing FAQ — reply to the confirmation email and we&apos;ll build those into the demo.
          </p>
          <p className="mt-3 text-base text-gray-400 max-w-xl mx-auto">
            We&apos;ll build a personalized version of EasyAsk on your site and send you the link, usually within 24 hours. There&apos;s nothing to buy. You just watch it answer the questions your homeowners actually ask.
          </p>

          {submitted ? (
            <div className="mt-10 max-w-md mx-auto p-8 rounded-2xl bg-gray-800 border border-green-500/30 shadow-md text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-900/50 flex items-center justify-center text-green-400 text-3xl">
                ✓
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">Done.</h3>
              <p className="mt-3 text-base text-gray-300 leading-relaxed">
                We&apos;ll build a demo of EasyAsk on your site and send you the link — usually within 24 hours. If you want to share your rebate guide, panel specs, or financing FAQ, reply to the confirmation email and we&apos;ll build those into the demo so you can see it answering from your actual content.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 max-w-md mx-auto space-y-4">
              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full px-5 py-4 rounded-xl border border-gray-600 bg-gray-800 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
              />
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="w-full px-5 py-4 rounded-xl border border-gray-600 bg-gray-800 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
              />
              <input
                type="url"
                placeholder="yourcompany.com"
                className="w-full px-5 py-4 rounded-xl border border-gray-600 bg-gray-800 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
              />
              <button
                type="submit"
                className="w-full py-4 px-8 rounded-xl text-lg font-bold text-white bg-gradient-to-br from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
              >
                Show me on my site
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Free personalized demo — usually ready in 24 hours
              </p>
              <p className="mt-4 text-sm text-gray-500">
                No credit card · No commitment · Built in Vancouver for BC solar
              </p>
              <p className="mt-2 text-xs text-gray-600">
                Works whether your site has chat now or not.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Secondary CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Not ready to share your URL? See a 2-minute overview first.
          </h3>
          <a
            href="#"
            className="mt-6 inline-block w-full sm:w-auto text-center px-8 py-3 rounded-xl border-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-all"
          >
            Watch the demo
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">EasyAsk · Built in Vancouver</p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="/examples" className="hover:text-gray-600 transition-colors">Examples</Link>
            <Link href="/login" className="hover:text-gray-600 transition-colors">Login</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

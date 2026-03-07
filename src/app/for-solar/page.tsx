'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function ForSolarPage() {
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
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <Image src="/images/main-logo.png" alt="EasyAsk" width={32} height={32} className="h-8 w-auto" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">EasyAsk</span>
              <span className="text-xs text-gray-400 hidden sm:block">Your content. Your closer.</span>
            </div>
          </a>
          {/* Nav CTA */}
          <a
            href="#cta-form"
            className="text-xs sm:text-sm font-medium text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded bg-gradient-to-br from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md"
          >
            See it on your site
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.06)_0%,_transparent_60%)]">
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-gray-900 leading-[1.1] tracking-tight">
              The lead you paid $200 for is asking questions right now. Who&apos;s answering?
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
              EasyAsk puts an AI on your website that knows your panels, your warranties, and BC&apos;s rebate programs — so homeowners get real answers at 11 PM, not a callback on Monday.
            </p>
            <a
              href="#cta-form"
              className="mt-8 inline-block text-lg font-semibold text-white px-8 py-4 rounded bg-gradient-to-br from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto text-center"
            >
              See it on my website
            </a>
            <p className="mt-4 text-sm text-gray-400">
              Takes an afternoon to set up · No credit card required · Built in Vancouver
            </p>
          </div>
          {/* Right: image */}
          <div>
            <Image
              src="/images/solar-hero.png"
              alt="Paper craft illustration of a BC home with solar panels surrounded by mountains and evergreen trees"
              width={600}
              height={450}
              className="w-full max-w-lg mx-auto rounded-2xl mt-8 lg:mt-0"
            />
          </div>
        </div>
      </section>

      {/* ── The Problem (Pain) ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold text-gray-900 text-center">
            Most solar leads go cold before anyone calls back
          </h2>
          <div className="mt-10 space-y-6 text-lg text-gray-600 leading-relaxed">
            <p>
              Solar leads cost real money — Google Ads, CleanBC referrals, word-of-mouth campaigns. When a homeowner finally lands on your site at 9 PM with questions about your financing terms or BC Hydro net metering, what happens?
            </p>
            <p>
              They scroll around, don&apos;t find what they need, and leave. Or they fill out your contact form and you see it Thursday morning. By then they&apos;ve already toured two other installers.
            </p>

            {/* Pull-quote callout (design review 3.1) */}
            <div className="my-8 py-4 border-l-4 border-orange-400 pl-6 text-xl font-semibold text-gray-900 bg-orange-50/50 rounded-r-lg">
              It&apos;s a timing problem.
            </div>

            <p>
              This isn&apos;t a follow-up discipline problem. It&apos;s a timing problem. You&apos;re on a job site. Your phone&apos;s in your pocket. The lead submitted at 10:47 PM on a Sunday isn&apos;t waiting until Monday.
            </p>
            <p>
              The hard part: most of those leads never get contacted at all. Not because solar installers don&apos;t care — because the website has no way to hold the conversation until someone can.
            </p>
          </div>
          <Image
            src="/images/solar-pain.png"
            alt="Paper craft illustration of missed calls and leads walking away from a clock"
            width={800}
            height={450}
            className="mt-12 w-full max-w-2xl mx-auto rounded-xl"
          />
        </div>
      </section>

      {/* ── The Incentive/Rebate Trap ── */}
      <section className="py-20 lg:py-28 bg-[rgba(249,115,22,0.04)]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold text-gray-900 text-center">
            Homeowners ask about BC rebates constantly. Generic chatbots make it worse.
          </h2>
          <div className="mt-10 space-y-6 text-lg text-gray-600 leading-relaxed">
            <p>
              CleanBC, BC Hydro net metering, the Canada Greener Homes Grant — homeowners ask about these on every discovery call. They understand them poorly, they confuse them with each other, and they&apos;ve often read something wrong online.
            </p>
            <p>
              A generic AI chatbot will answer confidently and incorrectly. It&apos;ll invent a rebate amount, describe an eligibility rule that doesn&apos;t apply, or explain net metering in a way that contradicts BC Hydro&apos;s actual program.
            </p>

            {/* Pull-quote callout (design review 3.1) */}
            <div className="my-8 py-4 border-l-4 border-rose-400 pl-6 text-xl font-semibold text-gray-900 bg-rose-50/50 rounded-r-lg">
              A chatbot making things up on your website is a liability you don&apos;t want.
            </div>

            <p>
              That&apos;s not just bad customer service. In solar, where FTC regulators and provincial bodies have documented widespread misrepresentation of incentives, a chatbot making things up on your website is a liability you don&apos;t want.
            </p>
            <p>
              EasyAsk answers only from content you give it. Point it at your rebate guide, your BC Hydro net metering explainer, your financing FAQ. It answers from that — nothing else. When a question falls outside your content, it says so and captures the homeowner&apos;s contact information and exact question so you can follow up with the accurate answer.
            </p>
          </div>
          <Image
            src="/images/solar-trust.png"
            alt="Paper craft illustration of documents flowing into a trusted chat bubble with a shield"
            width={800}
            height={450}
            className="mt-12 w-full max-w-2xl mx-auto rounded-xl"
          />
          <p className="mt-8 text-center text-xl font-semibold text-gray-900">
            Your answer. Not something it invented.
          </p>
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 text-center">
            WHY EASYASK
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: '📄',
                title: 'Answers from your content, not the internet',
                body: 'You control what EasyAsk knows: your panel specs, your warranties, your BC-specific rebate materials. It can\u2019t answer questions your documents don\u2019t cover — which means it can\u2019t invent wrong ones.',
              },
              {
                icon: '🌙',
                title: 'Catches the leads your phone can\u2019t',
                body: 'Homeowners researching solar at night and on weekends get real answers instead of a form. Questions it can\u2019t handle get routed to you with the homeowner\u2019s contact info and the exact question they asked.',
              },
              {
                icon: '⚡',
                title: 'Deployed in an afternoon, not a quarter',
                body: 'Upload your content, paste one embed code, done. No developer, no integration project, no enterprise contract.',
              },
              {
                icon: '🏠',
                title: 'Built for the questions solar leads actually ask',
                body: 'Roof compatibility, permitting timelines in your municipality, panel brand and warranty, net metering and CleanBC eligibility, financing terms. Feed it the right materials and it handles the first conversation. The BC solar companies that get this right first stop losing deals they never knew they were losing.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="p-8 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center text-2xl">
                  {card.icon}
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{card.title}</h3>
                <p className="mt-3 text-base text-gray-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Widget Mockup (addresses design review 4.2) ── */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Image
            src="/images/solar-widget-mockup.png"
            alt="Paper craft illustration of a laptop showing a solar installer website with an EasyAsk chat widget"
            width={960}
            height={540}
            className="w-full max-w-3xl mx-auto rounded-2xl shadow-lg"
          />
          <p className="mt-6 text-base lg:text-lg text-gray-500 italic">
            EasyAsk lives on your website — answering homeowner questions from your content, 24/7.
          </p>
        </div>
      </section>

      {/* ── What It Can Answer ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold text-gray-900 text-center">
            The questions currently going to your voicemail
          </h2>
          <div className="mt-12 space-y-4">
            {[
              '"Do I qualify for the BC Hydro net metering program?"',
              '"What panel brand do you install, and what\u2019s the warranty?"',
              '"How does financing work — what\u2019s the monthly payment on a $25,000 system?"',
              '"How long does permitting take in [Victoria / Nanaimo / Kelowna]?"',
              '"Can my roof handle solar, or do I need work done first?"',
              '"What\u2019s the difference between the CleanBC rebate and the Canada Greener Homes Grant?"',
              '"Do you handle the permit and interconnection paperwork?"',
              '"Are you certified — what credentials should I be looking for?"',
            ].map((question) => (
              <div
                key={question}
                className="flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-white border border-gray-100 shadow-sm border-l-4 border-l-orange-400 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-sm font-bold">
                  Q
                </div>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">{question}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-lg text-gray-600">
            These are the questions in your email inbox and your voicemail. EasyAsk answers them at midnight.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 lg:py-28 bg-[rgba(249,115,22,0.04)]">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 text-center">
            HOW IT WORKS
          </p>
          <div className="mt-12 space-y-12 relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-orange-300 to-rose-300 hidden md:block" />

            {[
              {
                num: '1',
                title: 'Upload your materials',
                body: 'Panel spec sheets, financing options, your BC rebate and net metering explainer, warranty terms, permit FAQ, whatever you give prospects. Takes a few hours the first time.',
              },
              {
                num: '2',
                title: 'EasyAsk reads and answers',
                body: 'EasyAsk reads homeowner questions and answers from your actual documents. If a homeowner asks something your content doesn\u2019t cover, it says so honestly and captures their name and question.',
              },
              {
                num: '3',
                title: 'You get a routed lead',
                body: 'You get a routed lead with the exact question they asked — not a cold form fill, but a warm contact with context on where they are in the decision.',
              },
            ].map((step) => (
              <div key={step.num} className="relative flex items-start gap-4 md:gap-6">
                <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-md relative z-10">
                  {step.num}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-gray-600 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Authority / Credibility ── */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold text-gray-900">
            Built in Vancouver, for BC solar companies
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            EasyAsk is built in Vancouver — not a US product with a CleanBC paragraph bolted on. BC Hydro net metering, the Canada Greener Homes Grant, and the municipal permitting differences between Victoria and Kelowna are built into how we think about the product, not afterthoughts.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-50 border border-orange-200 text-sm font-medium text-orange-700">
            Built in Vancouver · BC-specific from day one
          </div>
        </div>
      </section>

      {/* ── FAQ / Objections ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold text-gray-900 text-center">
            Questions you&apos;re probably asking
          </h2>
          <div className="mt-12 space-y-4">
            {[
              {
                q: "I don't have a chatbot on my site right now.",
                a: "That's actually fine — you're starting fresh with something that works, instead of replacing something that doesn't. No existing setup to migrate.",
              },
              {
                q: "I had a chatbot before and it gave wrong answers.",
                a: "That's the hallucination problem. Generic AI tools are trained on the internet and will invent answers when they don't know something. EasyAsk only uses content you provide. If it doesn't have an answer, it tells the homeowner and captures their contact info instead of guessing.",
              },
              {
                q: "My team handles inquiries — we have a process.",
                a: "EasyAsk handles the 11 PM questions so your team handles the ones that need a human. If you're available 9–5, that's 16 hours a day when leads don't have anyone to talk to. EasyAsk fills the gap, and routes the ones it can't handle directly to you.",
              },
              {
                q: "What if it says something wrong about BC rebates and gets us in trouble?",
                a: "EasyAsk only answers from documents you give it — it can't invent information it wasn't given. The more accurate your rebate guide, the more accurate the answers. And when it can't find an answer in your content, it says so rather than making something up.",
              },
              {
                q: "How long does setup actually take?",
                a: "Most installers have the content already — panel spec sheets, a rebate FAQ, financing terms. Uploading it and getting the widget live takes an afternoon. You're not building anything from scratch.",
              },
              {
                q: "What does it cost?",
                a: "EasyAsk for solar starts at $199/month. No setup fee, no annual contract. The personalized demo is free — there's nothing to buy until you've seen it working on your actual site.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors font-semibold text-gray-900 text-base sm:text-lg list-none">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200 ml-4 flex-shrink-0">
                    ▾
                  </span>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Form (Primary) ── */}
      <section id="cta-form" className="py-20 lg:py-28 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold text-gray-900">
            See what EasyAsk looks like on your actual website
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            Fill out the form below with your name, email, and website URL. We&apos;ll build a personalized demo showing EasyAsk working on your homepage — answering the kinds of questions your homeowners actually ask.
          </p>
          <p className="mt-4 text-sm font-medium text-rose-600">
            Every night your site goes quiet is another lead researching your competitor. The form takes 60 seconds.
          </p>

          {submitted ? (
            <div className="mt-10 max-w-md mx-auto p-8 rounded-2xl bg-white border border-green-200 shadow-md text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl">
                ✓
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">You&apos;re on the list.</h3>
              <p className="mt-3 text-base text-gray-600 leading-relaxed">
                We&apos;ll build a demo of EasyAsk on your site and send you the link — usually within 24 hours. If you want to send over any content in the meantime (rebate guides, financing FAQ, panel specs), reply to the confirmation email and we&apos;ll build it in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 max-w-md mx-auto space-y-4">
              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
              />
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
              />
              <input
                type="url"
                placeholder="yourcompany.com or leave blank if you don't have one"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
              />
              <button
                type="submit"
                className="w-full py-4 px-8 rounded-xl text-lg font-bold text-white bg-gradient-to-br from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
              >
                Show me on my site
              </button>
              <p className="mt-2 text-xs text-gray-400">
                We&apos;ll build a free personalized demo — usually ready in under 24 hours
              </p>
              <p className="mt-4 text-sm text-gray-400">
                No credit card · No commitment · Free for BC solar installers to see
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Works whether you have chat on your site now or not.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Secondary CTA ── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Not ready to see it on your site? Watch a 2-minute demo instead.
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

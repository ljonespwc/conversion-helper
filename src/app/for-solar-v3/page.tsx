'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ForSolarV3Page() {
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  function toggleFaq(index: number) {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "I already have a contact form — homeowners can reach out whenever they want.",
      answer:
        "A contact form captures intent. EasyAsk captures a conversation. The homeowner who fills out a form at 10 PM gets a callback on Monday. The one who types their question and gets an accurate answer in 30 seconds stays warm — and you see the full conversation context when you call them back.",
    },
    {
      question: "I had a chatbot before and it gave wrong answers.",
      answer:
        "Generic AI tools are trained on the internet and will invent answers when they don't know something. EasyAsk only uses content you provide. If it doesn't have an answer, it says so and routes the question to you instead of guessing. That's a different kind of tool.",
    },
    {
      question: "I'm not sure I have time to set it up.",
      answer:
        "If you have panel spec sheets, a rebate guide, and a financing FAQ already, you have the content. Uploading it and getting the widget live takes an afternoon. Include your URL in the demo request and we'll show you EasyAsk working from your actual materials before you commit to anything.",
    },
    {
      question: "What if it gives wrong information about BC rebates?",
      answer:
        "It can't invent information you didn't give it. Feed it an accurate BC Hydro net metering document and it answers those questions accurately. Feed it nothing on a topic and it won't answer. The accuracy is a direct function of your materials, which you control.",
    },
    {
      question: "My team follows up on all leads — we have a process.",
      answer:
        "Your process runs during business hours. EasyAsk handles the conversations that happen when your process is offline — evenings, weekends, statutory holidays. It doesn't change how you handle the warm leads it sends you. It creates warm leads your process was never reaching before.",
    },
    {
      question: "What does it cost?",
      answer:
        "$199/month for BC solar installers. No setup fee, no annual contract. The personalized demo is free — there's nothing to buy until you've seen it working on your actual site.",
    },
  ]

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#FFF8F0' }}>

      {/* ── Navigation ── */}
      <nav
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-orange-100"
        style={{ backgroundColor: 'rgba(255, 248, 240, 0.9)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <Image src="/images/main-logo.png" alt="EasyAsk" width={32} height={32} className="h-8 w-auto" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">EasyAsk</span>
              <span className="text-xs text-stone-400 hidden sm:block">Your content. Your closer.</span>
            </div>
          </a>
          <a
            href="#cta-form"
            className="text-xs sm:text-sm font-medium text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
            style={{
              background: 'linear-gradient(to bottom right, #F97316, #F59E0B)',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.background =
                'linear-gradient(to bottom right, #EA580C, #D97706)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.background =
                'linear-gradient(to bottom right, #F97316, #F59E0B)'
            }}
          >
            See it on your site
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="max-w-5xl mx-auto px-6 pt-32 pb-16 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-600 mb-6">
            FOR BC SOLAR INSTALLERS
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.08] tracking-tight max-w-4xl mx-auto">
            That BC homeowner researching solar tonight? Your website can&apos;t answer her.
          </h1>
          <p className="mt-6 text-lg text-stone-500 leading-relaxed max-w-2xl mx-auto">
            Homeowners don&apos;t stop researching at 5 PM. When they land on your site with questions about BC Hydro
            net metering, CleanBC rebates, or your financing terms — and find nothing but a contact form — they go back
            to Google. EasyAsk answers from your own content, at midnight, and routes the warm lead to you with the full
            conversation.
          </p>
          <a
            href="#cta-form"
            className="mt-8 inline-block text-lg font-semibold text-white px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(to bottom right, #F97316, #F59E0B)' }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.background =
                'linear-gradient(to bottom right, #EA580C, #D97706)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.background =
                'linear-gradient(to bottom right, #F97316, #F59E0B)'
            }}
          >
            Show me on my site
          </a>
          <p className="mt-4 text-sm text-stone-400">
            No credit card required · Personalized demo in 24 hours · Built in Vancouver
          </p>
          <Image
            src="/images/solar-v3-hero-evening-home.png"
            alt="Paper craft illustration of a BC home at dusk with solar panels and warm evening light"
            width={1200}
            height={630}
            className="mt-12 w-full max-w-3xl mx-auto rounded-2xl shadow-lg"
            priority
          />
        </div>
      </section>

      {/* ── Tuesday Evening Scene ── */}
      <section className="py-20 lg:py-28 scroll-mt-20" style={{ backgroundColor: '#FEF3E2' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-600 mb-4">
            THE LEAD YOU PAID FOR
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
            Here&apos;s what your $200 lead is doing right now.
          </h2>

          <div className="mt-8 space-y-5 text-lg text-stone-600 leading-[1.8]">
            <p>
              Tuesday, 9:17 PM. A homeowner in Victoria got your name last week — from a Google ad, a CleanBC referral,
              a neighbor who got solar done. Tonight she has time to look you up.
            </p>
            <p>
              She pulls up your website. She&apos;s not ready to call. She wants to know: Does BC Hydro net metering
              actually work for a house her size? What panel brand do you install? Is the Canada Greener Homes Grant
              still running for 2025?
            </p>
            <p>She scrolls your about page. Your project gallery. Your FAQ. None of it answers her specific questions.</p>
            <p>She fills out your contact form. Or she doesn&apos;t — and she just goes back to Google.</p>
            <div className="text-xl font-semibold text-stone-900 py-4 border-l-4 border-amber-400 pl-6 bg-amber-50 rounded-r-lg my-8">
              You won&apos;t know she was there until Monday morning. By then she&apos;s already booked a site visit
              with an installer who got back to her over the weekend.
            </div>
          </div>

          <Image
            src="/images/solar-v3-tuesday-scene.png"
            alt="Paper craft illustration of a homeowner researching solar on a laptop in the evening"
            width={1200}
            height={630}
            className="mt-10 w-full rounded-xl shadow-md"
          />
        </div>
      </section>

      {/* ── Run the Numbers ── */}
      <section className="py-20 lg:py-28 scroll-mt-20" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-600 mb-4 text-center">
            RUN THE NUMBERS
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 text-center">Run the numbers.</h2>

          {/* Number callout row */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
              <div className="text-5xl sm:text-6xl font-extrabold text-orange-600">$200+</div>
              <div className="mt-2 text-sm text-stone-500">Average cost per solar lead</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
              <div className="text-5xl sm:text-6xl font-extrabold text-stone-900">$25K</div>
              <div className="mt-2 text-sm text-stone-500">Average residential install</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
              <div className="text-5xl sm:text-6xl font-extrabold" style={{ color: '#0F766E' }}>
                ~10x
              </div>
              <div className="mt-2 text-sm text-stone-500">Annual ROI from one extra deal</div>
            </div>
          </div>

          <div className="mt-10 max-w-3xl mx-auto space-y-5 text-lg text-stone-600 leading-[1.8]">
            <p>
              Solar leads in BC average around $200 each — Google Ads, CleanBC referrals, word-of-mouth campaigns. A
              residential install runs $20,000–$30,000. At a typical close rate, you need multiple qualified leads to
              close one deal.
            </p>
            <p>Which means you can&apos;t afford to lose leads to an unanswered website visit.</p>
            <p>
              But that&apos;s exactly what&apos;s happening. Not to every lead — just the ones who arrive evenings and
              weekends, when nobody&apos;s online. The ones who had a question your FAQ didn&apos;t answer and
              didn&apos;t bother with the contact form. The ones you&apos;ll never see.
            </p>
            <p>
              If EasyAsk captures two of those leads a month — two homeowners who would have left, who instead got an
              accurate answer and booked a call — that&apos;s one extra deal every few months. At $20,000 a close,
              that&apos;s not a question of whether the tool pays for itself. The math is not close.
            </p>
          </div>

          <Image
            src="/images/solar-v3-roi-math.png"
            alt="Paper craft illustration showing small monthly cost leading to large deal value"
            width={1200}
            height={630}
            className="mt-10 w-full max-w-lg mx-auto rounded-xl"
          />

          <p className="mt-8 text-2xl font-bold text-stone-900 text-center">The math is not close.</p>
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="py-20 lg:py-28 bg-white scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: "📋",
                title: "Answers BC-specific questions from your own documentation",
                body: "CleanBC eligibility, BC Hydro net metering rules, Canada Greener Homes Grant, municipal permitting timelines. EasyAsk answers from the materials you upload — it can't invent information you didn't give it.",
              },
              {
                icon: "🕙",
                title: "Captures the leads your contact form misses",
                body: "When a homeowner has a question at 10 PM and there's no one to answer, they leave. EasyAsk answers, keeps the conversation going, and routes the lead to you with the exact question they asked.",
              },
              {
                icon: "⚡",
                title: "Deployed in an afternoon, no engineering required",
                body: "Upload your panel specs, warranty docs, rebate guide, and financing FAQ. Paste one embed code. The first time takes a few hours. After that, it runs.",
              },
              {
                icon: "💰",
                title: "A revenue channel, not a tool expense",
                body: "At $200 per lead and $20K+ per close, one recovered deal pays for years of EasyAsk. This belongs in the same category as your lead generation spend, not your software budget.",
              },
            ].map((prop, i) => (
              <div key={i} className="rounded-2xl p-6 sm:p-8 border border-orange-50" style={{ backgroundColor: '#FFF8F0' }}>
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-4 text-lg">
                  {prop.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{prop.title}</h3>
                <p className="text-base text-stone-600 leading-relaxed">{prop.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Questions Going Unanswered ── */}
      <section className="py-20 lg:py-28 scroll-mt-20" style={{ backgroundColor: '#FEF3E2' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-600 mb-4">WHAT THEY'RE ASKING</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
            These are what your Tuesday evening homeowner wants to know.
          </h2>

          <div className="mt-10 space-y-4">
            {[
              '"Do I qualify for the Canada Greener Homes Grant, and does it stack with CleanBC?"',
              '"How does BC Hydro net metering actually work for a house my size?"',
              '"What panel brand do you install, and what\'s the manufacturer warranty?"',
              '"How long does permitting take in Victoria? What about Nanaimo or Kelowna?"',
              '"Is my roof suitable, or do I need structural work first?"',
              '"How does financing work — what\'s the monthly payment on a $25,000 system?"',
              '"Do you handle the interconnection paperwork with BC Hydro?"',
              '"What credentials should I look for in a BC installer?"',
            ].map((question, i) => (
              <div key={i} className="bg-white rounded-xl p-4 sm:p-5 border border-orange-100 shadow-sm">
                <p className="text-base text-stone-700 leading-relaxed italic">{question}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-lg font-semibold text-stone-900">
            These are deal-deciding questions. The homeowner who gets accurate answers buys. The one who doesn&apos;t
            keeps shopping.
          </p>
        </div>
      </section>

      {/* ── Generic Chatbots Warning ── */}
      <section className="py-20 lg:py-28 scroll-mt-20" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
            A chatbot that makes things up is worse than no chatbot.
          </h2>
          <div className="mt-8 space-y-5 text-lg text-stone-600 leading-[1.8]">
            <p>
              Solar has a documented misrepresentation problem. Provincial bodies and consumer protection agencies across
              Canada have flagged it. The most common issue: overstating rebate amounts, misrepresenting BC Hydro net
              metering rules, describing incentives that don&apos;t apply to a specific homeowner&apos;s situation.
            </p>
            <p>
              A generic AI chatbot on your site faces the same risk from the inside. It&apos;ll confidently answer
              &quot;how much is the CleanBC rebate?&quot; with a number it learned from the internet — which may have
              changed, may not apply to your service area, or may be wrong for the product you install.
            </p>
            <p>
              EasyAsk only answers from content you upload. If you gave it your accurate BC Hydro net metering
              explainer, it answers those questions from that document. If you didn&apos;t give it anything on a topic,
              it says so honestly and captures the homeowner&apos;s question for your follow-up.
            </p>
          </div>
          <div
            className="mt-8 py-4 border-l-4 pl-6 text-xl font-bold rounded-r-lg"
            style={{ borderColor: '#14B8A6', color: '#115E59', backgroundColor: 'rgba(20,184,166,0.05)' }}
          >
            Your accuracy. Not the internet&apos;s.
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 lg:py-28 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-600 mb-4 text-center">
            HOW IT WORKS
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 text-center">
            Live by this afternoon.
          </h2>

          <div className="mt-14 relative">
            {[
              {
                num: 1,
                title: "Gather your materials",
                body: 'Panel spec sheets, your rebate and incentive explainer, BC Hydro net metering documentation, financing terms, warranty information, permitting FAQ. Most BC solar installers already have these — it takes a few hours to pull them together the first time.',
              },
              {
                num: 2,
                title: "Upload to EasyAsk",
                body: "It reads your documents and builds a knowledge base from your actual content. It doesn't search the internet. What you give it is what it knows.",
              },
              {
                num: 3,
                title: "Go live",
                body: "EasyAsk is live on your site — answering homeowners at midnight, on weekends, while you're commissioning a system across town. Questions it can't answer from your materials get routed to you with the homeowner's contact info and the exact question they asked.",
              },
            ].map((step, i, arr) => (
              <div
                key={i}
                className="relative pl-12 sm:pl-16 pb-10 sm:pb-12"
                style={{
                  borderLeft: i < arr.length - 1 ? '2px solid #FED7AA' : 'none',
                  marginLeft: '20px',
                }}
              >
                <div
                  className="absolute left-0 -translate-x-1/2 w-8 sm:w-10 h-8 sm:h-10 rounded-full text-white font-bold text-base sm:text-lg flex items-center justify-center"
                  style={{ backgroundColor: '#F97316', top: 0 }}
                >
                  {step.num}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-base text-stone-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business Case ── */}
      <section
        className="py-20 lg:py-28 scroll-mt-20"
        style={{ background: 'linear-gradient(to bottom, #FEF3E2, #FFF8F0)' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-600 mb-4">THE MATH</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900">One deal. That&apos;s the math.</h2>

          <div className="mt-8 text-lg text-stone-600 leading-[1.8] text-left max-w-2xl mx-auto space-y-5">
            <p>
              EasyAsk for BC solar starts at $199/month. One residential solar install in BC averages $20,000–$30,000.
              If EasyAsk captures one lead per month that would have gone cold — one homeowner who had a question at 10
              PM, got a real answer, and booked a site visit instead of going back to Google — that&apos;s one extra
              deal per quarter. At $20,000, that&apos;s roughly a 10x return on the annual subscription in a single
              close.
            </p>
            <p>
              You won&apos;t capture every lead that would have gone cold. You&apos;ll capture some of them. Those are
              real dollars, from homeowners who were already on your site, who already cost you $200 to get there.
            </p>
          </div>

          {/* Highlight box */}
          <div className="mt-10 bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-orange-100 max-w-md mx-auto">
            <div className="text-sm text-stone-500 uppercase tracking-wider">EasyAsk for BC Solar</div>
            <div className="text-4xl font-extrabold text-orange-600 mt-2">$199/mo</div>
            <div className="text-sm text-stone-500 mt-2">One $20K deal = ~10x annual return</div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 lg:py-28 scroll-mt-20" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 text-center mb-12">
            Fair questions.
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-orange-100 overflow-hidden">
                <button
                  className="w-full text-left px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between cursor-pointer hover:bg-orange-50 transition-colors"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="text-base font-semibold text-stone-900 pr-4">{faq.question}</span>
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-orange-500 transition-transform duration-200"
                    style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-base text-stone-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Primary CTA Form ── */}
      <section
        id="cta-form"
        className="py-20 lg:py-28 scroll-mt-20"
        style={{ background: 'linear-gradient(to bottom, #FFF7ED, #FFF8F0)' }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">
            See the math work on your website
          </h2>
          <p className="mt-4 text-lg text-stone-500 leading-relaxed">
            Fill in the form with your name, email, and website URL. We&apos;ll build a personalized demo of EasyAsk on
            your site — answering the BC-specific questions your homeowners actually ask — and send you the link within
            24 hours.
          </p>
          <p className="mt-3 text-base text-stone-400">
            If you want to include your materials in the demo — your rebate guide, panel specs, financing FAQ — reply to
            the confirmation email and we&apos;ll build those in. The demo shows EasyAsk working from your content, not
            a generic template.
          </p>
          <p className="mt-4 text-sm font-semibold text-stone-600">Nothing to buy until you&apos;ve seen it.</p>

          {submitted ? (
            <div className="mt-8 bg-teal-50 rounded-xl p-6 text-teal-800 text-base leading-relaxed border border-teal-200 text-left">
              Done. We&apos;ll build a demo of EasyAsk on your site and send you the link — usually within 24 hours. If
              you want to share your BC rebate guide, panel specs, or financing FAQ, reply to this email and we&apos;ll
              build those into the demo so you can see it answering from your actual content.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-md mx-auto">
              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
              <input
                type="url"
                required
                placeholder="yourcompany.com"
                className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="w-full py-4 text-lg font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                style={{ background: 'linear-gradient(to bottom right, #F97316, #F59E0B)' }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background =
                    'linear-gradient(to bottom right, #EA580C, #D97706)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background =
                    'linear-gradient(to bottom right, #F97316, #F59E0B)'
                }}
              >
                Show me on my site
              </button>
              <p className="mt-2 text-sm text-stone-400">Free personalized demo · Usually ready in 24 hours</p>
            </form>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
            <span className="text-xs text-stone-400">No credit card</span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-400">No commitment</span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-400">Built in Vancouver for BC solar</span>
          </div>
          <p className="mt-4 text-xs text-stone-400 italic">Works whether your site has chat now or not.</p>
        </div>
      </section>

      {/* ── Secondary CTA ── */}
      <section className="py-14" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lg text-stone-500">Not ready to share your URL? Watch a 2-minute overview first.</p>
          <a
            href="#"
            className="mt-4 inline-block text-base font-semibold text-orange-600 px-6 py-3 rounded-xl border-2 border-orange-300 hover:bg-orange-50 transition-colors"
          >
            Watch the demo
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 bg-stone-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/main-logo.png"
                alt="EasyAsk"
                width={24}
                height={24}
                className="h-6 w-auto brightness-200"
              />
              <span className="text-sm text-stone-400">EasyAsk · Built in Vancouver</span>
            </div>
            <span className="text-xs text-stone-500">Built in Vancouver · BC-specific from day one</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

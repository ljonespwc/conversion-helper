'use client'

import { useState, useEffect } from 'react'

const standoutConversations = [
  {
    title: 'The 17-Question Marathon',
    subtitle: 'Egypt buyer — discovering → ready to buy',
    tags: ['17 questions', 'Egypt', 'Full sales arc'],
    messages: [
      { role: 'user' as const, text: 'How long does the PN Level 1 take?' },
      { role: 'ai' as const, text: 'The PN Level 1 Certification can be completed in about 20 weeks, investing 3–5 hours per week. You can go at your own pace.' },
      { role: 'ellipsis' as const, text: '3 questions about course content & structure' },
      { role: 'user' as const, text: 'Is it enough to start a nutrition career?' },
      { role: 'ai' as const, text: 'Yes — the certification teaches you a proven coaching system. Graduates work in private practice, clinics, gyms, and corporate wellness. You\'ll also be listed on the PN directory and guaranteed job interviews with leading organizations.' },
      { role: 'user' as const, text: 'How to know this is the correct website to pay?' },
      { role: 'ai' as const, text: 'Great question. You\'re on the official Precision Nutrition website. When you\'re ready, look for the "Enroll now" button on this page — it will take you to a secure checkout.' },
      { role: 'ellipsis' as const, text: '2 questions verifying the purchase URL' },
      { role: 'user' as const, text: 'When I pay, what will happen next?' },
      { role: 'ai' as const, text: 'Once you enroll, you\'ll get immediate access to your student dashboard and online course materials. Your textbooks will be shipped separately with tracking details.' },
      { role: 'user' as const, text: 'The textbooks can be delivered to Egypt?' },
      { role: 'ai' as const, text: 'Yes — Precision Nutrition ships textbooks internationally, including to Egypt. Shipping is included in the price at no extra charge.' },
      { role: 'ellipsis' as const, text: '4 more questions about shipping & tracking' },
    ],
  },
  {
    title: 'The Philippines Enrollment',
    subtitle: '10 questions — discovering → ready to buy',
    tags: ['10 questions', 'Philippines', 'ready_to_buy'],
    messages: [
      { role: 'user' as const, text: 'How many levels are there for the nutrition coaching program?' },
      { role: 'ai' as const, text: 'Precision Nutrition offers Level 1, Level 2, and Level 3 certifications — each building on the previous. Level 1 is where most people start.' },
      { role: 'user' as const, text: 'For basic health balance and chronic problems, will Level 1 suffice?' },
      { role: 'ai' as const, text: 'Yes, Level 1 covers nutrition science, coaching methodology, and practical application — including working with clients on health conditions. Are you ready to get started?' },
      { role: 'user' as const, text: 'I think so.' },
      { role: 'ai' as const, text: 'Great! You can enroll directly on this page. The monthly plan is $59/month for 12 months, or $599 as a single payment. Both include free shipping.' },
      { role: 'user' as const, text: 'What apps do I need? I\'m not so techie.' },
      { role: 'ai' as const, text: 'No special apps needed — everything is accessed through your web browser. You\'ll log into your student dashboard from any device.' },
      { role: 'user' as const, text: 'I\'m enrolling from the Philippines. Will you ship the physical materials to me? Is there an added cost?' },
      { role: 'ai' as const, text: 'Yes, we ship internationally including to the Philippines. Shipping is included — no extra cost.' },
      { role: 'user' as const, text: 'Oh that\'s good to know. So I can start right away then. Thank you.' },
    ],
  },
  {
    title: 'The India Student Escalation',
    subtitle: '7 questions — evaluating → escalated',
    tags: ['7 questions', 'India', 'Escalated', 'Content gap'],
    messages: [
      { role: 'user' as const, text: 'Hi PN Team, I\'m a student from India and very interested in enrolling in PN Level 1. I\'ll be paying fully on my own, and international payments + conversion fees make it a bit challenging. I wanted to ask if there are any student discounts, regional pricing options, or current promotions I might be eligible for before enrolling.' },
      { role: 'ai' as const, text: 'The current pricing is $599 USD (single payment) or $59/month for 12 months. Both include a 45-day money-back guarantee. I don\'t have information about student discounts or regional pricing.' },
      { role: 'user' as const, text: 'Can I get on the insider access list for exclusive offers?' },
      { role: 'ai' as const, text: 'I can\'t sign you up for insider access directly. I\'d recommend reaching out to the PN team for that.' },
      { role: 'ellipsis' as const, text: 'Tried 2 more times, providing email directly in chat' },
      { role: 'user' as const, text: 'Can someone from the team contact me?' },
      { role: 'ai' as const, text: 'I\'d like to connect you with someone who can help with this directly. Could you share your email address so our team can follow up?' },
    ],
  },
]

const galleryConversations = [
  {
    title: 'The Relationship Counselor',
    subtitle: '14 questions — SSR student applies stress concepts to boyfriend drama',
    why: 'A student uses nutrition coaching frameworks to process real relationship stress. The AI adapts PN\'s 6-step coaching process to "managing feeling sad about boyfriend\'s actions" — a use case nobody designed for.',
    tags: ['14 questions', 'SSR student', 'Personal crisis'],
    messages: [
      { role: 'user' as const, text: 'what are the factors that influence our sleep, stress management, and recovery.' },
      { role: 'ai' as const, text: 'Biological factors: genetics, chronotype, exercise, aging, hormones. Psychological: mindset, thoughts, feelings, expectations. Social/Environmental: work schedules, safety, home environment, travel, noise/light...' },
      { role: 'ellipsis' as const, text: '5 questions about change, sphere of control, stress' },
      { role: 'user' as const, text: 'i am sad about my boyfriend behavior and it is bothering me. is that feeling kind of stress?' },
      { role: 'ai' as const, text: 'Yes, feeling sad and bothered can absolutely be a type of stress — specifically emotional stress or social stress. All emotions can be stressors. Emotional stress arises when we can\'t process or express emotions in healthy ways.' },
      { role: 'user' as const, text: 'how to get away from trauma bonding' },
      { role: 'ai' as const, text: 'I don\'t have specific information about "trauma bonding." However, related concepts include: fear conditioning, fawning response (people-pleasing due to trauma), and social threat (feeling devalued, harmed, abandoned)...' },
      { role: 'user' as const, text: 'how to adapt PN 6 step process to manage feeling sad about boyfriend action' },
      { role: 'ai' as const, text: 'The PN 6-step process: 1. Assess and Gather Data (understand your feelings). 2. Understand and Explore (deeper reasons, values being unmet). 3. Strategize and Plan (communication, boundaries, self-care). 4. Choose and Test a Next Action. 5. Observe and Monitor. 6. Analyze and Evaluate.' },
    ],
  },
  {
    title: 'The Neuroscience Deep-Dive',
    subtitle: '6 questions — SSR student pushes into carrier proteins and BCAA timing',
    why: 'Questions so specific they\'d challenge a human tutor. The student asks whether morning BCAA supplementation would clear by evening to allow tryptophan transport to the brain — genuine critical thinking the AI handles gracefully.',
    tags: ['6 questions', 'SSR student', 'Advanced science'],
    messages: [
      { role: 'user' as const, text: 'Explain zeitgebers in more detail' },
      { role: 'ai' as const, text: 'Zeitgebers are internal and external cues that regulate our circadian rhythms. The term means "time-keeper" in German. Key examples: photic signals (light/darkness), temperature, food, physical activity, stress, social interaction...' },
      { role: 'user' as const, text: 'How do you pronounce it?' },
      { role: 'ai' as const, text: 'I don\'t have specific information about that in my content.' },
      { role: 'user' as const, text: 'Are carrier proteins influenced by diet?' },
      { role: 'ai' as const, text: 'Yes. BCAAs compete with tryptophan for the same carrier proteins. A diet high in other large neutral amino acids can reduce tryptophan reaching the brain. Carbohydrates stimulate insulin, which clears competing amino acids, increasing tryptophan availability...' },
      { role: 'user' as const, text: 'If you consume supplemental BCAA in the morning, would it clear by evening, thus allowing tryptophan to be available to the brain?' },
      { role: 'ai' as const, text: 'The content doesn\'t give a specific timeline for BCAA clearance. The ratio of tryptophan to other amino acids matters most. Consuming carbohydrates can help by stimulating insulin to clear competing amino acids...' },
    ],
  },
  {
    title: 'The Coaching Trenches',
    subtitle: '7 questions — student escalates real coaching frustrations',
    why: 'Raw, unfiltered coaching frustration. The student goes from textbook scenario to "they\'re too lazy to even think about it!" — each follow-up more exasperated than the last. Then pivots to a personal conflict about going to bed early while their partner thinks they\'re a bad partner.',
    tags: ['7 questions', 'SSR student', 'Client resistance'],
    messages: [
      { role: 'user' as const, text: 'so what can i do if a client just gets mad every time i ask why?' },
      { role: 'ai' as const, text: 'Strategies: 1. Explore benefits of the current situation ("What is good about not changing?"). 2. Validate and acknowledge. 3. Use reflective listening. 4. Rephrase to "What" or "How" questions. 5. Understand the underlying problem...' },
      { role: 'user' as const, text: 'or when you ask why or try any of these other methods, they just say "i don\'t know"' },
      { role: 'ai' as const, text: '1. Acknowledge "I don\'t know" as valid. 2. Embrace ambivalence/resistance as normal. 3. Revisit "What is GOOD about NOT changing?" 4. Use the "Downward Arrow" technique gently. 5. Remember every behavior solves a problem.' },
      { role: 'user' as const, text: 'they\'re too lazy to even think about it' },
      { role: 'ai' as const, text: 'I don\'t have specific information about that in my content.' },
      { role: 'user' as const, text: 'so when i go with these options, and they don\'t do the work to think about it, then what should i do?' },
      { role: 'ai' as const, text: 'Reframe — not "laziness" but ambivalence/resistance. 1. Embrace it. 2. Help them express and describe. 3. Treat resistance as valid "competing commitments." 4. Ask "What is GOOD about NOT changing?" 5. Be an ambivalence investigator.' },
    ],
  },
  {
    title: 'The Philosopher',
    subtitle: '7 questions — opens with "are you an AI?" then pushes into existential psychology',
    why: 'Starts by testing the AI\'s self-awareness, asks it to explain a philosophical quote about imagined sorrows, then tries to introduce Rogers\' theory of congruence — pushing beyond what any indexed content covers. Rated 5 stars despite hitting the AI\'s limits.',
    tags: ['7 questions', 'Rating 5', 'AI awareness', 'Psychology'],
    messages: [
      { role: 'user' as const, text: 'are you an Ai? do you reply freely?' },
      { role: 'ai' as const, text: 'Yes, I am an AI. I reply based on the information I have been trained on and the instructions I have been given to assist you.' },
      { role: 'user' as const, text: 'Explain this simply: "I have known many sorrows, most of which never happened."' },
      { role: 'ai' as const, text: 'This quote means a person spent a lot of time feeling sad or worried about things that they thought might happen, but never actually occurred. It\'s about how suffering comes from worrying about potential problems that never materialize...' },
      { role: 'user' as const, text: 'for existential stressors how do you define them scientifically in theories of psychology' },
      { role: 'ai' as const, text: 'Existential stressors are primarily about ideas, worries, beliefs, and thoughts concerning our place in the world. Categories: not enough control/certainty, too much freedom/responsibility, identity transitions, loss and grief, fear of death, ignoring needs/emotions...' },
      { role: 'user' as const, text: 'I find: Not meeting expectations... ignore certain needs... are components of rogers theory of congruence...' },
      { role: 'ai' as const, text: 'I don\'t have specific information about that in my content.' },
    ],
  },
  {
    title: 'The 8-Fallback Nightmare',
    subtitle: '10 questions — rating 1 — 8 consecutive fallbacks after one good answer',
    why: 'The clearest failure case in the dataset. After one successful answer about CEU eligibility, the AI hit "I don\'t have specific information" 8 times in a row on reasonable follow-ups. This conversation led directly to discovering and fixing the conversation history pollution bug.',
    tags: ['10 questions', 'Rating 1', '8 fallbacks', 'Bug discovered'],
    messages: [
      { role: 'user' as const, text: 'Am I eligible for a continuing education units?' },
      { role: 'ai' as const, text: 'Yes! The certification qualifies for CEUs with NASM, ACSM, ACE, AFAA, and more. You can earn credits that count toward professional development.' },
      { role: 'user' as const, text: 'What type of career can I pursue' },
      { role: 'ai' as const, text: 'I don\'t have specific information about that in my content.' },
      { role: 'user' as const, text: 'What can I expect after becoming certified' },
      { role: 'ai' as const, text: 'I don\'t have specific information about that in my content.' },
      { role: 'ellipsis' as const, text: '6 more questions — all received the same fallback response' },
      { role: 'user' as const, text: 'How can I make income through this cert' },
      { role: 'ai' as const, text: 'I don\'t have specific information about that in my content.' },
    ],
  },
  {
    title: 'South Africa vs. The World',
    subtitle: '6 questions — rating 5 — methodical international evaluator',
    why: 'A prospect from South Africa doing real due diligence: is it recognized internationally? What levels exist? Does it cover digestion and macros in depth? How does it compare to the Nutrition Institute (SA)? The AI handles the competitive comparison gracefully without trashing competitors.',
    tags: ['6 questions', 'Rating 5', 'South Africa', 'Comparison'],
    messages: [
      { role: 'user' as const, text: 'Is the Nutrition course recognised in South Africa? Is there a cut off date to get certified?' },
      { role: 'ai' as const, text: 'Yes, the PN Level 1 is recognized internationally and valid worldwide. Over 175,000 professionals in 150+ countries. Certification is valid for two years — recertify via a free 50-question exam...' },
      { role: 'user' as const, text: 'Does the course go in depth about Digestion, carbs, fats, protein, vitamins, minerals, hydration?' },
      { role: 'ai' as const, text: 'Yes, comprehensively: Chapter 8 covers GI tract/digestion, Chapter 11 covers macronutrients, Chapter 12 covers micronutrients (vitamins/minerals), Chapter 13 covers water and fluid balance...' },
      { role: 'user' as const, text: 'How does precision nutrition compare to the nutrition institute (SA)?' },
      { role: 'ai' as const, text: 'I don\'t have specific information comparing to "the Nutrition Institute (SA)." However, the biggest difference vs academic programs: PN Level 1 is designed to help you start coaching right away. ~5 months vs 4+ years for a degree. Priced at $599 USD...' },
    ],
  },
  {
    title: 'The Vocabulary Hunter',
    subtitle: '7 questions — rating 5 — using AI as a course dictionary and translator',
    why: 'Student treats the widget as a personal dictionary for course jargon. Asks to define "alexithymia," explain "interspersing," and even tries to get Spanish translations. Shows an entirely unintended but highly useful application.',
    tags: ['7 questions', 'Rating 5', 'Vocabulary', 'Spanish'],
    messages: [
      { role: 'user' as const, text: 'alexithymia' },
      { role: 'ai' as const, text: 'Alexithymia is a condition where individuals have difficulty identifying and describing their own emotions. They may prefer external rules because they can\'t intuitively sense their own needs. As a coach, these clients may prioritize external evidence over bodily sensations...' },
      { role: 'user' as const, text: 'Explain this simply: interspersing' },
      { role: 'ai' as const, text: 'I don\'t have specific information about that in my content.' },
      { role: 'user' as const, text: 'Explain this simply: interspersing periods of focus' },
      { role: 'ai' as const, text: '"Interspersing periods of focus" means alternating times of high concentration with periods of rest. Some methods suggest 90 minutes of focus then a break. The Pomodoro Technique uses 25 minutes focused + 5 minutes rest...' },
      { role: 'user' as const, text: 'Translate this to Spanish: wrangle their schedule' },
      { role: 'ai' as const, text: 'I don\'t have specific information about that in my content.' },
    ],
  },
  {
    title: 'The Returning Student',
    subtitle: '5 questions — has old materials, discovers they\'re current',
    why: 'A customer service scenario on a sales page. Student had L1 materials from years ago, asks if they\'re outdated. Through conversation, discovers they have the 4th edition — which is the current version. Then asks where to log in. The AI handled post-purchase support it wasn\'t designed for.',
    tags: ['5 questions', 'Returning student', 'Version check'],
    messages: [
      { role: 'user' as const, text: 'I had L1 materials from a few years ago, can I start program now or are my materials outdated now?' },
      { role: 'ai' as const, text: 'The current PN Level 1 Certification is Version 4, completely up-to-date. Your purchase includes lifetime access to the version you purchased. Given that Version 4 is current, your older materials might be an earlier version...' },
      { role: 'user' as const, text: 'I have 4th edition materials' },
      { role: 'ai' as const, text: 'I don\'t have specific information about that in my content.' },
      { role: 'user' as const, text: 'Is 4th edition the current version' },
      { role: 'ai' as const, text: 'Yes, the 4th edition is indeed the current version. It is completely up-to-date with the latest scientific research and coaching methodologies. No immediate plans for Version 5...' },
      { role: 'user' as const, text: 'Where do I gain online access to my program' },
      { role: 'ai' as const, text: 'You can gain online access at my.precisionnutrition.com. On this homepage, you\'ll find all online materials including chapter exams, videos, workbook questions, and supplemental reading...' },
    ],
  },
]

export default function InsightsReport() {
  const [expandedConvos, setExpandedConvos] = useState<Set<number>>(new Set())
  const [expandedGallery, setExpandedGallery] = useState<Set<number>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap'
    document.head.appendChild(link)
    setMounted(true)
    return () => { document.head.removeChild(link) }
  }, [])

  const toggleConvo = (index: number) => {
    setExpandedConvos(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const toggleGallery = (index: number) => {
    setExpandedGallery(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  if (!mounted) {
    return <div style={{ background: '#0a0a0c', minHeight: '100vh' }} />
  }

  return (
    <>
      <style>{`
        .insights-report * { box-sizing: border-box; margin: 0; padding: 0; }

        .insights-report {
          --bg: #0a0a0c;
          --surface: #111114;
          --surface-2: #18181c;
          --surface-3: #1f1f24;
          --border: #2a2a30;
          --border-subtle: #1e1e23;
          --text: #e8e8ec;
          --text-secondary: #9898a4;
          --text-muted: #5c5c68;
          --accent-blue: #3b82f6;
          --accent-amber: #f59e0b;
          --accent-green: #10b981;
          --accent-red: #ef4444;
          --accent-purple: #8b5cf6;
          --accent-cyan: #06b6d4;
          --accent-pink: #ec4899;
          --accent-orange: #f97316;
          --font-display: 'Instrument Serif', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
          --font-mono: 'DM Mono', 'SF Mono', monospace;

          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          min-height: 100vh;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        .insights-report a { color: inherit; }

        /* Noise texture overlay */
        .insights-report::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .insights-report > * { position: relative; z-index: 1; }

        /* ---- Hero ---- */
        .ir-hero {
          padding: 80px 48px 64px;
          max-width: 1200px;
          margin: 0 auto;
          border-bottom: 1px solid var(--border);
        }

        .ir-hero-eyebrow {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--accent-green);
          margin-bottom: 24px;
          font-weight: 400;
        }

        .ir-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(40px, 5.5vw, 72px);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--text);
          max-width: 900px;
        }

        .ir-hero h1 em {
          font-style: italic;
          color: var(--accent-green);
        }

        .ir-hero-sub {
          font-size: 17px;
          color: var(--text-secondary);
          margin-top: 20px;
          max-width: 640px;
          line-height: 1.7;
          font-weight: 300;
        }

        .ir-pills {
          display: flex;
          gap: 12px;
          margin-top: 48px;
          flex-wrap: wrap;
        }

        .ir-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 22px;
        }

        .ir-pill-value {
          font-family: var(--font-mono);
          font-size: 24px;
          font-weight: 500;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .ir-pill-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ---- Sections ---- */
        .ir-section {
          padding: 80px 48px;
          max-width: 1200px;
          margin: 0 auto;
          border-bottom: 1px solid var(--border-subtle);
        }

        .ir-section-num {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .ir-section h2 {
          font-family: var(--font-display);
          font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 400;
          line-height: 1.15;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }

        .ir-section h2 em {
          font-style: italic;
          color: var(--text-secondary);
        }

        .ir-section-desc {
          font-size: 15px;
          color: var(--text-secondary);
          max-width: 600px;
          margin-bottom: 48px;
          line-height: 1.7;
          font-weight: 300;
        }

        /* ---- Funnel ---- */
        .ir-funnel {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ir-funnel-row {
          display: grid;
          grid-template-columns: 200px 1fr 80px;
          align-items: center;
          gap: 20px;
          padding: 14px 0;
        }

        .ir-funnel-label {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-secondary);
          text-align: right;
        }

        .ir-funnel-bar-track {
          height: 32px;
          background: var(--surface);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .ir-funnel-bar-fill {
          height: 100%;
          border-radius: 6px;
          background: var(--accent-green);
          transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .ir-funnel-count {
          font-family: var(--font-mono);
          font-size: 15px;
          font-weight: 500;
          color: var(--text);
          text-align: right;
        }

        .ir-funnel-drop {
          display: grid;
          grid-template-columns: 200px 1fr 80px;
          gap: 20px;
          padding: 2px 0;
        }

        .ir-funnel-drop-text {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          padding-left: 20px;
        }

        /* ---- Bar Chart (vertical) ---- */
        .ir-bars {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          height: 220px;
          padding-bottom: 40px;
          position: relative;
        }

        .ir-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          height: 100%;
          position: relative;
        }

        .ir-bar-value {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .ir-bar {
          width: 100%;
          max-width: 64px;
          border-radius: 6px 6px 0 0;
          background: var(--accent-blue);
          transition: height 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .ir-bar-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
          position: absolute;
          bottom: -32px;
          white-space: nowrap;
        }

        .ir-stats-strip {
          display: flex;
          gap: 48px;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid var(--border-subtle);
          flex-wrap: wrap;
        }

        .ir-stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ir-stat-item-value {
          font-family: var(--font-mono);
          font-size: 24px;
          font-weight: 500;
          color: var(--text);
        }

        .ir-stat-item-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ---- When They Chat ---- */
        .ir-time-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }

        .ir-day-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ir-day-row {
          display: grid;
          grid-template-columns: 40px 1fr 40px;
          align-items: center;
          gap: 12px;
        }

        .ir-day-label {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
          text-align: right;
        }

        .ir-day-bar-track {
          height: 20px;
          background: var(--surface);
          border-radius: 4px;
          overflow: hidden;
        }

        .ir-day-bar-fill {
          height: 100%;
          border-radius: 4px;
          background: var(--accent-amber);
        }

        .ir-day-count {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
        }

        .ir-time-blocks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .ir-time-block {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .ir-time-block::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: var(--intensity, 0);
          border-radius: 10px;
        }

        .ir-time-block-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
          position: relative;
        }

        .ir-time-block-value {
          font-family: var(--font-mono);
          font-size: 28px;
          font-weight: 500;
          color: var(--text);
          position: relative;
        }

        .ir-time-block-pct {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          position: relative;
        }

        .ir-callout {
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 3px solid var(--accent-amber);
          border-radius: 10px;
          padding: 20px 24px;
          margin-top: 32px;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.7;
          font-weight: 300;
        }

        .ir-callout strong {
          color: var(--text);
          font-weight: 500;
        }

        /* ---- Theme Cards ---- */
        .ir-theme-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .ir-theme-card {
          background: var(--surface);
          padding: 24px;
          transition: background 0.2s ease;
        }

        .ir-theme-card:hover { background: var(--surface-2); }

        .ir-theme-card-top {
          height: 3px;
          border-radius: 2px;
          margin-bottom: 16px;
        }

        .ir-theme-card-name {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .ir-theme-card-pct {
          font-family: var(--font-mono);
          font-size: 22px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .ir-theme-card-count {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }

        .ir-quotes-section {
          margin-top: 48px;
        }

        .ir-quotes-title {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 400;
          margin-bottom: 20px;
          color: var(--text);
        }

        .ir-quotes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .ir-quote {
          background: var(--surface);
          padding: 20px 24px;
          font-size: 14px;
          color: var(--text-secondary);
          font-style: italic;
          line-height: 1.6;
          font-weight: 300;
          transition: background 0.2s ease;
        }

        .ir-quote:hover { background: var(--surface-2); }

        .ir-quote-tag {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          font-style: normal;
          letter-spacing: 0.5px;
          display: block;
          margin-top: 8px;
        }

        /* ---- Journey ---- */
        .ir-journey-pills {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        .ir-journey-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px 28px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
        }

        .ir-journey-pill-stage {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .ir-journey-pill-count {
          font-family: var(--font-mono);
          font-size: 28px;
          font-weight: 500;
          color: var(--text);
        }

        .ir-journey-pill-pct {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }

        .ir-journey-arrow {
          font-size: 20px;
          color: var(--text-muted);
        }

        .ir-signal-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 32px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 32px;
        }

        .ir-signal-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ir-signal-stat-value {
          font-family: var(--font-mono);
          font-size: 32px;
          font-weight: 500;
          color: var(--accent-green);
        }

        .ir-signal-stat-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .ir-signal-quotes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .ir-signal-quote {
          background: var(--surface);
          padding: 16px 20px;
          font-size: 13px;
          color: var(--text-secondary);
          font-style: italic;
          line-height: 1.6;
          font-weight: 300;
          transition: background 0.2s ease;
        }

        .ir-signal-quote:hover { background: var(--surface-2); }

        /* ---- Grounding ---- */
        .ir-big-stat {
          text-align: center;
          padding: 48px 0;
        }

        .ir-big-stat-value {
          font-family: var(--font-mono);
          font-size: clamp(64px, 10vw, 120px);
          font-weight: 500;
          color: var(--text);
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .ir-big-stat-label {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-muted);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 12px;
        }

        .ir-big-stat-sub {
          font-size: 15px;
          color: var(--text-secondary);
          margin-top: 8px;
          font-weight: 300;
        }

        .ir-action-table {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 48px;
        }

        .ir-action-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .ir-action-table thead {
          background: var(--surface);
        }

        .ir-action-table th {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 14px 20px;
          text-align: left;
          font-weight: 500;
          border-bottom: 1px solid var(--border);
        }

        .ir-action-table td {
          padding: 12px 20px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-secondary);
        }

        .ir-action-table tr:last-child td { border-bottom: none; }

        .ir-action-table tr:hover td { background: var(--surface); }

        .ir-grounding-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 32px;
        }

        .ir-grounding-card {
          background: var(--surface);
          padding: 28px;
          transition: background 0.2s ease;
        }

        .ir-grounding-card:hover { background: var(--surface-2); }

        .ir-grounding-card-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .ir-grounding-card-value {
          font-family: var(--font-mono);
          font-size: 32px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 4px;
        }

        .ir-grounding-card-detail {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 300;
        }

        /* ---- Ratings ---- */
        .ir-rating-bars {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 600px;
        }

        .ir-rating-row {
          display: grid;
          grid-template-columns: 40px 1fr 60px;
          align-items: center;
          gap: 16px;
        }

        .ir-rating-label {
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--text-secondary);
          text-align: right;
        }

        .ir-rating-bar-track {
          height: 28px;
          background: var(--surface);
          border-radius: 6px;
          overflow: hidden;
        }

        .ir-rating-bar-fill {
          height: 100%;
          border-radius: 6px;
        }

        .ir-rating-pct {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-muted);
        }

        .ir-depth-table {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 40px;
          max-width: 500px;
        }

        .ir-depth-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .ir-depth-table thead { background: var(--surface); }

        .ir-depth-table th {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 12px 20px;
          text-align: left;
          font-weight: 500;
          border-bottom: 1px solid var(--border);
        }

        .ir-depth-table td {
          padding: 10px 20px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-secondary);
        }

        .ir-depth-table tr:last-child td { border-bottom: none; }

        /* ---- Conversations ---- */
        .ir-convo-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ir-convo {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .ir-convo-header {
          padding: 20px 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.2s ease;
        }

        .ir-convo-header:hover { background: var(--surface-2); }

        .ir-convo-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--text);
          font-weight: 400;
        }

        .ir-convo-subtitle {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .ir-convo-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .ir-convo-tag {
          font-family: var(--font-mono);
          font-size: 10px;
          padding: 3px 10px;
          border-radius: 4px;
          background: var(--surface-3);
          color: var(--text-secondary);
          letter-spacing: 0.3px;
        }

        .ir-convo-toggle {
          font-family: var(--font-mono);
          font-size: 18px;
          color: var(--text-muted);
          transition: transform 0.3s ease;
          flex-shrink: 0;
          margin-left: 16px;
        }

        .ir-convo-body {
          border-top: 1px solid var(--border-subtle);
          animation: ir-fadeIn 0.3s ease;
        }

        @keyframes ir-fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ir-msg {
          padding: 16px 24px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-subtle);
        }

        .ir-msg:last-child { border-bottom: none; }

        .ir-msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          flex-shrink: 0;
          margin-top: 2px;
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .ir-msg-avatar-user {
          background: var(--surface-3);
          color: var(--text-muted);
        }

        .ir-msg-avatar-ai {
          background: var(--accent-green);
          color: white;
          border-radius: 6px;
        }

        .ir-msg-text {
          font-size: 14px;
          line-height: 1.7;
          font-weight: 300;
        }

        .ir-msg-text-user {
          color: var(--text);
          font-weight: 400;
        }

        .ir-msg-text-ai {
          color: var(--text-secondary);
        }

        .ir-msg-ellipsis {
          width: 100%;
          text-align: center;
          padding: 8px 24px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .ir-msg-ellipsis span {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          background: var(--surface-2);
          padding: 4px 12px;
          border-radius: 4px;
        }

        .ir-convo-why {
          padding: 16px 24px;
          background: rgba(245, 158, 11, 0.05);
          border-top: 1px solid var(--border-subtle);
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.7;
          font-weight: 300;
        }

        .ir-convo-why-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--accent-amber);
          margin-bottom: 6px;
          font-weight: 500;
        }

        /* ---- Findings ---- */
        .ir-findings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .ir-finding {
          background: var(--surface);
          padding: 32px;
          transition: background 0.2s ease;
          position: relative;
        }

        .ir-finding:hover { background: var(--surface-2); }

        .ir-finding-num {
          font-family: var(--font-mono);
          font-size: 48px;
          font-weight: 300;
          color: var(--border);
          line-height: 1;
          letter-spacing: -0.04em;
          position: absolute;
          top: 16px;
          right: 20px;
        }

        .ir-finding-stat {
          font-family: var(--font-mono);
          font-size: 18px;
          font-weight: 500;
          color: var(--accent-green);
          margin-bottom: 8px;
        }

        .ir-finding-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.65;
          font-weight: 300;
          max-width: 90%;
        }

        /* ---- Footer ---- */
        .ir-footer {
          padding: 48px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .ir-footer-left {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.5px;
          line-height: 1.8;
        }

        .ir-footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16,185,129,0.1);
          color: var(--accent-green);
          padding: 6px 14px;
          border-radius: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        /* ---- Responsive ---- */
        @media (max-width: 900px) {
          .ir-hero, .ir-section { padding: 48px 24px; }
          .ir-pills { gap: 8px; }
          .ir-pill { padding: 10px 16px; }
          .ir-pill-value { font-size: 18px; }
          .ir-funnel-row { grid-template-columns: 120px 1fr 50px; gap: 12px; }
          .ir-funnel-label { font-size: 11px; }
          .ir-funnel-drop { grid-template-columns: 120px 1fr 50px; gap: 12px; }
          .ir-time-grid { grid-template-columns: 1fr; gap: 32px; }
          .ir-theme-grid { grid-template-columns: 1fr 1fr; }
          .ir-quotes-grid { grid-template-columns: 1fr; }
          .ir-signal-card { grid-template-columns: 1fr; }
          .ir-signal-quotes { grid-template-columns: 1fr; }
          .ir-grounding-comparison { grid-template-columns: 1fr; }
          .ir-findings-grid { grid-template-columns: 1fr; }
          .ir-journey-pills { flex-direction: column; align-items: stretch; }
          .ir-journey-arrow { transform: rotate(90deg); text-align: center; }
          .ir-footer { padding: 48px 24px; }
          .ir-bars { gap: 8px; }
          .ir-convo-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .ir-convo-toggle { margin-left: 0; }
        }

        @media (max-width: 600px) {
          .ir-theme-grid { grid-template-columns: 1fr; }
          .ir-time-blocks { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="insights-report">
        {/* ===== HERO ===== */}
        <header className="ir-hero">
          <p className="ir-hero-eyebrow">Conversation Insights &middot; Jan 16 &ndash; Feb 7, 2026</p>
          <h1>Three Weeks of<br /><em>Real Conversations</em></h1>
          <p className="ir-hero-sub">
            What 292 real conversations reveal about how visitors engage with AI chat
            on a sales page. Every stat, quote, and insight comes from live data on
            Precision Nutrition&rsquo;s certification pages.
          </p>

          <div className="ir-pills">
            <div className="ir-pill">
              <span className="ir-pill-value">475</span>
              <span className="ir-pill-label">Opens</span>
            </div>
            <div className="ir-pill">
              <span className="ir-pill-value">292</span>
              <span className="ir-pill-label">Conversations</span>
            </div>
            <div className="ir-pill">
              <span className="ir-pill-value">1,624</span>
              <span className="ir-pill-label">Messages</span>
            </div>
            <div className="ir-pill">
              <span className="ir-pill-value">104</span>
              <span className="ir-pill-label">Visitors</span>
            </div>
            <div className="ir-pill">
              <span className="ir-pill-value">3 wks</span>
              <span className="ir-pill-label">Duration</span>
            </div>
          </div>
        </header>

        {/* ===== 01 — THE FUNNEL ===== */}
        <section className="ir-section">
          <p className="ir-section-num">01</p>
          <h2>The <em>Funnel</em></h2>
          <p className="ir-section-desc">
            From widget open to email capture. 61.5% of people who opened the widget
            actually typed something &mdash; not a chatbot people ignore, real engagement.
          </p>

          <div className="ir-funnel">
            {[
              { label: 'Widget Opens', count: 475, pct: 100 },
              { label: 'Started Conversation', count: 292, pct: 61.5, drop: '38.5% drop-off' },
              { label: 'Asked 2+ Questions', count: 175, pct: 36.8, drop: '40.1% drop-off' },
              { label: 'Asked 4+ Questions', count: 69, pct: 14.5, drop: '60.6% drop-off' },
              { label: 'Rated Experience', count: 70, pct: 14.7, drop: null },
              { label: 'Escalated to Email', count: 7, pct: 1.5, drop: null },
            ].map((row, i, arr) => (
              <div key={i}>
                <div className="ir-funnel-row">
                  <span className="ir-funnel-label">{row.label}</span>
                  <div className="ir-funnel-bar-track">
                    <div
                      className="ir-funnel-bar-fill"
                      style={{
                        width: `${row.pct}%`,
                        opacity: 1 - (i * 0.12),
                      }}
                    />
                  </div>
                  <span className="ir-funnel-count">{row.count}</span>
                </div>
                {row.drop && i < arr.length - 1 && (
                  <div className="ir-funnel-drop">
                    <span />
                    <span className="ir-funnel-drop-text">&darr; {row.drop}</span>
                    <span />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== 02 — SESSION DEPTH ===== */}
        <section className="ir-section">
          <p className="ir-section-num">02</p>
          <h2>Session <em>Depth</em></h2>
          <p className="ir-section-desc">
            ~40% are &ldquo;one and done&rdquo; &mdash; a single burning question, fast answer.
            But 18% go 5+ questions deep, treating chat like a consultative sales conversation.
          </p>

          <div className="ir-bars">
            {[
              { label: '1 question', count: 117, pct: 40.1 },
              { label: '2 questions', count: 81, pct: 27.7 },
              { label: '3\u20134', count: 41, pct: 14.0 },
              { label: '5\u20138', count: 37, pct: 12.7 },
              { label: '9\u201315', count: 15, pct: 5.1 },
              { label: '16+', count: 1, pct: 0.3 },
            ].map((bar, i) => (
              <div className="ir-bar-col" key={i}>
                <span className="ir-bar-value">{bar.count}</span>
                <div
                  className="ir-bar"
                  style={{
                    height: `${Math.max((bar.pct / 40.1) * 160, 4)}px`,
                    background: i <= 1 ? 'var(--accent-blue)' : i <= 3 ? 'var(--accent-amber)' : 'var(--accent-green)',
                  }}
                />
                <span className="ir-bar-label">{bar.label}</span>
              </div>
            ))}
          </div>

          <div className="ir-stats-strip">
            <div className="ir-stat-item">
              <span className="ir-stat-item-value">2.8</span>
              <span className="ir-stat-item-label">Avg Questions</span>
            </div>
            <div className="ir-stat-item">
              <span className="ir-stat-item-value">2</span>
              <span className="ir-stat-item-label">Median</span>
            </div>
            <div className="ir-stat-item">
              <span className="ir-stat-item-value">17</span>
              <span className="ir-stat-item-label">Maximum</span>
            </div>
          </div>
        </section>

        {/* ===== 03 — WHEN THEY CHAT ===== */}
        <section className="ir-section">
          <p className="ir-section-num">03</p>
          <h2>When They <em>Chat</em></h2>
          <p className="ir-section-desc">
            Peak days are Wednesday and Friday. 22% of conversations happen between
            midnight and 5am ET &mdash; international visitors no human team covers.
          </p>

          <div className="ir-time-grid">
            <div>
              <div className="ir-day-bars">
                {[
                  { day: 'Mon', count: 22 },
                  { day: 'Tue', count: 32 },
                  { day: 'Wed', count: 60 },
                  { day: 'Thu', count: 41 },
                  { day: 'Fri', count: 61 },
                  { day: 'Sat', count: 52 },
                  { day: 'Sun', count: 24 },
                ].map((d, i) => (
                  <div className="ir-day-row" key={i}>
                    <span className="ir-day-label">{d.day}</span>
                    <div className="ir-day-bar-track">
                      <div
                        className="ir-day-bar-fill"
                        style={{
                          width: `${(d.count / 61) * 100}%`,
                          opacity: d.count >= 60 ? 1 : 0.6 + (d.count / 61) * 0.4,
                        }}
                      />
                    </div>
                    <span className="ir-day-count">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="ir-time-blocks">
                {[
                  { label: '12am \u2013 5am', count: 64, pct: '22%', intensity: 0.22 },
                  { label: '6am \u2013 11am', count: 56, pct: '19%', intensity: 0.19 },
                  { label: '12pm \u2013 5pm', count: 114, pct: '39%', intensity: 0.39 },
                  { label: '6pm \u2013 11pm', count: 58, pct: '20%', intensity: 0.20 },
                ].map((t, i) => (
                  <div
                    className="ir-time-block"
                    key={i}
                    style={{
                      background: `rgba(16, 185, 129, ${t.intensity * 0.15})`,
                      borderColor: `rgba(16, 185, 129, ${t.intensity * 0.3})`,
                    }}
                  >
                    <p className="ir-time-block-label">{t.label}</p>
                    <p className="ir-time-block-value">{t.count}</p>
                    <p className="ir-time-block-pct">{t.pct} of conversations</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ir-callout">
            <strong>22% between midnight&ndash;5am ET.</strong> This isn&rsquo;t insomnia &mdash; it&rsquo;s
            international visitors in India, Philippines, Egypt, Vietnam, Singapore, and Belgium.
            A human sales team serves none of these people. AI serves all of them.
          </div>
        </section>

        {/* ===== 04 — WHAT PEOPLE ASK ===== */}
        <section className="ir-section">
          <p className="ir-section-num">04</p>
          <h2>What People <em>Ask</em></h2>
          <p className="ir-section-desc">
            Logistics and pricing dominate &mdash; 44% of questions are purchase-adjacent.
            People aren&rsquo;t asking &ldquo;what is nutrition coaching?&rdquo; &mdash; they&rsquo;re asking
            &ldquo;how do I buy this?&rdquo;
          </p>

          <div className="ir-theme-grid">
            {[
              { name: 'Logistics', pct: '26.8%', count: 92, color: 'var(--accent-blue)' },
              { name: 'Pricing', pct: '17.5%', count: 60, color: 'var(--accent-green)' },
              { name: 'General', pct: '17.2%', count: 59, color: 'var(--accent-purple)' },
              { name: 'Features', pct: '15.5%', count: 53, color: 'var(--accent-amber)' },
              { name: 'Fit', pct: '14.0%', count: 48, color: 'var(--accent-cyan)' },
              { name: 'Comparison', pct: '4.7%', count: 16, color: 'var(--accent-pink)' },
              { name: 'Trust', pct: '2.6%', count: 9, color: 'var(--accent-orange)' },
              { name: 'Objection', pct: '1.7%', count: 6, color: 'var(--accent-red)' },
            ].map((theme, i) => (
              <div className="ir-theme-card" key={i}>
                <div className="ir-theme-card-top" style={{ background: theme.color }} />
                <p className="ir-theme-card-name">{theme.name}</p>
                <p className="ir-theme-card-pct">{theme.pct}</p>
                <p className="ir-theme-card-count">{theme.count} questions</p>
              </div>
            ))}
          </div>

          <div className="ir-quotes-section">
            <h3 className="ir-quotes-title">First Messages</h3>
            <div className="ir-quotes-grid">
              {[
                { text: 'Is there a textbook?', tag: '#1 opener \u2014 10 occurrences' },
                { text: 'What are the pros and cons?', tag: 'Quick action' },
                { text: 'Can it be done online from other country?', tag: 'International' },
                { text: 'How much is it?', tag: 'Pricing' },
                { text: 'What exactly do I get?', tag: 'Quick action' },
                { text: 'Can I schedule a call?', tag: 'Handoff intent' },
                { text: 'Who are the program authors?', tag: 'Trust' },
                { text: 'I am 74 years old! Am I too old??', tag: 'Fit' },
              ].map((q, i) => (
                <div className="ir-quote" key={i}>
                  &ldquo;{q.text}&rdquo;
                  <span className="ir-quote-tag">{q.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 05 — THE BUYING JOURNEY ===== */}
        <section className="ir-section">
          <p className="ir-section-num">05</p>
          <h2>The Buying <em>Journey</em></h2>
          <p className="ir-section-desc">
            The AI classifies each conversation into a buying stage. 5.8% of conversations
            reach &ldquo;ready to buy&rdquo; &mdash; the AI isn&rsquo;t just answering questions, it&rsquo;s moving people through a funnel.
          </p>

          <div className="ir-journey-pills">
            {[
              { stage: 'Discovering', count: 225, pct: '77.1%', color: 'var(--accent-blue)' },
              { stage: 'Evaluating', count: 46, pct: '15.8%', color: 'var(--accent-amber)' },
              { stage: 'Ready to Buy', count: 17, pct: '5.8%', color: 'var(--accent-green)' },
              { stage: 'Handoff', count: 4, pct: '1.4%', color: 'var(--accent-red)' },
            ].map((s, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="ir-journey-pill">
                  <span className="ir-journey-pill-stage" style={{ color: s.color }}>{s.stage}</span>
                  <span className="ir-journey-pill-count">{s.count}</span>
                  <span className="ir-journey-pill-pct">{s.pct}</span>
                </div>
                {i < arr.length - 1 && <span className="ir-journey-arrow">&rarr;</span>}
              </div>
            ))}
          </div>

          <div className="ir-signal-card">
            <div className="ir-signal-stat">
              <span className="ir-signal-stat-value">159</span>
              <span className="ir-signal-stat-label">Signal Messages</span>
            </div>
            <div className="ir-signal-stat">
              <span className="ir-signal-stat-value">77</span>
              <span className="ir-signal-stat-label">Sessions w/ Signals</span>
            </div>
            <div className="ir-signal-stat">
              <span className="ir-signal-stat-value">26.4%</span>
              <span className="ir-signal-stat-label">Conversations w/ Intent</span>
            </div>
          </div>

          <div className="ir-signal-quotes">
            {[
              'Is it enough to start a nutrition career?',
              'Can I finish in 3 months?',
              'Will I be able to work in a clinic?',
              'How to know this is the correct website to pay',
              'When I pay, what will happen next?',
              'The textbooks can be delivered to Egypt?',
              'I\'m a student from India and very interested in enrolling',
              'I join the early access list now',
            ].map((q, i) => (
              <div className="ir-signal-quote" key={i}>
                &ldquo;{q}&rdquo;
              </div>
            ))}
          </div>
        </section>

        {/* ===== 06 — AI GROUNDING ===== */}
        <section className="ir-section">
          <p className="ir-section-num">06</p>
          <h2>AI <em>Grounding</em></h2>
          <p className="ir-section-desc">
            How often the AI&rsquo;s response is sourced from actual uploaded content vs.
            falling back to a generic response.
          </p>

          <div className="ir-big-stat">
            <p className="ir-big-stat-value">72.3%</p>
            <p className="ir-big-stat-label">Grounding Rate</p>
            <p className="ir-big-stat-sub">253 of 350 responses grounded in content</p>
          </div>

          <div className="ir-action-table">
            <table>
              <thead>
                <tr>
                  <th>Quick Action</th>
                  <th>Uses</th>
                  <th>% Share</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'TL;DR', uses: 12, pct: '25.0%' },
                  { name: 'Pros & Cons', uses: 9, pct: '18.8%' },
                  { name: 'What Do I Get', uses: 9, pct: '18.8%' },
                  { name: 'Why Should I Care', uses: 6, pct: '12.5%' },
                  { name: 'How It Works', uses: 6, pct: '12.5%' },
                  { name: 'Quick Facts', uses: 5, pct: '10.4%' },
                  { name: 'Show Proof', uses: 1, pct: '2.1%' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text)' }}>{row.name}</td>
                    <td>{row.uses}</td>
                    <td>{row.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ir-grounding-comparison">
            <div className="ir-grounding-card">
              <p className="ir-grounding-card-label">Organic Questions</p>
              <p className="ir-grounding-card-value">72.1%</p>
              <p className="ir-grounding-card-detail">217 grounded of 764 responses</p>
            </div>
            <div className="ir-grounding-card">
              <p className="ir-grounding-card-label">Quick Actions</p>
              <p className="ir-grounding-card-value">75.0%</p>
              <p className="ir-grounding-card-detail">36 grounded of 48 responses</p>
            </div>
          </div>
        </section>

        {/* ===== 07 — RATINGS ===== */}
        <section className="ir-section">
          <p className="ir-section-num">07</p>
          <h2>Ratings &amp; <em>Satisfaction</em></h2>
          <p className="ir-section-desc">
            Strikingly bimodal: 64% give 5 stars, 26% give 1 star, almost nobody
            lands in between. A love-it-or-leave-it pattern.
          </p>

          <div className="ir-rating-bars">
            {[
              { stars: 5, count: 45, pct: 64.3, color: 'var(--accent-green)' },
              { stars: 4, count: 3, pct: 4.3, color: 'var(--accent-green)' },
              { stars: 3, count: 3, pct: 4.3, color: 'var(--accent-amber)' },
              { stars: 2, count: 1, pct: 1.4, color: 'var(--accent-amber)' },
              { stars: 1, count: 18, pct: 25.7, color: 'var(--accent-red)' },
            ].map((r, i) => (
              <div className="ir-rating-row" key={i}>
                <span className="ir-rating-label">{r.stars} {'\u2605'}</span>
                <div className="ir-rating-bar-track">
                  <div
                    className="ir-rating-bar-fill"
                    style={{
                      width: `${r.pct}%`,
                      background: r.color,
                    }}
                  />
                </div>
                <span className="ir-rating-pct">{r.pct}%</span>
              </div>
            ))}
          </div>

          <div className="ir-depth-table">
            <table>
              <thead>
                <tr>
                  <th>Session Length</th>
                  <th>Rated</th>
                  <th>Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text)' }}>1&ndash;2 questions</td>
                  <td>41</td>
                  <td>3.80</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text)' }}>3&ndash;4 questions</td>
                  <td>13</td>
                  <td>3.54</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text)' }}>5+ questions</td>
                  <td>16</td>
                  <td style={{ color: 'var(--accent-green)' }}>4.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="ir-callout" style={{ marginTop: 32 }}>
            <strong>Most 1-star ratings aren&rsquo;t about AI quality &mdash; they&rsquo;re about audience mismatch.</strong>{' '}
            Current students and graduates landing on the sales page chat expecting customer support,
            not sales assistance. When the visitor is actually the target audience, ratings are
            significantly higher.
          </div>
        </section>

        {/* ===== 08 — STANDOUT CONVERSATIONS ===== */}
        <section className="ir-section">
          <p className="ir-section-num">08</p>
          <h2>Standout <em>Conversations</em></h2>
          <p className="ir-section-desc">
            Three conversations that demonstrate the full range of what AI chat can do &mdash;
            from a complete sales arc to a frustrated escalation.
          </p>

          <div className="ir-convo-list">
            {standoutConversations.map((convo, idx) => (
              <div className="ir-convo" key={idx}>
                <div className="ir-convo-header" onClick={() => toggleConvo(idx)}>
                  <div>
                    <p className="ir-convo-title">{convo.title}</p>
                    <p className="ir-convo-subtitle">{convo.subtitle}</p>
                    <div className="ir-convo-tags" style={{ marginTop: 8 }}>
                      {convo.tags.map((tag, j) => (
                        <span className="ir-convo-tag" key={j}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <span
                    className="ir-convo-toggle"
                    style={{ transform: expandedConvos.has(idx) ? 'rotate(45deg)' : 'none' }}
                  >
                    +
                  </span>
                </div>
                {expandedConvos.has(idx) && (
                  <div className="ir-convo-body">
                    {convo.messages.map((msg, j) => {
                      if (msg.role === 'ellipsis') {
                        return (
                          <div className="ir-msg-ellipsis" key={j}>
                            <span>[...] {msg.text}</span>
                          </div>
                        )
                      }
                      return (
                        <div className="ir-msg" key={j}>
                          <div className={`ir-msg-avatar ${msg.role === 'user' ? 'ir-msg-avatar-user' : 'ir-msg-avatar-ai'}`}>
                            {msg.role === 'user' ? 'V' : 'AI'}
                          </div>
                          <p className={`ir-msg-text ${msg.role === 'user' ? 'ir-msg-text-user' : 'ir-msg-text-ai'}`}>
                            {msg.text}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== 09 — RESPONSE GALLERY ===== */}
        <section className="ir-section">
          <p className="ir-section-num">09</p>
          <h2>Response <em>Gallery</em></h2>
          <p className="ir-section-desc">
            Eight conversations chosen for being novel, unexpected, or revealing.
            Students using AI as a therapist, a dictionary, a science tutor &mdash;
            and the bug that broke everything.
          </p>

          <div className="ir-convo-list">
            {galleryConversations.map((convo, idx) => (
              <div className="ir-convo" key={idx}>
                <div className="ir-convo-header" onClick={() => toggleGallery(idx)}>
                  <div>
                    <p className="ir-convo-title">{convo.title}</p>
                    <p className="ir-convo-subtitle">{convo.subtitle}</p>
                    <div className="ir-convo-tags" style={{ marginTop: 8 }}>
                      {convo.tags.map((tag, j) => (
                        <span className="ir-convo-tag" key={j}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <span
                    className="ir-convo-toggle"
                    style={{ transform: expandedGallery.has(idx) ? 'rotate(45deg)' : 'none' }}
                  >
                    +
                  </span>
                </div>
                {expandedGallery.has(idx) && (
                  <div className="ir-convo-body">
                    {convo.messages.map((msg, j) => {
                      if (msg.role === 'ellipsis') {
                        return (
                          <div className="ir-msg-ellipsis" key={j}>
                            <span>[...] {msg.text}</span>
                          </div>
                        )
                      }
                      return (
                        <div className="ir-msg" key={j}>
                          <div className={`ir-msg-avatar ${msg.role === 'user' ? 'ir-msg-avatar-user' : 'ir-msg-avatar-ai'}`}>
                            {msg.role === 'user' ? 'V' : 'AI'}
                          </div>
                          <p className={`ir-msg-text ${msg.role === 'user' ? 'ir-msg-text-user' : 'ir-msg-text-ai'}`}>
                            {msg.text}
                          </p>
                        </div>
                      )
                    })}
                    <div className="ir-convo-why">
                      <p className="ir-convo-why-label">Why this conversation</p>
                      <p>{convo.why}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== 10 — KEY FINDINGS ===== */}
        <section className="ir-section" style={{ borderBottom: 'none' }}>
          <p className="ir-section-num">10</p>
          <h2>Key <em>Findings</em></h2>
          <p className="ir-section-desc">
            Ten takeaways from three weeks of real conversation data.
          </p>

          <div className="ir-findings-grid">
            {[
              {
                num: '01',
                stat: '61.5% engagement rate',
                text: 'Not a chatbot people ignore. Nearly 2 in 3 widget opens lead to a real conversation.',
              },
              {
                num: '02',
                stat: '#1 question: "Is there a textbook?"',
                text: 'The sales page doesn\u2019t answer it prominently. Chat fills genuine content gaps visitors can\u2019t find.',
              },
              {
                num: '03',
                stat: '44% logistics + pricing questions',
                text: 'Visitors are further down the funnel than expected. They\u2019re asking "how do I buy?" not "what is this?"',
              },
              {
                num: '04',
                stat: '26.4% show buying signals',
                text: '1 in 4 conversations contain active purchase intent. The conversational format naturally progresses people toward buying.',
              },
              {
                num: '05',
                stat: '22% chat after midnight ET',
                text: 'International visitors from India, Philippines, Egypt, Vietnam. No human team covers these hours. AI does.',
              },
              {
                num: '06',
                stat: '64% five-star, 26% one-star',
                text: 'Bimodal ratings. Most 1-stars are audience mismatch \u2014 existing students on a sales page \u2014 not AI quality.',
              },
              {
                num: '07',
                stat: '72.3% grounding rate',
                text: 'Nearly 3 in 4 responses sourced from actual content. The 27.7% fallback identifies specific content gaps to fill.',
              },
              {
                num: '08',
                stat: '100% of escalations rated 1 star',
                text: 'All 7 escalations were unsatisfied. Escalation = the AI can\u2019t help. But it captures the lead every time.',
              },
              {
                num: '09',
                stat: 'Peak: 4pm ET + weekends',
                text: '52 Saturday conversations. Late-night international traffic. AI ensures no prospect goes unanswered.',
              },
              {
                num: '10',
                stat: '17 questions, one buyer',
                text: 'The Egypt session: a complete sales arc \u2014 from "how long?" to "is this the right URL to pay?" \u2014 all handled by AI.',
              },
            ].map((f, i) => (
              <div className="ir-finding" key={i}>
                <span className="ir-finding-num">{f.num}</span>
                <p className="ir-finding-stat">{f.stat}</p>
                <p className="ir-finding-text">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="ir-footer">
          <div className="ir-footer-left">
            Data source: Precision Nutrition L1 Certification pages<br />
            Analysis period: January 16 &ndash; February 7, 2026
          </div>
          <div>
            <span className="ir-footer-badge">
              <span style={{ fontSize: 14 }}>{'\u2713'}</span>
              292 conversations &middot; 3 weeks &middot; Live data
            </span>
          </div>
        </footer>
      </div>
    </>
  )
}

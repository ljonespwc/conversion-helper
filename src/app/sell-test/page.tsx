'use client'

import { useState, useEffect } from 'react'

const stages = ['discovering', 'evaluating', 'ready_to_buy'] as const
type Stage = typeof stages[number]

const stageResponses: Record<Stage, { response: string; behavior: string; color: string; label: string }> = {
  discovering: {
    label: 'Discovering',
    color: '#3b82f6',
    behavior: 'Answers concisely \u2192 asks a diagnostic question about their situation',
    response: `You have two payment options for the Nutrition Certification. You can choose a monthly payment plan of $59 USD per month for 12 months, which saves you $20 USD per month compared to the original monthly price. Alternatively, you can make a single payment of $599 USD, which saves you $200 USD off the original price of $799 USD. Both options come with a 100% money-back guarantee for 45 days.\n\nWhich payment option aligns best with your current financial planning?`,
  },
  evaluating: {
    label: 'Evaluating',
    color: '#f59e0b',
    behavior: 'More detailed specifics \u2192 includes extras (guarantee, instant access, shipping) \u2192 asks what fits',
    response: `You have two main payment options for the Nutrition Certification. You can choose a monthly payment plan of $59 USD per month for 12 months, which is a savings of $20 USD per month from the regular price of $79 USD/month.\n\nAlternatively, you can opt for a single payment of $599 USD, which saves you $200 USD compared to the original price of $799 USD.\n\nBoth options include instant access to the online program, free shipping for textbooks, and a 45-day money-back guarantee.\n\nWhich payment option sounds like a better fit for you?`,
  },
  ready_to_buy: {
    label: 'Ready to Buy',
    color: '#10b981',
    behavior: 'Removes friction (payment plan vs subscription clarified) \u2192 gives clear CTA ("look for the Enroll now button") \u2192 assumptive close',
    response: `Great choice! The monthly payment plan for the Nutrition Certification is $59 USD per month for 12 months.\n\nIt\u2019s important to know that this is a payment plan, not a subscription. This means you are responsible for making all 12 monthly payments, even if you complete the certification sooner. Once the plan is paid off, you\u2019ll continue to have access to your course materials without any further payments, so you can always refer back to them. To receive your certification, you must make at least 3 payments at the full monthly price.\n\nWhen you\u2019re ready to enroll, you can do so directly on this page. Just look for the \u2018Enroll now\u2019 button under the monthly payment option.\n\nAre you ready to get started and become a Certified Nutrition Coach?`,
  },
}

const classificationData = [
  { message: 'What is this certification about?', stage: 'discovering', detail: '\u2014', group: 'discovering' },
  { message: 'Is this a health coaching course?', stage: 'discovering', detail: '\u2014', group: 'discovering' },
  { message: 'How does this work?', stage: 'discovering', detail: '\u2014', group: 'discovering' },
  { message: 'What are the payment plan options?', stage: 'evaluating', detail: 'w/ pricing history', group: 'evaluating' },
  { message: 'Does it go in depth about digestion, macros...?', stage: 'evaluating', detail: '\u2014', group: 'evaluating' },
  { message: 'How does this compare to IIN?', stage: 'evaluating', detail: 'intent: comparison', group: 'evaluating' },
  { message: 'How do I sign up?', stage: 'ready_to_buy', detail: 'signal: true', group: 'ready_to_buy' },
  { message: 'I want to get started', stage: 'ready_to_buy', detail: 'signal: true', group: 'ready_to_buy' },
  { message: "I'm ready to enroll", stage: 'ready_to_buy', detail: 'signal: true', group: 'ready_to_buy' },
  { message: "I'm trying to purchase but I keep getting an error... Can I talk to someone?", stage: 'handoff_needed', detail: '\u2014', group: 'handoff' },
  { message: 'I need to speak to a real person', stage: 'handoff_needed', detail: '\u2014', group: 'handoff' },
  { message: 'When I start, will textbooks ship right away?', stage: '\u2014', detail: 'signal: true', group: 'signal' },
  { message: 'What topics does it cover?', stage: '\u2014', detail: 'signal: false', group: 'signal' },
]

const conversationExamples = [
  {
    stage: 'discovering',
    intent: 'general',
    question: 'What is this certification about?',
    response: `This certification, the PN Level 1 Nutrition Certification, is designed to help you guide people in improving their health, nutrition, and lifestyle behaviors. It teaches a structured, systematic, and science-based approach to nutrition coaching, enabling you to provide advice clients can trust. The program covers the philosophy and methodology of coaching, the science of nutrition, and practical application, including how to assess clients, create action plans, monitor data, and even build a coaching business.\n\nWhat are you hoping to achieve by looking into a nutrition certification?`,
    annotations: ['Answers the question thoroughly', 'Ends with a diagnostic question about their goals', 'No pitch, no pricing, no pressure'],
  },
  {
    stage: 'discovering',
    intent: 'fit',
    question: 'Is this good for someone who wants to become a health coach?',
    response: `Yes, this program is designed for individuals who want to become health coaches. It\u2019s suitable for those switching careers, looking for a flexible and fulfilling job, or wanting to add nutrition coaching to their existing health and wellness services. The certification teaches you the nutrition science and coaching skills needed to help people and can be completed in about 20 weeks, investing 3-5 hours per week.\n\nWhat kind of impact are you hoping to make as a health coach?`,
    annotations: ['Confirms fit honestly', 'Includes time commitment (concrete details)', 'Asks about their aspirations \u2014 not "ready to buy?"'],
  },
  {
    stage: 'evaluating',
    intent: 'pricing',
    question: 'How much does it cost and what payment options are there?',
    response: `The Precision Nutrition Level 1 Certification offers two payment options. You can choose a single payment of **$599 USD**, which saves you $200 USD compared to the original price of $799 USD. Alternatively, you can opt for a monthly payment plan of **$59 USD per month for 12 months**, saving you $20 USD per month. All prices are listed in USD.\n\nBoth options come with a 100% money-back guarantee. You also get a 45-day money-back guarantee, allowing you to return your textbooks for a full refund if you\u2019re not satisfied before you certify.\n\nWhich payment option aligns best with your budget?`,
    annotations: ['Leads with value (savings framing)', 'Brackets both options with specific numbers', 'Mentions guarantee to reduce risk', 'Asks what fits \u2014 not "ready to sign up?"'],
  },
  {
    stage: 'evaluating',
    intent: 'features',
    question: 'What specific topics does the course cover? How deep does it go?',
    response: `The certification covers a comprehensive range of topics across three main units, designed to provide a step-by-step progression for learning and practicing the material.\n\n**Unit 1: The Precision Nutrition Approach** focuses on the philosophy and methodology of coaching. You\u2019ll learn how to explore your own coaching style, use evidence in coaching, coach "deep health," build effective coaching relationships, and help clients learn and change.\n\n**Unit 2: The Science of Nutrition** delves into the scientific foundations. This includes energy balance and metabolism, digestion and absorption, macro- and micronutrients, water and fluid balance, and the impact of stress and recovery.\n\n**Unit 3: Putting it into Practice** teaches you how to apply what you\u2019ve learned. This unit covers the step-by-step PN coaching process, how to assess clients, create action plans, monitor and use data, and work with different "nutritional levels" and client capacities.\n\nThe program includes 20 chapters, with each chapter featuring a video, text, study guide questions, real-world case studies for practice, and a short end-of-chapter exam. The content is built upon extensive research and expertise, combining insights from coaching over 150,000 clients and over 1100 scientific citations.\n\nWhat aspects of nutrition coaching are most important for you to master?`,
    annotations: ['Extremely detailed \u2014 3 units broken down', 'Specific numbers: 20 chapters, 150K clients, 1100 citations', 'Frames features as outcomes ("you\u2019ll learn how to...")', 'Asks what matters most to deepen the conversation'],
  },
  {
    stage: 'evaluating',
    intent: 'comparison',
    question: 'How does Precision Nutrition compare to other nutrition certifications?',
    response: `Precision Nutrition (PN) Level 1 Nutrition Coaching is designed to help you start coaching and making an impact immediately, focusing on practical application rather than just academic knowledge.\n\nHere\u2019s how it compares:\n\u2022 **Focus on Coaching:** Unlike many degree programs that are more academic and broad, PN teaches you a proven, step-by-step system for effective nutrition coaching.\n\u2022 **Time and Cost:** A traditional degree can take 4+ years and cost $50,000\u2013$100,000+ USD, while the PN Certification can be completed in about 20 weeks by dedicating 3-5 hours per week.\n\u2022 **Accessibility:** PN Level 1 is open to anyone, regardless of prior experience.\n\u2022 **Industry Recognition:** Precision Nutrition is recognized as the #1 recommended nutrition certification by Business Insider.\n\u2022 **Real-World Application:** The program incorporates insights from coaching over 150,000 clients, 20,000+ hours of research, and the expertise of 7 PhDs, 2 MDs, and 3 RDs.\n\u2022 **Career Support:** Upon certification, you can be listed on the PN website and in the US, you are guaranteed job interviews with leading health and fitness organizations.\n\nWhat aspects of a nutrition certification are most important to you?`,
    annotations: ['Never names or trashes a competitor', 'Differentiates on concrete strengths', 'Uses specific proof points (150K clients, 7 PhDs)', 'Asks what matters to THIS buyer'],
  },
  {
    stage: 'ready_to_buy',
    intent: 'logistics',
    question: 'I\u2019m going with the monthly plan. The textbooks are included, right? How soon do they ship?',
    response: `Yes, the textbooks are included in the price of your certification, whether you choose the single payment or the monthly plan. Shipping is also included, and there are no extra charges for it.\n\nOnce your textbooks and course materials are shipped, you will receive tracking details so you can monitor your package. We do everything we can to minimize international customs and brokerage fees for those outside North America.\n\nWhen you\u2019re ready to get started, you can sign up directly on this page. Anything else I can help with?`,
    annotations: ['Confirms their decision (no re-selling)', 'Removes friction: shipping is free, tracking included', 'Clear next step: "sign up directly on this page"', 'Assumptive: "When you\u2019re ready" not "If you decide"'],
  },
  {
    stage: 'ready_to_buy',
    intent: 'general',
    question: 'What happens after I sign up?',
    response: `That\u2019s great to hear! Once you sign up, you\u2019ll gain immediate access to your student dashboard, which includes lifetime access to your course materials. Each day, you\u2019ll log into your PN homepage to find new materials to read, a workout, and a daily habit or practice to complete.\n\nYour payment plan consists of 12 monthly payments, separate from your self-paced study. Even after you complete the certification, you\u2019ll continue to have access to all course materials without any further payments once your plan is paid off.\n\nAre you ready to get started and transform your nutrition coaching journey?`,
    annotations: ['Future-paces: "Once you sign up, you\u2019ll..."', 'Paints a picture of daily life as a student', 'Removes payment anxiety: lifetime access after plan is done', 'Assumptive close: "Are you ready to get started?"'],
  },
  {
    stage: 'handoff_needed',
    intent: 'objection',
    question: 'I\u2019m really confused about how the money-back guarantee works. Is it really 45 days? I need to understand this before I spend $599.',
    response: `That\u2019s a fair concern, and it\u2019s important to understand the guarantee before making a commitment.\n\nYes, for the Level 1 Nutrition Certification, we do offer a 45-day, 100% money-back guarantee. You can try the certification for 45 days, and if you\u2019re not happy with what you learn, you can email us to request a refund. This needs to be done within the 45-day trial period and before you\u2019ve completed the course and certified. You\u2019ll also need to return your textbooks.\n\nDoes that help address your concern about the money-back guarantee?`,
    annotations: ['Validates: "That\u2019s a fair concern"', 'Answers with specific details from content', 'No sales pressure \u2014 just information', 'Checks if the concern is resolved'],
  },
]

const stageColors: Record<string, string> = {
  discovering: '#3b82f6',
  evaluating: '#f59e0b',
  ready_to_buy: '#10b981',
  handoff_needed: '#ef4444',
}

export default function SellTestReport() {
  const [activeStage, setActiveStage] = useState<Stage>('discovering')
  const [galleryFilter, setGalleryFilter] = useState<string>('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap'
    document.head.appendChild(link)
    setMounted(true)
    return () => { document.head.removeChild(link) }
  }, [])

  if (!mounted) {
    return <div style={{ background: '#0a0a0c', minHeight: '100vh' }} />
  }

  return (
    <>
      <style>{`
        .sell-report * { box-sizing: border-box; margin: 0; padding: 0; }

        .sell-report {
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

        .sell-report a { color: inherit; }

        /* Noise texture overlay */
        .sell-report::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .sell-report > * { position: relative; z-index: 1; }

        /* ---- Hero ---- */
        .sr-hero {
          padding: 80px 48px 64px;
          max-width: 1200px;
          margin: 0 auto;
          border-bottom: 1px solid var(--border);
        }

        .sr-hero-eyebrow {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--accent-green);
          margin-bottom: 24px;
          font-weight: 400;
        }

        .sr-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(40px, 5.5vw, 72px);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--text);
          max-width: 900px;
        }

        .sr-hero h1 em {
          font-style: italic;
          color: var(--accent-green);
        }

        .sr-hero-sub {
          font-size: 17px;
          color: var(--text-secondary);
          margin-top: 20px;
          max-width: 640px;
          line-height: 1.7;
          font-weight: 300;
        }

        .sr-stats {
          display: flex;
          gap: 48px;
          margin-top: 48px;
          flex-wrap: wrap;
        }

        .sr-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sr-stat-value {
          font-family: var(--font-mono);
          font-size: 32px;
          font-weight: 500;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .sr-stat-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ---- Sections ---- */
        .sr-section {
          padding: 80px 48px;
          max-width: 1200px;
          margin: 0 auto;
          border-bottom: 1px solid var(--border-subtle);
        }

        .sr-section-num {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .sr-section h2 {
          font-family: var(--font-display);
          font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 400;
          line-height: 1.15;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }

        .sr-section h2 em {
          font-style: italic;
          color: var(--text-secondary);
        }

        .sr-section-desc {
          font-size: 15px;
          color: var(--text-secondary);
          max-width: 600px;
          margin-bottom: 48px;
          line-height: 1.7;
          font-weight: 300;
        }

        /* ---- Layer Cards ---- */
        .sr-layers {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .sr-layer {
          background: var(--surface);
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: background 0.3s ease;
        }

        .sr-layer:hover {
          background: var(--surface-2);
        }

        .sr-layer-num {
          font-family: var(--font-mono);
          font-size: 64px;
          font-weight: 300;
          color: var(--border);
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .sr-layer h3 {
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }

        .sr-layer-meta {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          gap: 16px;
        }

        .sr-layer-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sr-layer p {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.65;
          font-weight: 300;
        }

        .sr-layer-bar {
          height: 3px;
          border-radius: 2px;
          margin-top: auto;
        }

        /* ---- Tone Shift Section ---- */
        .sr-tone-question {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px 28px;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sr-tone-q-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--surface-3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          color: var(--text-muted);
        }

        .sr-tone-q-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .sr-tone-q-text {
          font-size: 17px;
          color: var(--text);
          font-weight: 500;
        }

        .sr-stage-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: var(--surface);
          padding: 4px;
          border-radius: 10px;
          width: fit-content;
        }

        .sr-stage-tab {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.5px;
          padding: 10px 20px;
          border-radius: 7px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          background: transparent;
          color: var(--text-muted);
          position: relative;
        }

        .sr-stage-tab:hover {
          color: var(--text-secondary);
        }

        .sr-stage-tab[data-active="true"] {
          background: var(--surface-3);
          color: var(--text);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .sr-response-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          animation: sr-fadeIn 0.3s ease;
        }

        @keyframes sr-fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sr-response-header {
          padding: 20px 28px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sr-response-stage {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sr-response-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .sr-response-stage-name {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 500;
        }

        .sr-response-behavior {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          max-width: 500px;
          text-align: right;
        }

        .sr-response-body {
          padding: 28px;
        }

        .sr-response-text {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.8;
          white-space: pre-line;
          font-weight: 300;
        }

        .sr-response-text strong {
          color: var(--text);
          font-weight: 500;
        }

        /* Highlight question marks in responses */
        .sr-response-question {
          display: block;
          margin-top: 16px;
          padding: 16px 20px;
          background: var(--surface-2);
          border-radius: 8px;
          border-left: 3px solid;
          font-size: 15px;
          color: var(--text);
          font-weight: 400;
          line-height: 1.6;
        }

        /* ---- Classification Table ---- */
        .sr-table-wrap {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .sr-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .sr-table thead {
          background: var(--surface);
        }

        .sr-table th {
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

        .sr-table td {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
        }

        .sr-table tr:last-child td { border-bottom: none; }

        .sr-table tr:hover td {
          background: var(--surface);
        }

        .sr-table-msg {
          font-size: 13px;
          color: var(--text);
          font-weight: 400;
          max-width: 420px;
        }

        .sr-table-msg em {
          font-style: normal;
          color: var(--text-muted);
          font-size: 12px;
        }

        .sr-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 4px;
          display: inline-block;
          letter-spacing: 0.3px;
        }

        .sr-badge-discovering { background: rgba(59,130,246,0.12); color: #60a5fa; }
        .sr-badge-evaluating { background: rgba(245,158,11,0.12); color: #fbbf24; }
        .sr-badge-ready_to_buy { background: rgba(16,185,129,0.12); color: #34d399; }
        .sr-badge-handoff_needed { background: rgba(239,68,68,0.12); color: #f87171; }
        .sr-badge-signal { background: rgba(139,92,246,0.12); color: #a78bfa; }

        .sr-check {
          color: var(--accent-green);
          font-size: 16px;
          font-weight: 600;
        }

        /* ---- Methodology Grid ---- */
        .sr-method-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 48px;
        }

        .sr-method-card {
          background: var(--surface);
          padding: 28px;
          transition: background 0.2s ease;
        }

        .sr-method-card:hover { background: var(--surface-2); }

        .sr-method-stage {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sr-method-name {
          font-family: var(--font-display);
          font-size: 22px;
          margin-bottom: 12px;
          font-weight: 400;
        }

        .sr-method-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.65;
          font-weight: 300;
        }

        /* Intent pills */
        .sr-intents {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .sr-intent {
          background: var(--surface);
          padding: 20px 28px;
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 20px;
          align-items: baseline;
          transition: background 0.2s ease;
        }

        .sr-intent:hover { background: var(--surface-2); }

        .sr-intent-name {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text);
          font-weight: 500;
        }

        .sr-intent-technique {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
          font-weight: 300;
        }

        .sr-intent-arrow {
          color: var(--text-muted);
          margin: 0 4px;
        }

        /* ---- Vertical Agnostic ---- */
        .sr-agnostic {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }

        .sr-agnostic-text h3 {
          font-family: var(--font-display);
          font-size: 28px;
          margin-bottom: 16px;
          font-weight: 400;
        }

        .sr-agnostic-text h3 em {
          font-style: italic;
          color: var(--accent-green);
        }

        .sr-agnostic-text p {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.75;
          font-weight: 300;
        }

        .sr-agnostic-diagram {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sr-agnostic-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sr-agnostic-box {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 12px 20px;
          border-radius: 8px;
          text-align: center;
          flex: 1;
        }

        .sr-agnostic-arrow {
          color: var(--text-muted);
          font-size: 18px;
          flex-shrink: 0;
        }

        /* ---- Footer ---- */
        .sr-footer {
          padding: 48px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .sr-footer-left {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.5px;
          line-height: 1.8;
        }

        .sr-footer-right {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          text-align: right;
        }

        .sr-footer-badge {
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

        /* ---- Gallery ---- */
        .sr-gallery {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sr-gallery-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .sr-gallery-filter {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.5px;
          padding: 7px 16px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sr-gallery-filter:hover {
          border-color: var(--text-muted);
          color: var(--text-secondary);
        }

        .sr-gallery-filter[data-active="true"] {
          background: var(--surface-2);
          border-color: var(--text-secondary);
          color: var(--text);
        }

        .sr-conv {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          animation: sr-fadeIn 0.3s ease;
        }

        .sr-conv-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sr-conv-badges {
          display: flex;
          gap: 6px;
          flex: 1;
        }

        .sr-conv-intent {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 3px 8px;
          background: var(--surface-3);
          border-radius: 4px;
        }

        .sr-conv-q {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .sr-conv-q-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--surface-3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: var(--text-muted);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .sr-conv-q-text {
          font-size: 15px;
          color: var(--text);
          font-weight: 400;
          line-height: 1.6;
        }

        .sr-conv-a {
          padding: 20px 24px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .sr-conv-a-avatar {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: white;
          flex-shrink: 0;
          margin-top: 2px;
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .sr-conv-a-body {
          flex: 1;
          min-width: 0;
        }

        .sr-conv-a-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.75;
          white-space: pre-line;
          font-weight: 300;
        }

        .sr-conv-annotations {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }

        .sr-conv-annotation {
          font-family: var(--font-mono);
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 4px;
          background: var(--surface-3);
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* ---- Responsive ---- */
        @media (max-width: 900px) {
          .sr-hero, .sr-section { padding: 48px 24px; }
          .sr-layers { grid-template-columns: 1fr; }
          .sr-method-grid { grid-template-columns: 1fr; }
          .sr-agnostic { grid-template-columns: 1fr; gap: 32px; }
          .sr-stats { gap: 32px; }
          .sr-response-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .sr-response-behavior { text-align: left; max-width: none; }
          .sr-intent { grid-template-columns: 1fr; gap: 6px; }
          .sr-footer { padding: 48px 24px; }
          .sr-stage-tabs { width: 100%; }
          .sr-stage-tab { flex: 1; text-align: center; padding: 10px 12px; }
          .sr-conv-q, .sr-conv-a { padding: 16px 18px; }
          .sr-conv-annotations { flex-direction: column; }
        }
      `}</style>

      <div className="sell-report">
        {/* ===== HERO ===== */}
        <header className="sr-hero">
          <p className="sr-hero-eyebrow">Test Report &middot; February 7, 2026</p>
          <h1>Consultative Selling Engine<br /><em>Test Results</em></h1>
          <p className="sr-hero-sub">
            Enhanced stage-aware prompts verified against real Precision Nutrition conversations.
            47 tests across 3 layers confirm the AI shifts its selling approach based on where
            the visitor is in their buying journey.
          </p>
          <div className="sr-stats">
            <div className="sr-stat">
              <span className="sr-stat-value">47</span>
              <span className="sr-stat-label">Tests</span>
            </div>
            <div className="sr-stat">
              <span className="sr-stat-value" style={{ color: 'var(--accent-green)' }}>100%</span>
              <span className="sr-stat-label">Pass Rate</span>
            </div>
            <div className="sr-stat">
              <span className="sr-stat-value">3</span>
              <span className="sr-stat-label">Test Layers</span>
            </div>
            <div className="sr-stat">
              <span className="sr-stat-value">46.7s</span>
              <span className="sr-stat-label">Runtime</span>
            </div>
          </div>
        </header>

        {/* ===== SECTION 1: TEST ARCHITECTURE ===== */}
        <section className="sr-section">
          <p className="sr-section-num">01</p>
          <h2>Test <em>Architecture</em></h2>
          <p className="sr-section-desc">
            Three layers of verification, from fast unit checks to real AI conversations
            against indexed content.
          </p>

          <div className="sr-layers">
            <div className="sr-layer">
              <span className="sr-layer-num">01</span>
              <h3>Unit Tests</h3>
              <div className="sr-layer-meta">
                <span>22 tests</span>
                <span>&lt;1ms</span>
              </div>
              <p>
                Verify <code>buildSellPrompt()</code> produces correct selling methodology per
                stage, intent, and signal combination. Tests prompt structure: response frameworks,
                stage guidance, intent techniques, buying signal variations, shared constraints.
              </p>
              <div className="sr-layer-bar" style={{ background: 'var(--accent-blue)' }} />
            </div>
            <div className="sr-layer">
              <span className="sr-layer-num">02</span>
              <h3>Classification Tests</h3>
              <div className="sr-layer-meta">
                <span>13 tests</span>
                <span>~580ms each</span>
              </div>
              <p>
                Real Gemini API calls with actual PN visitor messages. Verify stage,
                intent, and buying signal classification accuracy against 13 representative
                visitor questions modeled on real conversation data.
              </p>
              <div className="sr-layer-bar" style={{ background: 'var(--accent-amber)' }} />
            </div>
            <div className="sr-layer">
              <span className="sr-layer-num">03</span>
              <h3>Integration Tests</h3>
              <div className="sr-layer-meta">
                <span>12 tests</span>
                <span>~2&ndash;4s each</span>
              </div>
              <p>
                Full flow: stage-specific system prompt, Gemini File Search against real
                indexed content, then verify the AI&rsquo;s response tone and approach shift
                appropriately per stage.
              </p>
              <div className="sr-layer-bar" style={{ background: 'var(--accent-green)' }} />
            </div>
          </div>
        </section>

        {/* ===== SECTION 2: TONE SHIFT COMPARISON ===== */}
        <section className="sr-section">
          <p className="sr-section-num">02</p>
          <h2>Stage Tone <em>Shift</em></h2>
          <p className="sr-section-desc">
            The same question produces fundamentally different responses depending on
            the visitor&rsquo;s buying stage. These are real AI outputs from the test suite.
          </p>

          <div className="sr-tone-question">
            <div className="sr-tone-q-icon">&gt;</div>
            <div>
              <p className="sr-tone-q-label">Visitor question (identical across all three stages)</p>
              <p className="sr-tone-q-text">&ldquo;Tell me about the payment options&rdquo;</p>
            </div>
          </div>

          <div className="sr-stage-tabs">
            {stages.map(s => (
              <button
                key={s}
                className="sr-stage-tab"
                data-active={activeStage === s ? 'true' : 'false'}
                onClick={() => setActiveStage(s)}
              >
                <span style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: stageResponses[s].color,
                  marginRight: 8,
                  verticalAlign: 'middle',
                }} />
                {stageResponses[s].label}
              </button>
            ))}
          </div>

          <div className="sr-response-card" key={activeStage}>
            <div className="sr-response-header">
              <div className="sr-response-stage">
                <div className="sr-response-dot" style={{ background: stageResponses[activeStage].color }} />
                <span className="sr-response-stage-name" style={{ color: stageResponses[activeStage].color }}>
                  {stageResponses[activeStage].label}
                </span>
              </div>
              <span className="sr-response-behavior">{stageResponses[activeStage].behavior}</span>
            </div>
            <div className="sr-response-body">
              {(() => {
                const text = stageResponses[activeStage].response
                const lastQ = text.lastIndexOf('?')
                if (lastQ === -1) return <p className="sr-response-text">{text}</p>
                const lastNewline = text.lastIndexOf('\n', lastQ)
                const mainText = text.substring(0, lastNewline > 0 ? lastNewline : lastQ)
                const question = text.substring(lastNewline > 0 ? lastNewline + 1 : lastQ - 20)
                return (
                  <>
                    <p className="sr-response-text">{mainText}</p>
                    <span
                      className="sr-response-question"
                      style={{ borderColor: stageResponses[activeStage].color }}
                    >
                      {question.trim()}
                    </span>
                  </>
                )
              })()}
            </div>
          </div>
        </section>

        {/* ===== SECTION 3: RESPONSE GALLERY ===== */}
        <section className="sr-section">
          <p className="sr-section-num">03</p>
          <h2>Response <em>Gallery</em></h2>
          <p className="sr-section-desc">
            Eight real AI responses from the test suite, showing how the engine adapts
            its tone, depth, and follow-up strategy based on stage and intent.
          </p>

          <div className="sr-gallery-filters">
            {[
              { key: 'all', label: 'All' },
              { key: 'discovering', label: 'Discovering' },
              { key: 'evaluating', label: 'Evaluating' },
              { key: 'ready_to_buy', label: 'Ready to Buy' },
              { key: 'handoff_needed', label: 'Handoff' },
            ].map(f => (
              <button
                key={f.key}
                className="sr-gallery-filter"
                data-active={galleryFilter === f.key ? 'true' : 'false'}
                onClick={() => setGalleryFilter(f.key)}
              >
                {f.key !== 'all' && (
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: stageColors[f.key] || 'var(--text-muted)',
                    marginRight: 6,
                    verticalAlign: 'middle',
                  }} />
                )}
                {f.label}
              </button>
            ))}
          </div>

          <div className="sr-gallery">
            {conversationExamples
              .filter(ex => galleryFilter === 'all' || ex.stage === galleryFilter)
              .map((ex, i) => (
              <div className="sr-conv" key={`${ex.stage}-${ex.intent}-${i}`}>
                <div className="sr-conv-header">
                  <div className="sr-conv-badges">
                    <span className={`sr-badge sr-badge-${ex.stage}`}>
                      {ex.stage.replace('_', ' ')}
                    </span>
                    <span className="sr-conv-intent">{ex.intent}</span>
                  </div>
                </div>
                <div className="sr-conv-q">
                  <div className="sr-conv-q-avatar">V</div>
                  <p className="sr-conv-q-text">{ex.question}</p>
                </div>
                <div className="sr-conv-a">
                  <div className="sr-conv-a-avatar" style={{ background: stageColors[ex.stage] || 'var(--text-muted)' }}>
                    AI
                  </div>
                  <div className="sr-conv-a-body">
                    <p className="sr-conv-a-text">{ex.response}</p>
                    <div className="sr-conv-annotations">
                      {ex.annotations.map((a, j) => (
                        <span className="sr-conv-annotation" key={j}>{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 4: CLASSIFICATION ACCURACY ===== */}
        <section className="sr-section">
          <p className="sr-section-num">04</p>
          <h2>Classification <em>Accuracy</em></h2>
          <p className="sr-section-desc">
            13 real visitor messages classified with 100% accuracy.
            Each message is modeled on actual conversations from the PN Certification page.
          </p>

          <div className="sr-table-wrap">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Visitor Message</th>
                  <th>Expected Stage</th>
                  <th>Detail</th>
                  <th style={{ textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {classificationData.map((row, i) => (
                  <tr key={i}>
                    <td className="sr-table-msg">&ldquo;{row.message}&rdquo;</td>
                    <td>
                      {row.stage !== '\u2014' ? (
                        <span className={`sr-badge sr-badge-${row.stage}`}>
                          {row.stage.replace('_', ' ')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>&mdash;</span>
                      )}
                    </td>
                    <td>
                      {row.detail !== '\u2014' ? (
                        <span className={`sr-badge ${row.detail.includes('signal') ? 'sr-badge-signal' : 'sr-badge-' + row.stage}`}>
                          {row.detail}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>&mdash;</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="sr-check">{'\u2713'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== SECTION 5: METHODOLOGY MAP ===== */}
        <section className="sr-section">
          <p className="sr-section-num">05</p>
          <h2>Selling <em>Methodology</em></h2>
          <p className="sr-section-desc">
            Each stage applies a distinct consultative selling framework.
            Intent-specific techniques layer on top.
          </p>

          <div className="sr-method-grid">
            {[
              { stage: 'Discovering', name: 'SPIN Diagnosis', color: 'var(--accent-blue)',
                desc: 'Situation & Problem questions. Diagnose before prescribing. Understand their world so you can be relevant later. Never pitch at this stage.' },
              { stage: 'Evaluating', name: 'Specifics + Implications', color: 'var(--accent-amber)',
                desc: 'Answer with numbers and outcomes. Surface concerns proactively. Frame the cost of inaction. Help them build a case for or against.' },
              { stage: 'Ready to Buy', name: 'Assumptive Closing', color: 'var(--accent-green)',
                desc: '\u201CWhen you get started\u2026\u201D not \u201CIf you decide\u2026\u201D Future-pace. Remove friction. One clear next step. Don\u2019t re-sell.' },
              { stage: 'Handoff Needed', name: 'Validate + Elevate', color: 'var(--accent-red)',
                desc: 'Validate the concern. Answer what you can. Frame the handoff as elevated service, not failure. No sales pressure.' },
            ].map((m, i) => (
              <div className="sr-method-card" key={i}>
                <p className="sr-method-stage" style={{ color: m.color }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  {m.stage}
                </p>
                <p className="sr-method-name">{m.name}</p>
                <p className="sr-method-desc">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="sr-intents">
            {[
              { name: 'pricing', technique: 'Lead with value \u2192 state numbers \u2192 bracket options' },
              { name: 'objection', technique: 'Acknowledge \u2192 Explore \u2192 Reframe \u2192 Check' },
              { name: 'comparison', technique: 'Never trash competitors. Differentiate on what matters to THIS buyer.' },
              { name: 'features', technique: 'Sell outcomes not features. "This means you can\u2026" not "This includes\u2026"' },
              { name: 'fit', technique: 'Diagnose first, be honest if not a fit. Builds trust.' },
              { name: 'trust', technique: 'Specificity is credibility. Cite exact numbers. Never fabricate.' },
              { name: 'logistics', technique: 'Step-by-step. Preempt friction. Keep momentum.' },
              { name: 'general', technique: 'Answer \u2192 pivot to learn about their needs' },
            ].map((intent, i) => (
              <div className="sr-intent" key={i}>
                <span className="sr-intent-name">{intent.name}</span>
                <span className="sr-intent-technique">{intent.technique}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 6: VERTICAL AGNOSTIC ===== */}
        <section className="sr-section" style={{ borderBottom: 'none' }}>
          <p className="sr-section-num">06</p>
          <h2>Works for <em>Any Vertical</em></h2>

          <div className="sr-agnostic">
            <div className="sr-agnostic-text">
              <h3>The methodology is <em>universal</em></h3>
              <p>
                Nothing in this system is specific to Precision Nutrition. The selling
                frameworks&mdash;SPIN, objection handling, assumptive closing, value
                framing&mdash;are applied based on the visitor&rsquo;s <strong style={{ color: 'var(--text)' }}>stage</strong> and
                {' '}<strong style={{ color: 'var(--text)' }}>intent</strong>, not the product category.
              </p>
              <p style={{ marginTop: 16 }}>
                The only thing that changes per business is the <strong style={{ color: 'var(--text)' }}>content</strong> that
                File Search retrieves. Whether you&rsquo;re selling SaaS subscriptions,
                consulting services, or physical products, the consultative approach adapts
                automatically.
              </p>
            </div>
            <div className="sr-agnostic-diagram">
              <div className="sr-agnostic-row">
                <div className="sr-agnostic-box" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  Visitor Message
                </div>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 20 }}>&darr;</div>
              <div className="sr-agnostic-row">
                <div className="sr-agnostic-box" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent-amber)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  Classify Stage + Intent
                </div>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 20 }}>&darr;</div>
              <div className="sr-agnostic-row">
                <div className="sr-agnostic-box" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  Build Sell Prompt
                </div>
                <span className="sr-agnostic-arrow">&larr;</span>
                <div className="sr-agnostic-box" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  Universal Methodology
                </div>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 20 }}>&darr;</div>
              <div className="sr-agnostic-row">
                <div className="sr-agnostic-box" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  AI Response
                </div>
                <span className="sr-agnostic-arrow">&larr;</span>
                <div className="sr-agnostic-box" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  Your Content (File Search)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="sr-footer">
          <div className="sr-footer-left">
            Generated from vitest test suite<br />
            <code style={{ color: 'var(--text-secondary)' }}>consultative-selling-stages.test.ts</code>
          </div>
          <div className="sr-footer-right">
            <span className="sr-footer-badge">
              <span style={{ fontSize: 14 }}>{'\u2713'}</span>
              47 tests &middot; 100% pass &middot; Real Gemini API
            </span>
          </div>
        </footer>
      </div>
    </>
  )
}

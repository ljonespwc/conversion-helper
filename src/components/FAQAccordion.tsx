'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqItems = [
  {
    question: '"We already have live chat on our website."',
    answer: [
      'Live chat means typing and waiting. Your visitors type a question, then stare at "An agent will be with you shortly" for 4 minutes. Half of them leave.',
      'EasyAsk uses voice for instant answers. No queue. No staffing. No wait time. And it\'s built for sales conversations, not support tickets—so it captures intent and purchase signals, not complaint categories.',
    ],
  },
  {
    question: '"Why wouldn\'t I just embed ChatGPT or Claude on my site?"',
    answer: [
      'Generic AI hallucinates. It sounds confident while saying something completely wrong about your product. That\'s not a sales tool—it\'s a brand risk.',
      'EasyAsk only answers from content you provide. Scraped pages, uploaded docs, nothing else. Plus it captures leads when it can\'t answer, escalates to your sales team, and gives you analytics on every conversation. It\'s built for conversion, not just conversation.',
    ],
  },
  {
    question: '"Our prospects won\'t want to talk to a website."',
    answer: [
      'They don\'t have to. EasyAsk supports voice AND text—visitors choose.',
      'But here\'s what we\'ve seen: voice drops friction dramatically, especially on mobile. People say more than they type. They ask follow-ups. They engage longer. And either way, you see what they asked—intent signals you\'d never get from a static page.',
    ],
  },
  {
    question: '"What if the AI gives wrong answers?"',
    answer: [
      'It only answers from content you provide. No inventing. No hallucinating.',
      'If the AI doesn\'t have an answer, it doesn\'t fake one. It captures the visitor\'s email and exact question, then flags the conversation for your team. You\'re in complete control of what it knows. And satisfaction ratings on every response let you catch issues fast.',
    ],
  },
  {
    question: '"We don\'t have budget for another tool."',
    answer: [
      'What\'s the cost of losing 3 prospects this month because they couldn\'t find an answer? Or 10?',
      'If EasyAsk converts even 2-3 extra leads, it pays for itself. There\'s no implementation cost—you set it up yourself in minutes. No dev team. No procurement process. No six-month "pilot program."',
    ],
  },
  {
    question: '"Does it integrate with our CRM?"',
    answer: [
      'EasyAsk captures emails and full conversation context. You can export that data or connect it to your existing tools.',
      'But the real value isn\'t CRM integration—it\'s the conversations happening BEFORE someone fills out a form. Intent signals from anonymous visitors. Questions that reveal objections. Insights you\'d never get otherwise. The CRM gets the lead after EasyAsk captures it.',
    ],
  },
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="landing-faq-list">
      {faqItems.map((item, index) => (
        <div
          key={index}
          className="landing-faq-item"
          data-open={openIndex === index}
        >
          <div
            className="landing-faq-question"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <h3 style={{ margin: 0 }}>{item.question}</h3>
            <ChevronDown className="landing-faq-icon" size={20} />
          </div>
          <div className="landing-faq-answer">
            {item.answer.map((paragraph, pIndex) => (
              <p key={pIndex}>{paragraph}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

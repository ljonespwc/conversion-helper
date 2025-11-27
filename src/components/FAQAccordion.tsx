'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqItems = [
  {
    question: 'How is this different from live chat?',
    answer: [
      'Live chat requires someone to answer. Your visitor types a question, sees "An agent will be with you shortly," and waits. If it\'s after hours, they get a form. If your team is busy, they wait longer. Most leave before anyone responds.',
      'EasyAsk answers instantly—24/7—using voice or text. No staffing required. No queue. And because it only knows your content, the answers are accurate and consistent every time. It\'s also built for sales conversations, not support tickets. It captures purchase intent and escalates to your team when needed, instead of just deflecting to a help article.',
    ],
  },
  {
    question: 'Why wouldn\'t I just use ChatGPT or Claude?',
    answer: [
      'Generic AI makes things up. It\'ll confidently tell your prospect something completely wrong about your pricing, your features, or your policies. That\'s not a sales tool—it\'s a liability.',
      'EasyAsk only answers from content you provide: your pages, your docs, your sales materials. Nothing else. If it doesn\'t know something, it says so and captures the visitor\'s email so your team can follow up. You also get analytics on every conversation—what people ask, how satisfied they are, and how likely they are to buy. It\'s built for conversion, not just conversation.',
    ],
  },
  {
    question: 'Will visitors actually talk to my website?',
    answer: [
      'They don\'t have to talk—they can read the AI\'s response as text while it speaks. But voice removes a lot of friction, especially on mobile. People say more than they type. They ask follow-up questions. They stay engaged longer.',
      'What matters most is that visitors get answers instantly. And you see every question they ask. That\'s intent data you\'d never get from a static page or a form they didn\'t fill out.',
    ],
  },
  {
    question: 'What if the AI gives wrong answers?',
    answer: [
      'It can only answer from content you provide. No outside knowledge. No inventing. No hallucinating.',
      'If the AI doesn\'t have an answer, it tells the visitor honestly and offers to capture their email so your team can follow up with the right information. You\'re in complete control of what it knows—scrape pages, upload docs, remove anything outdated. And every response includes a satisfaction rating, so you\'ll know immediately if something isn\'t working.',
    ],
  },
  {
    question: 'What does it cost?',
    answer: [
      'We\'re currently in early access, so pricing isn\'t finalized yet. Sign up and we\'ll work with you directly to get you set up.',
      'What we can tell you: there are no setup fees, no implementation costs, and you can set it up yourself in under 10 minutes. No dev team required. No six-month "pilot program."',
    ],
  },
  {
    question: 'Does it integrate with my CRM?',
    answer: [
      'EasyAsk captures emails, conversation transcripts, and purchase intent signals. You can export that data anytime or connect it to your existing tools via webhook.',
      'But the real value isn\'t the CRM integration—it\'s what happens before someone fills out a form. You\'re seeing questions from anonymous visitors who would have bounced. You\'re learning what objections people have. You\'re getting intent signals that no form or CRM could ever capture. The CRM gets the lead after EasyAsk surfaces it.',
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

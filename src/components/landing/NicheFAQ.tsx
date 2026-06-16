'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

export function NicheFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="landing-faq-list">
      {items.map((item, index) => (
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
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

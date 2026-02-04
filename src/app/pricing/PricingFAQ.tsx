'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FAQItem } from './page'

function PricingFAQItem({ item, isOpen, onToggle }: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="landing-faq-item" data-open={isOpen}>
      <div className="landing-faq-question" onClick={onToggle}>
        <h3 style={{ margin: 0 }}>{item.question}</h3>
        <ChevronDown className="landing-faq-icon" size={20} />
      </div>
      <div className="landing-faq-answer">
        {item.answer.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}

export function PricingFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="landing-faq-list">
      {items.map((item, index) => (
        <PricingFAQItem
          key={index}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  )
}

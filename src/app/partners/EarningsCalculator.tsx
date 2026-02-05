'use client'

import { useState, useEffect, useRef } from 'react'

const plans = [
  { name: 'Starter', price: 129 },
  { name: 'Growth', price: 299 },
] as const

type PlanName = typeof plans[number]['name']

export function EarningsCalculator() {
  const [referrals, setReferrals] = useState(5)
  const [selectedPlan, setSelectedPlan] = useState<PlanName>('Growth')
  const [isAnimating, setIsAnimating] = useState(false)
  const prevTotal = useRef(0)

  const plan = plans.find(p => p.name === selectedPlan)!
  const customerPays = plan.price * 0.80
  const partnerEarns = customerPays * 0.40
  const cumulativeMonths = 78 // sum of 1+2+...+12
  const annualTotal = referrals * partnerEarns * cumulativeMonths

  useEffect(() => {
    if (prevTotal.current !== annualTotal) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      prevTotal.current = annualTotal
      return () => clearTimeout(timer)
    }
  }, [annualTotal])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="partner-calculator">
      {/* Slider */}
      <div style={{ marginBottom: '2rem' }}>
        <label
          htmlFor="referrals"
          style={{
            display: 'block',
            fontSize: 'var(--landing-font-size-x-small)',
            fontWeight: 600,
            color: 'var(--landing-color-text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          Referrals per month: <span style={{ color: 'rgb(234, 88, 12)' }}>{referrals}</span>
        </label>
        <input
          id="referrals"
          type="range"
          min={1}
          max={20}
          value={referrals}
          onChange={(e) => setReferrals(Number(e.target.value))}
          className="partner-slider"
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--landing-font-size-xxxx-small)',
          color: 'var(--landing-color-text-muted)',
          marginTop: '0.25rem',
        }}>
          <span>1</span>
          <span>20</span>
        </div>
      </div>

      {/* Plan Toggle */}
      <div style={{ marginBottom: '2rem' }}>
        <span
          style={{
            display: 'block',
            fontSize: 'var(--landing-font-size-x-small)',
            fontWeight: 600,
            color: 'var(--landing-color-text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          Their plan
        </span>
        <div className="partner-plan-toggle">
          {plans.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelectedPlan(p.name)}
              className={`partner-plan-btn ${selectedPlan === p.name ? 'partner-plan-btn--active' : ''}`}
            >
              {p.name} (${p.price}/mo)
            </button>
          ))}
        </div>
      </div>

      {/* Earnings Display */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: 'var(--landing-font-size-xxxx-small)',
          color: 'var(--landing-color-text-muted)',
          margin: '0 0 0.5rem 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}>
          Your projected first-year earnings
        </p>
        <p className={`partner-earnings-amount ${isAnimating ? 'partner-earnings-animating' : ''}`}>
          {formatCurrency(annualTotal)}
        </p>
        <p className="partner-breakdown">
          {referrals} referral{referrals > 1 ? 's' : ''}/mo &times; {formatCurrency(partnerEarns)}/referral &times; {cumulativeMonths} cumulative months = {formatCurrency(annualTotal)}/yr
        </p>
        <p style={{
          fontSize: 'var(--landing-font-size-xxxx-small)',
          color: 'var(--landing-color-text-muted)',
          margin: '1rem 0 0 0',
          fontStyle: 'italic',
        }}>
          Revenue compounds — each new referral adds to your monthly total.
        </p>
      </div>
    </div>
  )
}

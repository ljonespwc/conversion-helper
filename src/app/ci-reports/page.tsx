'use client'

import { useState } from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

type Tab = 'profiles' | 'seo' | 'threats' | 'positioning' | 'summary'

export default function CIReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profiles')

  return (
    <div className={`${inter.className} bg-surface text-ink antialiased`}>
      <style>{`
        html { scroll-behavior: smooth; }
        .ci-tier-1 { background: #FEE2E2; color: #991B1B; border-color: #FECACA; }
        .ci-tier-2 { background: #FEF3C7; color: #92400E; border-color: #FDE68A; }
        .ci-tier-3 { background: #E0E7FF; color: #3730A3; border-color: #C7D2FE; }
        .ci-strength-bar { height: 6px; border-radius: 3px; background: #E8E8E6; }
        .ci-strength-fill { height: 6px; border-radius: 3px; background: #E54D2E; }
        @keyframes ci-fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .ci-panel-active { animation: ci-fade-in 0.4s ease-out; }
        @media (max-width: 639px) {
          .ci-tab-bar-wrap::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 48px;
            background: linear-gradient(to right, transparent, white);
            pointer-events: none;
            z-index: 10;
          }
        }
      `}</style>

      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-border-subtle z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-toyo rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-bold text-ink text-lg tracking-tight">Hooli Intel</span>
          </div>
          <a
            href="#order"
            className="hidden sm:inline-flex items-center bg-toyo hover:bg-toyo-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Get report &mdash; $299
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero copy */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-ink mb-5">
              Your competitors just got profiled.<br className="hidden sm:block" /> Here&rsquo;s what we found.
            </h1>
            <p className="text-lg sm:text-xl text-ink-secondary leading-relaxed max-w-2xl mx-auto mb-6">
              A full competitive intelligence report on your market: 25+ competitor profiles, SEO gaps, positioning map, threat tier ranking. In your inbox in 48 hours. One flat price.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <a
                href="#order"
                className="bg-toyo hover:bg-toyo-dark text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors shadow-sm"
              >
                Get your report &mdash; $299
              </a>
            </div>
            <p className="text-sm text-ink-muted">$299 flat. 24-48 hour delivery. Full refund guarantee.</p>
          </div>

          {/* ── Embedded Sample Report ── */}
          <div className="bg-white rounded-2xl border border-border-subtle shadow-lg overflow-hidden">
            {/* Browser chrome */}
            <div className="bg-ink px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-white/60 text-sm ml-2 font-medium">Sample Report &mdash; Competitive Intelligence</span>
              </div>
              <span className="text-xs text-white/40 font-medium px-2 py-1 rounded bg-white/10">SAMPLE</span>
            </div>

            {/* Tab bar */}
            <div className="ci-tab-bar-wrap relative border-b border-border-subtle">
              <div className="px-6 pt-4 flex gap-2 overflow-x-auto pb-0">
                {(['profiles', 'seo', 'threats', 'positioning', 'summary'] as Tab[]).map((tab) => {
                  const labels: Record<Tab, string> = {
                    profiles: 'Competitor Profiles',
                    seo: 'SEO Gaps',
                    threats: 'Threat Tiers',
                    positioning: 'Positioning Map',
                    summary: 'Executive Summary',
                  }
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2.5 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-all ${
                        activeTab === tab
                          ? 'bg-toyo text-white'
                          : 'bg-white text-ink-secondary border border-border-subtle'
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Panel: Competitor Profiles ── */}
            {activeTab === 'profiles' && (
              <div key="profiles" className="ci-panel-active p-4 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-ink">29 Competitors Profiled</h3>
                    <p className="text-sm text-ink-muted">Each scored across traffic, content depth, brand clarity, and conversion signals</p>
                  </div>
                  <div className="hidden sm:flex gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full ci-tier-1">Tier 1</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full ci-tier-2">Tier 2</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full ci-tier-3">Tier 3</span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { name: 'Gumloop', tier: '1', meta: 'Visual agent builder · $70.6M raised · DR 71', traffic: '53.9K/mo', strength: 68, score: '21/25' },
                    { name: 'Lindy AI', tier: '1', meta: 'AI assistant · $50M raised · DR 76', traffic: '117.6K/mo', strength: 85, score: '20/25' },
                    { name: 'Relevance AI', tier: '1', meta: 'AI workforce · $37M Series B · DR 4', traffic: '25K/mo', strength: 45, score: '20/25' },
                    { name: 'n8n', tier: '1', meta: 'Open-source automation · 181K GitHub stars · DR 87', traffic: '2.6M/mo', strength: 95, score: '19/25' },
                    { name: 'Relay.app', tier: '1', meta: 'Collaborative automation · a16z backed · DR 73', traffic: '5.9K/mo', strength: 25, score: '18/25' },
                    { name: 'Zapier', tier: '2', meta: 'Automation giant · 2.2M+ customers · DR 91', traffic: '4.5M/mo', strength: 98, score: '14/25' },
                  ].map((c) => (
                    <div key={c.name} className="border border-border-subtle rounded-xl p-4 hover:border-[#E54D2E]/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-ink">{c.name}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ci-tier-${c.tier}`}>Tier {c.tier}</span>
                      </div>
                      <p className="text-xs text-ink-muted mb-3">{c.meta}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-ink-secondary">Traffic</span>
                          <span className="font-medium">{c.traffic}</span>
                        </div>
                        <div className="ci-strength-bar">
                          <div className="ci-strength-fill" style={{ width: `${c.strength}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-ink-secondary">Threat Score</span>
                          <span className={`font-bold ${c.tier === '1' ? 'text-toyo' : ''}`}>{c.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-ink-muted mt-4">+ 23 more profiles in the full report</p>
              </div>
            )}

            {/* ── Panel: SEO Gaps ── */}
            {activeTab === 'seo' && (
              <div key="seo" className="ci-panel-active p-4 sm:p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-ink">SEO Keyword Gap Analysis</h3>
                  <p className="text-sm text-ink-muted">Terms your competitors rank for that you don&rsquo;t. Sorted by volume and difficulty.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle text-left">
                        <th className="py-3 pr-4 font-semibold text-ink-secondary text-xs uppercase tracking-wider">Priority</th>
                        <th className="py-3 pr-4 font-semibold text-ink-secondary text-xs uppercase tracking-wider">Keyword Cluster</th>
                        <th className="py-3 pr-4 font-semibold text-ink-secondary text-xs uppercase tracking-wider">Volume</th>
                        <th className="py-3 pr-4 font-semibold text-ink-secondary text-xs uppercase tracking-wider">Competition</th>
                        <th className="py-3 font-semibold text-ink-secondary text-xs uppercase tracking-wider">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border-subtle">
                        <td className="py-3 pr-4"><span className="bg-toyo text-white text-xs font-bold px-2 py-0.5 rounded">#1</span></td>
                        <td className="py-3 pr-4 font-medium">AI Agent Builder terms</td>
                        <td className="py-3 pr-4 text-ink-secondary">8K–25K/mo</td>
                        <td className="py-3 pr-4"><span className="text-green-600 font-medium">Zero ranking</span></td>
                        <td className="py-3 font-bold text-toyo">10/10</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-3 pr-4"><span className="bg-toyo text-white text-xs font-bold px-2 py-0.5 rounded">#2</span></td>
                        <td className="py-3 pr-4 font-medium">AI for Founders/Startups</td>
                        <td className="py-3 pr-4 text-ink-secondary">5K–15K/mo</td>
                        <td className="py-3 pr-4"><span className="text-green-600 font-medium">Zero ranking</span></td>
                        <td className="py-3 font-bold text-toyo">10/10</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-3 pr-4"><span className="bg-ink-muted text-white text-xs font-bold px-2 py-0.5 rounded">#3</span></td>
                        <td className="py-3 pr-4 font-medium">Security/Trust terms</td>
                        <td className="py-3 pr-4 text-ink-secondary">1K–5K/mo</td>
                        <td className="py-3 pr-4"><span className="text-green-600 font-medium">Zero content</span></td>
                        <td className="py-3 font-bold">8/10</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-3 pr-4"><span className="bg-ink-muted text-white text-xs font-bold px-2 py-0.5 rounded">#4</span></td>
                        <td className="py-3 pr-4 font-medium">AI Employee/Workforce</td>
                        <td className="py-3 pr-4 text-ink-secondary">3K–8K/mo</td>
                        <td className="py-3 pr-4"><span className="text-yellow-600 font-medium">1 competitor</span></td>
                        <td className="py-3 font-bold">8/10</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-3 pr-4"><span className="bg-ink-muted text-white text-xs font-bold px-2 py-0.5 rounded">#5</span></td>
                        <td className="py-3 pr-4 font-medium">Zapier/Make/n8n Alternatives</td>
                        <td className="py-3 pr-4 text-ink-secondary">25K–50K/mo</td>
                        <td className="py-3 pr-4"><span className="text-red-500 font-medium">Medium-high</span></td>
                        <td className="py-3 font-bold">9/10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-5 bg-toyo-light rounded-xl p-4 border border-[#E54D2E]/10">
                  <p className="text-sm text-ink-secondary">
                    <span className="font-semibold text-ink">Key finding:</span> 330,000+ keywords tracked across 25 competitors, yet exact category keywords (&ldquo;AI agent builder,&rdquo; &ldquo;no-code AI agent builder&rdquo;) have zero rankings from any competitor. First-mover opportunity.
                  </p>
                </div>
              </div>
            )}

            {/* ── Panel: Threat Tiers ── */}
            {activeTab === 'threats' && (
              <div key="threats" className="ci-panel-active p-4 sm:p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-ink">Threat Tier Ranking</h3>
                  <p className="text-sm text-ink-muted">Your competitors sorted by how much attention they deserve</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full ci-tier-1">Tier 1 &mdash; Critical Threats</span>
                      <span className="text-xs text-ink-muted">Requires immediate response</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { name: 'Gumloop', score: '21/25', desc: '$70.6M from Benchmark. Best-funded AI-native automation startup. Credit-based pricing is exploitable.' },
                        { name: 'Lindy AI', score: '20/25', desc: '117K monthly traffic. Trustpilot 2.4/5 from billing issues. No team tier.' },
                        { name: 'Relevance AI', score: '20/25', desc: '12x pricing cliff ($19 to $234). Mid-market prospects stranded between tiers.' },
                        { name: 'n8n', score: '19/25', desc: '2.6M monthly visits. Open-source community darling. Complex for non-technical users.' },
                      ].map((c) => (
                        <div key={c.name} className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">{c.name}</span>
                            <span className="text-xs font-bold text-red-700">{c.score}</span>
                          </div>
                          <p className="text-xs text-ink-secondary">{c.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full ci-tier-2">Tier 2 &mdash; Monitor</span>
                      <span className="text-xs text-ink-muted">11 competitors with plausible expansion paths</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Zapier', 'Notion AI', 'Make', 'Jasper', 'Adaptive', 'MindStudio'].map((name) => (
                        <span key={name} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-800">{name}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full ci-tier-3">Tier 3 &mdash; Noise</span>
                      <span className="text-xs text-ink-muted">9 competitors. Different focus, minimal overlap.</span>
                    </div>
                    <p className="text-xs text-ink-muted">Stop treating Tier 3 the same as Tier 1. These don&rsquo;t need a response.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Panel: Positioning Map ── */}
            {activeTab === 'positioning' && (
              <div key="positioning" className="ci-panel-active p-4 sm:p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-ink">Market Positioning Map</h3>
                  <p className="text-sm text-ink-muted">Where each player sits across the axes that matter for your category</p>
                </div>
                <div className="relative bg-surface-alt rounded-xl p-6 border border-border-subtle" style={{ minHeight: 340 }}>
                  {/* Axes */}
                  <div className="absolute left-1/2 top-6 bottom-6 w-px bg-border-subtle" />
                  <div className="absolute top-1/2 left-6 right-6 h-px bg-border-subtle" />
                  {/* Labels */}
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-ink-muted font-semibold">AI-Native</span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-ink-muted font-semibold">Integration-First</span>
                  <span
                    className="absolute left-2 top-1/2 text-[10px] uppercase tracking-widest text-ink-muted font-semibold"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}
                  >Technical</span>
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest text-ink-muted font-semibold"
                    style={{ writingMode: 'vertical-rl' }}
                  >Non-technical</span>
                  {/* YOU marker */}
                  <div className="absolute" style={{ top: '25%', right: '30%' }}>
                    <div className="w-10 h-10 rounded-full bg-[#E54D2E]/20 border-2 border-toyo flex items-center justify-center">
                      <span className="text-[9px] font-bold text-toyo">YOU</span>
                    </div>
                  </div>
                  {/* Competitor dots */}
                  <div className="absolute flex items-center" style={{ top: '18%', left: '28%' }}>
                    <div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-[10px] ml-1 text-ink-muted">Gumloop</span>
                  </div>
                  <div className="absolute flex items-center" style={{ top: '22%', right: '22%' }}>
                    <div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-[10px] ml-1 text-ink-muted">Lindy</span>
                  </div>
                  <div className="absolute flex items-center" style={{ top: '30%', left: '22%' }}>
                    <div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-[10px] ml-1 text-ink-muted">Relevance</span>
                  </div>
                  <div className="absolute flex items-center" style={{ top: '70%', left: '20%' }}>
                    <div className="w-4 h-4 rounded-full bg-amber-300" /><span className="text-[10px] ml-1 text-ink-muted">n8n</span>
                  </div>
                  <div className="absolute flex items-center" style={{ top: '75%', left: '35%' }}>
                    <div className="w-5 h-5 rounded-full bg-amber-300" /><span className="text-[10px] ml-1 text-ink-muted">Zapier</span>
                  </div>
                  <div className="absolute flex items-center" style={{ top: '68%', right: '30%' }}>
                    <div className="w-4 h-4 rounded-full bg-amber-300" /><span className="text-[10px] ml-1 text-ink-muted">Make</span>
                  </div>
                  <div className="absolute flex items-center" style={{ top: '42%', right: '18%' }}>
                    <div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-[10px] ml-1 text-ink-muted">Relay</span>
                  </div>
                  {/* White space callout */}
                  <div
                    className="absolute bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800 font-medium"
                    style={{ top: '30%', right: '25%', maxWidth: 140 }}
                  >
                    White space: AI-native + non-technical + mid-market pricing
                  </div>
                </div>
              </div>
            )}

            {/* ── Panel: Executive Summary ── */}
            {activeTab === 'summary' && (
              <div key="summary" className="ci-panel-active p-4 sm:p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-ink">Executive Summary</h3>
                  <p className="text-sm text-ink-muted">Not just findings. What to do about them.</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-toyo-light border border-[#E54D2E]/10 rounded-xl p-4">
                    <p className="text-sm font-semibold text-ink mb-1">Key Finding #1</p>
                    <p className="text-sm text-ink-secondary"><strong>Your exact category keywords are uncontested.</strong> &ldquo;AI agent builder,&rdquo; &ldquo;no-code AI agent builder,&rdquo; and &ldquo;AI for founders&rdquo; have zero rankings from any of the 25 competitors analyzed.</p>
                  </div>
                  <div className="bg-toyo-light border border-[#E54D2E]/10 rounded-xl p-4">
                    <p className="text-sm font-semibold text-ink mb-1">Key Finding #2</p>
                    <p className="text-sm text-ink-secondary"><strong>Billing transparency is the #1 cross-market vulnerability.</strong> Credit-based pricing drives documented churn at Lindy AI (2.4/5 Trustpilot), Gumloop, Relevance AI, Zapier, Make, and Airtable.</p>
                  </div>
                  <div className="bg-toyo-light border border-[#E54D2E]/10 rounded-xl p-4">
                    <p className="text-sm font-semibold text-ink mb-1">Key Finding #3</p>
                    <p className="text-sm text-ink-secondary"><strong>The mid-market team tier ($50&ndash;$150/mo) is structurally vacant.</strong> Only Relay.app occupies this gap. First mover captures the SMB segment everyone else ignores or prices out.</p>
                  </div>
                  <div className="bg-surface-alt border border-border-subtle rounded-xl p-4">
                    <p className="text-sm font-semibold text-ink mb-2">Recommended Actions</p>
                    <ol className="text-sm text-ink-secondary space-y-2 list-decimal list-inside">
                      <li>Target uncontested &ldquo;AI agent builder&rdquo; keyword cluster with 38-piece content plan</li>
                      <li>Launch $50&ndash;$150/mo team tier to fill structural gap</li>
                      <li>Position flat pricing against competitors&rsquo; credit-based models</li>
                      <li>Publish comparison content exploiting Tier 1 weaknesses</li>
                      <li>Build backlink campaign to push DR from 4 to 28&ndash;35 in 90 days</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="py-20 px-6" id="compare">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-ink-secondary leading-relaxed text-center max-w-2xl mx-auto mb-8">
            You&rsquo;ve had three SEO tools bookmarked for six months, a half-built competitive spreadsheet, and a recurring calendar block called &ldquo;comp analysis&rdquo; that keeps getting pushed. The analysis is still pending. Meanwhile your competitors shipped two positioning updates and picked up ranking in the keyword clusters you&rsquo;ve been meaning to check.
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-ink text-center mb-3">What you&rsquo;re actually comparing</h2>
          <div className="overflow-x-auto mt-10">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-4 pr-4 text-sm font-semibold text-ink-muted w-1/4" />
                  <th className="py-4 px-4 text-sm font-semibold text-ink-secondary">DIY</th>
                  <th className="py-4 px-4 text-sm font-semibold text-ink-secondary">Agency</th>
                  <th className="py-4 px-4 text-sm font-semibold text-ink bg-toyo-light rounded-t-xl border-t-2 border-toyo">Us</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border-subtle">
                  <td className="py-4 pr-4 text-sm font-semibold text-ink">Cost</td>
                  <td className="py-4 px-4 text-sm text-ink-secondary">$249+/mo in tools<br /><span className="text-ink-muted text-xs">(you maintain the stack)</span></td>
                  <td className="py-4 px-4 text-sm text-ink-secondary">$5,000&ndash;$15,000</td>
                  <td className="py-4 px-4 text-sm font-bold text-ink bg-toyo-light">$299, flat</td>
                </tr>
                <tr className="border-t border-border-subtle">
                  <td className="py-4 pr-4 text-sm font-semibold text-ink">Time</td>
                  <td className="py-4 px-4 text-sm text-ink-secondary">40+ hours of your time</td>
                  <td className="py-4 px-4 text-sm text-ink-secondary">2&ndash;4 weeks</td>
                  <td className="py-4 px-4 text-sm font-bold text-ink bg-toyo-light">24&ndash;48 hours</td>
                </tr>
                <tr className="border-t border-border-subtle">
                  <td className="py-4 pr-4 text-sm font-semibold text-ink">Output</td>
                  <td className="py-4 px-4 text-sm text-ink-secondary">Whatever you manage to pull together</td>
                  <td className="py-4 px-4 text-sm text-ink-secondary">Polished deck, generic conclusions</td>
                  <td className="py-4 px-4 text-sm font-bold text-ink bg-toyo-light">Custom report built for your exact market</td>
                </tr>
                <tr className="border-t border-border-subtle">
                  <td className="py-4 pr-4 text-sm font-semibold text-ink">QA</td>
                  <td className="py-4 px-4 text-sm text-ink-secondary">None</td>
                  <td className="py-4 px-4 text-sm text-ink-secondary">&ldquo;Trust us&rdquo;</td>
                  <td className="py-4 px-4 text-sm font-bold text-ink bg-toyo-light rounded-b-xl">85/100 minimum score or it doesn&rsquo;t ship</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-ink-muted text-center mt-6 max-w-2xl mx-auto">
            The tools are not the hard part. Knowing what to look for, where to find it, and how to score it is. That&rsquo;s what 800+ workflow runs buys you.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 bg-white" id="how">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-ink text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                n: '1',
                title: 'Tell us who you compete with',
                body: 'Your company URL and your top 3–5 competitors. Or just your category, and we\'ll identify them.',
              },
              {
                n: '2',
                title: 'We run the analysis',
                body: 'Our workflow runs 25+ competitor profiles across SEO, content strategy, positioning signals, and threat indicators. Every source is logged.',
              },
              {
                n: '3',
                title: 'Your report, in your inbox',
                body: 'QA-scored, formatted, and delivered within 48 hours. Ready to share with your team or drop straight into your board deck.',
              },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-toyo-light flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-toyo">{step.n}</span>
                </div>
                <h3 className="font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="py-20 px-6" id="included">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-ink text-center mb-3">Six sections. All of them matter.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
                title: 'Competitor profiles with strength ratings',
                body: 'Each competitor scored across traffic, content depth, brand clarity, and conversion signals. You see who\'s actually strong and who just looks it.',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
                title: 'SEO keyword gap analysis',
                body: 'The terms your competitors are ranking for that you aren\'t. Sorted by volume and difficulty so you know where to start.',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
                title: 'Content strategy opportunities',
                body: 'Topics your market is searching for that nobody in your competitive set owns yet. These are the gaps worth moving on.',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />,
                title: 'Threat tier ranking',
                body: 'Your competitors sorted by how much attention they deserve. Tier 1 needs a response. Tier 3 is noise. Stop treating them the same.',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
                title: 'Market positioning map',
                body: 'Where each player sits across the axes that matter for your category. Where the white space is.',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
                title: 'Executive summary with recommended actions',
                body: 'Not just findings. A short list of what to do about them, written for the person who\'s going to act on this.',
              },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-border-subtle p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-toyo-light flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-toyo" fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
                </div>
                <h3 className="font-bold text-ink mb-2">{card.title}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {[
              {
                title: 'Depth that actually moves decisions',
                body: 'Every report covers 25+ competitors across SEO, content positioning, threat tier, and market map. It\'s the kind of analysis most teams put off for quarters because it\'s too expensive to outsource and too slow to do in-house.',
              },
              {
                title: 'QA rubric, not vibe checks',
                body: 'Reports are scored against an 85-point quality rubric before delivery. If the score comes in below 85, it doesn\'t ship. You get the rescore first, then the report.',
              },
              {
                title: '20 years of CRO pattern recognition baked in',
                body: 'The rubric was built by someone who\'s spent two decades reading competitive landscapes for growth teams. The workflow doesn\'t just collect data. It interprets it.',
              },
              {
                title: 'One price, no upsell',
                body: '$299 gets you the full report. No tiers, no add-ons, no \u201chop on a call to see pricing.\u201d',
              },
              {
                title: 'This is where competitive analysis is headed',
                body: 'Every growth team eventually automates this work. The ones who get there first stop making positioning decisions from memory.',
              },
            ].map((prop, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="w-1 rounded-full bg-toyo shrink-0 self-stretch" />
                <div>
                  <h3 className="font-bold text-ink text-lg mb-1">{prop.title}</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">{prop.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-8">
            {[
              { num: '800+', label: 'workflow runs' },
              { num: '85/100', label: 'QA minimum' },
              { num: '20 yrs', label: 'CRO experience' },
              { num: '48 hrs', label: 'delivery' },
            ].map((stat) => (
              <div key={stat.label}>
                <span className="text-3xl font-black text-ink block">{stat.num}</span>
                <p className="text-sm text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-muted mb-10">
            800+ workflow runs. Every one QA-scored. 20 years building competitive analysis processes for growth teams. Join the teams who&rsquo;ve already mapped their market.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div className="bg-white rounded-xl border border-border-subtle p-5">
              <p className="text-sm text-ink-secondary leading-relaxed italic mb-3">
                &ldquo;I&rsquo;ve done competitive analysis for three startups. This was the first time I handed a report to my board and they asked where it came from &mdash; not because it was flashy, but because the threat tier section told them something they hadn&rsquo;t considered.&rdquo;
              </p>
              <p className="text-xs text-ink-muted font-medium">Series B Head of Growth, SaaS &mdash; anonymized on request</p>
            </div>
            <div className="bg-white rounded-xl border border-border-subtle p-5">
              <p className="text-sm text-ink-secondary leading-relaxed italic mb-3">
                &ldquo;The SEO gap section alone was worth it. We found a cluster our top competitor wasn&rsquo;t touching. We published four pieces, three ranked in 60 days.&rdquo;
              </p>
              <p className="text-xs text-ink-muted font-medium">Founder, B2B marketplace &mdash; anonymized on request</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 bg-white" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-ink text-center mb-12">Questions</h2>
          <div className="divide-y divide-[#E8E8E6]">
            {[
              {
                q: "Can't I just do this myself?",
                a: "Yes. It takes 40+ hours and a stack of tools you'll pay $249/mo for. The report you get at the end will be less structured and won't have a QA score. If your time costs you nothing, do it yourself.",
              },
              {
                q: 'How is this different from what an agency delivers?',
                a: 'Agencies charge $5,000\u2013$15,000 and take 2\u20134 weeks. Some of that money pays for account management, project coordination, and slide design. We charge $299. The analysis is what you\u2019re paying for, not the overhead.',
              },
              {
                q: "What if I don't have a list of competitors ready?",
                a: "Give us your category or your company URL. We'll build the competitor list as part of the run. You don't need to have this figured out before you order.",
              },
              {
                q: "What if the report isn't what I expected?",
                a: "Full refund. The guarantee is in the footer and it\u2019s real: if it\u2019s not the most thorough competitive analysis you\u2019ve seen, you get your money back.",
              },
              {
                q: 'Who is this built for?',
                a: 'Series A and B startups, 5\u201350 people, who need to understand their competitive position but don\u2019t have the time or budget for an agency engagement. If you\u2019re pre-seed and still finding product-market fit, wait. This report assumes you have something to compete with.',
              },
            ].map((item, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-semibold text-ink pr-4">{item.q}</span>
                  <svg
                    className="w-5 h-5 text-ink-muted shrink-0 transition-transform group-open:rotate-45"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </summary>
                <p className="text-sm text-ink-secondary leading-relaxed mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Secondary CTA (Lead Capture) ── */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-ink mb-3">Not ready to spend $299 today?</h2>
          <p className="text-sm text-ink-secondary leading-relaxed mb-6">
            We&rsquo;ll send you a full executive summary section from a recent report &mdash; one competitor, fully profiled, QA-scored output. No pitch, no follow-up sequence. Just the actual thing so you can decide if it&rsquo;s worth it.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your work email"
              className="flex-1 px-4 py-3 rounded-lg border border-border-subtle text-sm text-ink placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-toyo focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-toyo hover:bg-toyo-dark text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Send me a sample section
            </button>
          </form>
          <p className="text-xs text-ink-muted mt-2">One email. No sequence.</p>
          <p className="text-xs text-[#8A8A8A]/60 mt-1">We don&rsquo;t sell your email. Unsubscribe whenever.</p>
        </div>
      </section>

      {/* ── Order CTA ── */}
      <section className="py-20 px-6 bg-ink" id="order">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">Know your market. Move faster.</h2>
          <p className="text-white/60 text-sm mb-8">No subscription. No upsell. Refund if it&rsquo;s not the best analysis you&rsquo;ve seen.</p>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="url"
              placeholder="Your company URL (e.g. yourcompany.com)"
              className="w-full px-4 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-toyo focus:border-transparent"
            />
            <textarea
              placeholder="Up to 5 competitor URLs, or leave blank and we'll identify them"
              rows={2}
              className="w-full px-4 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-toyo focus:border-transparent resize-none"
            />
            <button
              type="submit"
              className="w-full bg-toyo hover:bg-toyo-dark text-white font-semibold text-lg py-4 rounded-lg transition-colors shadow-lg"
            >
              Get your report &mdash; $299
            </button>
            <p className="text-xs text-white/40">We&rsquo;ll confirm your order and any questions within 2 hours</p>
          </form>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              24-48 hour delivery
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              QA score: 85/100 min
            </span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-ink-muted mb-2">If it&rsquo;s not the most thorough competitive analysis you&rsquo;ve seen, we&rsquo;ll refund it.</p>
          <p className="text-xs text-[#8A8A8A]/60">&copy; 2026 Hooli Intel. 800+ workflow runs. Every one QA-scored.</p>
        </div>
      </footer>
    </div>
  )
}

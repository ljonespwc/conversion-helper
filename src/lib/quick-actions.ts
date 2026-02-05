import {
  Lightbulb, FileText, BookOpen, Languages,
  Scale, GitCompare, Cog, Award,
  Zap, Heart, Package, ListChecks,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export type QuickAction = {
  key: string
  label: string
  prepend: string        // text prepended to user input (for input actions)
  prompt: string         // full prompt sent (for zero-input actions)
  requiresInput: boolean
  icon: LucideIcon
}

export type PageGoal = 'sell' | 'lead' | 'support' | null

// ============================================================================
// Presets
// ============================================================================

const SELL_ACTIONS: QuickAction[] = [
  {
    key: 'pros-cons',
    label: 'Pros & Cons',
    prepend: 'Give me an honest pros and cons analysis of:',
    prompt: 'What are the pros and cons? What are the main benefits and strengths, and what are the potential downsides, limitations, or trade-offs? Be honest and structure it clearly.',
    requiresInput: false,
    icon: Scale,
  },
  {
    key: 'compare',
    label: 'Compare',
    prepend: 'Compare this against:',
    prompt: '',
    requiresInput: true,
    icon: GitCompare,
  },
  {
    key: 'how-it-works',
    label: 'How Does It Work?',
    prepend: '',
    prompt: 'How does this work step by step? What is the process, what are the key steps, and what should someone expect at each stage?',
    requiresInput: false,
    icon: Cog,
  },
  {
    key: 'show-proof',
    label: 'Show Me Proof',
    prepend: '',
    prompt: 'What proof, evidence, or results are there? Include any case studies, testimonials, success stories, statistics, or specific outcomes.',
    requiresInput: false,
    icon: Award,
  },
]

const LEAD_ACTIONS: QuickAction[] = [
  {
    key: 'tldr',
    label: 'TL;DR',
    prepend: '',
    prompt: 'What is this page about? Summarize the main offering, who it is for, and why it matters in 2-3 sentences.',
    requiresInput: false,
    icon: Zap,
  },
  {
    key: 'why-care',
    label: 'Why Should I Care?',
    prepend: '',
    prompt: 'Why should I care about this? What problem does it solve and what difference would it make for someone like me?',
    requiresInput: false,
    icon: Heart,
  },
  {
    key: 'what-do-i-get',
    label: 'What Do I Get?',
    prepend: '',
    prompt: 'What exactly do I get? Break down everything that is included — deliverables, features, access, outcomes — in bullet format.',
    requiresInput: false,
    icon: Package,
  },
  {
    key: 'quick-facts',
    label: 'Quick Facts',
    prepend: '',
    prompt: 'What are the key facts? Give me pricing, timeline, requirements, and any other important details in bullet format.',
    requiresInput: false,
    icon: ListChecks,
  },
]

const SUPPORT_ACTIONS: QuickAction[] = [
  {
    key: 'explain',
    label: 'Explain Simply',
    prepend: 'Explain simply:',
    prompt: '',
    requiresInput: true,
    icon: Lightbulb,
  },
  {
    key: 'example',
    label: 'Give an Example',
    prepend: 'Give me a real-world example of:',
    prompt: '',
    requiresInput: true,
    icon: FileText,
  },
  {
    key: 'define',
    label: 'Define Terms',
    prepend: 'Define the key terms in this:',
    prompt: '',
    requiresInput: true,
    icon: BookOpen,
  },
  {
    key: 'translate',
    label: 'Translate',
    prepend: 'Translate this to',
    prompt: '',
    requiresInput: true,
    icon: Languages,
  },
]

const FALLBACK_ACTIONS: QuickAction[] = [
  {
    key: 'explain',
    label: 'Explain Simply',
    prepend: 'Explain simply:',
    prompt: '',
    requiresInput: true,
    icon: Lightbulb,
  },
  {
    key: 'summarize',
    label: 'Summarize',
    prepend: 'Summarize this:',
    prompt: '',
    requiresInput: true,
    icon: FileText,
  },
  {
    key: 'define',
    label: 'Define Terms',
    prepend: 'Define the key terms in this:',
    prompt: '',
    requiresInput: true,
    icon: BookOpen,
  },
  {
    key: 'translate',
    label: 'Translate',
    prepend: 'Translate this to',
    prompt: '',
    requiresInput: true,
    icon: Languages,
  },
]

// ============================================================================
// Disabled Actions Config
// ============================================================================

// Globally disable specific buttons per goal.
// The code remains intact — buttons are just filtered out at runtime.
// To re-enable a button, remove its key from the array.
const DISABLED_ACTIONS: Partial<Record<NonNullable<PageGoal>, string[]>> = {
  sell: ['compare'], // Compare disabled until grounding bypass is implemented
}

// ============================================================================
// Getter
// ============================================================================

export function getQuickActionsForGoal(pageGoal: PageGoal): QuickAction[] {
  let actions: QuickAction[]

  switch (pageGoal) {
    case 'sell':
      actions = SELL_ACTIONS
      break
    case 'lead':
      actions = LEAD_ACTIONS
      break
    case 'support':
      actions = SUPPORT_ACTIONS
      break
    default:
      actions = FALLBACK_ACTIONS
  }

  // Filter out disabled actions for this goal
  const disabled = pageGoal ? DISABLED_ACTIONS[pageGoal] : undefined
  if (disabled && disabled.length > 0) {
    return actions.filter(a => !disabled.includes(a.key))
  }

  return actions
}

/** Check if a set of actions includes the translate action (needs special dropdown UI) */
export function hasTranslateAction(actions: QuickAction[]): boolean {
  return actions.some(a => a.key === 'translate')
}

/** Check if any actions require input (determines placeholder text) */
export function hasInputRequiredAction(actions: QuickAction[]): boolean {
  return actions.some(a => a.requiresInput)
}

// ============================================================================
// Label Lookup (for admin display)
// ============================================================================

export const QUICK_ACTION_LABELS: Record<string, string> = {
  // Sell actions
  'pros-cons': 'Pros & Cons',
  'compare': 'Compare',
  'how-it-works': 'How It Works',
  'show-proof': 'Show Proof',
  // Lead actions
  'tldr': 'TL;DR',
  'why-care': 'Why Care',
  'what-do-i-get': 'What I Get',
  'quick-facts': 'Quick Facts',
  // Support actions
  'explain': 'Explain',
  'example': 'Example',
  'define': 'Define',
  'translate': 'Translate',
  // Fallback actions
  'summarize': 'Summarize',
}

export type BusinessType = 'saas' | 'ecommerce' | 'smb'
export type PageGoal = 'sell' | 'lead' | 'support'

export interface ExampleConversation {
  token: string
  businessType: BusinessType
  goal: PageGoal
  title: string
  description: string
  previewQuestion: string
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  saas: 'SaaS',
  ecommerce: 'E-commerce',
  smb: 'SMB',
}

export const GOAL_LABELS: Record<PageGoal, string> = {
  sell: 'Sales Page',
  lead: 'Lead Capture',
  support: 'Customer Support',
}

export const EXAMPLE_CONVERSATIONS: ExampleConversation[] = [
  // SaaS
  {
    token: 'sh_example_saas_sell',
    businessType: 'saas',
    goal: 'sell',
    title: 'The Skeptic',
    description: 'Handling objections with specifics, not fluff. Differentiates from crowded competition and closes with clear pricing.',
    previewQuestion: 'How is this any different from the 50 other project management tools out there?',
  },
  {
    token: 'sh_example_saas_lead',
    businessType: 'saas',
    goal: 'lead',
    title: 'Deep Dive Integration',
    description: 'Complex technical question gets a structured, markdown-formatted answer. Leads naturally to a demo booking.',
    previewQuestion: 'Can you break down your integration options?',
  },
  {
    token: 'sh_example_saas_support',
    businessType: 'saas',
    goal: 'support',
    title: 'Email Deliverability',
    description: 'Step-by-step troubleshooting with clear next actions. Asks the right diagnostic questions first.',
    previewQuestion: 'My emails are going to spam. What can I do?',
  },

  // E-commerce
  {
    token: 'sh_example_ecommerce_sell',
    businessType: 'ecommerce',
    goal: 'sell',
    title: 'Quick Hit',
    description: 'Two exchanges, ten seconds, done. The "people don\'t read" thesis in action.',
    previewQuestion: 'Is this waterproof?',
  },
  {
    token: 'sh_example_ecommerce_lead',
    businessType: 'ecommerce',
    goal: 'lead',
    title: 'Hola, ¿Envían a México?',
    description: 'Visitor asks in Spanish, gets a perfect response in Spanish. Multilingual comprehension in action.',
    previewQuestion: '¿Tienen envío a México?',
  },
  {
    token: 'sh_example_ecommerce_support',
    businessType: 'ecommerce',
    goal: 'support',
    title: 'The Honest Handoff',
    description: 'When AI can\'t access order details, it says so honestly and directs to the right channel.',
    previewQuestion: 'I ordered 3 days ago and still no shipping confirmation.',
  },

  // SMB
  {
    token: 'sh_example_smb_sell',
    businessType: 'smb',
    goal: 'sell',
    title: 'Warming Up',
    description: 'Starts vague, gets specific. AI asks smart diagnostic questions and adapts as buying intent rises.',
    previewQuestion: 'What do you guys do exactly?',
  },
  {
    token: 'sh_example_smb_lead',
    businessType: 'smb',
    goal: 'lead',
    title: 'Pros & Cons',
    description: 'Visitor uses a quick action button. Gets an honest, structured trade-off analysis with markdown formatting.',
    previewQuestion: 'Give me the pros and cons of hiring an accountant vs doing it myself',
  },
  {
    token: 'sh_example_smb_support',
    businessType: 'smb',
    goal: 'support',
    title: 'Dental Office Hours',
    description: 'Quick insurance and scheduling questions. Friendly, efficient, guides to booking.',
    previewQuestion: 'Do you take Delta Dental?',
  },
]

export function getExamplesByBusinessType(type: BusinessType): ExampleConversation[] {
  return EXAMPLE_CONVERSATIONS.filter((ex) => ex.businessType === type)
}

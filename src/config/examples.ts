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
    title: 'Project Management Pricing',
    description: 'Handling pricing objections and trial signup on a SaaS pricing page.',
    previewQuestion: 'How much does the Pro plan cost?',
  },
  {
    token: 'sh_example_saas_lead',
    businessType: 'saas',
    goal: 'lead',
    title: 'CRM Integration Questions',
    description: 'Answering technical integration questions and booking a demo.',
    previewQuestion: 'Does this integrate with Salesforce?',
  },
  {
    token: 'sh_example_saas_support',
    businessType: 'saas',
    goal: 'support',
    title: 'Email Deliverability Help',
    description: 'Troubleshooting spam issues and guiding through DNS setup.',
    previewQuestion: 'My emails are going to spam. What can I do?',
  },

  // E-commerce
  {
    token: 'sh_example_ecommerce_sell',
    businessType: 'ecommerce',
    goal: 'sell',
    title: 'Headphones Product Page',
    description: 'Answering product specs, shipping, and return questions to close the sale.',
    previewQuestion: "What's the battery life on these?",
  },
  {
    token: 'sh_example_ecommerce_lead',
    businessType: 'ecommerce',
    goal: 'lead',
    title: 'Sustainable Fashion Brand',
    description: 'Building trust with sustainability info and capturing newsletter signup.',
    previewQuestion: 'Are your clothes actually sustainable?',
  },
  {
    token: 'sh_example_ecommerce_support',
    businessType: 'ecommerce',
    goal: 'support',
    title: 'Order Tracking & Returns',
    description: 'Helping customers track orders and understand return policies.',
    previewQuestion: "Where's my order? It was supposed to arrive yesterday.",
  },

  // SMB
  {
    token: 'sh_example_smb_sell',
    businessType: 'smb',
    goal: 'sell',
    title: 'HVAC Service Scheduling',
    description: 'Discussing pricing, financing options, and booking appointments.',
    previewQuestion: 'How much does a new AC unit cost?',
  },
  {
    token: 'sh_example_smb_lead',
    businessType: 'smb',
    goal: 'lead',
    title: 'Accounting Services',
    description: 'Qualifying leads around e-commerce tax compliance needs.',
    previewQuestion: 'Do you work with small ecommerce businesses?',
  },
  {
    token: 'sh_example_smb_support',
    businessType: 'smb',
    goal: 'support',
    title: 'Dental Practice Info',
    description: 'Answering insurance and scheduling questions for patients.',
    previewQuestion: 'Do you accept Delta Dental insurance?',
  },
]

export function getExamplesByBusinessType(type: BusinessType): ExampleConversation[] {
  return EXAMPLE_CONVERSATIONS.filter((ex) => ex.businessType === type)
}

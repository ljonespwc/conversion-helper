export interface ChatResponse {
  response: string
  type: 'faq' | 'ai' | 'error'
  confidence?: number
  resources?: string[]
}

export interface WidgetConfig {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'light' | 'dark' | 'auto'
  primaryColor?: string
  accentColor?: string
}
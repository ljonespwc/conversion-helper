export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  message: string
  timestamp: number | null
  matched: boolean
  category: string | null
  grounded: boolean | null
  created_at: string
}

export interface ConversationSession {
  id: string
  session_id: string
  started_at: string
  ended_at: string | null
  total_questions: number
  matched_responses: number
  page_url: string | null
  user_rating: number | null
  messages: ConversationMessage[]
  is_bookmarked: boolean
  bookmarked_at: string | null
  last_viewed_at: string | null
  is_unread: boolean
  has_purchase: boolean
  share_token: string | null
}

export interface Stats {
  total: number
  today: number
  avgDuration: number
  activeNow: number
  avgRating: number
  totalRatings: number
  positiveRatings: number
  negativeRatings: number
  totalOpens: number
  todayOpens: number
  uniqueOpeners: number
  conversionRate: number
  purchasesInfluenced: number
  revenueInfluenced: number
  recentSessions: ConversationSession[]
}

export interface WidgetPage {
  id: string
  page_url: string
  page_title: string
}

export interface EscalationMessage {
  id: string
  role: 'user' | 'assistant'
  message: string
  timestamp: number | null
  needs_followup: boolean
  followup_reason: string | null
}

export interface Escalation {
  id: string
  session_id: string
  user_email: string
  page_url: string | null
  total_questions: number
  started_at: string
  ended_at: string | null
  escalation_timestamp: string
  resolved: boolean
  resolved_at: string | null
  messages: EscalationMessage[]
  flagged_count: number
  flagged_messages: EscalationMessage[]
}

export interface EscalationStats {
  total: number
  unresolved: number
  resolved: number
  total_flagged_messages: number
}

export interface ScrapingJob {
  id: string
  url: string
  status: string
  scraping_status: string
  indexing_status: string
  file_size: number | null
  word_count: number | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export interface FileUpload {
  id: string
  filename: string
  file_path: string
  file_size: number
  word_count: number
  status: string
  created_at: string
  completed_at?: string | null
}

export interface QuestionTheme {
  name: string
  description: string
  count: number
  examples: string[]
}

export interface PageThemeResult {
  page_url: string
  page_title: string
  themes: QuestionTheme[]
  generated_at: string | null
  message_count: number
}

export type IndexedPageSyncStatus = 'synced' | 'orphaned' | 'missing_from_google' | 'id_mismatch'

export interface IndexedPage {
  id: string
  page_url: string
  page_title: string | null
  document_id: string
  file_search_store_name?: string
  status?: string
  synced_to_file_search?: boolean
  source_type?: 'scraped' | 'uploaded'
  page_urls: string[] | null
  created_at?: string
  updated_at?: string
  scraped_at?: string
  metadata?: Record<string, unknown>
  sync_status: IndexedPageSyncStatus
  in_google: boolean
  in_database: boolean
}

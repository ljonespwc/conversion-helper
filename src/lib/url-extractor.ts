export interface ExtractedLink {
  type: 'url' | 'placeholder'
  text: string
  href?: string
  description?: string
}

export interface URLExtractionResult {
  hasLinks: boolean
  links: ExtractedLink[]
}

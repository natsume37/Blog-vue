import request from './request'

export const generateArticleDraft = (data: {
  topic: string
  style?: string
  tone?: string
  language?: string
  target_words?: number
  keywords?: string[]
  outline?: string[]
  include_summary?: boolean
  existing_context?: string
}) => request.post('/ai/article-draft', data)

export const generateArticleSummary = (data: {
  title?: string
  content_markdown: string
  max_length?: number
  style?: string
}) => request.post('/ai/article-summary', data)

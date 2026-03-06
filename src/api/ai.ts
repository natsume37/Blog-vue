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

export const getAIConfig = () => request.get('/ai/config')

export const updateAIConfig = (data: {
  ai_enabled: boolean
  ai_provider: string
  ai_base_url: string
  ai_api_key: string
  ai_model: string
  ai_timeout_seconds: number
}) => request.put('/ai/config', data)

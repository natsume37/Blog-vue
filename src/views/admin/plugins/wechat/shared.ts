export const WECHAT_PLUGIN_ID = 'wechat-official-account'

export type WeChatPluginConfig = {
  app_id: string
  app_secret: string
  callback_token: string
  callback_reply_text: string
  callback_subscribe_reply: string
  author: string
  publish_mode: 'draft' | 'publish'
  content_source_url_base: string
  fallback_thumb_media_id: string
  need_open_comment: boolean
  only_fans_can_comment: boolean
  preview_target_type: 'towxname' | 'touser'
  preview_target_value: string
  send_ignore_reprint: boolean
  default_tag_id: string
}

export type WeChatDraftItem = {
  media_id: string
  article_count: number
  title: string
  author: string
  digest: string
  thumb_url: string
  update_time: number
  created_at: number
  news_items: Array<Record<string, any>>
}

export type WeChatMaterialItem = {
  media_id: string
  name: string
  url: string
  update_time: number
}

export type WeChatTaskItem = {
  id: number
  task_type: string
  source_type: string
  article_id?: number | null
  title?: string
  draft_media_id?: string
  broadcast_media_id?: string
  publish_id?: string
  msg_id?: string
  preview_target?: string
  audience_type?: string
  audience_value?: string
  status: string
  status_text?: string
  created_at?: string
  updated_at?: string
  finished_at?: string
  request_payload?: Record<string, any> | null
  response_payload?: Record<string, any> | null
  result_payload?: Record<string, any> | null
}

export type WeChatQrCodeItem = {
  id: number
  name: string
  action_name: string
  scene_type: string
  scene_value: string
  ticket: string
  url: string
  image_url: string
  expire_seconds?: number | null
  expires_at?: string
  created_at?: string
}

export const createDefaultWeChatConfig = (): WeChatPluginConfig => ({
  app_id: '',
  app_secret: '',
  callback_token: '',
  callback_reply_text: '公众号服务已连接，当前请在后台完成发布操作。',
  callback_subscribe_reply: '欢迎关注 Martin Blog。',
  author: '',
  publish_mode: 'draft',
  content_source_url_base: '',
  fallback_thumb_media_id: '',
  need_open_comment: true,
  only_fans_can_comment: false,
  preview_target_type: 'towxname',
  preview_target_value: '',
  send_ignore_reprint: false,
  default_tag_id: '',
})

export const normalizeWeChatConfig = (payload: any): WeChatPluginConfig => ({
  app_id: payload?.app_id || '',
  app_secret: payload?.app_secret || '',
  callback_token: payload?.callback_token || '',
  callback_reply_text: payload?.callback_reply_text || '公众号服务已连接，当前请在后台完成发布操作。',
  callback_subscribe_reply: payload?.callback_subscribe_reply || '欢迎关注 Martin Blog。',
  author: payload?.author || '',
  publish_mode: payload?.publish_mode === 'publish' ? 'publish' : 'draft',
  content_source_url_base: payload?.content_source_url_base || '',
  fallback_thumb_media_id: payload?.fallback_thumb_media_id || '',
  need_open_comment: payload?.need_open_comment !== false,
  only_fans_can_comment: !!payload?.only_fans_can_comment,
  preview_target_type: payload?.preview_target_type === 'touser' ? 'touser' : 'towxname',
  preview_target_value: payload?.preview_target_value || '',
  send_ignore_reprint: !!payload?.send_ignore_reprint,
  default_tag_id: payload?.default_tag_id || '',
})

export const unwrapPluginResult = (res: any) => res?.data?.result || res?.data || {}

export const formatIsoDateTime = (value?: string) => {
  if (!value) return '--'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('zh-CN', { hour12: false })
}

export const formatUnixDateTime = (value?: number) => {
  if (!value) return '--'
  const parsed = new Date(value * 1000)
  if (Number.isNaN(parsed.getTime())) return '--'
  return parsed.toLocaleString('zh-CN', { hour12: false })
}

export const taskTypeLabel = (value?: string) => {
  if (value === 'draft') return '草稿'
  if (value === 'freepublish') return '发布'
  if (value === 'preview') return '预览'
  if (value === 'mass_send') return '群发'
  return value || '--'
}

export const taskStatusType = (value?: string) => {
  if (value === 'published' || value === 'preview_sent' || value === 'completed' || value === 'draft') return 'success'
  if (value === 'publishing' || value === 'sending' || value === 'reviewing') return 'warning'
  if (value === 'failed' || value === 'deleted') return 'danger'
  return 'info'
}

export const audienceLabel = (item: Pick<WeChatTaskItem, 'audience_type' | 'audience_value' | 'preview_target'>) => {
  if (item.audience_type === 'preview') return item.preview_target || '预览目标'
  if (item.audience_type === 'all') return '全部粉丝'
  if (item.audience_type === 'tag') return `标签 ${item.audience_value || '--'}`
  if (item.audience_type === 'freepublish') return '公众号发布'
  return item.audience_value || '--'
}

export const qrcodeModeLabel = (actionName?: string) => {
  if (!actionName) return '--'
  return actionName.startsWith('QR_LIMIT_') ? '永久' : '临时'
}

export const shortText = (value: string, max = 18) => {
  const text = String(value || '')
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

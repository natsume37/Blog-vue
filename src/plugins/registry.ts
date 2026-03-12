import type { Component } from 'vue'
import {
  Box,
  Connection,
  DataBoard,
  Document,
  Grid,
  MagicStick,
  Picture,
  PictureFilled,
  Promotion,
  Setting,
  Tickets,
} from '@element-plus/icons-vue'
import type { PluginManifest } from '../types/plugins'

type PluginPageLoader = () => Promise<any>

const pageRegistry: Record<string, PluginPageLoader> = {
  'plugin.ai.settings': () => import('../views/admin/AISettings.vue'),
  'plugin.ai.image': () => import('../views/admin/plugins/AIImageStudioPlugin.vue'),
  'plugin.wechat.dashboard': () => import('../views/admin/plugins/WeChatOfficialAccountPlugin.vue'),
  'plugin.wechat.drafts': () => import('../views/admin/plugins/WeChatDraftsPlugin.vue'),
  'plugin.wechat.media': () => import('../views/admin/plugins/WeChatMediaLibraryPlugin.vue'),
  'plugin.wechat.broadcast': () => import('../views/admin/plugins/WeChatBroadcastPlugin.vue'),
  'plugin.wechat.qrcode': () => import('../views/admin/plugins/WeChatQrcodePlugin.vue'),
}

const iconRegistry: Record<string, Component> = {
  Box,
  Connection,
  DataBoard,
  Document,
  Grid,
  MagicStick,
  Picture,
  PictureFilled,
  Promotion,
  Setting,
  Tickets,
}

export const builtinPluginCatalog: PluginManifest[] = [
  {
    id: 'ai-assistant',
    name: 'AI 助手',
    version: '1.2.0',
    builtin: true,
    marketplace: true,
    official: true,
    verified: true,
    featured: true,
    installed: true,
    enabled: true,
    category: 'core',
    icon: 'MagicStick',
    author: 'Martin',
    description: '统一管理文本与图片生成能力，提供模型配置、文章辅助和生图工作台。',
    summary: '文本生成、图片生成、MCP 工具和模型配置的一体化 AI 插件。',
    features: ['AI 草稿', 'AI 摘要', 'AI 生图', '模型配置', '图库入库'],
    keywords: ['ai', 'draft', 'summary', 'mcp', 'image', 'prompt'],
    tags: ['automation', 'editor', 'media', 'official'],
    permissions: ['network', 'site_settings', 'resource_write'],
    capabilities: ['article_draft', 'article_summary', 'mcp_tools', 'model_settings', 'image_generation', 'resource_library'],
    publisher: { name: 'natsume37', url: 'https://martin88.xyz', verified: true },
    compatibility: { backend: 'fastapi', frontend: 'vue', min_app_version: '1.0.0' },
    delivery: { type: 'builtin', entry_mode: 'local', install_strategy: 'builtin-toggle', runtime_type: 'builtin' },
    docsUrl: 'https://github.com/natsume37/Blog-plugin-market/tree/main/plugins/ai-assistant',
    repoUrl: 'https://github.com/natsume37/Blog-backend',
    supportUrl: 'https://github.com/natsume37/Blog-backend/issues',
    adminPages: [
      {
        key: 'settings',
        label: 'AI 助手',
        description: '配置 AI Provider、模型和超时策略。',
        component: 'plugin.ai.settings',
        icon: 'MagicStick',
        menu: true,
        order: 820,
        default: true,
      },
      {
        key: 'images',
        label: 'AI 生图',
        description: '生成可直接入库图库的封面、配图和视觉素材。',
        component: 'plugin.ai.image',
        icon: 'PictureFilled',
        menu: true,
        order: 825,
        default: false,
        path: '/admin/plugins/ai-assistant/images',
        render_mode: 'local',
        layout: 'workspace',
      },
    ],
  },
  {
    id: 'wechat-official-account',
    name: '微信公众号工作台',
    version: '2.0.0',
    builtin: true,
    marketplace: true,
    official: true,
    verified: true,
    featured: true,
    installed: false,
    enabled: false,
    category: 'distribution',
    icon: 'Promotion',
    author: 'Martin',
    description: '把博客文章同步到公众号草稿、微信图库和真群发流程，并提供二维码和状态反馈工作台。',
    features: ['草稿管理', '微信图库', '预览发送', '真群发', '二维码', '状态反馈'],
    keywords: ['wechat', 'distribution', 'publish', 'broadcast', 'qrcode'],
    tags: ['distribution', 'social', 'official'],
    permissions: ['network', 'article_content', 'plugin_settings', 'plugin_storage'],
    capabilities: ['wechat_draft', 'wechat_material', 'wechat_preview', 'wechat_mass_send', 'wechat_qrcode', 'wechat_publish_status'],
    publisher: { name: 'natsume37', url: 'https://martin88.xyz', verified: true },
    compatibility: { backend: 'fastapi', frontend: 'vue', min_app_version: '1.0.0' },
    delivery: { type: 'builtin', entry_mode: 'local', install_strategy: 'builtin-toggle', runtime_type: 'builtin' },
    docsUrl: 'https://github.com/natsume37/Blog-plugin-market/tree/main/plugins/wechat-official-account',
    repoUrl: 'https://github.com/natsume37/Blog-backend',
    supportUrl: 'https://github.com/natsume37/Blog-backend/issues',
    adminPages: [
      {
        key: 'publisher',
        label: '公众号工作台',
        description: '配置公众号凭证，查看最近任务，并从文章直接进入微信流转。',
        component: 'plugin.wechat.dashboard',
        icon: 'Promotion',
        menu: true,
        order: 830,
        default: true,
        path: '/admin/plugins/wechat-official-account/publisher',
        render_mode: 'local',
        layout: 'workspace',
      },
      {
        key: 'drafts',
        label: '公众号草稿',
        description: '查看、删除并把现有微信草稿送入发布流程。',
        component: 'plugin.wechat.drafts',
        icon: 'Document',
        menu: true,
        order: 832,
        default: false,
        path: '/admin/plugins/wechat-official-account/drafts',
        render_mode: 'local',
        layout: 'workspace',
      },
      {
        key: 'media',
        label: '微信图库',
        description: '集中管理微信永久图片素材，并支持从本站图库选图上传。',
        component: 'plugin.wechat.media',
        icon: 'PictureFilled',
        menu: true,
        order: 834,
        default: false,
        path: '/admin/plugins/wechat-official-account/media',
        render_mode: 'local',
        layout: 'workspace',
      },
      {
        key: 'broadcast',
        label: '群发中心',
        description: '处理预览发送、真群发和状态刷新。',
        component: 'plugin.wechat.broadcast',
        icon: 'Connection',
        menu: true,
        order: 836,
        default: false,
        path: '/admin/plugins/wechat-official-account/broadcast',
        render_mode: 'local',
        layout: 'workspace',
      },
      {
        key: 'qrcodes',
        label: '二维码',
        description: '生成活动二维码、菜单二维码并保留记录。',
        component: 'plugin.wechat.qrcode',
        icon: 'Tickets',
        menu: true,
        order: 838,
        default: false,
        path: '/admin/plugins/wechat-official-account/qrcodes',
        render_mode: 'local',
        layout: 'workspace',
      },
    ],
  },
  {
    id: 'newsnow-realtime',
    name: 'NewsNow 实时新闻',
    version: '0.1.0',
    builtin: true,
    marketplace: true,
    official: true,
    verified: true,
    featured: true,
    installed: false,
    enabled: false,
    category: 'content',
    icon: 'DataBoard',
    author: 'Martin',
    description: '启用后在博客前台导航展示“博客 / 新闻”子菜单，并提供一个站内新闻入口页。',
    summary: '把实时新闻入口接入博客导航，让访客在博客和新闻之间切换。',
    features: ['前台导航扩展', '博客/新闻切换', '实时新闻入口'],
    keywords: ['news', 'realtime', 'navigation', 'homepage'],
    tags: ['content', 'navigation', 'official'],
    permissions: [],
    capabilities: ['public_navigation', 'external_news_page'],
    publisher: { name: 'natsume37', url: 'https://martin88.xyz', verified: true },
    compatibility: { backend: 'fastapi', frontend: 'vue', min_app_version: '1.0.0' },
    delivery: { type: 'builtin', entry_mode: 'local', install_strategy: 'builtin-toggle', runtime_type: 'builtin' },
    docsUrl: 'https://newsnow.busiyi.world/c/realtime',
    repoUrl: 'https://github.com/ourongxing/newsnow',
    supportUrl: 'https://github.com/natsume37/Blog-backend/issues',
    adminPages: [],
  },
]

export const resolvePluginPageLoader = (componentKey?: string) => {
  const key = String(componentKey || '').trim()
  if (!key) return undefined
  return pageRegistry[key]
}

export const resolveBuiltinPluginPageLoader = (pluginId?: string, pageKey?: string, path?: string) => {
  const normalizedPluginId = String(pluginId || '').trim()
  if (!normalizedPluginId) return undefined

  const plugin = builtinPluginCatalog.find((item) => item.id === normalizedPluginId)
  if (!plugin) return undefined

  const normalizedPageKey = String(pageKey || '').trim()
  const normalizedPath = String(path || '').trim()
  const pages = plugin.adminPages || []
  const page =
    (normalizedPageKey ? pages.find((item) => item.key === normalizedPageKey) : undefined) ||
    (normalizedPath ? pages.find((item) => item.path === normalizedPath) : undefined) ||
    pages.find((item) => item.default) ||
    pages[0]

  return resolvePluginPageLoader(page?.component || page?.component_key)
}

export const resolvePluginIcon = (iconName?: string): Component => {
  if (!iconName) return Grid
  return iconRegistry[iconName] || Grid
}

import type { Component } from 'vue'
import {
  Box,
  Connection,
  DataBoard,
  Grid,
  MagicStick,
  Promotion,
  Setting,
} from '@element-plus/icons-vue'
import type { PluginManifest } from '../types/plugins'

type PluginPageLoader = () => Promise<any>

const pageRegistry: Record<string, PluginPageLoader> = {
  'plugin.ai.settings': () => import('../views/admin/AISettings.vue'),
  'plugin.wechat.settings': () => import('../views/admin/plugins/WeChatOfficialAccountPlugin.vue'),
}

const iconRegistry: Record<string, Component> = {
  Box,
  Connection,
  DataBoard,
  Grid,
  MagicStick,
  Promotion,
  Setting,
}

export const builtinPluginCatalog: PluginManifest[] = [
  {
    id: 'ai-assistant',
    name: 'AI 助手',
    version: '1.0.0',
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
    description: '管理模型配置，并为文章编辑器提供草稿生成与摘要能力。',
    features: ['AI 草稿', 'AI 摘要', '模型配置'],
    keywords: ['ai', 'draft', 'summary', 'mcp'],
    tags: ['automation', 'editor', 'official'],
    permissions: ['network', 'site_settings'],
    capabilities: ['article_draft', 'article_summary', 'mcp_tools'],
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
    ],
  },
  {
    id: 'wechat-official-account',
    name: '微信公众号发布',
    version: '1.0.0',
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
    description: '把博客文章发送到公众号草稿箱，或按插件配置直接发起发布。',
    features: ['草稿上传', '公众号发布', '文章快捷入口'],
    keywords: ['wechat', 'distribution', 'publish'],
    tags: ['distribution', 'social', 'official'],
    permissions: ['network', 'article_content', 'plugin_settings'],
    capabilities: ['wechat_draft', 'wechat_publish', 'wechat_publish_status'],
    publisher: { name: 'natsume37', url: 'https://martin88.xyz', verified: true },
    compatibility: { backend: 'fastapi', frontend: 'vue', min_app_version: '1.0.0' },
    delivery: { type: 'builtin', entry_mode: 'local', install_strategy: 'builtin-toggle', runtime_type: 'builtin' },
    docsUrl: 'https://github.com/natsume37/Blog-plugin-market/tree/main/plugins/wechat-official-account',
    repoUrl: 'https://github.com/natsume37/Blog-backend',
    supportUrl: 'https://github.com/natsume37/Blog-backend/issues',
    adminPages: [
      {
        key: 'publisher',
        label: '公众号发布',
        description: '维护公众号凭证并选择文章执行上传发布。',
        component: 'plugin.wechat.settings',
        icon: 'Promotion',
        menu: true,
        order: 830,
        default: true,
      },
    ],
  },
]

export const resolvePluginPageLoader = (componentKey?: string) => {
  if (!componentKey) return undefined
  return pageRegistry[componentKey]
}

export const resolvePluginIcon = (iconName?: string): Component => {
  if (!iconName) return Grid
  return iconRegistry[iconName] || Grid
}

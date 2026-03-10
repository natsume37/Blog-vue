export interface PluginAdminPage {
  key: string
  label: string
  description?: string
  component?: string
  icon?: string
  menu?: boolean
  order?: number
  default?: boolean
  path?: string
  route_name?: string
  title?: string
  menu_label?: string
  component_key?: string
  render_mode?: string
  entry_url?: string
  script_url?: string
  layout?: string
}

export interface PluginPublisher {
  name?: string
  url?: string
  verified?: boolean
}

export interface PluginCompatibility {
  backend?: string
  frontend?: string
  min_app_version?: string
  max_app_version?: string
}

export interface PluginDelivery {
  type?: string
  entry_mode?: string
  install_strategy?: string
  runtime_type?: string
  entry_url?: string
}

export interface PluginScreenshot {
  label?: string
  url?: string
}

export interface PluginManifest {
  id: string
  plugin_id?: string
  name: string
  version: string
  latest_version?: string
  installed_version?: string
  description?: string
  summary?: string
  author?: string
  publisher?: PluginPublisher
  icon?: string
  builtin?: boolean
  marketplace?: boolean
  official?: boolean
  verified?: boolean
  featured?: boolean
  installed?: boolean
  enabled?: boolean
  installable?: boolean
  activatable?: boolean
  upgrade_available?: boolean
  status?: string
  category?: string
  source?: string
  homepage?: string
  docsUrl?: string
  docs_url?: string
  repoUrl?: string
  repo_url?: string
  supportUrl?: string
  support_url?: string
  issuesUrl?: string
  issues_url?: string
  changelogUrl?: string
  changelog_url?: string
  manifestUrl?: string
  manifest_url?: string
  sourceRepo?: string
  source_repo?: string
  license?: string
  pricing?: string
  publishedAt?: string
  published_at?: string
  auto_install?: boolean
  features?: string[]
  keywords?: string[]
  tags?: string[]
  capabilities?: string[]
  permissions?: string[]
  compatibility?: PluginCompatibility
  delivery?: PluginDelivery
  screenshots?: PluginScreenshot[]
  adminPages?: PluginAdminPage[]
  admin_pages?: PluginAdminPage[]
  actions?: Array<{ name: string; label: string; description?: string }>
  config?: Record<string, any>
  metadata?: Record<string, any>
}

export interface PluginActionResult {
  success?: boolean
  message?: string
  data?: any
}

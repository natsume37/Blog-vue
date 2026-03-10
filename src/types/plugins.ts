export interface PluginAdminPage {
  key: string
  label: string
  description?: string
  component: string
  icon?: string
  menu?: boolean
  order?: number
  default?: boolean
  path?: string
  route_name?: string
  title?: string
  menu_label?: string
  component_key?: string
}

export interface PluginManifest {
  id: string
  plugin_id?: string
  name: string
  version: string
  description?: string
  author?: string
  icon?: string
  builtin?: boolean
  installed?: boolean
  enabled?: boolean
  status?: string
  category?: string
  source?: string
  homepage?: string
  docsUrl?: string
  features?: string[]
  adminPages?: PluginAdminPage[]
  admin_pages?: PluginAdminPage[]
  config?: Record<string, any>
  metadata?: Record<string, any>
  auto_install?: boolean
}

export interface PluginActionResult {
  success?: boolean
  message?: string
  data?: any
}

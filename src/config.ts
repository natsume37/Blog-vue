/**
 * 应用配置文件
 * 所有配置项都可以在这里统一管理，从 .env 文件动态读取
 */

// API 配置
export const apiConfig = {
  // 后端 API 基础地址
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  // 请求超时时间（毫秒）
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
}

// 站点配置
export const siteConfig = {
  name: import.meta.env.VITE_SITE_NAME as string,
  slogan: import.meta.env.VITE_SITE_SLOGAN as string,
  description: import.meta.env.VITE_SITE_DESCRIPTION as string,
  avatar: import.meta.env.VITE_SITE_AVATAR as string,
  author: import.meta.env.VITE_SITE_AUTHOR as string,
  beian: import.meta.env.VITE_SITE_BEIAN as string,
  footerText: import.meta.env.VITE_SITE_FOOTER_TEXT as string,
}

// 用户默认头像
export const defaultAvatar = import.meta.env.VITE_DEFAULT_AVATAR as string;

// Hero 区域配置（可管理员页面自定义）
export const heroConfig = {
  title: import.meta.env.VITE_HERO_TITLE as string,
  bgImage: import.meta.env.VITE_HERO_BG_IMAGE as string,
  sentences: (import.meta.env.VITE_HERO_SENTENCES as string).split('|'),
}

// 社交链接配置
export const socialConfig = {
  github: import.meta.env.VITE_SOCIAL_GITHUB as string,
  gitee: import.meta.env.VITE_SOCIAL_GITEE as string,
  email: import.meta.env.VITE_SOCIAL_EMAIL as string,
}

// 模块开关配置 
export const modulesConfig = {
  showNotice: import.meta.env.VITE_MODULES_SHOW_NOTICE === 'true',
  noticeText: import.meta.env.VITE_MODULES_NOTICE_TEXT as string,
  showBanner: import.meta.env.VITE_MODULES_SHOW_BANNER === 'true',
}

// 默认导出（兼容旧代码）
export default {
  api: apiConfig,
  site: siteConfig,
  defaultAvatar,
  hero: heroConfig,
  social: socialConfig,
  modules: modulesConfig,
}
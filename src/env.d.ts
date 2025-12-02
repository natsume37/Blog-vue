/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_SITE_NAME: string;
  readonly VITE_SITE_SLOGAN: string;
  readonly VITE_SITE_DESCRIPTION: string;
  readonly VITE_SITE_AVATAR: string;
  readonly VITE_SITE_AUTHOR: string;
  readonly VITE_SITE_BEIAN: string;
  readonly VITE_SITE_FOOTER_TEXT: string;
  readonly VITE_DEFAULT_AVATAR: string;
  readonly VITE_HERO_TITLE: string;
  readonly VITE_HERO_BG_IMAGE: string;
  readonly VITE_HERO_SENTENCES: string;
  readonly VITE_SOCIAL_GITHUB: string;
  readonly VITE_SOCIAL_GITEE: string;
  readonly VITE_SOCIAL_EMAIL: string;
  readonly VITE_MODULES_SHOW_NOTICE: string;
  readonly VITE_MODULES_NOTICE_TEXT: string;
  readonly VITE_MODULES_SHOW_BANNER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
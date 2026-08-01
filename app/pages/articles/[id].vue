<script setup lang="ts">
import DOMPurify from 'dompurify'
import { marked } from 'marked'

import { formatPublicDate } from '~/features/public-content/presentation'
import { serializeJsonLd } from '~/utils/public-seo'

definePageMeta({ layout: 'public' })

const route = useRoute()
const config = useRuntimeConfig()
const { getArticle } = usePublicContentApi()
const articleId = computed(() => Number(route.params.id))

const { data: article, error, refresh, status } = useAsyncData(
  'public-article-detail',
  () => getArticle(articleId.value, { trackView: import.meta.client }),
  {
    // 构建时不计入阅读数；客户端挂载后再完成真实访问统计。
    watch: [articleId],
    default: () => null,
  },
)

onMounted(() => {
  refresh()
})

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  const html = marked.parse(article.value.content, { async: false }) as string
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
})

const articleTitle = computed(() => article.value?.seo_title || article.value?.title || `文章 · ${config.public.siteName}`)
const articleDescription = computed(() => article.value?.seo_description || article.value?.summary || '只读公开文章。')
const articleKeywords = computed(() => article.value?.seo_keywords || article.value?.tags.map(tag => tag.name).join(', '))
const { canonicalUrl, siteUrl } = usePublicSeo({
  title: computed(() => article.value?.title ? `${articleTitle.value} · ${config.public.siteName}` : articleTitle.value),
  description: articleDescription,
  keywords: articleKeywords,
  path: computed(() => `/articles/${articleId.value}`),
  type: 'article',
  // 无法公开读取的文章不应被搜索引擎收录。
  indexable: computed(() => !error.value && Boolean(article.value)),
})

useHead(() => {
  if (!article.value) return {}

  return {
    script: [{
      key: 'structured-data-article',
      type: 'application/ld+json',
      innerHTML: serializeJsonLd({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': article.value.title,
        'description': articleDescription.value,
        'datePublished': article.value.createdAt || article.value.createTime,
        'mainEntityOfPage': canonicalUrl.value,
        'inLanguage': 'zh-CN',
        'keywords': articleKeywords.value,
        'author': {
          '@type': 'Person',
          'name': config.public.siteAuthor,
          'url': siteUrl,
        },
      }),
    }],
  }
})
</script>

<template>
  <main class="reader-page">
    <header class="archive-header">
      <NuxtLink
        class="archive-brand"
        to="/"
      >{{ config.public.siteName }}</NuxtLink>
      <nav aria-label="公开档案导航">
        <NuxtLink to="/articles">文章</NuxtLink>
        <ArchiveThemeSelector />
        <NuxtLink
          to="/login"
          aria-label="站长登录"
        ><UIcon name="i-lucide-lock-keyhole" /></NuxtLink>
      </nav>
    </header>

    <section
      v-if="status === 'pending' || status === 'idle'"
      class="reader-empty"
    >
      正在打开文章…
    </section>

    <article
      v-else-if="article"
      class="reader-content"
    >
      <NuxtLink
        class="reader-back"
        to="/articles"
      >← 文章</NuxtLink>

      <header>
        <p>{{ article.categoryName || '随笔' }} · {{ formatPublicDate(article.createTime) }} · {{ config.public.siteAuthor }}</p>
        <h1>{{ article.title }}</h1>
        <ul
          v-if="article.tags.length"
          aria-label="文章标签"
        >
          <li
            v-for="tag in article.tags"
            :key="tag.id"
          >
            {{ tag.name }}
          </li>
        </ul>
      </header>

      <img
        v-if="article.cover"
        :src="article.cover"
        :alt="article.title"
      >

      <p
        v-if="article.summary"
        class="reader-summary"
      >
        {{ article.summary }}
      </p>

      <!-- eslint-disable vue/no-v-html -->
      <!-- 内容由站长维护，Markdown 转换后仍在展示前净化。 -->
      <div
        class="reader-prose"
        v-html="renderedContent"
      />
      <!-- eslint-enable vue/no-v-html -->
    </article>

    <section
      v-else
      class="reader-empty"
    >
      <p>这篇文章暂不可读。</p>
      <button
        type="button"
        @click="refresh"
      >
        重试
      </button>
    </section>

    <footer class="archive-footer">
      {{ config.public.siteName }} · 只读公开档案
    </footer>
  </main>
</template>

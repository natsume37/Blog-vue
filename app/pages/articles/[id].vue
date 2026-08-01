<script setup lang="ts">
import DOMPurify from 'dompurify'
import { marked } from 'marked'

import { formatPublicDate } from '~/features/public-content/presentation'

definePageMeta({ layout: 'default' })

const route = useRoute()
const config = useRuntimeConfig()
const { getArticle } = usePublicContentApi()
const articleId = computed(() => Number(route.params.id))

const { data: article, refresh, status } = useAsyncData(
  'public-article-detail',
  () => getArticle(articleId.value),
  {
    // 文章详情使用公开接口在客户端获取，不会把某次构建时的正文固化到静态产物。
    server: false,
    watch: [articleId],
    default: () => null,
  },
)

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  const html = marked.parse(article.value.content, { async: false }) as string
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
})

useSeoMeta({
  title: () => article.value?.title
    ? `${article.value.title} · ${config.public.siteName}`
    : `文章 · ${config.public.siteName}`,
  description: () => article.value?.summary || '公开文章阅读页，只提供只读访问。',
})
</script>

<template>
  <main class="public-reader-page">
    <header class="public-content-header">
      <NuxtLink
        class="public-brand"
        to="/"
      >
        <span>日</span><strong>{{ config.public.siteName }}</strong>
      </NuxtLink>
      <NuxtLink
        class="public-reader-back"
        to="/articles"
      ><UIcon name="i-lucide-arrow-left" /> 返回文章归档</NuxtLink>
      <NuxtLink
        class="public-owner-entry"
        to="/login"
        aria-label="站长登录"
      ><UIcon name="i-lucide-lock-keyhole" /></NuxtLink>
    </header>

    <section
      v-if="status === 'pending' || status === 'idle'"
      class="public-reader-state"
    >
      <UIcon name="i-lucide-notebook-pen" />
      <h1>正在打开文章</h1>
      <p>正文加载完成后会显示在这里。</p>
    </section>

    <article
      v-else-if="article"
      class="public-reader"
    >
      <header class="public-reader-heading">
        <p>{{ article.categoryName || '随笔' }}</p>
        <h1>{{ article.title }}</h1>
        <div>
          <time :datetime="article.createTime">{{ formatPublicDate(article.createTime) }}</time>
          <span>{{ article.viewCount }} 次阅读</span>
        </div>
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
        class="public-reader-cover"
        :src="article.cover"
        :alt="article.title"
      >

      <p
        v-if="article.summary"
        class="public-reader-summary"
      >
        {{ article.summary }}
      </p>

      <!-- eslint-disable vue/no-v-html -->
      <!-- 文章仅使用站长维护的内容，仍在展示前净化 Markdown 生成的 HTML。 -->
      <div
        class="public-reader-content"
        v-html="renderedContent"
      />
      <!-- eslint-enable vue/no-v-html -->
    </article>

    <section
      v-else
      class="public-reader-state"
    >
      <UIcon name="i-lucide-lock" />
      <h1>这篇文章暂不可读</h1>
      <p>它可能不存在、尚未公开，或暂时无法从内容服务读取。</p>
      <button
        type="button"
        @click="refresh"
      >
        重新加载
      </button>
    </section>

    <footer class="public-footer">
      <span>PERSONAL ARCHIVE · READ ONLY</span>
      <p>内容持续整理中，所有编辑均在私人工作台完成。</p>
    </footer>
  </main>
</template>

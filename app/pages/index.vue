<script setup lang="ts">
import { formatPublicDate, publicRecordMeta } from '~/features/public-content/presentation'
import type { TimelineRecord } from '~/features/records/types'
import { serializeJsonLd } from '~/utils/public-seo'

definePageMeta({ layout: 'public' })

const config = useRuntimeConfig()
const { data: homeContent, refresh, status } = usePublicHome()

const records = computed(() => homeContent.value?.records ?? [])
const articles = computed(() => homeContent.value?.articles ?? [])
const hasLoadFailure = computed(() => homeContent.value?.hasLoadFailure ?? false)
const isLoading = computed(() => status.value === 'pending' || status.value === 'idle')

function recordKind(record: TimelineRecord): string {
  return publicRecordMeta[record.kind].label
}

const description = '一个按时间整理的只读个人公开档案。'
const { canonicalUrl, siteUrl } = usePublicSeo({
  title: `${config.public.siteName} · 公开档案`,
  description,
  path: '/',
})

useHead(() => ({
  script: [{
    key: 'structured-data-website',
    type: 'application/ld+json',
    innerHTML: serializeJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': config.public.siteName,
      'url': canonicalUrl.value,
      'description': description,
      'inLanguage': 'zh-CN',
      'publisher': {
        '@type': 'Person',
        'name': config.public.siteAuthor,
        'url': siteUrl,
      },
    }),
  }],
}))
</script>

<template>
  <main class="archive-page">
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
      id="timeline"
      class="archive-section"
    >
      <div class="archive-heading">
        <div>
          <p>公开档案</p>
          <h1>最近记录</h1>
        </div>
        <span>只读</span>
      </div>

      <ol class="archive-list">
        <li
          v-if="isLoading"
          class="archive-empty"
        >
          正在读取记录…
        </li>

        <template v-else-if="records.length">
          <li
            v-for="record in records.slice(0, 12)"
            :key="record.id"
            class="archive-row"
          >
            <time :datetime="record.occurredAt">{{ formatPublicDate(record.occurredAt) }}</time>
            <strong>{{ record.title }}</strong>
            <span>{{ recordKind(record) }}</span>
          </li>
        </template>

        <li
          v-else
          class="archive-empty"
        >
          <span>{{ hasLoadFailure ? '公开记录暂时无法读取。' : '还没有公开记录。' }}</span>
          <button
            v-if="hasLoadFailure"
            type="button"
            @click="refresh"
          >
            重试
          </button>
        </li>
      </ol>
    </section>

    <section
      id="writing"
      class="archive-section"
    >
      <div class="archive-heading">
        <div>
          <p>公开文章</p>
          <h2>文章</h2>
        </div>
        <NuxtLink to="/articles">全部</NuxtLink>
      </div>

      <ol class="archive-list archive-list--articles">
        <li
          v-if="isLoading"
          class="archive-empty"
        >
          正在读取文章…
        </li>

        <template v-else-if="articles.length">
          <li
            v-for="article in articles"
            :key="article.id"
          >
            <NuxtLink
              class="archive-row archive-row--link"
              :to="`/articles/${article.id}`"
            >
              <time :datetime="article.createTime">{{ formatPublicDate(article.createTime) }}</time>
              <strong>{{ article.title }}</strong>
              <span>{{ article.categoryName || '随笔' }}</span>
            </NuxtLink>
          </li>
        </template>

        <li
          v-else
          class="archive-empty"
        >
          {{ hasLoadFailure ? '公开文章暂时无法读取。' : '还没有公开文章。' }}
        </li>
      </ol>
    </section>

    <footer class="archive-footer">
      {{ config.public.siteName }} · 只读公开档案
    </footer>
  </main>
</template>

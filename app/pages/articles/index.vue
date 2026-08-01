<script setup lang="ts">
import { formatPublicDate } from '~/features/public-content/presentation'
import type { PublicArticlePage } from '~/features/public-content/types'

definePageMeta({ layout: 'public' })

const config = useRuntimeConfig()
const { listArticles } = usePublicContentApi()
const pageSize = 12
const currentPage = ref(1)

function emptyArticlePage(): PublicArticlePage {
  return {
    records: [],
    total: 0,
    current: 1,
    size: pageSize,
  }
}

const { data: articlePage, refresh, status } = useAsyncData<PublicArticlePage>(
  'public-articles-list',
  () => listArticles({ current: currentPage.value, size: pageSize }),
  {
    // 文章归档需预渲染，便于搜索引擎发现每篇文章的链接。
    watch: [currentPage],
    default: emptyArticlePage,
  },
)

const articles = computed(() => articlePage.value?.records ?? [])
const total = computed(() => articlePage.value?.total ?? 0)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const isLoading = computed(() => status.value === 'pending' || status.value === 'idle')

onMounted(() => {
  refresh()
})

function changePage(nextPage: number): void {
  currentPage.value = Math.min(pageCount.value, Math.max(1, nextPage))
}

usePublicSeo({
  title: `文章 · ${config.public.siteName}`,
  description: '只读公开文章归档。',
  path: '/articles',
})
</script>

<template>
  <main class="archive-page">
    <header class="archive-header">
      <NuxtLink
        class="archive-brand"
        to="/"
      >{{ config.public.siteName }}</NuxtLink>
      <nav aria-label="公开档案导航">
        <NuxtLink to="/">记录</NuxtLink>
        <ArchiveThemeSelector />
        <NuxtLink
          to="/login"
          aria-label="站长登录"
        ><UIcon name="i-lucide-lock-keyhole" /></NuxtLink>
      </nav>
    </header>

    <section class="archive-section archive-section--first">
      <div class="archive-heading">
        <div>
          <p>公开档案</p>
          <h1>文章</h1>
        </div>
        <span>{{ total ? `${total} 篇` : '只读' }}</span>
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
          <span>还没有公开文章。</span>
          <button
            type="button"
            @click="refresh"
          >
            重试
          </button>
        </li>
      </ol>
    </section>

    <nav
      v-if="total > pageSize"
      class="archive-pagination"
      aria-label="文章分页"
    >
      <button
        type="button"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        上一页
      </button>
      <span>{{ currentPage }} / {{ pageCount }}</span>
      <button
        type="button"
        :disabled="currentPage === pageCount"
        @click="changePage(currentPage + 1)"
      >
        下一页
      </button>
    </nav>

    <footer class="archive-footer">
      {{ config.public.siteName }} · 只读公开档案
    </footer>
  </main>
</template>

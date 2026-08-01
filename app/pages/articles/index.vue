<script setup lang="ts">
import { formatPublicDate, getArticleExcerpt } from '~/features/public-content/presentation'
import type { PublicArticlePage } from '~/features/public-content/types'

definePageMeta({ layout: 'default' })

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
    // 静态站点在浏览器中读取实时公开文章，新增文章无需重新发布前端。
    server: false,
    watch: [currentPage],
    default: emptyArticlePage,
  },
)

const articles = computed(() => articlePage.value?.records ?? [])
const total = computed(() => articlePage.value?.total ?? 0)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function changePage(nextPage: number): void {
  currentPage.value = Math.min(pageCount.value, Math.max(1, nextPage))
}

useSeoMeta({
  title: `文章归档 · ${config.public.siteName}`,
  description: '公开文章归档，只提供阅读，不开放访客互动或提交。',
})
</script>

<template>
  <main class="public-content-page">
    <header class="public-content-header">
      <NuxtLink
        class="public-brand"
        to="/"
      >
        <span>日</span><strong>{{ config.public.siteName }}</strong>
      </NuxtLink>
      <nav aria-label="文章页面导航">
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink
          to="/articles"
          aria-current="page"
        >文章归档</NuxtLink>
      </nav>
      <NuxtLink
        class="public-owner-entry"
        to="/login"
        aria-label="站长登录"
      ><UIcon name="i-lucide-lock-keyhole" /></NuxtLink>
    </header>

    <section class="public-page-intro">
      <p>WRITING ARCHIVE</p>
      <h1>文章归档</h1>
      <span>所有内容以阅读为目的，不开放评论、投稿或访客编辑。</span>
    </section>

    <section
      class="public-article-list"
      aria-label="公开文章列表"
    >
      <div
        v-if="status === 'pending' || status === 'idle'"
        class="public-state"
      >
        <UIcon name="i-lucide-notebook-pen" />
        <div>
          <strong>正在读取文章归档</strong>
          <p>稍候片刻，公开文章会显示在这里。</p>
        </div>
      </div>

      <div
        v-else-if="articles.length"
        class="public-article-list-grid"
      >
        <NuxtLink
          v-for="(article, index) in articles"
          :key="article.id"
          class="public-article-card public-article-card--list"
          :to="`/articles/${article.id}`"
        >
          <header>
            <span>ESSAY {{ String((currentPage - 1) * pageSize + index + 1).padStart(2, '0') }}</span>
            <UIcon name="i-lucide-arrow-up-right" />
          </header>
          <div>
            <p>{{ article.categoryName || '随笔' }}</p>
            <h2>{{ article.title }}</h2>
            <span>{{ getArticleExcerpt(article, 132) }}</span>
          </div>
          <footer>
            <time :datetime="article.createTime">{{ formatPublicDate(article.createTime) }}</time>
            <span>{{ article.viewCount }} 次阅读</span>
          </footer>
        </NuxtLink>
      </div>

      <div
        v-else
        class="public-state public-state--empty"
      >
        <UIcon name="i-lucide-notebook-pen" />
        <div>
          <strong>暂时没有公开文章</strong>
          <p>站长发布并设为公开的文章会自动显示在这里。</p>
        </div>
        <button
          type="button"
          @click="refresh"
        >
          重新加载
        </button>
      </div>
    </section>

    <nav
      v-if="total > pageSize"
      class="public-pagination"
      aria-label="文章分页"
    >
      <button
        type="button"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <UIcon name="i-lucide-arrow-left" /> 上一页
      </button>
      <span>第 {{ currentPage }} / {{ pageCount }} 页</span>
      <button
        type="button"
        :disabled="currentPage === pageCount"
        @click="changePage(currentPage + 1)"
      >
        下一页 <UIcon name="i-lucide-arrow-right" />
      </button>
    </nav>

    <footer class="public-footer">
      <span>PERSONAL ARCHIVE · READ ONLY</span>
      <p>内容持续整理中，所有编辑均在私人工作台完成。</p>
    </footer>
  </main>
</template>

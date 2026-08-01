<script setup lang="ts">
import {
  formatPublicDate,
  getArticleExcerpt,
  getPublicRecordDetail,
  publicRecordMeta,
} from '~/features/public-content/presentation'
import type { TimelineRecord } from '~/features/records/types'

definePageMeta({ layout: 'default' })

const config = useRuntimeConfig()
const { data: homeContent, refresh, status } = usePublicHome()

const records = computed(() => homeContent.value?.records ?? [])
const articles = computed(() => homeContent.value?.articles ?? [])
const readingRecords = computed(() => records.value.filter(
  (record): record is Extract<TimelineRecord, { kind: 'reading' }> => record.kind === 'reading',
).slice(0, 3))
const movieRecords = computed(() => records.value.filter(
  (record): record is Extract<TimelineRecord, { kind: 'movie' }> => record.kind === 'movie',
).slice(0, 3))
const hasLoadFailure = computed(() => homeContent.value?.hasLoadFailure ?? false)

function recordMeta(record: TimelineRecord) {
  return publicRecordMeta[record.kind]
}

function recordSummary(record: TimelineRecord): string {
  return record.summary.trim() || getPublicRecordDetail(record)
}

useSeoMeta({
  title: `${config.public.siteName} · 个人数字空间`,
  description: '一个持续记录文章、阅读、电影与生活片段的只读个人数字空间。',
})
</script>

<template>
  <main class="public-home">
    <header class="public-header">
      <NuxtLink
        class="public-brand"
        to="/"
      >
        <span>日</span><strong>{{ config.public.siteName }}</strong>
      </NuxtLink>

      <nav
        class="public-nav"
        aria-label="公开内容导航"
      >
        <a href="#timeline">时间流</a>
        <a href="#writing">文章</a>
        <a href="#reading">书影</a>
      </nav>

      <NuxtLink
        class="public-owner-entry"
        to="/login"
        aria-label="站长登录"
      >
        <UIcon name="i-lucide-lock-keyhole" />
      </NuxtLink>
    </header>

    <section class="public-hero">
      <div class="public-hero-copy">
        <p class="public-eyebrow">
          PERSONAL ARCHIVE · READ ONLY
        </p>
        <h1>把生活的片段，<br><em>留在可以回看的地方。</em></h1>
        <p class="public-hero-description">
          这里收集文章、阅读、电影与日常的微小进展。内容由站长在私人工作台整理，访客始终只读。
        </p>
        <a
          class="public-scroll-link"
          href="#timeline"
        >
          查看最近记录 <UIcon name="i-lucide-arrow-down" />
        </a>
      </div>

      <aside class="public-hero-note">
        <UIcon name="i-lucide-eye" />
        <p>
          不追求完整，<br>只保留值得回看的痕迹。
        </p>
        <span>持续更新中</span>
      </aside>
    </section>

    <section
      class="public-capabilities"
      aria-label="公开内容范围"
    >
      <div>
        <UIcon name="i-lucide-notebook-pen" />
        <span>片段笔记与时间流</span>
      </div>
      <div>
        <UIcon name="i-lucide-book-open" />
        <span>阅读进度与读后想法</span>
      </div>
      <div>
        <UIcon name="i-lucide-clapperboard" />
        <span>电影记录与观后感</span>
      </div>
      <div>
        <UIcon name="i-lucide-lock" />
        <span>访客始终只有阅读权限</span>
      </div>
    </section>

    <section
      id="timeline"
      class="public-section public-timeline-section"
    >
      <div class="public-section-heading">
        <div>
          <p>RECENT LOG</p>
          <h2>最近公开的片段</h2>
        </div>
        <span>按发生时间排列</span>
      </div>

      <div
        v-if="status === 'pending' || status === 'idle'"
        class="public-state"
      >
        <UIcon name="i-lucide-timer" />
        <div>
          <strong>正在读取公开记录</strong>
          <p>内容会在加载完成后出现在这里。</p>
        </div>
      </div>

      <div
        v-else-if="records.length"
        class="public-record-grid"
      >
        <article
          v-for="record in records.slice(0, 8)"
          :key="record.id"
          class="public-record-card"
          :class="`public-record-card--${recordMeta(record).accent}`"
        >
          <header>
            <span>
              <UIcon :name="recordMeta(record).icon" />
              {{ recordMeta(record).label }}
            </span>
            <time :datetime="record.occurredAt">{{ formatPublicDate(record.occurredAt) }}</time>
          </header>
          <h3>{{ record.title }}</h3>
          <p>{{ recordSummary(record) }}</p>
          <footer>
            <span>{{ getPublicRecordDetail(record) }}</span>
            <span
              v-if="record.tags.length"
              class="public-record-tags"
            >{{ record.tags.slice(0, 2).join(' · ') }}</span>
          </footer>
        </article>
      </div>

      <div
        v-else
        class="public-state public-state--empty"
      >
        <UIcon name="i-lucide-sparkles" />
        <div>
          <strong>{{ hasLoadFailure ? '公开记录暂时不可读取' : '公开时间流正在建立' }}</strong>
          <p>{{ hasLoadFailure ? '服务恢复后，这里会自动展示最新的公开内容。' : '站长将记录设为公开后，它会自动出现在这里。' }}</p>
        </div>
        <button
          v-if="hasLoadFailure"
          type="button"
          @click="refresh"
        >
          重新加载
        </button>
      </div>
    </section>

    <section
      id="writing"
      class="public-section public-writing-section"
    >
      <div class="public-section-heading">
        <div>
          <p>WRITING ARCHIVE</p>
          <h2>文章归档</h2>
        </div>
        <NuxtLink to="/articles">全部文章 <UIcon name="i-lucide-arrow-right" /></NuxtLink>
      </div>

      <div
        v-if="status === 'pending' || status === 'idle'"
        class="public-article-skeletons"
        aria-label="正在读取文章"
      >
        <span /><span /><span /><span />
      </div>

      <div
        v-else-if="articles.length"
        class="public-article-grid"
      >
        <NuxtLink
          v-for="(article, index) in articles"
          :key="article.id"
          class="public-article-card"
          :to="`/articles/${article.id}`"
        >
          <header>
            <span>ESSAY {{ String(index + 1).padStart(2, '0') }}</span>
            <UIcon name="i-lucide-arrow-up-right" />
          </header>
          <div>
            <p>{{ article.categoryName || '随笔' }}</p>
            <h3>{{ article.title }}</h3>
            <span>{{ getArticleExcerpt(article) }}</span>
          </div>
          <footer>
            <time :datetime="article.createTime">{{ formatPublicDate(article.createTime) }}</time>
            <span>{{ article.viewCount }} 次阅读</span>
          </footer>
        </NuxtLink>
      </div>

      <div
        v-else
        class="public-compact-empty"
      >
        <UIcon name="i-lucide-notebook-pen" />
        <p>{{ hasLoadFailure ? '文章归档暂时无法读取。' : '公开文章会在完成整理后归档到这里。' }}</p>
      </div>
    </section>

    <section
      id="reading"
      class="public-collections"
    >
      <article class="public-collection public-collection--reading">
        <header>
          <div>
            <UIcon name="i-lucide-book-open" />
            <p>READING SHELF</p>
          </div>
          <span>阅读</span>
        </header>
        <div
          v-if="readingRecords.length"
          class="public-collection-list"
        >
          <article
            v-for="record in readingRecords"
            :key="record.id"
          >
            <span
              class="public-progress-ring"
              :style="{ '--progress': `${record.detail.progress}%` }"
            >{{ record.detail.progress }}%</span>
            <div>
              <h3>{{ record.detail.bookTitle }}</h3>
              <p>{{ getPublicRecordDetail(record) }}</p>
            </div>
          </article>
        </div>
        <div
          v-else
          class="public-collection-empty"
        >
          <p>公开阅读记录会从时间流自动汇集到这里。</p>
        </div>
      </article>

      <article class="public-collection public-collection--movie">
        <header>
          <div>
            <UIcon name="i-lucide-clapperboard" />
            <p>SCREEN NOTES</p>
          </div>
          <span>电影</span>
        </header>
        <div
          v-if="movieRecords.length"
          class="public-collection-list"
        >
          <article
            v-for="record in movieRecords"
            :key="record.id"
          >
            <span class="public-movie-mark">{{ record.detail.rating > 0 ? record.detail.rating.toFixed(1) : '—' }}</span>
            <div>
              <h3>{{ record.detail.movieTitle }}</h3>
              <p>{{ getPublicRecordDetail(record) }}</p>
            </div>
          </article>
        </div>
        <div
          v-else
          class="public-collection-empty"
        >
          <p>公开观影记录会在写下感想后出现在这里。</p>
        </div>
      </article>
    </section>

    <footer class="public-footer">
      <span>PERSONAL ARCHIVE · READ ONLY</span>
      <p>内容持续整理中，所有编辑均在私人工作台完成。</p>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { getRecordModule, recordModules } from '~/features/records/registry'
import type { TimelineRecord } from '~/features/records/types'

const workspace = useWorkspace()
const recordsApi = useRecordsApi()
const expandedIds = ref<string[]>([])
const searchVisible = ref(false)

function toggleExpanded(id: string): void {
  expandedIds.value = expandedIds.value.includes(id)
    ? expandedIds.value.filter(value => value !== id)
    : [...expandedIds.value, id]
}

function formatTime(value: string): string {
  const date = new Date(value)
  const today = new Date()
  const isToday = date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate()

  return new Intl.DateTimeFormat('zh-CN', isToday
    ? {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }
    : {
        month: 'numeric',
        day: 'numeric',
      }).format(date)
}

function recordMeta(record: TimelineRecord): string {
  switch (record.kind) {
    case 'note':
      return `Markdown · ${record.detail.content.length} 字`
    case 'focus':
      return `${Math.max(1, Math.round(record.detail.durationSeconds / 60))} 分钟${record.detail.project ? ` · ${record.detail.project}` : ''}`
    case 'reading':
      return `${record.detail.durationMinutes} 分钟 · ${record.detail.status}`
    case 'movie':
      return `${record.detail.status}${record.detail.rating ? ` · ${record.detail.rating} 星` : ''}`
  }
}

function showSearch(): void {
  searchVisible.value = !searchVisible.value
  if (!searchVisible.value) workspace.setSearch('')
  nextTick(() => document.querySelector<HTMLInputElement>('#timeline-search')?.focus())
}
</script>

<template>
  <section
    id="timeline"
    class="timeline-section"
    aria-labelledby="timeline-title"
  >
    <header class="timeline-heading">
      <div>
        <h2 id="timeline-title">
          时间流
        </h2>
        <span>今天 {{ workspace.todayCount.value }} · 共 {{ workspace.visibleRecords.value.length }} 条</span>
      </div>
      <div class="timeline-controls">
        <div
          class="timeline-filters"
          aria-label="筛选记录"
        >
          <button
            type="button"
            :class="{ 'is-active': workspace.state.value.activeFilter === 'all' }"
            @click="workspace.setFilter('all')"
          >
            全部
          </button>
          <button
            v-for="module in recordModules"
            :key="module.kind"
            type="button"
            :class="{ 'is-active': workspace.state.value.activeFilter === module.kind }"
            @click="workspace.setFilter(module.kind)"
          >
            {{ module.shortLabel }}
          </button>
        </div>
        <button
          class="search-toggle"
          type="button"
          aria-label="搜索时间流"
          @click="showSearch"
        >
          <UIcon :name="searchVisible ? 'i-lucide-x' : 'i-lucide-search'" />
        </button>
      </div>
    </header>

    <label
      v-if="searchVisible"
      class="timeline-search"
      for="timeline-search"
    >
      <UIcon name="i-lucide-search" />
      <input
        id="timeline-search"
        :value="workspace.state.value.search"
        type="search"
        placeholder="搜索标题、内容或标签……"
        @input="workspace.setSearch(($event.target as HTMLInputElement).value)"
      >
      <kbd>ESC</kbd>
    </label>

    <div
      v-if="workspace.visibleRecords.value.length"
      class="timeline-list"
      aria-live="polite"
    >
      <article
        v-for="record in workspace.visibleRecords.value"
        :key="record.id"
        class="timeline-entry"
        :data-record-kind="record.kind"
      >
        <div class="entry-rail">
          <time :datetime="record.occurredAt">{{ formatTime(record.occurredAt) }}</time>
          <span :style="{ '--module-color': getRecordModule(record.kind).color }">
            <UIcon :name="getRecordModule(record.kind).icon" />
          </span>
        </div>

        <div class="entry-card">
          <header>
            <div>
              <span>{{ getRecordModule(record.kind).shortLabel }}</span>
              <small>{{ recordMeta(record) }}</small>
            </div>
            <button
              type="button"
              :aria-label="`展开${record.title}的详情`"
              @click="toggleExpanded(record.id)"
            >
              <UIcon :name="expandedIds.includes(record.id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" />
            </button>
          </header>

          <button
            class="entry-content"
            type="button"
            @click="toggleExpanded(record.id)"
          >
            <strong>{{ record.title }}</strong>
            <p v-if="record.summary">
              {{ record.summary }}
            </p>
          </button>

          <div
            v-if="expandedIds.includes(record.id)"
            class="entry-detail"
          >
            <template v-if="record.kind === 'note'">
              <p>{{ record.detail.content }}</p>
            </template>
            <template v-else-if="record.kind === 'focus'">
              <dl><div><dt>任务</dt><dd>{{ record.detail.task }}</dd></div><div><dt>时长</dt><dd>{{ recordMeta(record) }}</dd></div></dl>
            </template>
            <template v-else-if="record.kind === 'reading'">
              <dl><div><dt>书名</dt><dd>{{ record.detail.bookTitle }}</dd></div><div><dt>进度</dt><dd>{{ record.detail.progress }}%</dd></div></dl>
            </template>
            <template v-else>
              <dl><div><dt>导演</dt><dd>{{ record.detail.director || '未填写' }}</dd></div><div><dt>评分</dt><dd>{{ record.detail.rating || '未评分' }}</dd></div></dl>
            </template>
          </div>

          <footer>
            <div>
              <span
                v-for="tag in record.tags"
                :key="tag"
                class="entry-tag"
              >{{ tag }}</span>
              <span
                v-if="!record.tags.length"
                class="entry-tag"
              >刚刚记录</span>
            </div>
            <span :class="['privacy-label', { 'is-public': record.visibility === 'public' }]">
              <UIcon :name="record.visibility === 'private' ? 'i-lucide-lock' : 'i-lucide-eye'" />
              {{ record.visibility === 'private' ? '仅自己' : '公开只读' }}
            </span>
          </footer>
        </div>
      </article>
    </div>

    <div
      v-else
      class="timeline-empty"
    >
      <span><UIcon name="i-lucide-inbox" /></span>
      <h3>{{ workspace.state.value.search ? '没有匹配的记录' : '今天还没有这类记录' }}</h3>
      <p>换一个筛选条件，或者从上方快速记录开始。</p>
      <button
        type="button"
        @click="workspace.setFilter('all')"
      >
        查看全部记录
      </button>
    </div>

    <div
      v-if="recordsApi.loading.value || recordsApi.error.value || recordsApi.hasMore.value || recordsApi.pendingCount.value"
      class="timeline-sync"
      aria-live="polite"
    >
      <span v-if="recordsApi.loading.value">正在同步服务端记录…</span>
      <template v-else-if="recordsApi.error.value">
        <span>{{ recordsApi.error.value }}</span>
        <button
          type="button"
          @click="recordsApi.syncLatest"
        >
          重新同步
        </button>
      </template>
      <button
        v-else-if="recordsApi.hasMore.value"
        type="button"
        @click="recordsApi.loadMore"
      >
        载入更早记录
      </button>
      <template v-if="recordsApi.pendingCount.value">
        <span>有 {{ recordsApi.pendingCount.value }} 条本机记录待同步</span>
        <button
          type="button"
          @click="recordsApi.flushPending"
        >
          重试同步
        </button>
      </template>
    </div>
  </section>
</template>

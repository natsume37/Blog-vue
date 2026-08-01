<script setup lang="ts">
import { recordModules } from '~/features/records/registry'
import type { RecordKind } from '~/features/records/types'

const workspace = useWorkspace()
const session = useOwnerSession()

const primaryLinks = [
  { label: '今天', icon: 'i-lucide-sun', to: '/workspace' },
  { label: '时间流', icon: 'i-lucide-list-tree', to: '/workspace#timeline' },
]

const secondaryLinks = [
  { label: '回顾', icon: 'i-lucide-calendar-days' },
  { label: '标签', icon: 'i-lucide-tags' },
  { label: '公开站点', icon: 'i-lucide-globe-2', to: '/' },
]

const todayLabel = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(new Date())

async function openCapture(kind: RecordKind): Promise<void> {
  workspace.setActiveCapture(kind)
  await nextTick()
  document.querySelector('.quick-capture')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <aside class="workspace-sidebar">
    <div class="sidebar-brand">
      <NuxtLink
        to="/workspace"
        aria-label="日常工作台"
      >
        <span>日</span>
        <div><strong>日常</strong><small>私人工作台</small></div>
      </NuxtLink>
      <button
        type="button"
        aria-label="搜索记录"
        @click="workspace.setSearch('')"
      >
        <UIcon name="i-lucide-search" />
      </button>
    </div>

    <div class="sidebar-date">
      <small>{{ todayLabel }}</small>
      <strong>{{ workspace.todayCount.value }} 条记录</strong>
    </div>

    <nav aria-label="工作台导航">
      <ul class="nav-primary">
        <li
          v-for="link in primaryLinks"
          :key="link.label"
        >
          <NuxtLink
            :to="link.to"
            :class="{ 'is-active': link.label === '今天' }"
          >
            <UIcon :name="link.icon" /><span>{{ link.label }}</span>
          </NuxtLink>
        </li>
      </ul>

      <div class="nav-group">
        <span>记录</span>
        <button
          v-for="module in recordModules"
          :key="module.kind"
          type="button"
          @click="openCapture(module.kind)"
        >
          <UIcon :name="module.icon" />
          <span>{{ module.shortLabel }}</span>
          <small>{{ workspace.state.value.records.filter(record => record.kind === module.kind).length }}</small>
        </button>
      </div>

      <ul class="nav-secondary">
        <li
          v-for="link in secondaryLinks"
          :key="link.label"
        >
          <NuxtLink
            v-if="link.to"
            :to="link.to"
          >
            <UIcon :name="link.icon" /><span>{{ link.label }}</span>
          </NuxtLink>
          <button
            v-else
            type="button"
          >
            <UIcon :name="link.icon" /><span>{{ link.label }}</span><small>稍后</small>
          </button>
        </li>
      </ul>
    </nav>

    <div class="sidebar-owner">
      <span class="owner-avatar">{{ (session.user.value?.nickname || session.user.value?.username || 'M').slice(0, 1) }}</span>
      <div>
        <strong>{{ session.user.value?.nickname || session.user.value?.username || 'Martin' }}</strong>
        <small>所有者</small>
      </div>
      <button
        type="button"
        aria-label="退出登录"
        @click="session.logout"
      >
        <UIcon name="i-lucide-log-out" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const workspace = useWorkspace()

async function addNote(): Promise<void> {
  workspace.setActiveCapture('note')
  await nextTick()
  document.querySelector('.quick-capture')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <nav
    class="mobile-nav"
    aria-label="移动端工作台导航"
  >
    <NuxtLink
      to="/workspace"
      class="is-active"
    ><UIcon name="i-lucide-sun" /><span>今天</span></NuxtLink>
    <NuxtLink to="/workspace#timeline"><UIcon name="i-lucide-list-tree" /><span>时间流</span></NuxtLink>
    <button
      class="mobile-add"
      type="button"
      aria-label="快速添加笔记"
      @click="addNote"
    >
      <UIcon name="i-lucide-plus" />
    </button>
    <button
      type="button"
      @click="workspace.setActiveCapture('reading')"
    >
      <UIcon name="i-lucide-book-open" /><span>阅读</span>
    </button>
    <button type="button">
      <UIcon name="i-lucide-menu" /><span>更多</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const config = useRuntimeConfig()

useSeoMeta({
  title: `${config.public.siteName} · 个人数字空间`,
  description: '一个持续记录文章、阅读、电影与生活片段的个人数字空间。',
})
</script>

<template>
  <main class="public-placeholder">
    <nav>
      <NuxtLink
        class="public-brand"
        to="/"
      ><span>日</span><strong>{{ config.public.siteName }}</strong></NuxtLink>
      <div>
        <a href="#recent">最近记录</a><NuxtLink
          to="/login"
          aria-label="站长登录"
        ><UIcon name="i-lucide-lock-keyhole" /></NuxtLink>
      </div>
    </nav>
    <section>
      <p>PERSONAL SPACE · READ ONLY</p>
      <h1>认真记录，<br>让普通的日子留下纹理。</h1>
      <div class="public-intro">
        <p>这里会逐步汇集文章、阅读、电影与正在做的事。外部访客只有阅读权限，所有维护都在私人工作台完成。</p>
        <NuxtLink to="/login">站长进入工作台 <UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
      </div>
    </section>
    <section
      id="recent"
      class="public-next"
    >
      <span>公开内容迁移中</span>
      <p>下一阶段将把现有文章与公开书影记录迁移到这套新的视觉系统。</p>
    </section>
  </main>
</template>

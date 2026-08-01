<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: '站长登录 · 日常',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const session = useOwnerSession()
const username = ref('')
const password = ref('')
const message = ref('')

function safeRedirect(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/workspace'
  }
  return value
}

async function submit(): Promise<void> {
  message.value = ''
  const result = await session.login(username.value.trim(), password.value)
  if (!result.ok) {
    message.value = result.message
    return
  }
  await navigateTo(safeRedirect(route.query.redirect))
}
</script>

<template>
  <main class="login-page">
    <NuxtLink
      class="login-brand"
      to="/"
      aria-label="返回公开首页"
    >
      <span>日</span>
      <strong>日常</strong>
    </NuxtLink>

    <section
      class="login-card"
      aria-labelledby="login-title"
    >
      <div class="login-eyebrow">
        <UIcon name="i-lucide-lock-keyhole" />
        私人区域
      </div>
      <h1 id="login-title">
        欢迎回来
      </h1>
      <p>工作台只对站长开放，公开区域始终保持只读。</p>

      <form @submit.prevent="submit">
        <label>
          <span>用户名</span>
          <input
            v-model="username"
            name="username"
            autocomplete="username"
            required
          >
        </label>
        <label>
          <span>密码</span>
          <input
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
          >
        </label>
        <p
          v-if="message"
          class="login-error"
          role="alert"
        >
          {{ message }}
        </p>
        <button
          class="login-submit"
          type="submit"
          :disabled="session.loading.value"
        >
          <span>{{ session.loading.value ? '正在验证…' : '进入工作台' }}</span>
          <UIcon name="i-lucide-arrow-right" />
        </button>
      </form>

      <NuxtLink
        class="login-back"
        to="/"
      >
        <UIcon name="i-lucide-arrow-left" />
        返回公开站点
      </NuxtLink>
    </section>
  </main>
</template>

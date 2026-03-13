<template>
  <div class="news-redirect">
    <div class="news-redirect__panel">
      <div class="news-redirect__eyebrow">Redirecting</div>
      <h1>正在跳转到 NewsNow</h1>
      <p>如果没有自动跳转，点击下面的按钮直接打开新闻站点。</p>
      <a
        class="news-redirect__button"
        :href="targetUrl"
        target="_self"
        rel="noopener noreferrer"
      >
        打开 NewsNow
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const targetUrl = 'https://newsnow.busiyi.world/'

onMounted(() => {
  window.location.replace(targetUrl)
})
</script>

<style scoped>
.news-redirect {
  min-height: calc(100vh - 8rem);
  display: grid;
  place-items: center;
  padding: 8rem 1rem 3rem;
}

.news-redirect__panel {
  width: min(100%, 32rem);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
  padding: 2rem 1.5rem;
  text-align: center;
}

.news-redirect__eyebrow {
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.news-redirect h1 {
  margin-top: 0.85rem;
  color: #0f172a;
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  font-weight: 700;
}

.news-redirect p {
  margin-top: 0.75rem;
  color: #64748b;
  line-height: 1.8;
}

.news-redirect__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.25rem;
  border-radius: 999px;
  background: #0f172a;
  color: #ffffff;
  padding: 0.8rem 1.25rem;
  font-weight: 600;
  transition: background 0.2s ease, transform 0.2s ease;
}

.news-redirect__button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}
</style>

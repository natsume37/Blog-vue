<template>
  <div class="category-page min-h-screen bg-[#f5f7fb]">
    <section class="category-hero">
      <div class="category-hero__media">
        <img :src="activeBanner" alt="Category banner" class="category-hero__image" />
      </div>
      <div class="category-hero__veil"></div>
      <div class="category-hero__noise"></div>
      <div class="category-orb category-orb-a"></div>
      <div class="category-orb category-orb-b"></div>

      <div class="category-hero__content">
        <div class="category-hero__eyebrow">
          {{ activeKeyword ? 'Search Chronicle' : currentCategory ? 'Category Atlas' : 'Article Galaxy' }}
        </div>
        <h1 class="category-hero__title">{{ heroTitle }}</h1>
        <p class="category-hero__desc">{{ heroDescription }}</p>

        <div class="category-hero__chips">
          <span v-if="activeKeyword" class="category-mini-chip">关键词 · {{ activeKeyword }}</span>
          <span v-if="currentCategory" class="category-mini-chip">分类 · {{ currentCategory.name }}</span>
          <span v-if="activeTagName" class="category-mini-chip">标签 · {{ activeTagName }}</span>
          <span v-if="!hasActiveFilters" class="category-mini-chip">正在浏览全部文章</span>
        </div>

        <div class="category-stat-grid">
          <div class="category-stat-card">
            <span>结果总数</span>
            <strong>{{ totalArticles }}</strong>
            <p>{{ resultSummary }}</p>
          </div>
          <div class="category-stat-card">
            <span>分类视角</span>
            <strong>{{ currentCategory?.name || '全部' }}</strong>
            <p>{{ currentCategory?.description || '跨分类浏览最新内容' }}</p>
          </div>
          <div class="category-stat-card">
            <span>筛选密度</span>
            <strong>{{ activeFilterCount }}</strong>
            <p>{{ activeFilterCount > 0 ? '已启用组合筛选' : '当前无额外筛选' }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="category-stage">
      <div class="category-filter-shell">
        <div class="category-filter-shell__head">
          <div>
            <div class="category-filter-shell__eyebrow">Filter Matrix</div>
            <h2 class="category-filter-shell__title">用分类和标签快速切出阅读视图</h2>
            <p class="category-filter-shell__desc">这里的筛选会直接映射到路由参数，刷新和分享链接后仍能保持当前视图。</p>
          </div>
          <el-button v-if="hasActiveFilters" text @click="clearFilters">清空筛选</el-button>
        </div>

        <div class="category-filter-group">
          <div class="category-filter-group__label">
            <el-icon><Folder /></el-icon>
            分类
          </div>
          <div class="category-chip-row">
            <button
              type="button"
              class="category-filter-chip"
              :class="{ 'category-filter-chip-active': selectedCategory === null }"
              @click="selectCategory(null)"
            >
              全部分类
            </button>
            <button
              v-for="category in categories"
              :key="category.id"
              type="button"
              class="category-filter-chip"
              :class="{ 'category-filter-chip-active': selectedCategory === category.id }"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <div class="category-filter-group">
          <div class="category-filter-group__label">
            <el-icon><CollectionTag /></el-icon>
            标签
          </div>
          <div class="category-chip-row">
            <button
              type="button"
              class="category-filter-chip category-filter-chip-soft"
              :class="{ 'category-filter-chip-active': selectedTag === null }"
              @click="selectTag(null)"
            >
              全部标签
            </button>
            <button
              v-for="tag in tags"
              :key="tag.id"
              type="button"
              class="category-filter-chip category-filter-chip-soft"
              :class="{ 'category-filter-chip-active': selectedTag === tag.id }"
              @click="selectTag(tag.id)"
            >
              {{ tag.name }}
            </button>
          </div>
        </div>
      </div>

      <Transition mode="out-in" name="fade">
        <div v-if="loading" class="category-card-grid category-card-grid-loading">
          <div v-for="i in 6" :key="i" class="category-skeleton-card animate-pulse">
            <div class="category-skeleton-card__image"></div>
            <div class="category-skeleton-card__body">
              <div class="h-3 w-24 rounded-full bg-slate-200"></div>
              <div class="h-7 w-3/4 rounded-xl bg-slate-200"></div>
              <div class="h-4 w-full rounded-full bg-slate-100"></div>
              <div class="h-4 w-5/6 rounded-full bg-slate-100"></div>
              <div class="h-4 w-2/3 rounded-full bg-slate-100"></div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div class="category-results-head">
            <div>
              <div class="category-results-head__eyebrow">Discover</div>
              <h3 class="category-results-head__title">{{ resultSummary }}</h3>
            </div>
            <div class="category-results-head__tips">
              <el-icon><Promotion /></el-icon>
              <span>{{ activeKeyword ? '搜索结果已按最新排序' : '当前列表按最新文章排序' }}</span>
            </div>
          </div>

          <TransitionGroup name="card-stagger" tag="div" class="category-card-grid">
            <router-link
              v-for="(article, index) in articles"
              :key="article.id"
              :to="`/article/${article.id}`"
              class="category-card"
              :class="{ 'category-card-featured': index === 0 }"
              :style="{ '--stagger-delay': `${index * 60}ms` }"
            >
              <div class="category-card__image-shell">
                <img
                  :src="article.cover || defaultCover"
                  alt="Cover"
                  loading="lazy"
                  class="category-card__image"
                />
                <div class="category-card__gradient"></div>
                <div class="category-card__badge-row">
                  <span class="category-card__badge category-card__badge-primary">
                    <el-icon><Folder /></el-icon>
                    {{ article.categoryName || '未分类' }}
                  </span>
                  <span v-if="article.tags?.length" class="category-card__badge">
                    <el-icon><PriceTag /></el-icon>
                    {{ article.tags[0].name }}
                  </span>
                </div>
              </div>

              <div class="category-card__body">
                <div class="category-card__meta">
                  <span><el-icon><Calendar /></el-icon>{{ article.createTime }}</span>
                  <span><el-icon><View /></el-icon>{{ article.viewCount || 0 }}</span>
                  <span><el-icon><ChatDotSquare /></el-icon>{{ article.commentCount || 0 }}</span>
                </div>

                <h3 class="category-card__title">{{ article.title }}</h3>
                <p class="category-card__summary">{{ article.summary || '这篇文章还没有摘要，但值得点进去细看。' }}</p>

                <div class="category-card__footer">
                  <div class="category-card__footer-note">
                    <span class="category-card__pulse"></span>
                    {{ index === 0 ? '本页焦点内容' : '继续阅读' }}
                  </div>
                  <span class="category-card__cta">阅读全文</span>
                </div>
              </div>
            </router-link>
          </TransitionGroup>

          <div v-if="articles.length === 0" class="category-empty">
            <el-icon class="category-empty__icon"><Document /></el-icon>
            <h3 class="category-empty__title">当前筛选下还没有文章</h3>
            <p class="category-empty__desc">可以清空筛选重新浏览，或者换一个分类继续探索。</p>
            <el-button type="primary" plain @click="clearFilters">重置视图</el-button>
          </div>
        </div>
      </Transition>

      <div v-if="totalArticles > pageSize" class="flex justify-center mt-12">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalArticles"
          layout="prev, pager, next"
          background
          @current-change="fetchArticles"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { View, Document, Calendar, ChatDotSquare, Folder, PriceTag, Promotion, CollectionTag } from '@element-plus/icons-vue'
import { getArticles, getCategories, getTags } from '../api'

const route = useRoute()
const router = useRouter()

const defaultCover = 'https://images.unsplash.com/photo-1516216628859-9bccecab13ca?q=80&w=1738&auto=format&fit=crop'
const defaultBanner = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop'

const loading = ref(false)
const articles = ref<any[]>([])
const categories = ref<any[]>([])
const tags = ref<any[]>([])
const selectedCategory = ref<number | null>(null)
const selectedTag = ref<number | null>(null)

const currentPage = ref(1)
const pageSize = ref(10)
const totalArticles = ref(0)

const currentCategory = computed(() => {
  if (!selectedCategory.value) return null
  return categories.value.find((category) => category.id === selectedCategory.value) || null
})

const activeKeyword = computed(() => String(route.query.keyword || '').trim())
const activeTagName = computed(() => tags.value.find((tag) => tag.id === selectedTag.value)?.name || '')
const hasActiveFilters = computed(() => Boolean(activeKeyword.value || selectedCategory.value || selectedTag.value))
const activeFilterCount = computed(() => [activeKeyword.value, selectedCategory.value, selectedTag.value].filter(Boolean).length)
const activeBanner = computed(() => currentCategory.value?.banner_url || defaultBanner)

const heroTitle = computed(() => {
  if (activeKeyword.value) return `搜索 “${activeKeyword.value}”`
  if (currentCategory.value?.name) return currentCategory.value.name
  return '发现内容星图'
})

const heroDescription = computed(() => {
  if (activeKeyword.value) {
    return '把关键词、分类和标签组合起来看，能更快定位真正值得阅读的内容。'
  }
  if (currentCategory.value?.quote) {
    return `${currentCategory.value.quote}${currentCategory.value.quote_author ? ` · ${currentCategory.value.quote_author}` : ''}`
  }
  return '这里汇集了全部公开文章。你可以从分类切入，再用标签继续收窄视角。'
})

const resultSummary = computed(() => {
  if (totalArticles.value === 0) {
    return '没有匹配文章'
  }
  if (activeKeyword.value) {
    return `找到 ${totalArticles.value} 篇与 “${activeKeyword.value}” 相关的文章`
  }
  if (currentCategory.value?.name) {
    return `${currentCategory.value.name} 下共有 ${totalArticles.value} 篇文章`
  }
  return `当前共有 ${totalArticles.value} 篇公开文章`
})

const fetchArticles = async () => {
  const loadingTimer = setTimeout(() => {
    loading.value = true
  }, 180)

  try {
    const params: any = {
      current: currentPage.value,
      size: pageSize.value,
      sort: 'new',
    }

    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value
    }
    if (selectedTag.value) {
      params.tagId = selectedTag.value
    }
    if (activeKeyword.value) {
      params.keyword = activeKeyword.value
    }

    const res: any = await getArticles(params)
    if (res.code === 200) {
      articles.value = res.data.records
      totalArticles.value = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    clearTimeout(loadingTimer)
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res: any = await getCategories()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const fetchTags = async () => {
  try {
    const params: any = {}
    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value
    }
    const res: any = await getTags(params)
    if (res.code === 200) {
      tags.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

const initData = async () => {
  await fetchCategories()
}

const selectCategory = (categoryId: number | null) => {
  currentPage.value = 1
  const query: any = { ...route.query }

  if (categoryId) {
    query.categoryId = categoryId
  } else {
    delete query.categoryId
  }

  delete query.tagId
  router.push({ query })
}

const selectTag = (tagId: number | null) => {
  currentPage.value = 1
  const query: any = { ...route.query }

  if (tagId) {
    query.tagId = tagId
  } else {
    delete query.tagId
  }

  router.push({ query })
}

const clearFilters = () => {
  currentPage.value = 1
  router.push({ path: '/category', query: {} })
}

watch(
  () => route.query,
  (newQuery) => {
    selectedCategory.value = newQuery.categoryId ? Number(newQuery.categoryId) : null
    selectedTag.value = newQuery.tagId ? Number(newQuery.tagId) : null

    fetchArticles()
    fetchTags()
  },
  { immediate: true },
)

onMounted(() => {
  initData()
})
</script>

<style scoped>
.category-page {
  overflow: hidden;
}

.category-hero {
  position: relative;
  min-height: 30rem;
  overflow: hidden;
  background: #0f172a;
}

.category-hero__media,
.category-hero__veil,
.category-hero__noise {
  position: absolute;
  inset: 0;
}

.category-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
  animation: category-pan 18s ease-in-out infinite alternate;
}

.category-hero__veil {
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.24), transparent 28%),
    linear-gradient(130deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.38) 48%, rgba(15, 23, 42, 0.82));
}

.category-hero__noise {
  opacity: 0.08;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.35) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(circle at center, black, transparent 78%);
}

.category-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(36px);
  opacity: 0.68;
  pointer-events: none;
  animation: category-float 10s ease-in-out infinite;
}

.category-orb-a {
  top: 4rem;
  right: 10%;
  width: 18rem;
  height: 18rem;
  background: rgba(251, 191, 36, 0.18);
}

.category-orb-b {
  left: 7%;
  bottom: 2rem;
  width: 14rem;
  height: 14rem;
  background: rgba(96, 165, 250, 0.22);
  animation-delay: -2.2s;
}

.category-hero__content {
  position: relative;
  z-index: 1;
  max-width: 90rem;
  margin: 0 auto;
  padding: 8.5rem 1.25rem 5rem;
  color: white;
}

.category-hero__eyebrow,
.category-filter-shell__eyebrow,
.category-results-head__eyebrow {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.category-hero__eyebrow {
  color: rgba(255, 255, 255, 0.78);
}

.category-hero__title {
  max-width: 52rem;
  margin-top: 0.9rem;
  font-size: clamp(2.6rem, 5vw, 4.7rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  font-weight: 800;
}

.category-hero__desc {
  max-width: 44rem;
  margin-top: 1rem;
  font-size: 1rem;
  line-height: 1.85;
  color: rgba(255, 255, 255, 0.82);
}

.category-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.5rem;
}

.category-mini-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
  padding: 0.55rem 0.9rem;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.94);
}

.category-stat-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 2rem;
}

.category-stat-card {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(18px);
  padding: 1rem 1.05rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.category-stat-card span {
  display: block;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.category-stat-card strong {
  display: block;
  margin-top: 0.65rem;
  font-size: 1.55rem;
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.category-stat-card p {
  margin-top: 0.45rem;
  font-size: 0.84rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.78);
}

.category-stage {
  position: relative;
  z-index: 2;
  max-width: 90rem;
  margin: -3.5rem auto 0;
  padding: 0 1.25rem 4.5rem;
}

.category-filter-shell {
  border-radius: 30px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.12), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96));
  padding: 1.35rem;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
}

.category-filter-shell__head {
  display: grid;
  gap: 1rem;
}

.category-filter-shell__eyebrow {
  color: #0ea5e9;
}

.category-filter-shell__title {
  margin-top: 0.5rem;
  font-size: 1.28rem;
  font-weight: 700;
  color: #0f172a;
}

.category-filter-shell__desc {
  margin-top: 0.45rem;
  max-width: 42rem;
  font-size: 0.92rem;
  line-height: 1.8;
  color: #64748b;
}

.category-filter-group + .category-filter-group {
  margin-top: 1rem;
}

.category-filter-group__label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.85rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
}

.category-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.category-filter-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: white;
  padding: 0.68rem 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #475569;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease, color 0.25s ease;
}

.category-filter-chip:hover {
  transform: translateY(-2px);
  border-color: rgba(14, 165, 233, 0.3);
  color: #0f172a;
  box-shadow: 0 16px 26px rgba(14, 165, 233, 0.1);
}

.category-filter-chip-soft {
  background: #f8fafc;
}

.category-filter-chip-active {
  border-color: rgba(14, 165, 233, 0.24);
  background: linear-gradient(135deg, #0f172a, #0369a1);
  color: white;
  box-shadow: 0 18px 38px rgba(14, 165, 233, 0.18);
}

.category-results-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.category-results-head__eyebrow {
  color: #94a3b8;
}

.category-results-head__title {
  margin-top: 0.45rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
}

.category-results-head__tips {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.95);
  padding: 0.7rem 1rem;
  font-size: 0.84rem;
  color: #475569;
}

.category-card-grid {
  display: grid;
  gap: 1.1rem;
  margin-top: 1rem;
}

.category-card {
  display: grid;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid rgba(226, 232, 240, 0.96);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.32s ease, border-color 0.32s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  border-color: rgba(56, 189, 248, 0.25);
  box-shadow: 0 34px 80px rgba(14, 165, 233, 0.12);
}

.category-card__image-shell {
  position: relative;
  overflow: hidden;
  min-height: 14rem;
  background: #0f172a;
}

.category-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.category-card:hover .category-card__image {
  transform: scale(1.06);
}

.category-card__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.6));
}

.category-card__badge-row {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.category-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
  padding: 0.42rem 0.75rem;
  font-size: 0.75rem;
  color: white;
}

.category-card__badge-primary {
  background: rgba(14, 165, 233, 0.2);
}

.category-card__body {
  display: grid;
  gap: 0.95rem;
  padding: 1.15rem;
}

.category-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem 1rem;
  font-size: 0.8rem;
  color: #64748b;
}

.category-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.category-card__title {
  font-size: 1.24rem;
  line-height: 1.25;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.category-card__summary {
  color: #475569;
  line-height: 1.85;
  font-size: 0.92rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.category-card__footer-note {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.82rem;
  color: #0f172a;
  font-weight: 600;
}

.category-card__pulse {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 9999px;
  background: #38bdf8;
  box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.55);
  animation: category-pulse 2.8s ease-in-out infinite;
}

.category-card__cta {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0284c7;
}

.category-card-featured {
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.08), transparent 32%),
    rgba(255, 255, 255, 0.98);
}

.category-skeleton-card {
  overflow: hidden;
  border-radius: 30px;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.category-skeleton-card__image {
  height: 14rem;
  background: linear-gradient(135deg, #e2e8f0, #f8fafc);
}

.category-skeleton-card__body {
  display: grid;
  gap: 0.95rem;
  padding: 1.15rem;
}

.category-empty {
  display: grid;
  justify-items: center;
  gap: 0.8rem;
  border-radius: 30px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  background: white;
  padding: 3rem 1.5rem;
  text-align: center;
}

.category-empty__icon {
  font-size: 3rem;
  color: #cbd5e1;
}

.category-empty__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.category-empty__desc {
  max-width: 26rem;
  line-height: 1.8;
  color: #64748b;
}

.card-stagger-enter-active,
.card-stagger-leave-active,
.card-stagger-move {
  transition: transform 0.48s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.48s ease;
}

.card-stagger-enter-from,
.card-stagger-leave-to {
  opacity: 0;
  transform: translate3d(0, 22px, 0);
}

.card-stagger-enter-active {
  transition-delay: var(--stagger-delay, 0ms);
}

@keyframes category-pan {
  0% {
    transform: scale(1) translate3d(0, 0, 0);
  }
  100% {
    transform: scale(1.08) translate3d(-1.8%, -1.2%, 0);
  }
}

@keyframes category-float {
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -14px, 0);
  }
}

@keyframes category-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(56, 189, 248, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
  }
}

@media (min-width: 768px) {
  .category-hero__content,
  .category-stage {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .category-stat-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .category-filter-shell__head {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: flex-start;
  }

  .category-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1200px) {
  .category-hero__content,
  .category-stage {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .category-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .category-card-featured {
    grid-column: span 2;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  }

  .category-card-featured .category-card__image-shell {
    min-height: 100%;
  }

  .category-card-featured .category-card__body {
    padding: 1.35rem 1.4rem;
    align-content: center;
  }

  .category-card-featured .category-card__title {
    font-size: 1.7rem;
  }

  .category-card-featured .category-card__summary {
    -webkit-line-clamp: 4;
    font-size: 0.96rem;
  }
}

@media (max-width: 767px) {
  .category-hero {
    min-height: 34rem;
  }

  .category-hero__content {
    padding-top: 7.5rem;
    padding-bottom: 4.5rem;
  }

  .category-stage {
    margin-top: -2.8rem;
  }
}
</style>

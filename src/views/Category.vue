<template>
  <div class="min-h-screen bg-gray-50/50">
    <!-- Hero Banner -->
    <div class="relative h-[400px] w-full overflow-hidden">
      <div class="absolute inset-0 bg-black/30 z-10"></div>
      <img 
        :src="currentCategory?.banner_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop'" 
        class="w-full h-full object-cover animate-ken-burns"
        alt="Banner"
      />
      <div class="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center p-4">
        <h1 class="text-4xl md:text-5xl font-bold mb-6 font-serif tracking-wider animate-fade-in-up">
          {{ currentCategory?.quote ? currentCategory.name : '行路难 · 其一' }}
        </h1>
        <div class="w-16 h-1 bg-white/80 mb-6 rounded-full animate-fade-in-up delay-100"></div>
        <p class="text-xl md:text-2xl opacity-90 font-serif mb-3 animate-fade-in-up delay-200">
          {{ currentCategory?.quote || '长风破浪会有时，直挂云帆济沧海。' }}
        </p>
        <p class="text-lg opacity-80 font-serif animate-fade-in-up delay-300">
          {{ currentCategory?.quote_author || '李白' }}
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-10">
      <!-- Tags -->
      <div class="flex flex-wrap gap-3 justify-center mb-12">
        <span
          :class="[
            'px-4 py-2 text-sm rounded-lg cursor-pointer transition-all duration-300 shadow-sm hover:-translate-y-0.5',
            selectedTag === null
              ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-blue-200'
              : 'bg-white text-gray-600 hover:shadow-md hover:text-blue-500'
          ]"
          @click="selectTag(null)"
        >
          全部
        </span>
        <span
          v-for="tag in tags"
          :key="tag.id"
          :class="[
            'px-4 py-2 text-sm rounded-lg cursor-pointer transition-all duration-300 shadow-sm hover:-translate-y-0.5',
            selectedTag === tag.id
              ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-blue-200'
              : 'bg-white text-gray-600 hover:shadow-md hover:text-blue-500'
          ]"
          @click="selectTag(tag.id)"
        >
          {{ tag.name }}
        </span>
      </div>

      <!-- Discover Header -->
      <div class="flex items-center gap-2 mb-6 text-gray-700 border-b border-gray-200 pb-4">
        <el-icon class="text-xl text-yellow-500 animate-bounce"><Promotion /></el-icon>
        <span class="text-lg font-bold">发现</span>
      </div>

      <!-- Article List -->
      <Transition mode="out-in" name="fade">
        <!-- Loading -->
        <div v-if="loading" class="space-y-6">
          <div v-for="i in 5" :key="i" class="bg-white rounded-xl shadow-sm p-6 flex gap-6 animate-pulse">
            <div class="flex-grow space-y-4">
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
              <div class="h-6 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-20 bg-gray-200 rounded w-full"></div>
            </div>
            <div class="w-64 h-40 bg-gray-200 rounded-lg flex-shrink-0"></div>
          </div>
        </div>

        <!-- Articles -->
        <div v-else class="min-h-[200px] space-y-6">
          <TransitionGroup
            name="list"
            tag="div"
            class="space-y-6"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
          >
            <router-link
              v-for="(article, index) in articles"
              :key="article.id"
              :to="`/article/${article.id}`"
              :data-index="index"
              class="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col md:flex-row gap-6 group border border-gray-100"
            >
              <!-- Left Content -->
              <div class="flex-grow flex flex-col min-w-0">
                <!-- Date -->
                <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <el-icon><Calendar /></el-icon>
                  <span>发布于 {{ article.createTime }}</span>
                </div>

                <!-- Title -->
                <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-500 transition-colors line-clamp-1">
                  {{ article.title }}
                </h3>

                <!-- Meta Stats -->
                <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span class="flex items-center gap-1 text-orange-500">
                    <el-icon><View /></el-icon> {{ article.viewCount || 0 }} 热度
                  </span>
                  <span class="flex items-center gap-1 text-gray-400">
                    <el-icon><ChatDotSquare /></el-icon> {{ article.commentCount || 0 }} 评论
                  </span>
                </div>

                <!-- Summary -->
                <p class="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4 flex-grow">
                  {{ article.summary || '暂无摘要' }}
                </p>

                <!-- Footer Tags -->
                <div class="flex items-center gap-4 mt-auto">
                  <span class="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded">
                    <el-icon><Folder /></el-icon> {{ article.categoryName || '未分类' }}
                  </span>
                  <span v-if="article.tags && article.tags.length" class="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                    <el-icon><PriceTag /></el-icon> {{ article.tags[0].name }}
                  </span>
                </div>
              </div>

              <!-- Right Image -->
              <div class="w-full md:w-64 h-40 flex-shrink-0 rounded-lg overflow-hidden relative">
                <img 
                  :src="article.cover || defaultCover" 
                  alt="Cover" 
                  loading="lazy" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
              </div>
            </router-link>
          </TransitionGroup>

          <!-- Empty State -->
          <div v-if="articles.length === 0" class="text-center py-20 text-gray-400 bg-white rounded-xl shadow-sm">
            <el-icon class="text-6xl mb-4"><Document /></el-icon>
            <p>暂无文章</p>
          </div>
        </div>
      </Transition>

      <!-- Pagination -->
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { View, Document, Calendar, ChatDotSquare, Folder, PriceTag, Promotion } from '@element-plus/icons-vue'
import { getArticles, getCategories, getTags } from '../api'

const route = useRoute()
const router = useRouter()

// 默认封面
const defaultCover = 'https://images.unsplash.com/photo-1516216628859-9bccecab13ca?q=80&w=1738&auto=format&fit=crop'

// 状态
const loading = ref(false)
const articles = ref<any[]>([])
const categories = ref<any[]>([])
const tags = ref<any[]>([])
const selectedCategory = ref<number | null>(null)
const selectedTag = ref<number | null>(null)

const currentCategory = computed(() => {
  if (!selectedCategory.value) return null
  return categories.value.find(c => c.id === selectedCategory.value)
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalArticles = ref(0)

// 列表动画钩子
const onBeforeEnter = (el: any) => {
  el.style.opacity = 0
  el.style.transform = 'translateY(20px)'
}

const onEnter = (el: any, done: any) => {
  const delay = el.dataset.index * 100
  setTimeout(() => {
    el.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'
    el.addEventListener('transitionend', done)
  }, delay)
}

// 获取文章
const fetchArticles = async () => {
  // 只有当请求超过 300ms 时才显示 loading，避免闪烁
  const loadingTimer = setTimeout(() => {
    loading.value = true
  }, 300)
  
  try {
    const params: any = {
      current: currentPage.value,
      size: pageSize.value
    }
    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value
    }
    if (selectedTag.value) {
      params.tagId = selectedTag.value
    }

    params.sort = 'new'
    
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

// 获取分类
const fetchCategories = async () => {
  try {
    const res: any = await getCategories()
    if (res.code === 200) categories.value = res.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// 获取标签
const fetchTags = async () => {
  try {
    const params: any = {}
    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value
    }
    const res: any = await getTags(params)
    if (res.code === 200) tags.value = res.data
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

// 初始化数据
const initData = async () => {
  await fetchCategories()
  // tags will be fetched by watcher
}

// 切换标签
const selectTag = (tagId: number | null) => {
  selectedTag.value = tagId
  currentPage.value = 1
  
  // 更新路由参数
  const query: any = { ...route.query }
  if (tagId) {
    query.tagId = tagId
  } else {
    delete query.tagId
  }
  router.push({ query })
}

// 监听路由变化
watch(() => route.query, (newQuery) => {
  if (newQuery.categoryId) {
    selectedCategory.value = Number(newQuery.categoryId)
  } else {
    selectedCategory.value = null
  }
  
  if (newQuery.tagId) {
    selectedTag.value = Number(newQuery.tagId)
  } else {
    selectedTag.value = null
  }
  
  fetchArticles()
  fetchTags()
}, { immediate: true })

onMounted(() => {
  initData()
})
</script>

<style scoped>
.animate-ken-burns {
  animation: ken-burns 20s ease-out infinite alternate;
}

@keyframes ken-burns {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fade-in-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
</style>
<template>
  <div class="min-h-screen bg-gray-50/50 pt-24 pb-12">
    <div class="max-w-7xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-12 font-serif">文章分类</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Category List -->
        <div class="md:col-span-1 space-y-2">
          <div 
            :class="[
              'px-4 py-3 rounded-lg shadow-sm cursor-pointer hover:bg-miyazaki-blue hover:text-white transition-all duration-200 font-medium flex justify-between items-center active:scale-95',
              selectedCategory === null ? 'bg-miyazaki-blue text-white shadow-md' : 'bg-white text-gray-700 hover:shadow-md'
            ]"
            @click="selectCategory(null)"
          >
            全部
            <span :class="['text-xs px-2 py-0.5 rounded-full transition-colors', selectedCategory === null ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500']">{{ totalArticles }}</span>
          </div>
          <div 
            v-for="cat in categories" 
            :key="cat.id" 
            :class="[
              'px-4 py-3 rounded-lg shadow-sm cursor-pointer hover:bg-miyazaki-blue hover:text-white transition-all duration-200 font-medium flex justify-between items-center active:scale-95',
              selectedCategory === cat.id ? 'bg-miyazaki-blue text-white shadow-md' : 'bg-white text-gray-700 hover:shadow-md'
            ]"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
            <span :class="['text-xs px-2 py-0.5 rounded-full transition-colors', selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500']">{{ cat.article_count || 0 }}</span>
          </div>
          
          <!-- Tags Section -->
          <div class="mt-6 bg-white rounded-lg shadow-sm p-4">
            <h3 class="text-sm font-bold text-gray-700 mb-3">标签筛选</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tag in tags" 
                :key="tag.id"
                :class="[
                  'px-2 py-1 text-xs rounded cursor-pointer transition-all border',
                  selectedTag === tag.id 
                    ? 'bg-miyazaki-blue text-white border-miyazaki-blue' 
                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-miyazaki-blue'
                ]"
                @click="selectTag(tag.id)"
              >
                {{ tag.name }}
              </span>
              <span 
                v-if="selectedTag"
                class="px-2 py-1 text-xs rounded cursor-pointer transition-all bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"
                @click="selectTag(null)"
              >
                清除
              </span>
            </div>
          </div>
        </div>

        <!-- Article List -->
        <div class="md:col-span-3">
          <Transition mode="out-in" name="fade">
            <!-- Loading -->
            <div v-if="loading" class="space-y-6">
              <div v-for="i in 4" :key="i" class="bg-white rounded-xl shadow-sm p-6 flex gap-6 animate-pulse">
                <div class="w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div class="flex-grow">
                  <div class="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div class="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div class="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
            
            <!-- Articles -->
            <div v-else class="space-y-6 min-h-[200px]">
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
                  class="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 active:scale-[0.99]"
                >
                  <div class="w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                    <img :src="article.cover || defaultCover" alt="Cover" loading="lazy" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700 ease-out" />
                  </div>
                  <div class="flex-grow flex flex-col justify-between">
                    <div>
                      <div class="flex items-center gap-2 mb-2">
                        <span class="bg-miyazaki-blue/10 text-miyazaki-blue text-xs px-2 py-0.5 rounded">{{ article.categoryName || '未分类' }}</span>
                        <span class="text-gray-400 text-xs">{{ formatDate(article.createTime) }}</span>
                      </div>
                      <h3 class="text-xl font-bold text-gray-800 mb-2 hover:text-miyazaki-blue transition-colors line-clamp-1">{{ article.title }}</h3>
                      <p class="text-gray-600 text-sm line-clamp-2">{{ article.summary || '暂无摘要' }}</p>
                    </div>
                    <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span class="flex items-center gap-1">
                        <el-icon><View /></el-icon> {{ article.viewCount }}
                      </span>
                      <span class="flex items-center gap-1">
                        <el-icon><Star /></el-icon> {{ article.likeCount }}
                      </span>
                    </div>
                  </div>
                </router-link>
              </TransitionGroup>
              
              <!-- Empty State -->
              <div v-if="articles.length === 0" class="text-center py-20 text-gray-400">
                <el-icon class="text-6xl mb-4"><Document /></el-icon>
                <p>暂无文章</p>
              </div>
            </div>
          </Transition>
          
          <!-- Pagination -->
          <div v-if="totalArticles > pageSize" class="flex justify-center mt-8">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { View, Star, Document } from '@element-plus/icons-vue'
import { getArticles, getCategories, getTags } from '../api'

const route = useRoute()

// 默认封面
const defaultCover = 'https://images.unsplash.com/photo-1516216628859-9bccecab13ca?q=80&w=1738&auto=format&fit=crop'

// 状态
const loading = ref(false)
const articles = ref<any[]>([])
const categories = ref<any[]>([])
const tags = ref<any[]>([])
const selectedCategory = ref<number | null>(null)
const selectedTag = ref<number | null>(null)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalArticles = ref(0)

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.split(' ')[0]
}

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
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// 获取标签
const fetchTags = async () => {
  try {
    const res: any = await getTags()
    if (res.code === 200) {
      tags.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

// 选择分类
const selectCategory = (id: number | null) => {
  selectedCategory.value = id
  currentPage.value = 1
  fetchArticles()
}

// 选择标签
const selectTag = (id: number | null) => {
  selectedTag.value = id
  currentPage.value = 1
  fetchArticles()
}

// 监听路由参数
watch(() => route.query, (query) => {
  if (query.tagId) {
    selectedTag.value = Number(query.tagId)
    fetchArticles()
  }
}, { immediate: true })

// 初始化
onMounted(() => {
  fetchCategories()
  fetchTags()
  if (!route.query.tagId) {
    fetchArticles()
  }
})
</script>

<style scoped>
</style>
<template>
  <div class="home-container pb-20 bg-gray-50/50">
    <!-- Hero Section -->
    <div class="relative h-[500px] w-full overflow-hidden mb-8 group">
      <div class="absolute inset-0 bg-gray-900">
        <img :src="siteStore.siteConfig.heroBgImage" alt="Hero" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-[2000ms]" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-gray-50/90"></div>
      <!-- Wave Effect at bottom -->
      <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg class="relative block w-[calc(100%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="fill-gray-50/50"></path>
        </svg>
      </div>
      
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-8 drop-shadow-2xl tracking-wider font-serif">{{ siteStore.siteConfig.heroTitle }}</h1>
        <div class="bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 shadow-2xl">
          <Typewriter :strings="siteStore.siteConfig.heroSentences" />
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Left Sidebar -->
        <aside class="w-full lg:w-[280px] space-y-6 flex-shrink-0">
          <!-- Profile Card -->
          <ProfileCard :stats="siteStats" />
          
          <!-- Admin: Write Article Button -->
          <div v-if="userStore.isAdmin" class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 animate-fade-in-up">
            <router-link 
              to="/admin/articles/new"
              class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-miyazaki-blue to-blue-400 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <el-icon class="group-hover:rotate-12 transition-transform"><EditPen /></el-icon> 
              发布新文章
            </router-link>
          </div>
          
          <!-- Search Box -->
          <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 relative overflow-hidden group">
             <!-- Mac Window Dots -->
             <div class="flex gap-1.5 mb-3">
               <div class="w-3 h-3 rounded-full bg-red-400"></div>
               <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
               <div class="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><el-icon><Search /></el-icon> 搜索</h3>
             <div class="relative">
               <input 
                 v-model="searchKeyword" 
                 type="text" 
                 placeholder="搜索文章..." 
                 class="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-miyazaki-blue focus:bg-white transition-all text-sm" 
                 @keyup.enter="handleSearch"
               />
               <div class="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-gray-400 cursor-pointer hover:text-miyazaki-blue" @click="handleSearch">
                 <el-icon><Search /></el-icon>
               </div>
             </div>
          </div>

          <!-- Recommended Ad/Image -->
          <div class="rounded-xl overflow-hidden shadow-sm group cursor-pointer relative h-40">
            <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
              <span class="text-white font-bold border-2 border-white px-4 py-1 rounded-full backdrop-blur-sm">加入我们</span>
            </div>
          </div>

          <!-- Recommended Articles List -->
          <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 relative overflow-hidden">
            <div class="flex gap-1.5 mb-3">
               <div class="w-3 h-3 rounded-full bg-red-400"></div>
               <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
               <div class="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
            <h3 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <el-icon class="text-orange-400"><Trophy /></el-icon> 推荐文章
            </h3>
            <ul class="space-y-3">
              <li 
                v-for="article in recommendArticles" 
                :key="article.id" 
                class="group cursor-pointer flex gap-3 items-center"
                @click="$router.push(`/article/${article.id}`)"
              >
                <div class="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                  <img :src="article.cover || defaultCover" class="w-full h-full object-cover" />
                </div>
                <div class="flex-grow min-w-0">
                  <h4 class="text-xs font-medium text-gray-700 group-hover:text-miyazaki-blue transition-colors line-clamp-2">
                    {{ article.title }}
                  </h4>
                  <span class="text-[10px] text-gray-400 mt-1 block">{{ formatDate(article.createTime) }}</span>
                </div>
              </li>
              <li v-if="recommendArticles.length === 0" class="text-center text-gray-400 text-sm py-4">
                暂无推荐文章
              </li>
            </ul>
          </div>

          <!-- Tags -->
          <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 relative overflow-hidden">
            <div class="flex gap-1.5 mb-3">
               <div class="w-3 h-3 rounded-full bg-red-400"></div>
               <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
               <div class="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
            <h3 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <el-icon class="text-miyazaki-blue"><CollectionTag /></el-icon> 标签云
            </h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tag in tags" 
                :key="tag.id" 
                :style="{ backgroundColor: tag.color ? tag.color + '20' : '', color: tag.color || '' }"
                class="px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded hover:opacity-80 transition-all cursor-pointer border border-gray-100"
                @click="$router.push(`/category?tagId=${tag.id}`)"
              >
                {{ tag.name }}
              </span>
              <span v-if="tags.length === 0" class="text-gray-400 text-sm">暂无标签</span>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-grow min-w-0 space-y-8">
          <!-- Notice Bar -->
          <div v-if="siteStore.siteConfig.showNotice" class="bg-white rounded-xl shadow-sm p-3 border border-gray-100 flex items-center gap-3 text-sm text-gray-600">
            <el-icon class="text-orange-500 animate-pulse text-lg"><Bell /></el-icon>
            <div class="flex-grow overflow-hidden">
              <div class="animate-marquee whitespace-nowrap">
                {{ siteStore.siteConfig.noticeText }}
              </div>
            </div>
          </div>

          <!-- Latest Articles Section -->
          <div v-if="!loading">
            <section class="mb-12">
              <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                <div class="flex items-center gap-4">
                  <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2 border-l-4 border-orange-400 pl-3">
                    <el-icon class="text-orange-400"><Grid /></el-icon> 最新文章
                  </h2>
                </div>
                <router-link to="/category" class="text-xs font-bold text-gray-400 hover:text-miyazaki-blue transition-colors flex items-center gap-1">
                  MORE <el-icon><DArrowRight /></el-icon>
                </router-link>
              </div>
              
              <TransitionGroup 
                tag="div" 
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                @before-enter="onBeforeEnter"
                @enter="onEnter"
              >
                <ArticleCard 
                  v-for="(article, index) in latestArticles" 
                  :key="article.id"
                  :id="article.id"
                  :title="article.title"
                  :summary="article.summary"
                  :date="article.createTime || ''"
                  :image="article.cover || defaultCover"
                  :category="article.categoryName"
                  :views="article.viewCount"
                  :likes="article.likeCount"
                  :comment-count="article.commentCount"
                  :tags="article.tags"
                  :data-index="index"
                />
              </TransitionGroup>
            </section>
          </div>

          <!-- Categorized Sections -->
          <div v-if="loading" class="space-y-12">
             <div v-for="i in 3" :key="i">
                <div class="h-8 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div v-for="j in 3" :key="j" class="bg-white rounded-xl p-4 animate-pulse h-64"></div>
                </div>
             </div>
          </div>

          <div v-else>
            <section v-for="category in categorizedArticles" :key="category.id" class="mb-12">
              <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                <div class="flex items-center gap-4">
                  <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2 border-l-4 border-orange-400 pl-3">
                    <el-icon class="text-orange-400"><Grid /></el-icon> {{ category.name }}
                  </h2>
                  <span class="text-sm text-gray-500 hidden sm:block">{{ category.description }}</span>
                </div>
                <router-link :to="`/category?categoryId=${category.id}`" class="text-xs font-bold text-gray-400 hover:text-miyazaki-blue transition-colors flex items-center gap-1">
                  MORE <el-icon><DArrowRight /></el-icon>
                </router-link>
              </div>
              
              <TransitionGroup 
                tag="div" 
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                @before-enter="onBeforeEnter"
                @enter="onEnter"
              >
                <ArticleCard 
                  v-for="(article, index) in category.articles" 
                  :key="article.id"
                  :id="article.id"
                  :title="article.title"
                  :summary="article.summary"
                  :date="article.createTime || ''"
                  :image="article.cover || defaultCover"
                  :category="article.categoryName"
                  :views="article.viewCount"
                  :likes="article.likeCount"
                  :comment-count="article.commentCount"
                  :tags="article.tags"
                  :data-index="index"
                />
              </TransitionGroup>
              <div v-if="category.articles.length === 0" class="text-center py-10 text-gray-400 bg-white rounded-xl">
                <el-icon class="text-4xl mb-2"><Document /></el-icon>
                <p>暂无文章</p>
              </div>
            </section>
            
            <div v-if="categorizedArticles.length === 0 && !loading" class="text-center py-20 text-gray-400">
               <el-icon class="text-6xl mb-4"><Document /></el-icon>
               <p>暂无分类数据</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Typewriter from '../components/Typewriter.vue'
import ProfileCard from '../components/ProfileCard.vue'
import ArticleCard from '../components/ArticleCard.vue'
import { 
  Grid, DArrowRight, Search, Trophy, 
  CollectionTag, Bell, Document, EditPen
} from '@element-plus/icons-vue'
import { getHomeArticles, getArticles, getTags, getSiteInfo } from '../api'
import { useSiteStore } from '../stores/site'
import { useUserStore } from '../stores/user'

const router = useRouter()
const siteStore = useSiteStore()
const userStore = useUserStore()

// 默认封面图
const defaultCover = 'https://images.unsplash.com/photo-1516216628859-9bccecab13ca?q=80&w=1738&auto=format&fit=crop'

// 状态
const loading = ref(false)
const categorizedArticles = ref<any[]>([])
const latestArticles = ref<any[]>([])
const recommendArticles = ref<any[]>([])
const tags = ref<any[]>([])
const siteStats = ref({ articleCount: 0, tagCount: 0, viewCount: 0, runDays: 0 })

// 搜索
const searchKeyword = ref('')

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.split(' ')[0] // 只取日期部分
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

// 获取最新文章（带分页）
const fetchLatestArticles = async () => {
  try {
    const res: any = await getArticles({
      current: 1,
      size: 6,
      sort: 'new'
    })
    if (res.code === 200) {
      latestArticles.value = res.data.records
    }
  } catch (error) {
    console.error('Failed to fetch latest articles:', error)
  }
}

// 获取首页分类文章列表
const fetchHomeArticles = async () => {
  loading.value = true
  try {
    await fetchLatestArticles() // 并行或串行获取
    const res: any = await getHomeArticles()
    if (res.code === 200) {
      categorizedArticles.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch home articles:', error)
  } finally {
    loading.value = false
  }
}

// 获取推荐文章
const fetchRecommendArticles = async () => {
  try {
    const res: any = await getArticles({
      current: 1,
      size: 5,
      sort: 'recommend'
    })
    if (res.code === 200) {
      recommendArticles.value = res.data.records
    }
  } catch (error) {
    console.error('Failed to fetch recommend articles:', error)
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

// 获取站点统计
const fetchSiteStats = async () => {
  try {
    const res: any = await getSiteInfo()
    if (res.code === 200) {
      siteStats.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch site stats:', error)
  }
}

// 搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/category', query: { keyword: searchKeyword.value } })
  }
}

// 初始化
onMounted(() => {
  fetchHomeArticles()
  fetchRecommendArticles()
  fetchTags()
  fetchSiteStats()
})

</script>

<style scoped>
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.animate-marquee {
  display: inline-block;
  animation: marquee 15s linear infinite;
}
</style>
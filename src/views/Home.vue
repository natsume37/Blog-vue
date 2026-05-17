<template>
  <div class="home-container pb-20 bg-gray-50/50">
    <!-- Hero Section -->
    <div class="hero-shell relative h-[500px] w-full overflow-hidden mb-8 group">
      <div class="absolute inset-0 bg-gray-900">
        <img
          :src="siteStore.siteConfig.heroBgImage"
          alt="Hero"
          fetchpriority="high"
          decoding="async"
          class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-[2000ms]"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-gray-50/90"></div>
      <div class="hero-glow hero-glow-a"></div>
      <div class="hero-glow hero-glow-b"></div>
      <!-- Cloud transition at bottom -->
      <div class="hero-cloud-transition" aria-hidden="true">
        <div class="hero-cloud-layer hero-cloud-layer-a"></div>
        <div class="hero-cloud-layer hero-cloud-layer-b"></div>
        <div class="hero-cloud-layer hero-cloud-layer-c"></div>
        <div class="hero-cloud-mist"></div>
      </div>
      
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <h1 class="hero-title text-4xl md:text-6xl font-bold text-white mb-8 drop-shadow-2xl tracking-wider font-serif">{{ siteStore.siteConfig.heroTitle }}</h1>
        <div class="hero-typing bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 shadow-2xl">
          <Typewriter :strings="siteStore.siteConfig.heroSentences" />
        </div>
      </div>
    </div>

    <div class="max-w-[90rem] mx-auto px-5 sm:px-6 lg:px-8 xl:px-10">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Left Sidebar -->
        <aside class="w-full lg:w-[280px] space-y-6 flex-shrink-0">
          <!-- Profile Card -->
          <ProfileCard :stats="siteStats" />
          
          <!-- Admin: Write Article Button -->
          <UiCard v-if="userStore.isAdmin" class="panel-card animate-fade-in-up">
            <router-link 
              to="/admin/articles/new"
              class="btn-shine w-full flex items-center justify-center gap-2 bg-gradient-to-r from-miyazaki-blue to-blue-400 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <el-icon class="group-hover:rotate-12 transition-transform"><EditPen /></el-icon> 
              发布新文章
            </router-link>
          </UiCard>
          
          <!-- Search Box -->
          <UiCard class="panel-card relative overflow-hidden group">
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
          </UiCard>

          <!-- Recommended Ad/Image -->
          <UiCard class="panel-card overflow-hidden relative !p-0">
            <div class="relative h-40">
              <img
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-r from-black/55 to-black/20 flex flex-col justify-end p-4">
                <p class="text-white text-xs uppercase tracking-wider opacity-80">Join Our Team</p>
                <p class="text-white font-bold text-lg leading-tight">加入我们 UI 卡片</p>
                <p class="text-white/90 text-xs mt-1">共建前端组件体系与内容平台能力</p>
              </div>
            </div>
          </UiCard>

          <!-- Recommended Articles List -->
          <UiCard class="panel-card relative overflow-hidden">
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
                class="group cursor-pointer flex gap-3 items-center lift-hover"
                @click="$router.push(`/article/${article.id}`)"
              >
                <div class="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                  <img :src="article.cover || defaultCover" loading="lazy" decoding="async" class="w-full h-full object-cover" />
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
          </UiCard>

          <!-- Tags -->
          <UiCard class="panel-card relative overflow-hidden">
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
                class="tag-pill px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded hover:opacity-80 transition-all cursor-pointer border border-gray-100"
                @click="$router.push(`/category?tagId=${tag.id}`)"
              >
                {{ tag.name }}
              </span>
              <span v-if="tags.length === 0" class="text-gray-400 text-sm">暂无标签</span>
            </div>
          </UiCard>
        </aside>

        <!-- Main Content -->
        <main class="flex-grow min-w-0 space-y-8">
          <!-- Notice Bar -->
          <UiCard v-if="siteStore.siteConfig.showNotice" :hoverable="false" padding-class="p-3">
            <div class="flex items-center gap-3 text-sm text-gray-600">
            <el-icon class="text-orange-500 animate-pulse text-lg"><Bell /></el-icon>
            <div class="flex-grow overflow-hidden">
              <div class="animate-marquee whitespace-nowrap">
                {{ siteStore.siteConfig.noticeText }}
              </div>
            </div>
            </div>
          </UiCard>

          <!-- Latest Articles Section -->
          <div v-if="!loading">
            <section class="mb-12">
              <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                <div class="flex items-center gap-4">
                  <h2 class="section-title text-lg font-bold text-gray-800 flex items-center gap-2 border-l-4 border-orange-400 pl-3">
                    <el-icon class="text-orange-400"><Grid /></el-icon> 最新文章
                  </h2>
                </div>
                <router-link to="/category" class="text-xs font-bold text-gray-400 hover:text-miyazaki-blue transition-colors flex items-center gap-1">
                  MORE <el-icon><DArrowRight /></el-icon>
                </router-link>
              </div>
              
              <TransitionGroup
                name="card-stagger"
                tag="div"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
                  :style="{ '--stagger-delay': `${index * 70}ms` }"
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
                  <h2 class="section-title text-lg font-bold text-gray-800 flex items-center gap-2 border-l-4 border-orange-400 pl-3">
                    <el-icon class="text-orange-400"><Grid /></el-icon> {{ category.name }}
                  </h2>
                  <span class="text-sm text-gray-500 hidden sm:block">{{ category.description }}</span>
                </div>
                <router-link :to="`/category?categoryId=${category.id}`" class="text-xs font-bold text-gray-400 hover:text-miyazaki-blue transition-colors flex items-center gap-1">
                  MORE <el-icon><DArrowRight /></el-icon>
                </router-link>
              </div>
              
              <TransitionGroup
                name="card-stagger"
                tag="div"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
                  :style="{ '--stagger-delay': `${index * 70}ms` }"
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
import UiCard from '../components/UiCard.vue'
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
const loading = ref(true)
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

// 获取首页分类文章列表
const fetchHomeArticles = async () => {
  loading.value = true
  try {
    const [latestRes, homeRes]: any = await Promise.all([
      getArticles({
        current: 1,
        size: 6,
        sort: 'new'
      }),
      getHomeArticles()
    ])
    if (latestRes.code === 200) {
      latestArticles.value = latestRes.data.records
    }
    const res: any = homeRes
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
  Promise.allSettled([fetchRecommendArticles(), fetchTags(), fetchSiteStats()])
})

</script>

<style scoped>
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes hero-float {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(0, -10px, 0) scale(1.04); }
}

@keyframes hero-reveal {
  from {
    opacity: 0;
    transform: translate3d(0, 24px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes cloud-drift {
  from { transform: translate3d(-4%, 0, 0); }
  to { transform: translate3d(4%, 0, 0); }
}

@keyframes cloud-breathe {
  0%, 100% {
    opacity: 0.78;
    transform: translate3d(0, 2px, 0) scale(1);
  }
  50% {
    opacity: 0.95;
    transform: translate3d(0, -7px, 0) scale(1.025);
  }
}

@keyframes shine-sweep {
  from { transform: translateX(-130%) skewX(-18deg); }
  to { transform: translateX(240%) skewX(-18deg); }
}

.animate-marquee {
  display: inline-block;
  animation: marquee 15s linear infinite;
}

.home-container {
  background-image:
    radial-gradient(circle at 14% 18%, rgba(135, 206, 235, 0.16), transparent 35%),
    radial-gradient(circle at 82% 24%, rgba(144, 238, 144, 0.12), transparent 32%);
}

.hero-shell {
  isolation: isolate;
}

.hero-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, rgba(255, 255, 255, 0.08), transparent 36%, rgba(255, 255, 255, 0.08) 70%, transparent);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.hero-shell:hover::after {
  opacity: 1;
}

.hero-title {
  animation: hero-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-typing {
  animation: hero-reveal 0.9s 0.18s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(40px);
  pointer-events: none;
  z-index: 1;
}

.hero-glow-a {
  width: 220px;
  height: 220px;
  top: 14%;
  left: 12%;
  background: rgba(255, 255, 255, 0.24);
  animation: hero-float 6.8s ease-in-out infinite;
}

.hero-glow-b {
  width: 180px;
  height: 180px;
  bottom: 18%;
  right: 14%;
  background: rgba(135, 206, 235, 0.26);
  animation: hero-float 7.4s 0.5s ease-in-out infinite;
}

.hero-cloud-transition {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -34px;
  height: 150px;
  overflow: hidden;
  pointer-events: none;
  z-index: 5;
  background:
    linear-gradient(to bottom, rgba(240, 249, 255, 0) 0%, rgba(240, 249, 255, 0.48) 48%, rgba(249, 250, 251, 0.96) 100%),
    radial-gradient(80% 95% at 50% 100%, rgba(255, 255, 255, 0.95), rgba(240, 249, 255, 0.38) 54%, transparent 78%);
}

.hero-cloud-transition::before,
.hero-cloud-transition::after,
.hero-cloud-layer,
.hero-cloud-mist {
  content: '';
  position: absolute;
  left: -10%;
  right: -10%;
  pointer-events: none;
  will-change: transform, opacity;
}

.hero-cloud-transition::before {
  bottom: 26px;
  height: 82px;
  opacity: 0.76;
  background:
    radial-gradient(110px 42px at 7% 58%, rgba(255, 255, 255, 0.7), transparent 68%),
    radial-gradient(150px 58px at 19% 46%, rgba(231, 246, 255, 0.72), transparent 70%),
    radial-gradient(190px 70px at 36% 62%, rgba(255, 255, 255, 0.8), transparent 72%),
    radial-gradient(140px 52px at 54% 42%, rgba(222, 243, 255, 0.62), transparent 70%),
    radial-gradient(210px 74px at 77% 60%, rgba(255, 255, 255, 0.86), transparent 74%),
    radial-gradient(145px 54px at 94% 48%, rgba(230, 246, 255, 0.68), transparent 72%);
  filter: blur(7px);
  animation: cloud-drift 19s ease-in-out infinite alternate;
}

.hero-cloud-transition::after {
  bottom: 0;
  height: 86px;
  opacity: 0.9;
  background:
    radial-gradient(180px 64px at 2% 78%, rgba(249, 250, 251, 0.98), transparent 72%),
    radial-gradient(220px 78px at 18% 72%, rgba(255, 255, 255, 0.98), transparent 74%),
    radial-gradient(250px 86px at 42% 78%, rgba(245, 250, 255, 0.98), transparent 76%),
    radial-gradient(220px 74px at 66% 70%, rgba(255, 255, 255, 0.96), transparent 74%),
    radial-gradient(260px 92px at 91% 76%, rgba(249, 250, 251, 0.98), transparent 76%);
  filter: blur(9px);
  animation: cloud-drift 23s ease-in-out infinite alternate-reverse;
}

.hero-cloud-layer {
  bottom: 18px;
  height: 100px;
  mix-blend-mode: screen;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 28%, black 78%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 28%, black 78%, transparent 100%);
}

.hero-cloud-layer-a {
  opacity: 0.54;
  background:
    radial-gradient(150px 56px at 14% 36%, rgba(180, 220, 235, 0.45), transparent 72%),
    radial-gradient(210px 72px at 46% 48%, rgba(255, 255, 255, 0.46), transparent 74%),
    radial-gradient(170px 62px at 82% 38%, rgba(187, 224, 238, 0.4), transparent 72%);
  filter: blur(15px);
  animation: cloud-drift 31s ease-in-out infinite alternate;
}

.hero-cloud-layer-b {
  bottom: 38px;
  opacity: 0.42;
  background:
    radial-gradient(190px 64px at 5% 68%, rgba(255, 255, 255, 0.48), transparent 72%),
    radial-gradient(260px 78px at 30% 54%, rgba(199, 232, 244, 0.38), transparent 74%),
    radial-gradient(220px 80px at 61% 64%, rgba(255, 255, 255, 0.5), transparent 74%),
    radial-gradient(210px 68px at 96% 52%, rgba(207, 236, 248, 0.44), transparent 72%);
  filter: blur(19px);
  animation: cloud-drift 37s ease-in-out infinite alternate-reverse;
}

.hero-cloud-layer-c {
  bottom: -10px;
  opacity: 0.36;
  background:
    linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.72) 58%, rgba(249, 250, 251, 0.98)),
    radial-gradient(70% 66% at 50% 76%, rgba(223, 244, 255, 0.52), transparent 70%);
  filter: blur(14px);
  animation: cloud-breathe 9s ease-in-out infinite;
}

.hero-cloud-mist {
  inset: auto -8% 0;
  height: 115px;
  opacity: 0.5;
  background:
    repeating-linear-gradient(100deg, rgba(255, 255, 255, 0.06) 0 12px, rgba(197, 225, 238, 0.06) 12px 24px),
    linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.55) 65%, rgba(249, 250, 251, 0.92));
  filter: blur(6px);
  animation: cloud-drift 44s linear infinite alternate;
}

.panel-card {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease;
}

.panel-card:hover {
  transform: translate3d(0, -4px, 0);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
  border-color: rgba(148, 163, 184, 0.28);
}

.section-title {
  position: relative;
  transition: color 0.25s ease;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 12px;
  bottom: -7px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #fb923c, #38bdf8);
  transition: width 0.35s ease;
}

section:hover .section-title::after {
  width: 72px;
}

.lift-hover {
  transition: transform 0.24s ease, opacity 0.24s ease;
}

.lift-hover:hover {
  transform: translate3d(2px, -2px, 0);
}

.tag-pill {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tag-pill:hover {
  transform: translate3d(0, -2px, 0) scale(1.03);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.09);
}

.btn-shine {
  position: relative;
  overflow: hidden;
}

.btn-shine::after {
  content: '';
  position: absolute;
  top: -18%;
  left: -30%;
  width: 24%;
  height: 136%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.48), transparent);
}

.btn-shine:hover::after {
  animation: shine-sweep 0.9s ease;
}

.card-stagger-enter-active {
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease;
  transition-delay: var(--stagger-delay, 0ms);
  will-change: transform, opacity;
}

.card-stagger-enter-from {
  opacity: 0;
  transform: translate3d(0, 20px, 0);
}

@media (prefers-reduced-motion: reduce) {
  .animate-marquee {
    animation: none;
  }

  .hero-title,
  .hero-typing,
  .hero-glow-a,
  .hero-glow-b,
  .hero-cloud-transition::before,
  .hero-cloud-transition::after,
  .hero-cloud-layer,
  .hero-cloud-mist,
  .btn-shine:hover::after {
    animation: none;
  }

  .panel-card:hover,
  .lift-hover:hover,
  .tag-pill:hover {
    transform: none;
  }

  .card-stagger-enter-active {
    transition-duration: 0.01ms;
    transition-delay: 0ms;
  }
}
</style>

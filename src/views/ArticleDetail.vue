<template>
  <div class="min-h-screen bg-white">
    <!-- Loading -->
    <div v-if="loading" class="pt-20 max-w-4xl mx-auto px-4 py-12">
      <div class="animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div class="h-64 bg-gray-200 rounded-xl mb-8"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="article">
      <!-- Hero Section (Cover) -->
      <div class="relative h-[60vh] w-full overflow-hidden">
        <div class="absolute inset-0 bg-gray-900">
           <img :src="article.cover || defaultCover" class="w-full h-full object-cover opacity-80" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
        
        <!-- Title & Meta Overlay -->
        <div class="absolute bottom-0 left-0 w-full p-8 pb-12 text-white">
           <div class="max-w-4xl mx-auto">
             <!-- Tags -->
             <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
                <span 
                  v-for="tag in article.tags" 
                  :key="tag.id"
                  class="px-3 py-1 text-xs rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white"
                >
                  #{{ tag.name }}
                </span>
             </div>
             <!-- Title -->
             <h1 class="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight drop-shadow-lg">
               {{ article.title }}
             </h1>
             <!-- Meta -->
             <div class="flex flex-wrap items-center gap-6 text-sm md:text-base text-white/90 font-medium">
                <span class="flex items-center gap-2">
                  <el-icon :size="18"><Calendar /></el-icon>
                  {{ formatDate(article.createdAt) }}
                </span>
                <span class="flex items-center gap-2">
                  <el-icon :size="18"><Folder /></el-icon>
                  {{ article.categoryName || '未分类' }}
                </span>
                <span class="flex items-center gap-2">
                  <el-icon :size="18"><View /></el-icon>
                  {{ article.viewCount }} 阅读
                </span>
                <span class="flex items-center gap-2">
                  <el-icon :size="18"><ChatDotSquare /></el-icon>
                  {{ article.commentCount }} 评论
                </span>
             </div>
           </div>
        </div>
      </div>

      <!-- Main Content -->
      <article class="max-w-4xl mx-auto px-4 py-12 relative">
         <!-- TOC Button -->
         <div class="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
            <el-tooltip content="文章目录" placement="right">
              <button 
                class="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-miyazaki-blue hover:shadow-xl transition-all duration-300"
                @click="showToc = true"
              >
                <el-icon :size="24"><List /></el-icon>
              </button>
            </el-tooltip>
         </div>

         <!-- Mobile TOC Button -->
         <div class="fixed right-6 bottom-24 z-40 xl:hidden">
            <button 
              class="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-miyazaki-blue transition-all duration-300"
              @click="showToc = true"
            >
              <el-icon :size="20"><List /></el-icon>
            </button>
         </div>

         <div class="w-full">
            <!-- Summary -->
            <div v-if="article.summary" class="bg-gray-50 border-l-4 border-miyazaki-blue p-4 rounded-r-lg text-gray-600 italic mb-8 text-base">
              {{ article.summary }}
            </div>
            
            <!-- Content -->
            <div class="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-miyazaki-blue prose-img:rounded-xl" v-html="renderedContent">
            </div>
            
            <!-- Footer Actions -->
            <footer class="mt-12 pt-8 border-t border-gray-200">
              <div class="flex justify-center gap-4">
                <el-button 
                  :type="isLiked ? 'danger' : 'primary'" 
                  :icon="Star" 
                  round 
                  size="default"
                  :loading="liking"
                  @click="handleLike"
                >
                  {{ isLiked ? '已点赞' : '点赞' }} ({{ article.likeCount }})
                </el-button>
                <el-button 
                  :icon="Share" 
                  round 
                  size="default"
                  @click="handleShare"
                >
                  分享
                </el-button>
              </div>
              
              <!-- Navigation -->
              <div class="mt-8 grid grid-cols-2 gap-4">
                <router-link 
                  v-if="prevArticle" 
                  :to="`/article/${prevArticle.id}`"
                  class="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <span class="text-xs text-gray-400 block mb-1">上一篇</span>
                  <p class="text-gray-700 font-medium line-clamp-1 group-hover:text-miyazaki-blue transition-colors text-sm">{{ prevArticle.title }}</p>
                </router-link>
                <div v-else></div>
                <router-link 
                  v-if="nextArticle" 
                  :to="`/article/${nextArticle.id}`"
                  class="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-right group"
                >
                  <span class="text-xs text-gray-400 block mb-1">下一篇</span>
                  <p class="text-gray-700 font-medium line-clamp-1 group-hover:text-miyazaki-blue transition-colors text-sm">{{ nextArticle.title }}</p>
                </router-link>
              </div>
            </footer>
            
            <!-- 评论区 -->
            <section class="mt-12 pt-8 border-t border-gray-200">
              <CommentSection :content-id="article.id" content-type="article" />
            </section>
         </div>
      </article>
    </div>
    
    <!-- Not Found -->
    <div v-else class="max-w-4xl mx-auto px-4 py-20 text-center pt-32">
      <el-icon class="text-6xl text-gray-300 mb-4"><Document /></el-icon>
      <p class="text-gray-500 mb-4">文章不存在或已被删除</p>
      <router-link to="/" class="text-miyazaki-blue hover:underline">返回首页</router-link>
    </div>

    <!-- TOC Drawer -->
    <el-drawer
      v-model="showToc"
      title="文章目录"
      direction="ltr"
      size="300px"
      :with-header="true"
    >
      <div class="toc-content">
        <ul v-if="toc.length > 0" class="space-y-2">
          <li 
            v-for="(item, index) in toc" 
            :key="index"
            :class="['pl-' + (item.level - 1) * 4]"
          >
            <a 
              :href="'#' + item.id" 
              class="text-gray-600 hover:text-miyazaki-blue transition-colors text-sm block py-1 border-l-2 border-transparent hover:border-miyazaki-blue pl-2"
              @click.prevent="scrollToHeading(item.id)"
            >
              {{ item.text }}
            </a>
          </li>
        </ul>
        <div v-else class="text-gray-400 text-center py-10">
          暂无目录
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, Folder, View, Star, Share, Document, ChatDotSquare, List } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getArticle, getArticles, likeArticle, unlikeArticle, getArticleLikeStatus } from '../api'
import { marked } from 'marked'
import CommentSection from '../components/CommentSection.vue'

const route = useRoute()

// 默认封面
const defaultCover = 'https://images.unsplash.com/photo-1516216628859-9bccecab13ca?q=80&w=1738&auto=format&fit=crop'

// 状态
const loading = ref(false)
const article = ref<any>(null)
const prevArticle = ref<any>(null)
const nextArticle = ref<any>(null)
const isLiked = ref(false)
const liking = ref(false)
const showToc = ref(false)
const toc = ref<any[]>([])

// 配置 marked - 启用 GFM 和换行
marked.setOptions({
  gfm: true,
  breaks: true
})

// 渲染 Markdown 内容
const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  
  // 清空旧的 TOC
  const newToc: any[] = []
  
  // 自定义 renderer 来收集 TOC
  const tocRenderer = new marked.Renderer()
  
  // 自定义标题渲染，同时收集 TOC
  tocRenderer.heading = function({ tokens, depth }: { tokens: any[], depth: number }) {
    // 使用 marked 的 parser 来解析 tokens 获取纯文本和 HTML
    const text = tokens.map((t: any) => t.raw || t.text || '').join('')
    const htmlContent = this.parser.parseInline(tokens)
    const id = `heading-${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')}`
    
    // 收集 TOC（使用纯文本）
    newToc.push({ id, text: text.replace(/\*\*/g, '').replace(/\*/g, ''), level: depth })
    
    // 返回渲染后的 HTML
    return `<h${depth} id="${id}">${htmlContent}</h${depth}>`
  }
  
  // 使用 marked.parse
  const html = marked.parse(article.value.content, { renderer: tocRenderer }) as string
  
  // 更新 TOC
  toc.value = newToc
  
  return html
})

// 滚动到指定标题
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - 80 // 减去导航栏高度
    window.scrollTo({ top, behavior: 'smooth' })
    showToc.value = false
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取文章详情
const fetchArticle = async () => {
  const id = Number(route.params.id)
  if (!id) return
  
  loading.value = true
  try {
    const res: any = await getArticle(id)
    if (res.code === 200) {
      article.value = res.data
      // 获取相邻文章
      fetchAdjacentArticles(id)
      // 获取点赞状态
      fetchLikeStatus(id)
    } else {
      article.value = null
    }
  } catch (error) {
    console.error('Failed to fetch article:', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

// 获取点赞状态
const fetchLikeStatus = async (articleId: number) => {
  try {
    const res: any = await getArticleLikeStatus(articleId)
    if (res.code === 200) {
      isLiked.value = res.data.isLiked
    }
  } catch (error) {
    console.error('Failed to fetch like status:', error)
  }
}

// 获取相邻文章
const fetchAdjacentArticles = async (currentId: number) => {
  try {
    const res: any = await getArticles({ current: 1, size: 100 })
    if (res.code === 200) {
      const articles = res.data.records
      const currentIndex = articles.findIndex((a: any) => a.id === currentId)
      if (currentIndex > 0) {
        nextArticle.value = articles[currentIndex - 1]
      } else {
        nextArticle.value = null
      }
      if (currentIndex < articles.length - 1) {
        prevArticle.value = articles[currentIndex + 1]
      } else {
        prevArticle.value = null
      }
    }
  } catch (error) {
    console.error('Failed to fetch adjacent articles:', error)
  }
}

// 点赞
const handleLike = async () => {
  if (!article.value || liking.value) return
  
  liking.value = true
  try {
    if (isLiked.value) {
      // 取消点赞
      const res: any = await unlikeArticle(article.value.id)
      if (res.code === 200) {
        isLiked.value = false
        article.value.likeCount = res.data.likeCount
        ElMessage.success('已取消点赞')
      } else {
        ElMessage.warning(res.msg || '操作失败')
      }
    } else {
      // 点赞
      const res: any = await likeArticle(article.value.id)
      if (res.code === 200) {
        isLiked.value = true
        article.value.likeCount = res.data.likeCount
        ElMessage.success('感谢您的点赞！')
      } else {
        ElMessage.warning(res.msg || '操作失败')
      }
    }
  } catch (error) {
    console.error('Like operation failed:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    liking.value = false
  }
}

// 分享
const handleShare = () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    ElMessage.success('链接已复制到剪贴板')
  } else {
    ElMessage.info('请手动复制链接分享')
  }
}

// 监听路由变化
watch(() => route.params.id, () => {
  fetchArticle()
  window.scrollTo(0, 0)
})

// 初始化
onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
/* Prose 样式增强 */
:deep(.prose) {
  line-height: 1.8;
}

:deep(.prose img) {
  margin: 1.5rem auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 确保加粗正确渲染 */
:deep(.prose strong),
:deep(.prose b) {
  font-weight: 700 !important;
  color: #0f172a;
}

/* 确保斜体正确渲染 */
:deep(.prose em),
:deep(.prose i) {
  font-style: italic !important;
}

/* 删除线 */
:deep(.prose del),
:deep(.prose s) {
  text-decoration: line-through;
  color: #64748b;
}
</style>
<template>
  <div class="comment-section">
    <!-- 评论标题 -->
    <div class="flex items-center gap-3 mb-8">
      <div class="w-1 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full"></div>
      <h3 class="text-2xl font-bold text-gray-800">评论区</h3>
      <span class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium">
        {{ totalComments }} 条评论
      </span>
    </div>

    <!-- 评论输入框 -->
    <div class="comment-input-card mb-8">
      <div v-if="userStore.isLoggedIn" class="flex gap-4">
        <div class="flex-shrink-0">
          <UserAvatar 
            :src="userStore.userInfo?.avatar" 
            :name="userStore.userInfo?.nickname || userStore.userInfo?.username"
            class="w-12 h-12 border-2 border-white shadow-md"
          />
        </div>
        <div class="flex-1">
          <div class="relative">
            <textarea 
              v-model="newComment" 
              :placeholder="replyTo ? `回复 @${replyTo.nickname}...` : '写下你的想法...'"
              class="comment-textarea"
              rows="3"
              maxlength="2000"
            ></textarea>
            <div class="absolute bottom-3 right-3 text-xs text-gray-400">
              {{ newComment.length }} / 2000
            </div>
          </div>
          <div class="flex justify-between items-center mt-3">
            <div class="flex gap-2">
              <button 
                v-if="replyTo" 
                @click="cancelReply"
                class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                取消回复
              </button>
            </div>
            <button 
              @click="submitComment" 
              :disabled="!newComment.trim() || submitting"
              class="submit-btn"
            >
              <span v-if="submitting" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                发送中...
              </span>
              <span v-else class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                发表评论
              </span>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <p class="text-gray-500 mb-4">登录后即可参与评论讨论</p>
        <router-link 
          to="/login" 
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          立即登录
        </router-link>
      </div>
    </div>

    <!-- 评论列表 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="flex items-center gap-3 text-gray-500">
        <svg class="animate-spin h-6 w-6" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <span>加载评论中...</span>
      </div>
    </div>

    <div v-else-if="comments.length === 0" class="empty-comments">
      <div class="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center">
        <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      </div>
      <p class="text-gray-400 text-lg">暂无评论</p>
      <p class="text-gray-300 text-sm mt-1">快来发表第一条评论吧~</p>
    </div>

    <div v-else class="space-y-6">
      <TransitionGroup name="comment-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-card">
          <!-- 主评论 -->
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <UserAvatar 
                :src="comment.user.avatar" 
                :name="comment.user.nickname || comment.user.username"
                class="w-11 h-11 border-2 border-white shadow-sm"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-semibold text-gray-800">{{ comment.user.nickname }}</span>
                <span class="text-xs text-gray-400">{{ formatTime(comment.created_at) }}</span>
              </div>
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{{ comment.content }}</p>
              <div class="flex items-center gap-4 mt-3">
                <button 
                  @click="handleLike(comment)" 
                  class="action-btn"
                  :class="{ 'text-rose-500': comment.is_liked }"
                >
                  <svg class="w-4 h-4" :fill="comment.is_liked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  <span>{{ comment.like_count || 0 }}</span>
                </button>
                <button @click="setReply(comment)" class="action-btn">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                  </svg>
                  <span>回复</span>
                </button>
                <button 
                  v-if="canDelete(comment)" 
                  @click="handleDelete(comment)" 
                  class="action-btn text-gray-400 hover:text-rose-500"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>

              <!-- 回复列表 -->
              <div v-if="comment.replies && comment.replies.length > 0" class="replies-container mt-4">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <UserAvatar 
                    :src="reply.user.avatar" 
                    :name="reply.user.nickname || reply.user.username"
                    class="w-8 h-8 flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-medium text-gray-800 text-sm">{{ reply.user.nickname }}</span>
                      <template v-if="reply.reply_to">
                        <span class="text-gray-400 text-sm">回复</span>
                        <span class="font-medium text-emerald-600 text-sm">@{{ reply.reply_to.nickname }}</span>
                      </template>
                      <span class="text-xs text-gray-400">{{ formatTime(reply.created_at) }}</span>
                    </div>
                    <p class="text-gray-600 text-sm mt-1 whitespace-pre-wrap break-words">{{ reply.content }}</p>
                    <div class="flex items-center gap-3 mt-2">
                      <button 
                        @click="handleLikeReply(reply)" 
                        class="action-btn-sm"
                        :class="{ 'text-rose-500': reply.is_liked }"
                      >
                        <svg class="w-3.5 h-3.5" :fill="reply.is_liked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                        <span>{{ reply.like_count || 0 }}</span>
                      </button>
                      <button @click="setReply(comment, reply.user)" class="action-btn-sm">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                        </svg>
                        <span>回复</span>
                      </button>
                      <button 
                        v-if="canDeleteReply(reply)" 
                        @click="handleDeleteReply(reply)" 
                        class="action-btn-sm text-gray-400 hover:text-rose-500"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="text-center mt-8">
      <button 
        @click="loadMore" 
        :disabled="loadingMore"
        class="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-full hover:border-emerald-300 hover:text-emerald-600 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <span v-if="loadingMore" class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          加载中...
        </span>
        <span v-else>加载更多评论</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as api from '../api'
import UserAvatar from './UserAvatar.vue'

interface Props {
  contentId: number
  contentType?: 'article' | 'changelog' | 'message_board'
}

const props = withDefaults(defineProps<Props>(), {
  contentType: 'article'
})
const userStore = useUserStore()

// 状态
const loading = ref(false)
const loadingMore = ref(false)
const submitting = ref(false)
const comments = ref<any[]>([])
const totalComments = ref(0)
const currentPage = ref(1)
const pageSize = 10

// 回复状态
const newComment = ref('')
const replyTo = ref<any>(null)
const replyParentId = ref<number | null>(null)

// 计算属性
const hasMore = computed(() => comments.value.length < totalComments.value)

// 加载评论
const fetchComments = async (page = 1, append = false) => {
  if (page === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  
  try {
    const res: any = await api.getComments(props.contentType, props.contentId, {
      current: page,
      size: pageSize
    })
    
    if (res.code === 200) {
      if (append) {
        comments.value = [...comments.value, ...res.data.records]
      } else {
        comments.value = res.data.records
      }
      totalComments.value = res.data.total
      currentPage.value = page
    }
  } catch (error) {
    console.error('加载评论失败:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多
const loadMore = () => {
  fetchComments(currentPage.value + 1, true)
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) return
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  
  submitting.value = true
  try {
    const data: any = {
      content_type: props.contentType,
      content_id: props.contentId,
      content: newComment.value.trim()
    }
    
    if (replyParentId.value) {
      data.parent_id = replyParentId.value
    }
    if (replyTo.value) {
      data.reply_to_id = replyTo.value.id
    }
    
    const res: any = await api.createComment(data)
    
    if (res.code === 200) {
      ElMessage.success('评论成功')
      newComment.value = ''
      cancelReply()
      // 重新加载评论
      fetchComments(1)
    } else {
      ElMessage.error(res.msg || '评论失败')
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    ElMessage.error('评论失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 设置回复
const setReply = (comment: any, user?: any) => {
  replyParentId.value = comment.id
  replyTo.value = user || comment.user
  // 滚动到输入框
  document.querySelector('.comment-textarea')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  ;(document.querySelector('.comment-textarea') as HTMLTextAreaElement)?.focus()
}

// 取消回复
const cancelReply = () => {
  replyTo.value = null
  replyParentId.value = null
}

// 点赞评论
const handleLike = async (comment: any) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  
  try {
    const res: any = await api.likeComment(comment.id)
    if (res.code === 200) {
      comment.like_count = res.data.like_count
      comment.is_liked = true
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 点赞回复
const handleLikeReply = async (reply: any) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  
  try {
    const res: any = await api.likeComment(reply.id)
    if (res.code === 200) {
      reply.like_count = res.data.like_count
      reply.is_liked = true
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 权限检查
const canDelete = (comment: any) => {
  if (!userStore.isLoggedIn) return false
  return userStore.userInfo?.id === comment.user.id || userStore.isAdmin
}

const canDeleteReply = (reply: any) => {
  if (!userStore.isLoggedIn) return false
  return userStore.userInfo?.id === reply.user.id || userStore.isAdmin
}

// 删除评论
const handleDelete = async (comment: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res: any = await api.deleteComment(comment.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchComments(1)
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
    }
  }
}

// 删除回复
const handleDeleteReply = async (reply: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条回复吗？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res: any = await api.deleteComment(reply.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchComments(1)
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除回复失败:', error)
    }
  }
}

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 监听内容ID变化
watch(() => props.contentId, (newId) => {
  if (newId) {
    fetchComments(1)
  }
}, { immediate: true })

onMounted(() => {
  if (props.contentId) {
    fetchComments(1)
  }
})
</script>

<style scoped>
.comment-section {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.comment-input-card {
  background: linear-gradient(to bottom right, white, rgba(249, 250, 251, 0.5));
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgb(243, 244, 246);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 0.75rem;
  resize: none;
  outline: none;
  transition: all 0.3s;
}

.comment-textarea:focus {
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  border-color: rgb(52, 211, 153);
}

.submit-btn {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(to right, rgb(16, 185, 129), rgb(20, 184, 166));
  color: white;
  border-radius: 9999px;
  font-weight: 500;
  transition: all 0.3s;
}

.submit-btn:hover {
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:disabled:hover {
  box-shadow: none;
}

.empty-comments {
  text-align: center;
  padding: 4rem 0;
}

.comment-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgb(243, 244, 246);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: all 0.3s;
}

.comment-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: rgb(107, 114, 128);
  transition: color 0.2s;
}

.action-btn:hover {
  color: rgb(16, 185, 129);
}

.action-btn-sm {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: rgb(156, 163, 175);
  transition: color 0.2s;
}

.action-btn-sm:hover {
  color: rgb(16, 185, 129);
}

.replies-container {
  background: rgba(249, 250, 251, 0.8);
  border-radius: 0.75rem;
  padding: 1rem;
}

.replies-container > * + * {
  margin-top: 1rem;
}

.reply-item {
  display: flex;
  gap: 0.75rem;
}

/* 动画 */
.comment-list-enter-active,
.comment-list-leave-active {
  transition: all 0.4s ease;
}

.comment-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.comment-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

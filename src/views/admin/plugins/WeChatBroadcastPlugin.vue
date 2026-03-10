<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Broadcast Hub</div>
          <h3 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">群发与预览中心</h3>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            支持文章直发预览、草稿转群发、按全部粉丝或标签发起真群发，并把任务状态持续回写到列表。
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <el-button class="!rounded-full" @click="router.push('/admin/plugins/wechat-official-account/drafts')">
            打开草稿箱
          </el-button>
          <el-button type="primary" class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800" :loading="loadingTasks" @click="fetchTasks">
            刷新任务
          </el-button>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <article class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
        <div class="mb-5">
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Source</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">内容来源</h4>
        </div>

        <div class="rounded-[22px] border border-slate-200 bg-slate-50/85 p-4">
          <el-radio-group v-model="form.source_type">
            <el-radio-button label="article">站内文章</el-radio-button>
            <el-radio-button label="draft">微信草稿</el-radio-button>
          </el-radio-group>
        </div>

        <div class="mt-5 space-y-4">
          <template v-if="form.source_type === 'article'">
            <div class="flex gap-3">
              <el-input v-model="articleIdInput" placeholder="输入文章 ID" />
              <el-button :loading="articleLoading" @click="loadArticle">加载文章</el-button>
            </div>

            <div
              v-if="article"
              class="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50/85"
            >
              <img v-if="article.cover" :src="article.cover" alt="article cover" class="h-48 w-full object-cover" />
              <div class="space-y-3 p-5">
                <div class="text-lg font-semibold text-slate-900">{{ article.title }}</div>
                <p class="text-sm leading-7 text-slate-500">{{ article.summary || '该文章暂无摘要。' }}</p>
                <div class="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span class="rounded-full bg-white px-3 py-1">文章 {{ article.id }}</span>
                  <span class="rounded-full bg-white px-3 py-1">{{ article.categoryName || '未分类' }}</span>
                </div>
              </div>
            </div>

            <div
              v-else
              class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/85 px-5 py-8 text-sm text-slate-500"
            >
              文章模式会先把站内文章转换成微信图文，再用于预览或真群发。
            </div>
          </template>

          <template v-else>
            <el-form label-position="top">
              <el-form-item label="草稿 Media ID">
                <el-input v-model="form.draft_media_id" placeholder="输入微信草稿 media_id" />
              </el-form-item>
              <el-form-item label="标题备注">
                <el-input v-model="form.title" placeholder="仅用于本地任务记录展示" />
              </el-form-item>
            </el-form>
            <div class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/85 px-5 py-8 text-sm text-slate-500">
              草稿模式会读取现有微信草稿内容，再重新生成适合群发的 mpnews 素材。
            </div>
          </template>
        </div>
      </article>

      <article class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
        <div class="mb-5">
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Delivery</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">发送策略</h4>
        </div>

        <div class="grid gap-5">
          <div class="rounded-[24px] border border-slate-200 bg-slate-50/85 p-5">
            <div class="text-sm font-semibold text-slate-900">非群发预览</div>
            <p class="mt-2 text-sm leading-7 text-slate-500">先把图文发到指定微信号或 OpenID，确认视觉和内容正常后再发起真群发。</p>
            <el-form label-position="top" class="mt-4">
              <div class="grid gap-4 md:grid-cols-2">
                <el-form-item label="目标类型">
                  <el-select v-model="form.preview_target_type" class="w-full">
                    <el-option label="微信号" value="towxname" />
                    <el-option label="OpenID" value="touser" />
                  </el-select>
                </el-form-item>
                <el-form-item label="预览目标">
                  <el-input v-model="form.preview_target_value" placeholder="微信号或 OpenID" />
                </el-form-item>
              </div>
            </el-form>
            <el-button
              type="primary"
              class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800"
              :loading="previewing"
              @click="sendPreview"
            >
              发送预览
            </el-button>
          </div>

          <div class="rounded-[24px] border border-slate-200 bg-slate-50/85 p-5">
            <div class="text-sm font-semibold text-slate-900">真群发</div>
            <p class="mt-2 text-sm leading-7 text-slate-500">按全部粉丝或标签发起群发。提交后会生成任务记录，后续可在下方刷新状态。</p>
            <el-form label-position="top" class="mt-4">
              <div class="grid gap-4 md:grid-cols-2">
                <el-form-item label="受众模式">
                  <el-select v-model="form.audience_mode" class="w-full">
                    <el-option label="全部粉丝" value="all" />
                    <el-option label="按标签群发" value="tag" />
                  </el-select>
                </el-form-item>
                <el-form-item label="标签 ID">
                  <el-input v-model="form.tag_id" :disabled="form.audience_mode !== 'tag'" placeholder="群发标签 ID" />
                </el-form-item>
              </div>
            </el-form>
            <div class="rounded-[20px] border border-slate-200 bg-white/80 p-4">
              <div class="text-sm font-medium text-slate-800">忽略转载校验</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">一般用于已知文章可能触发转载拦截的情况。</div>
              <el-switch v-model="form.send_ignore_reprint" class="mt-3" />
            </div>
            <el-button
              type="primary"
              class="mt-4 !rounded-full !border-none !bg-sky-600 hover:!bg-sky-500"
              :loading="sending"
              @click="sendBroadcast"
            >
              发起真群发
            </el-button>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
      <div class="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Task Feedback</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">任务状态反馈</h4>
        </div>
        <div class="flex flex-wrap gap-3">
          <el-radio-group v-model="taskFilter" @change="fetchTasks">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="preview">预览</el-radio-button>
            <el-radio-button label="mass_send">群发</el-radio-button>
            <el-radio-button label="freepublish">发布</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div v-if="tasks.length" class="space-y-3">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4"
        >
          <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-semibold text-slate-900">{{ task.title || taskTypeLabel(task.task_type) }}</span>
                <el-tag size="small" effect="plain">{{ taskTypeLabel(task.task_type) }}</el-tag>
                <el-tag size="small" :type="taskStatusType(task.status)" effect="plain">
                  {{ task.status_text || task.status }}
                </el-tag>
              </div>
              <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span class="rounded-full bg-white px-3 py-1">受众 {{ audienceLabel(task) }}</span>
                <span class="rounded-full bg-white px-3 py-1">创建于 {{ formatIsoDateTime(task.created_at) }}</span>
                <span v-if="task.finished_at" class="rounded-full bg-white px-3 py-1">完成于 {{ formatIsoDateTime(task.finished_at) }}</span>
              </div>
              <div class="mt-3 grid gap-2 text-xs leading-6 text-slate-500 md:grid-cols-2">
                <div v-if="task.article_id">文章 ID：{{ task.article_id }}</div>
                <div v-if="task.draft_media_id">draft_media_id：{{ task.draft_media_id }}</div>
                <div v-if="task.broadcast_media_id">broadcast_media_id：{{ task.broadcast_media_id }}</div>
                <div v-if="task.publish_id">publish_id：{{ task.publish_id }}</div>
                <div v-if="task.msg_id">msg_id：{{ task.msg_id }}</div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <el-button
                v-if="task.task_type === 'mass_send' || task.task_type === 'freepublish'"
                size="small"
                class="!rounded-full"
                :loading="refreshingTaskId === task.id"
                @click="refreshTask(task.id)"
              >
                刷新状态
              </el-button>
              <el-button
                v-if="task.task_type === 'preview'"
                size="small"
                class="!rounded-full"
                @click="copyPreviewTarget(task.preview_target || '')"
              >
                复制目标
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/85 px-5 py-14 text-center text-sm text-slate-500"
      >
        当前筛选条件下还没有任务记录。先发一条预览或提交一次真群发。
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as api from '../../../api'
import { usePluginStore } from '../../../stores/plugins'
import {
  WECHAT_PLUGIN_ID,
  audienceLabel,
  createDefaultWeChatConfig,
  formatIsoDateTime,
  normalizeWeChatConfig,
  taskStatusType,
  taskTypeLabel,
  unwrapPluginResult,
  type WeChatTaskItem,
} from './wechat/shared'

const route = useRoute()
const router = useRouter()
const pluginStore = usePluginStore()

const loadingTasks = ref(false)
const previewing = ref(false)
const sending = ref(false)
const articleLoading = ref(false)
const refreshingTaskId = ref<number | null>(null)

const config = ref(createDefaultWeChatConfig())
const article = ref<any | null>(null)
const articleIdInput = ref('')
const taskFilter = ref('')
const tasks = ref<WeChatTaskItem[]>([])

const form = ref({
  source_type: 'article' as 'article' | 'draft',
  draft_media_id: '',
  title: '',
  preview_target_type: 'towxname' as 'towxname' | 'touser',
  preview_target_value: '',
  audience_mode: 'all' as 'all' | 'tag',
  tag_id: '',
  send_ignore_reprint: false,
})

const fetchConfig = async () => {
  try {
    const res: any = await pluginStore.fetchPluginConfig(WECHAT_PLUGIN_ID)
    if (res.code === 200) {
      config.value = normalizeWeChatConfig(res.data?.values || res.data || {})
      form.value.preview_target_type = config.value.preview_target_type
      form.value.preview_target_value = config.value.preview_target_value
      form.value.tag_id = config.value.default_tag_id
      form.value.send_ignore_reprint = config.value.send_ignore_reprint
    }
  } catch (_error) {
    // ignore
  }
}

const fetchTasks = async () => {
  loadingTasks.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'list_tasks', {
      page: 1,
      size: 12,
      task_type: taskFilter.value,
    })
    if (res.code === 200) {
      const result = unwrapPluginResult(res)
      tasks.value = Array.isArray(result?.items) ? result.items : []
      return
    }
    ElMessage.error(res.msg || '获取任务失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '获取任务失败')
  } finally {
    loadingTasks.value = false
  }
}

const loadArticle = async () => {
  const articleId = Number(articleIdInput.value)
  if (!Number.isFinite(articleId) || articleId <= 0) {
    ElMessage.warning('请输入有效的文章 ID')
    return
  }

  articleLoading.value = true
  try {
    const res: any = await api.getArticle(articleId)
    if (res.code === 200 && res.data) {
      article.value = res.data
      form.value.title = res.data.title || ''
      return
    }
    ElMessage.error(res.msg || '获取文章失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '获取文章失败')
  } finally {
    articleLoading.value = false
  }
}

const buildPayload = () => {
  if (form.value.source_type === 'draft') {
    const draftMediaId = form.value.draft_media_id.trim()
    if (!draftMediaId) {
      ElMessage.warning('请填写草稿 Media ID')
      return null
    }
    return {
      source_type: 'draft',
      draft_media_id: draftMediaId,
      title: form.value.title.trim(),
    }
  }

  const articleId = Number(article.value?.id || articleIdInput.value)
  if (!Number.isFinite(articleId) || articleId <= 0) {
    ElMessage.warning('请先选择文章')
    return null
  }
  return {
    source_type: 'article',
    article_id: articleId,
  }
}

const sendPreview = async () => {
  const payload = buildPayload()
  if (!payload) return
  if (!form.value.preview_target_value.trim()) {
    ElMessage.warning('请填写预览目标')
    return
  }

  previewing.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'preview_broadcast', {
      ...payload,
      target_type: form.value.preview_target_type,
      target_value: form.value.preview_target_value.trim(),
    })
    if (res.code === 200) {
      ElMessage.success(unwrapPluginResult(res)?.message || '预览已发送')
      await fetchTasks()
      return
    }
    ElMessage.error(res.msg || '发送预览失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '发送预览失败')
  } finally {
    previewing.value = false
  }
}

const sendBroadcast = async () => {
  const payload = buildPayload()
  if (!payload) return
  if (form.value.audience_mode === 'tag' && !form.value.tag_id.trim()) {
    ElMessage.warning('按标签群发时必须填写 tag_id')
    return
  }

  sending.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'send_broadcast', {
      ...payload,
      audience_mode: form.value.audience_mode,
      tag_id: form.value.tag_id.trim(),
      send_ignore_reprint: form.value.send_ignore_reprint,
    })
    if (res.code === 200) {
      ElMessage.success(unwrapPluginResult(res)?.message || '群发任务已提交')
      await fetchTasks()
      return
    }
    ElMessage.error(res.msg || '提交群发失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '提交群发失败')
  } finally {
    sending.value = false
  }
}

const refreshTask = async (taskId: number) => {
  refreshingTaskId.value = taskId
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'refresh_task_status', { task_id: taskId })
    if (res.code === 200) {
      const result = unwrapPluginResult(res)
      const nextTask = result?.task
      if (nextTask) {
        tasks.value = tasks.value.map((item) => (item.id === taskId ? nextTask : item))
      }
      ElMessage.success(result?.message || '状态已刷新')
      return
    }
    ElMessage.error(res.msg || '刷新状态失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '刷新状态失败')
  } finally {
    refreshingTaskId.value = null
  }
}

const copyPreviewTarget = async (value: string) => {
  if (!value) {
    ElMessage.info('该任务没有预览目标')
    return
  }
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('预览目标已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

watch(
  () => route.query,
  (query) => {
    if (query.sourceType === 'draft') {
      form.value.source_type = 'draft'
      form.value.draft_media_id = String(query.draftMediaId || '')
      form.value.title = String(query.title || '')
      article.value = null
      return
    }
    if (typeof query.articleId === 'string' && query.articleId.trim()) {
      form.value.source_type = 'article'
      articleIdInput.value = query.articleId
      loadArticle()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await pluginStore.ensureCatalog()
  await fetchConfig()
  await fetchTasks()
})
</script>

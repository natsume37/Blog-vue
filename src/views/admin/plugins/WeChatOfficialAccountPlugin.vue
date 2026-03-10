<template>
  <div class="space-y-6">
    <section
      v-if="!plugin?.installed || !plugin?.enabled"
      class="rounded-[24px] border border-amber-200 bg-amber-50/90 px-6 py-5 text-sm text-amber-800"
    >
      当前插件尚未安装或启用。配置和工作台入口已经准备好，但启停请先回插件中心处理。
      <div class="mt-4">
        <el-button class="!rounded-full !border-amber-300 !bg-white" @click="router.push('/admin/plugins')">
          返回插件中心
        </el-button>
      </div>
    </section>

    <section class="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/96 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div class="grid gap-6 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%),linear-gradient(135deg,#f8fafc_0%,#ffffff_100%)] px-6 py-6 xl:grid-cols-[1.15fr_0.85fr] xl:px-8">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">WeChat Control Room</div>
          <h3 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">微信公众号工作台</h3>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            这里统一处理文章同步、草稿流转、真群发、微信图库和二维码投放。配置只需要维护一次，后续状态会在任务列表里持续回写。
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <el-button
              :loading="testing"
              class="!rounded-full !border-slate-200 !px-5 hover:!border-sky-200 hover:!text-sky-700"
              @click="testConnection"
            >
              测试连接
            </el-button>
            <el-button
              :loading="saving"
              class="!rounded-full !border-slate-200 !px-5 hover:!border-sky-200 hover:!text-sky-700"
              @click="saveConfig"
            >
              保存配置
            </el-button>
            <el-button
              type="primary"
              :loading="publishing"
              class="!rounded-full !border-none !bg-slate-900 !px-6 hover:!bg-slate-800"
              :disabled="!articleId"
              @click="syncArticle"
            >
              同步当前文章
            </el-button>
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button
              v-for="entry in navigationEntries"
              :key="entry.path"
              type="button"
              class="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_14px_30px_rgba(14,165,233,0.12)]"
              @click="router.push(entry.path)"
            >
              <div class="text-sm font-semibold text-slate-900">{{ entry.label }}</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">{{ entry.description }}</div>
            </button>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <article
            v-for="card in summaryCards"
            :key="card.label"
            class="rounded-[24px] border border-white/70 bg-white/92 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{{ card.label }}</div>
            <div class="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{{ card.value }}</div>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ card.hint }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <article class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
        <div class="mb-5">
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Config</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">基础配置</h4>
        </div>

        <el-form label-position="top" class="space-y-2">
          <el-form-item label="AppID">
            <el-input v-model="form.app_id" placeholder="填写微信公众号 AppID" />
          </el-form-item>
          <el-form-item label="AppSecret">
            <el-input
              v-model="form.app_secret"
              type="password"
              show-password
              placeholder="填写微信公众号 AppSecret"
              autocomplete="new-password"
            />
          </el-form-item>

          <div class="grid gap-4 md:grid-cols-2">
            <el-form-item label="默认作者">
              <el-input v-model="form.author" placeholder="为空则读取文章作者" />
            </el-form-item>
            <el-form-item label="默认同步模式">
              <el-select v-model="form.publish_mode" class="w-full">
                <el-option label="仅保存草稿" value="draft" />
                <el-option label="直接提交发布" value="publish" />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="文章原文链接前缀">
            <el-input v-model="form.content_source_url_base" placeholder="例如 https://martin88.xyz/article" />
          </el-form-item>
          <el-form-item label="备用封面 Media ID">
            <el-input v-model="form.fallback_thumb_media_id" placeholder="文章没有封面时使用" />
          </el-form-item>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-[22px] border border-slate-200 bg-slate-50/85 p-4">
              <div class="text-sm font-medium text-slate-800">开放评论</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">同步图文时默认启用评论开关。</div>
              <el-switch v-model="form.need_open_comment" class="mt-3" />
            </div>
            <div class="rounded-[22px] border border-slate-200 bg-slate-50/85 p-4">
              <div class="text-sm font-medium text-slate-800">仅粉丝可评论</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">开启后只允许已关注用户评论。</div>
              <el-switch v-model="form.only_fans_can_comment" class="mt-3" />
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <el-form-item label="默认预览目标类型">
              <el-select v-model="form.preview_target_type" class="w-full">
                <el-option label="微信号" value="towxname" />
                <el-option label="OpenID" value="touser" />
              </el-select>
            </el-form-item>
            <el-form-item label="默认预览目标">
              <el-input v-model="form.preview_target_value" placeholder="微信号或 OpenID" />
            </el-form-item>
            <el-form-item label="默认群发标签 ID">
              <el-input v-model="form.default_tag_id" placeholder="留空代表默认全部粉丝" />
            </el-form-item>
            <div class="rounded-[22px] border border-slate-200 bg-slate-50/85 p-4">
              <div class="text-sm font-medium text-slate-800">忽略转载校验</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">用于群发时的转载处理策略。</div>
              <el-switch v-model="form.send_ignore_reprint" class="mt-3" />
            </div>
          </div>
        </el-form>
      </article>

      <article class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Article Sync</div>
            <h4 class="mt-2 text-xl font-semibold text-slate-900">文章同步</h4>
          </div>
          <el-button class="!rounded-full" @click="router.push('/admin/articles')">浏览文章</el-button>
        </div>

        <div class="flex gap-3">
          <el-input v-model="articleIdInput" placeholder="输入文章 ID" />
          <el-button :loading="articleLoading" @click="loadArticle">加载</el-button>
        </div>

        <div
          v-if="article"
          class="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50/90"
        >
          <img v-if="article.cover" :src="article.cover" class="h-52 w-full object-cover" alt="article cover" />
          <div class="space-y-4 p-5">
            <div>
              <div class="text-xl font-semibold text-slate-900">{{ article.title }}</div>
              <p class="mt-3 text-sm leading-7 text-slate-500">
                {{ article.summary || '该文章暂无摘要，同步时会按公众号图文规则回退处理。' }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2 text-xs text-slate-500">
              <span class="rounded-full bg-white px-3 py-1">ID {{ article.id }}</span>
              <span class="rounded-full bg-white px-3 py-1">{{ article.categoryName || '未分类' }}</span>
              <span class="rounded-full bg-white px-3 py-1">{{ article.is_published ? '站内已发布' : '站内草稿' }}</span>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <el-form-item label="本次作者">
                <el-input v-model="publishAuthor" placeholder="为空时使用默认作者" />
              </el-form-item>
              <el-form-item label="本次同步模式">
                <el-select v-model="publishMode" class="w-full">
                  <el-option label="仅保存草稿" value="draft" />
                  <el-option label="直接提交发布" value="publish" />
                </el-select>
              </el-form-item>
            </div>
          </div>
        </div>

        <div
          v-else
          class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/85 px-5 py-10 text-sm text-slate-500"
        >
          载入文章后，可以直接把博客内容同步到公众号草稿箱，或者一步送入发布流。
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <article class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Recent Tasks</div>
            <h4 class="mt-2 text-xl font-semibold text-slate-900">最近任务</h4>
          </div>
          <el-button class="!rounded-full" :loading="summaryLoading" @click="fetchSummary">刷新概览</el-button>
        </div>

        <div v-if="recentTasks.length" class="space-y-3">
          <div
            v-for="item in recentTasks"
            :key="item.id"
            class="rounded-[22px] border border-slate-200/80 bg-slate-50/75 p-4"
          >
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-semibold text-slate-900">{{ item.title || taskTypeLabel(item.task_type) }}</span>
                  <el-tag size="small" effect="plain">{{ taskTypeLabel(item.task_type) }}</el-tag>
                  <el-tag size="small" :type="taskStatusType(item.status)" effect="plain">
                    {{ item.status_text || item.status }}
                  </el-tag>
                </div>
                <div class="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span v-if="item.article_id" class="rounded-full bg-white px-3 py-1">文章 {{ item.article_id }}</span>
                  <span class="rounded-full bg-white px-3 py-1">受众 {{ audienceLabel(item) }}</span>
                  <span class="rounded-full bg-white px-3 py-1">{{ formatIsoDateTime(item.created_at) }}</span>
                </div>
                <div class="mt-3 text-xs leading-6 text-slate-500">
                  <span v-if="item.publish_id">publish_id: {{ item.publish_id }}</span>
                  <span v-else-if="item.msg_id">msg_id: {{ item.msg_id }}</span>
                  <span v-else-if="item.draft_media_id">draft_media_id: {{ item.draft_media_id }}</span>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <el-button
                  v-if="item.task_type === 'freepublish' || item.task_type === 'mass_send'"
                  size="small"
                  class="!rounded-full"
                  :loading="refreshingTaskId === item.id"
                  @click="refreshTask(item.id)"
                >
                  刷新状态
                </el-button>
                <el-button
                  size="small"
                  class="!rounded-full"
                  @click="router.push('/admin/plugins/wechat-official-account/broadcast')"
                >
                  打开详情
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/85 px-5 py-10 text-sm text-slate-500"
        >
          还没有任务记录。先同步一篇文章、发一次预览或创建一次群发任务。
        </div>
      </article>

      <article class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Recent QR Codes</div>
            <h4 class="mt-2 text-xl font-semibold text-slate-900">最近二维码</h4>
          </div>
          <el-button class="!rounded-full" @click="router.push('/admin/plugins/wechat-official-account/qrcodes')">
            打开二维码页
          </el-button>
        </div>

        <div v-if="recentQrcodes.length" class="space-y-3">
          <div
            v-for="item in recentQrcodes"
            :key="item.id"
            class="flex gap-4 rounded-[22px] border border-slate-200/80 bg-slate-50/75 p-4"
          >
            <img :src="item.image_url" alt="wechat qrcode" class="h-20 w-20 rounded-2xl border border-slate-200 bg-white object-cover" />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-slate-900">{{ item.name || item.scene_value }}</div>
              <div class="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                <span class="rounded-full bg-white px-3 py-1">{{ qrcodeModeLabel(item.action_name) }}</span>
                <span class="rounded-full bg-white px-3 py-1">{{ item.scene_type === 'str' ? '字符串场景' : '数字场景' }}</span>
              </div>
              <div class="mt-2 text-xs leading-6 text-slate-500">创建于 {{ formatIsoDateTime(item.created_at) }}</div>
              <div v-if="item.expires_at" class="text-xs leading-6 text-slate-500">过期于 {{ formatIsoDateTime(item.expires_at) }}</div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/85 px-5 py-10 text-sm text-slate-500"
        >
          当前还没有二维码记录。可以在二维码页生成临时或永久二维码，用于菜单、活动页或渠道投放。
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
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
  qrcodeModeLabel,
  taskStatusType,
  taskTypeLabel,
  unwrapPluginResult,
  type WeChatPluginConfig,
  type WeChatQrCodeItem,
  type WeChatTaskItem,
} from './wechat/shared'

const route = useRoute()
const router = useRouter()
const pluginStore = usePluginStore()

const plugin = computed(() => pluginStore.getPlugin(WECHAT_PLUGIN_ID))
const saving = ref(false)
const testing = ref(false)
const publishing = ref(false)
const articleLoading = ref(false)
const summaryLoading = ref(false)
const refreshingTaskId = ref<number | null>(null)

const form = ref<WeChatPluginConfig>(createDefaultWeChatConfig())
const article = ref<any | null>(null)
const articleIdInput = ref('')
const publishAuthor = ref('')
const publishMode = ref<'draft' | 'publish'>('draft')
const recentTasks = ref<WeChatTaskItem[]>([])
const recentQrcodes = ref<WeChatQrCodeItem[]>([])
const counts = ref({
  drafts: 0,
  freepublish: 0,
  mass_send: 0,
  preview: 0,
  qrcodes: 0,
})

const navigationEntries = [
  { path: '/admin/plugins/wechat-official-account/drafts', label: '公众号草稿', description: '查看、删除或从草稿直接发起发布。' },
  { path: '/admin/plugins/wechat-official-account/media', label: '微信图库', description: '管理永久图片素材，随时上传站内封面。' },
  { path: '/admin/plugins/wechat-official-account/broadcast', label: '群发中心', description: '处理预览发送、真群发和状态刷新。' },
  { path: '/admin/plugins/wechat-official-account/qrcodes', label: '二维码', description: '生成临时或永久二维码并集中回看。' },
]

const articleId = computed(() => {
  const value = article.value?.id || articleIdInput.value
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
})

const summaryCards = computed(() => [
  { label: '草稿记录', value: counts.value.drafts, hint: '最近成功同步到微信草稿箱的次数。' },
  { label: '发布任务', value: counts.value.freepublish, hint: '进入公众号发布流的累计任务数。' },
  { label: '群发任务', value: counts.value.mass_send, hint: '真实群发与状态追踪都在这里回写。' },
  { label: '二维码', value: counts.value.qrcodes, hint: '已生成的临时或永久二维码记录。' },
])

const applyConfig = (payload: any) => {
  form.value = normalizeWeChatConfig(payload)
  publishAuthor.value = form.value.author
  publishMode.value = form.value.publish_mode
}

const fetchConfig = async () => {
  try {
    const res: any = await pluginStore.fetchPluginConfig(WECHAT_PLUGIN_ID)
    if (res.code === 200) {
      applyConfig(res.data?.values || res.data || {})
    }
  } catch (_error) {
    // ignore
  }
}

const fetchSummary = async () => {
  summaryLoading.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'dashboard_summary', {})
    if (res.code === 200) {
      const result = unwrapPluginResult(res)
      counts.value = {
        drafts: Number(result?.summary?.counts?.drafts || 0),
        freepublish: Number(result?.summary?.counts?.freepublish || 0),
        mass_send: Number(result?.summary?.counts?.mass_send || 0),
        preview: Number(result?.summary?.counts?.preview || 0),
        qrcodes: Number(result?.summary?.counts?.qrcodes || 0),
      }
      recentTasks.value = Array.isArray(result?.summary?.recent_tasks) ? result.summary.recent_tasks : []
      recentQrcodes.value = Array.isArray(result?.summary?.recent_qrcodes) ? result.summary.recent_qrcodes : []
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '获取控制台概览失败')
  } finally {
    summaryLoading.value = false
  }
}

const loadArticle = async () => {
  if (!articleId.value) {
    ElMessage.warning('请输入有效的文章 ID')
    return
  }

  articleLoading.value = true
  try {
    const res: any = await api.getArticle(articleId.value)
    if (res.code === 200 && res.data) {
      article.value = res.data
      articleIdInput.value = String(res.data.id)
      return
    }
    ElMessage.error(res.msg || '获取文章失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '获取文章失败')
  } finally {
    articleLoading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    const res: any = await pluginStore.updatePluginConfig(WECHAT_PLUGIN_ID, {
      ...form.value,
      app_id: form.value.app_id.trim(),
      app_secret: form.value.app_secret.trim(),
      author: form.value.author.trim(),
      content_source_url_base: form.value.content_source_url_base.trim(),
      fallback_thumb_media_id: form.value.fallback_thumb_media_id.trim(),
      preview_target_value: form.value.preview_target_value.trim(),
      default_tag_id: form.value.default_tag_id.trim(),
    })
    if (res.code === 200) {
      applyConfig(res.data?.values || res.data || form.value)
      ElMessage.success(res.msg || '插件配置已保存')
      return
    }
    ElMessage.error(res.msg || '保存失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const testConnection = async () => {
  testing.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'test_connection', {})
    if (res.code === 200) {
      ElMessage.success(unwrapPluginResult(res)?.message || '连接成功')
      return
    }
    ElMessage.error(res.msg || '连接失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '连接失败')
  } finally {
    testing.value = false
  }
}

const syncArticle = async () => {
  if (!articleId.value) {
    ElMessage.warning('请先选择文章')
    return
  }

  publishing.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'publish_article', {
      article_id: articleId.value,
      publish_mode: publishMode.value,
      author: publishAuthor.value.trim() || form.value.author.trim(),
      need_open_comment: form.value.need_open_comment,
      only_fans_can_comment: form.value.only_fans_can_comment,
    })
    if (res.code === 200) {
      const result = unwrapPluginResult(res)
      ElMessage.success(result?.message || '同步成功')
      await fetchSummary()
      return
    }
    ElMessage.error(res.msg || '同步失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '同步失败')
  } finally {
    publishing.value = false
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
        recentTasks.value = recentTasks.value.map((item) => (item.id === taskId ? nextTask : item))
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

watch(
  () => route.query.articleId,
  (nextArticleId) => {
    if (typeof nextArticleId === 'string' && nextArticleId.trim()) {
      articleIdInput.value = nextArticleId
      loadArticle()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await pluginStore.ensureCatalog()
  await fetchConfig()
  await fetchSummary()
})
</script>

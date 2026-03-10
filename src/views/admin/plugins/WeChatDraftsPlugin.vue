<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">Draft Center</div>
          <h3 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">公众号草稿箱</h3>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            统一查看微信端已有草稿，支持直接删除、送审发布，以及回到文章工作流继续处理。
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <el-button class="!rounded-full" @click="router.push('/admin/plugins/wechat-official-account/publisher')">
            返回工作台
          </el-button>
          <el-button type="primary" class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800" :loading="loading" @click="fetchDrafts">
            刷新草稿
          </el-button>
        </div>
      </div>
    </section>

    <section class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
      <div class="mb-5 flex items-center justify-between gap-3">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Queue</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">微信草稿列表</h4>
        </div>
        <div class="text-sm text-slate-500">共 {{ total }} 条</div>
      </div>

      <div v-if="items.length" class="space-y-4">
        <div
          v-for="item in items"
          :key="item.media_id"
          class="overflow-hidden rounded-[24px] border border-slate-200/80 bg-slate-50/80"
        >
          <div class="grid gap-4 p-5 lg:grid-cols-[220px_1fr]">
            <div class="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
              <img
                v-if="item.thumb_url"
                :src="item.thumb_url"
                alt="wechat draft cover"
                class="h-48 w-full object-cover"
              />
              <div v-else class="flex h-48 items-center justify-center bg-slate-100 text-sm text-slate-400">无封面</div>
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <div class="text-lg font-semibold text-slate-900">{{ item.title || '未命名草稿' }}</div>
                <el-tag size="small" effect="plain">{{ item.article_count }} 篇图文</el-tag>
              </div>
              <p class="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
                {{ item.digest || '该草稿暂无摘要。' }}
              </p>
              <div class="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span class="rounded-full bg-white px-3 py-1">作者 {{ item.author || '--' }}</span>
                <span class="rounded-full bg-white px-3 py-1">更新时间 {{ formatUnixDateTime(item.update_time) }}</span>
                <span class="rounded-full bg-white px-3 py-1">media_id {{ shortText(item.media_id, 24) }}</span>
              </div>

              <div class="mt-5 flex flex-wrap gap-3">
                <el-button
                  size="small"
                  type="primary"
                  class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800"
                  :loading="publishingMediaId === item.media_id"
                  @click="publishDraft(item)"
                >
                  送审发布
                </el-button>
                <el-button size="small" class="!rounded-full" @click="openBroadcast(item)">去群发中心</el-button>
                <el-button
                  size="small"
                  class="!rounded-full !border-rose-200 !text-rose-600 hover:!border-rose-300 hover:!bg-rose-50"
                  :loading="deletingMediaId === item.media_id"
                  @click="removeDraft(item)"
                >
                  删除草稿
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/85 px-5 py-14 text-center text-sm text-slate-500"
      >
        当前还没有拉取到微信草稿。先到工作台同步一篇文章，或者检查公众号配置是否已经连通。
      </div>

      <div class="mt-6 flex justify-center">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="handlePageChange"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePluginStore } from '../../../stores/plugins'
import {
  WECHAT_PLUGIN_ID,
  formatUnixDateTime,
  shortText,
  unwrapPluginResult,
  type WeChatDraftItem,
} from './wechat/shared'

const router = useRouter()
const pluginStore = usePluginStore()

const loading = ref(false)
const deletingMediaId = ref('')
const publishingMediaId = ref('')
const items = ref<WeChatDraftItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchDrafts = async () => {
  loading.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'list_drafts', {
      page: page.value,
      size: pageSize.value,
    })
    if (res.code === 200) {
      const result = unwrapPluginResult(res)
      items.value = Array.isArray(result?.items) ? result.items : []
      total.value = Number(result?.total || 0)
      return
    }
    ElMessage.error(res.msg || '获取草稿失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '获取草稿失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (nextPage: number) => {
  page.value = nextPage
  fetchDrafts()
}

const publishDraft = async (item: WeChatDraftItem) => {
  publishingMediaId.value = item.media_id
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'publish_draft', {
      media_id: item.media_id,
      title: item.title,
    })
    if (res.code === 200) {
      const result = unwrapPluginResult(res)
      ElMessage.success(result?.message || '草稿已提交发布')
      return
    }
    ElMessage.error(res.msg || '发布失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '发布失败')
  } finally {
    publishingMediaId.value = ''
  }
}

const removeDraft = async (item: WeChatDraftItem) => {
  try {
    await ElMessageBox.confirm(`确认删除微信草稿《${item.title || item.media_id}》吗？`, '删除草稿', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonClass: '!bg-rose-500 !border-rose-500',
    })
  } catch {
    return
  }

  deletingMediaId.value = item.media_id
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'delete_draft', { media_id: item.media_id })
    if (res.code === 200) {
      ElMessage.success(unwrapPluginResult(res)?.message || '草稿已删除')
      await fetchDrafts()
      return
    }
    ElMessage.error(res.msg || '删除失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '删除失败')
  } finally {
    deletingMediaId.value = ''
  }
}

const openBroadcast = (item: WeChatDraftItem) => {
  router.push({
    path: '/admin/plugins/wechat-official-account/broadcast',
    query: {
      sourceType: 'draft',
      draftMediaId: item.media_id,
      title: item.title || '',
    },
  })
}

onMounted(async () => {
  await pluginStore.ensureCatalog()
  await fetchDrafts()
})
</script>

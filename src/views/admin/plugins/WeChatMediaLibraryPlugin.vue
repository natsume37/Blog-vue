<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.28em] text-violet-600">Media Library</div>
          <h3 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">微信图库管理</h3>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            管理微信公众号的永久图片素材。可以直接贴远程图片链接，也可以从站内图库选取现成封面上传到微信端。
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <el-button class="!rounded-full" @click="resourceManagerRef?.open('image')">从本站图库选择</el-button>
          <el-button type="primary" class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800" :loading="loading" @click="fetchMaterials">
            刷新微信图库
          </el-button>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <article class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
        <div class="mb-5">
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Upload</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">上传图片到微信图库</h4>
        </div>

        <el-form label-position="top">
          <el-form-item label="图片地址">
            <el-input
              v-model="imageUrl"
              placeholder="支持七牛链接、本站图库地址或其它公网可访问图片 URL"
            />
          </el-form-item>
        </el-form>

        <div class="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div class="rounded-[24px] border border-slate-200 bg-slate-50/85 p-4">
            <div class="text-sm font-medium text-slate-800">上传建议</div>
            <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-500">
              <li>优先使用站内图库资源，避免来源地址失效。</li>
              <li>封面图建议比例接近横图，避免公众号卡片裁切过重。</li>
              <li>上传成功后会返回微信 `media_id`，后续可以给群发和草稿复用。</li>
            </ul>
            <div class="mt-4 flex flex-wrap gap-3">
              <el-button class="!rounded-full" @click="resourceManagerRef?.open('image')">打开本站图库</el-button>
              <el-button
                type="primary"
                class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800"
                :loading="uploading"
                @click="uploadMaterial"
              >
                上传到微信图库
              </el-button>
            </div>
          </div>

          <div class="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50/90">
            <img v-if="imageUrl" :src="imageUrl" alt="preview" class="h-full min-h-[200px] w-full object-cover" />
            <div v-else class="flex h-full min-h-[200px] items-center justify-center px-6 text-center text-sm text-slate-400">
              这里会预览当前准备上传到微信端的图片。
            </div>
          </div>
        </div>

        <div
          v-if="lastUploaded"
          class="mt-5 rounded-[22px] border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800"
        >
          <div class="font-medium text-emerald-900">最近一次上传成功</div>
          <div class="mt-2 leading-7">
            <div>名称：{{ lastUploaded.name || '--' }}</div>
            <div>media_id：{{ lastUploaded.media_id }}</div>
            <div v-if="lastUploaded.url">微信地址：{{ lastUploaded.url }}</div>
          </div>
        </div>
      </article>

      <article class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Assets</div>
            <h4 class="mt-2 text-xl font-semibold text-slate-900">微信永久图片素材</h4>
          </div>
          <div class="text-sm text-slate-500">共 {{ total }} 条</div>
        </div>

        <div v-if="items.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="item in items"
            :key="item.media_id"
            class="overflow-hidden rounded-[22px] border border-slate-200/80 bg-slate-50/80"
          >
            <div class="aspect-[4/3] overflow-hidden bg-white">
              <img v-if="item.url" :src="item.url" alt="wechat media" class="h-full w-full object-cover" />
              <div v-else class="flex h-full items-center justify-center text-sm text-slate-400">无预览</div>
            </div>
            <div class="space-y-3 p-4">
              <div class="text-sm font-semibold text-slate-900">{{ item.name || '未命名素材' }}</div>
              <div class="space-y-1 text-xs leading-6 text-slate-500">
                <div>更新时间 {{ formatUnixDateTime(item.update_time) }}</div>
                <div>media_id {{ shortText(item.media_id, 20) }}</div>
              </div>
              <div class="flex flex-wrap gap-2">
                <el-button size="small" class="!rounded-full" @click="copyMediaId(item.media_id)">复制 Media ID</el-button>
                <el-button
                  size="small"
                  class="!rounded-full !border-rose-200 !text-rose-600 hover:!border-rose-300 hover:!bg-rose-50"
                  :loading="deletingMediaId === item.media_id"
                  @click="removeMaterial(item.media_id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/85 px-5 py-14 text-center text-sm text-slate-500"
        >
          当前还没有拉取到微信图片素材。先上传一张站内封面或远程图片。
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
      </article>
    </section>

    <ResourceManager ref="resourceManagerRef" @select="handleResourceSelect" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ResourceManager from '../../../components/ResourceManager.vue'
import { usePluginStore } from '../../../stores/plugins'
import {
  WECHAT_PLUGIN_ID,
  formatUnixDateTime,
  shortText,
  unwrapPluginResult,
  type WeChatMaterialItem,
} from './wechat/shared'

const pluginStore = usePluginStore()
const resourceManagerRef = ref<any>(null)

const loading = ref(false)
const uploading = ref(false)
const deletingMediaId = ref('')
const imageUrl = ref('')
const lastUploaded = ref<WeChatMaterialItem | null>(null)
const items = ref<WeChatMaterialItem[]>([])
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)

const fetchMaterials = async () => {
  loading.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'list_materials', {
      page: page.value,
      size: pageSize.value,
    })
    if (res.code === 200) {
      const result = unwrapPluginResult(res)
      items.value = Array.isArray(result?.items) ? result.items : []
      total.value = Number(result?.total || 0)
      return
    }
    ElMessage.error(res.msg || '获取微信图库失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '获取微信图库失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (nextPage: number) => {
  page.value = nextPage
  fetchMaterials()
}

const uploadMaterial = async () => {
  const target = imageUrl.value.trim()
  if (!target) {
    ElMessage.warning('请先提供图片地址')
    return
  }

  uploading.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'upload_material_from_url', {
      url: target,
    })
    if (res.code === 200) {
      const result = unwrapPluginResult(res)
      lastUploaded.value = result?.item || null
      ElMessage.success(result?.message || '上传成功')
      await fetchMaterials()
      return
    }
    ElMessage.error(res.msg || '上传失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

const handleResourceSelect = (item: { url?: string; displayUrl?: string }) => {
  imageUrl.value = item.displayUrl || item.url || ''
}

const removeMaterial = async (mediaId: string) => {
  try {
    await ElMessageBox.confirm(`确认删除微信素材 ${mediaId} 吗？`, '删除素材', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonClass: '!bg-rose-500 !border-rose-500',
    })
  } catch {
    return
  }

  deletingMediaId.value = mediaId
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'delete_material', { media_id: mediaId })
    if (res.code === 200) {
      ElMessage.success(unwrapPluginResult(res)?.message || '素材已删除')
      await fetchMaterials()
      return
    }
    ElMessage.error(res.msg || '删除失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '删除失败')
  } finally {
    deletingMediaId.value = ''
  }
}

const copyMediaId = async (mediaId: string) => {
  try {
    await navigator.clipboard.writeText(mediaId)
    ElMessage.success('Media ID 已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

onMounted(async () => {
  await pluginStore.ensureCatalog()
  await fetchMaterials()
})
</script>

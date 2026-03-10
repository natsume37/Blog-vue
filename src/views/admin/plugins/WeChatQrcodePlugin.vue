<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600">QR Campaigns</div>
          <h3 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">公众号二维码页面</h3>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            生成临时或永久二维码，用于菜单入口、群发落地页、活动渠道追踪和私域导流。生成结果会保留到本地记录，便于回看。
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <el-button class="!rounded-full" @click="router.push('/admin/plugins/wechat-official-account/publisher')">返回工作台</el-button>
          <el-button type="primary" class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800" :loading="loading" @click="fetchRecords">
            刷新记录
          </el-button>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <article class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
        <div class="mb-5">
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Generate</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">创建二维码</h4>
        </div>

        <el-form label-position="top">
          <el-form-item label="备注名称">
            <el-input v-model="form.name" placeholder="例如 文章群发落地页" />
          </el-form-item>

          <div class="grid gap-4 md:grid-cols-2">
            <el-form-item label="二维码类型">
              <el-select v-model="form.mode" class="w-full">
                <el-option label="临时二维码" value="temp" />
                <el-option label="永久二维码" value="permanent" />
              </el-select>
            </el-form-item>
            <el-form-item label="场景值类型">
              <el-select v-model="form.scene_type" class="w-full">
                <el-option label="字符串场景值" value="str" />
                <el-option label="数字场景值" value="int" />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="场景值">
            <el-input v-model="form.scene_value" placeholder="例如 wechat-mass-campaign-001" />
          </el-form-item>

          <el-form-item v-if="form.mode === 'temp'" label="有效期（秒）">
            <el-input-number v-model="form.expire_seconds" :min="60" :max="2592000" class="w-full" />
          </el-form-item>
        </el-form>

        <div class="rounded-[22px] border border-slate-200 bg-slate-50/85 p-4">
          <div class="text-sm font-medium text-slate-800">使用建议</div>
          <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-500">
            <li>临时二维码适合短期群发活动和投放回收。</li>
            <li>永久二维码适合菜单入口、长期栏目和私域导流。</li>
            <li>场景值建议统一命名，方便后续和活动数据做关联。</li>
          </ul>
        </div>

        <el-button
          type="primary"
          class="mt-5 !rounded-full !border-none !bg-slate-900 !px-6 hover:!bg-slate-800"
          :loading="creating"
          @click="createQrcode"
        >
          生成二维码
        </el-button>
      </article>

      <article class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
        <div class="mb-5">
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Preview</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">当前结果</h4>
        </div>

        <div
          class="overflow-hidden rounded-[26px] border border-slate-200 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_30%),linear-gradient(180deg,#fffdf7_0%,#ffffff_100%)] p-6"
        >
          <template v-if="latestRecord">
            <div class="grid gap-6 lg:grid-cols-[220px_1fr]">
              <div class="overflow-hidden rounded-[22px] border border-slate-200 bg-white p-4">
                <img :src="latestRecord.image_url" alt="wechat qrcode" class="h-full w-full object-cover" />
              </div>
              <div class="space-y-3">
                <div class="text-2xl font-semibold text-slate-900">{{ latestRecord.name || latestRecord.scene_value }}</div>
                <div class="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span class="rounded-full bg-white px-3 py-1">{{ qrcodeModeLabel(latestRecord.action_name) }}</span>
                  <span class="rounded-full bg-white px-3 py-1">{{ latestRecord.scene_type === 'str' ? '字符串场景值' : '数字场景值' }}</span>
                </div>
                <div class="space-y-1 text-sm leading-7 text-slate-500">
                  <div>scene_value：{{ latestRecord.scene_value }}</div>
                  <div>ticket：{{ latestRecord.ticket }}</div>
                  <div>创建时间：{{ formatIsoDateTime(latestRecord.created_at) }}</div>
                  <div v-if="latestRecord.expires_at">过期时间：{{ formatIsoDateTime(latestRecord.expires_at) }}</div>
                </div>
                <div class="flex flex-wrap gap-3">
                  <el-button class="!rounded-full" @click="copyText(latestRecord.image_url)">复制图片地址</el-button>
                  <el-button class="!rounded-full" @click="copyText(latestRecord.ticket)">复制 Ticket</el-button>
                </div>
              </div>
            </div>
          </template>

          <div v-else class="py-10 text-center text-sm text-slate-500">
            生成二维码后，这里会立刻显示最新结果和可复用链接。
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
      <div class="mb-5 flex items-center justify-between gap-3">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">History</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">二维码记录</h4>
        </div>
        <div class="text-sm text-slate-500">共 {{ total }} 条</div>
      </div>

      <div v-if="items.length" class="space-y-3">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex flex-col gap-4 rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 lg:flex-row lg:items-center"
        >
          <img :src="item.image_url" alt="history qrcode" class="h-24 w-24 rounded-[20px] border border-slate-200 bg-white object-cover" />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-slate-900">{{ item.name || item.scene_value }}</span>
              <el-tag size="small" effect="plain">{{ qrcodeModeLabel(item.action_name) }}</el-tag>
            </div>
            <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span class="rounded-full bg-white px-3 py-1">{{ item.scene_type === 'str' ? '字符串场景值' : '数字场景值' }}</span>
              <span class="rounded-full bg-white px-3 py-1">scene {{ item.scene_value }}</span>
              <span class="rounded-full bg-white px-3 py-1">{{ formatIsoDateTime(item.created_at) }}</span>
            </div>
            <div v-if="item.expires_at" class="mt-2 text-xs text-slate-500">过期于 {{ formatIsoDateTime(item.expires_at) }}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <el-button size="small" class="!rounded-full" @click="copyText(item.image_url)">复制图片地址</el-button>
            <el-button size="small" class="!rounded-full" @click="copyText(item.ticket)">复制 Ticket</el-button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/85 px-5 py-14 text-center text-sm text-slate-500"
      >
        还没有二维码记录。先生成一个活动二维码或长期入口二维码。
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePluginStore } from '../../../stores/plugins'
import {
  WECHAT_PLUGIN_ID,
  createDefaultWeChatConfig,
  formatIsoDateTime,
  qrcodeModeLabel,
  unwrapPluginResult,
  type WeChatQrCodeItem,
} from './wechat/shared'

const router = useRouter()
const pluginStore = usePluginStore()

const config = ref(createDefaultWeChatConfig())
const loading = ref(false)
const creating = ref(false)
const items = ref<WeChatQrCodeItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const form = ref({
  name: '',
  mode: 'temp' as 'temp' | 'permanent',
  scene_type: 'str' as 'str' | 'int',
  scene_value: '',
  expire_seconds: 604800,
})

const latestRecord = computed(() => items.value[0] || null)

const fetchConfig = async () => {
  try {
    const res: any = await pluginStore.fetchPluginConfig(WECHAT_PLUGIN_ID)
    if (res.code === 200) {
      config.value = { ...config.value, ...(res.data?.values || res.data || {}) }
    }
  } catch (_error) {
    // ignore
  }
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'list_qrcodes', {
      page: page.value,
      size: pageSize.value,
    })
    if (res.code === 200) {
      const result = unwrapPluginResult(res)
      items.value = Array.isArray(result?.items) ? result.items : []
      total.value = Number(result?.total || 0)
      return
    }
    ElMessage.error(res.msg || '获取二维码记录失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '获取二维码记录失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (nextPage: number) => {
  page.value = nextPage
  fetchRecords()
}

const createQrcode = async () => {
  if (!form.value.scene_value.trim()) {
    ElMessage.warning('请填写场景值')
    return
  }

  creating.value = true
  try {
    const res: any = await pluginStore.callPluginAction(WECHAT_PLUGIN_ID, 'create_qrcode', {
      name: form.value.name.trim(),
      mode: form.value.mode,
      scene_type: form.value.scene_type,
      scene_value: form.value.scene_value.trim(),
      expire_seconds: form.value.expire_seconds,
    })
    if (res.code === 200) {
      ElMessage.success(unwrapPluginResult(res)?.message || '二维码已生成')
      page.value = 1
      await fetchRecords()
      return
    }
    ElMessage.error(res.msg || '生成二维码失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '生成二维码失败')
  } finally {
    creating.value = false
  }
}

const copyText = async (value: string) => {
  if (!value) {
    ElMessage.info('没有可复制内容')
    return
  }
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

onMounted(async () => {
  await pluginStore.ensureCatalog()
  await fetchConfig()
  await fetchRecords()
})
</script>

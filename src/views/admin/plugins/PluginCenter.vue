<template>
  <div class="plugin-center space-y-6">
    <section class="plugin-hero rounded-[28px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-7">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Plugin Hub</div>
          <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">插件中心</h2>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            统一发现、安装和启停插件。每个插件的具体配置进入它自己的页面处理，插件中心只管理生命周期。
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            {{ installedCount }} 已安装 / {{ enabledCount }} 已启用
          </div>
          <el-button
            :loading="pluginStore.loading"
            class="!rounded-full !border-slate-200 !px-5 hover:!border-sky-200 hover:!text-sky-700"
            @click="handleDiscover"
          >
            重新发现插件
          </el-button>
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <article class="overview-card">
          <div class="overview-card__label">插件总数</div>
          <div class="overview-card__value">{{ pluginStore.catalog.length }}</div>
          <p class="overview-card__hint">包含本地内建插件与市场目录。</p>
        </article>
        <article class="overview-card">
          <div class="overview-card__label">启用中</div>
          <div class="overview-card__value">{{ enabledCount }}</div>
          <p class="overview-card__hint">这些插件会进入后台导航并参与运行时能力。</p>
        </article>
        <article class="overview-card">
          <div class="overview-card__label">最近同步</div>
          <div class="overview-card__value text-lg">{{ lastSyncedLabel }}</div>
          <p class="overview-card__hint">刷新目录后会更新插件状态和菜单。</p>
        </article>
      </div>
    </section>

    <section class="space-y-4">
      <article
        v-for="plugin in pluginStore.catalog"
        :key="plugin.id"
        class="plugin-card rounded-[24px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)]"
      >
        <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <div class="plugin-card__icon">
                <el-icon><component :is="resolvePluginIcon(plugin.icon)" /></el-icon>
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-xl font-semibold text-slate-900">{{ plugin.name }}</h3>
                  <el-tag size="small" effect="plain">{{ plugin.version }}</el-tag>
                  <el-tag v-if="plugin.builtin" size="small" type="info" effect="plain">内建</el-tag>
                  <el-tag v-if="plugin.installed" size="small" type="success" effect="plain">已安装</el-tag>
                  <el-tag v-if="plugin.enabled" size="small" type="warning" effect="plain">已启用</el-tag>
                </div>
                <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                  {{ plugin.description || '暂无描述。' }}
                </p>
              </div>
            </div>

            <div v-if="plugin.features?.length" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="feature in plugin.features"
                :key="feature"
                class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500"
              >
                {{ feature }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 xl:justify-end">
            <el-button
              v-if="plugin.installed && plugin.adminPages?.length"
              class="!rounded-full"
              @click="openPluginPage(plugin.id)"
            >
              打开插件页
            </el-button>
            <el-button
              v-if="!plugin.installed"
              type="primary"
              class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800"
              @click="handleInstall(plugin.id)"
            >
              安装插件
            </el-button>
            <el-button
              v-else-if="plugin.enabled"
              class="!rounded-full !border-amber-200 !bg-amber-50 !text-amber-700 hover:!border-amber-300 hover:!bg-amber-100"
              @click="handleDisable(plugin.id)"
            >
              停用
            </el-button>
            <el-button
              v-else
              type="primary"
              class="!rounded-full !border-sky-200 !bg-sky-50 !text-sky-700 hover:!border-sky-300 hover:!bg-sky-100"
              @click="handleEnable(plugin.id)"
            >
              启用
            </el-button>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resolvePluginIcon } from '../../../plugins/registry'
import { usePluginStore } from '../../../stores/plugins'

const router = useRouter()
const pluginStore = usePluginStore()

const installedCount = computed(() => pluginStore.catalog.filter((plugin) => plugin.installed).length)
const enabledCount = computed(() => pluginStore.catalog.filter((plugin) => plugin.enabled).length)
const lastSyncedLabel = computed(() => {
  if (!pluginStore.lastSyncedAt) return '尚未同步'
  return new Date(pluginStore.lastSyncedAt).toLocaleString('zh-CN')
})

const handleDiscover = async () => {
  try {
    await pluginStore.discoverPlugins()
    ElMessage.success('插件目录已刷新')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '刷新插件目录失败')
  }
}

const handleInstall = async (pluginId: string) => {
  try {
    const res: any = await pluginStore.installPlugin(pluginId)
    if (res.code === 200) {
      ElMessage.success(res.msg || '插件安装成功')
      return
    }
    ElMessage.error(res.msg || '插件安装失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '插件安装失败')
  }
}

const handleEnable = async (pluginId: string) => {
  try {
    const res: any = await pluginStore.enablePlugin(pluginId)
    if (res.code === 200) {
      ElMessage.success(res.msg || '插件已启用')
      return
    }
    ElMessage.error(res.msg || '插件启用失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '插件启用失败')
  }
}

const handleDisable = async (pluginId: string) => {
  try {
    const res: any = await pluginStore.disablePlugin(pluginId)
    if (res.code === 200) {
      ElMessage.success(res.msg || '插件已停用')
      return
    }
    ElMessage.error(res.msg || '插件停用失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '插件停用失败')
  }
}

const openPluginPage = (pluginId: string) => {
  router.push(pluginStore.getPluginDefaultPath(pluginId))
}

onMounted(() => {
  pluginStore.ensureCatalog().catch(() => {})
})
</script>

<style scoped>
.plugin-center {
  --plugin-border: rgba(226, 232, 240, 0.9);
}

.plugin-hero {
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.12), transparent 30%),
    radial-gradient(circle at bottom left, rgba(15, 23, 42, 0.06), transparent 32%),
    rgba(255, 255, 255, 0.94);
}

.overview-card {
  border-radius: 22px;
  border: 1px solid var(--plugin-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  padding: 1rem 1.1rem;
}

.overview-card__label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #94a3b8;
}

.overview-card__value {
  margin-top: 0.85rem;
  font-size: 1.9rem;
  font-weight: 700;
  color: #0f172a;
}

.overview-card__hint {
  margin-top: 0.55rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #64748b;
}

.plugin-card__icon {
  display: inline-flex;
  height: 52px;
  width: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #eff6ff;
  color: #0369a1;
  font-size: 1.3rem;
}
</style>

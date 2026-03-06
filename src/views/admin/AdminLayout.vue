<template>
  <div class="admin-shell min-h-screen">
    <div class="admin-bg"></div>
    <div class="relative z-10 flex min-h-screen">
      <aside
        class="hidden lg:flex shrink-0 border-r border-slate-200/80 bg-white/95 backdrop-blur-md transition-all duration-300"
        :class="isCollapsed ? 'w-[88px]' : 'w-[260px]'"
      >
        <div class="flex h-full w-full flex-col">
          <div class="flex h-16 items-center border-b border-slate-100 px-5">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <el-icon><Management /></el-icon>
              </div>
              <div v-if="!isCollapsed" class="min-w-0">
                <div class="truncate text-[15px] font-semibold text-slate-800">博客后台</div>
                <div class="text-xs text-slate-400">Admin Console</div>
              </div>
            </div>
          </div>

          <nav class="flex-1 space-y-1 px-3 py-4">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="menu-item"
              :class="[
                isCollapsed ? 'justify-center px-2' : 'px-3',
                isActive(item.path) ? 'menu-item-active' : 'menu-item-default'
              ]"
            >
              <el-icon class="text-base"><component :is="item.icon" /></el-icon>
              <span v-if="!isCollapsed" class="truncate text-sm">{{ item.label }}</span>
            </router-link>
          </nav>

          <div class="border-t border-slate-100 p-3">
            <router-link
              to="/"
              class="menu-item menu-item-default mb-2"
              :class="isCollapsed ? 'justify-center px-2' : 'px-3'"
            >
              <el-icon class="text-base"><HomeFilled /></el-icon>
              <span v-if="!isCollapsed" class="text-sm">返回首页</span>
            </router-link>
            <div
              class="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-2"
              :class="isCollapsed ? 'justify-center' : 'justify-between'"
            >
              <div v-if="!isCollapsed" class="flex min-w-0 items-center gap-2">
                <UserAvatar
                  :src="userStore.userInfo?.avatar"
                  :name="userStore.userInfo?.nickname || 'Admin'"
                  class="h-8 w-8"
                />
                <div class="min-w-0">
                  <div class="truncate text-sm font-medium text-slate-700">{{ userStore.userInfo?.nickname || 'Admin' }}</div>
                  <div class="text-xs text-slate-400">管理员</div>
                </div>
              </div>
              <el-button link type="danger" @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div class="flex h-16 items-center justify-between px-4 sm:px-6">
            <div class="flex items-center gap-2 sm:gap-3">
              <el-button class="lg:hidden" text @click="mobileDrawerVisible = true">
                <el-icon><Menu /></el-icon>
              </el-button>
              <el-button class="hidden lg:inline-flex" text @click="toggleSidebar">
                <el-icon><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
              </el-button>
              <div class="min-w-0">
                <div class="truncate text-base font-semibold text-slate-800">{{ activeMenuLabel }}</div>
                <div class="hidden text-xs text-slate-400 sm:block">{{ route.path }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <router-link to="/">
                <el-button plain>预览站点</el-button>
              </router-link>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-auto px-4 py-5 sm:px-6 sm:py-6">
          <section class="rounded-2xl border border-slate-200/70 bg-white/92 p-4 shadow-[0_8px_32px_rgba(2,6,23,0.06)] sm:p-6">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </section>
        </main>
      </div>
    </div>

    <el-drawer
      v-model="mobileDrawerVisible"
      size="260px"
      direction="ltr"
      :with-header="false"
      class="admin-mobile-drawer"
    >
      <div class="flex h-full flex-col">
        <div class="flex h-16 items-center border-b border-slate-100 px-4">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <el-icon><Management /></el-icon>
            </div>
            <div>
              <div class="text-[15px] font-semibold text-slate-800">博客后台</div>
              <div class="text-xs text-slate-400">Admin Console</div>
            </div>
          </div>
        </div>
        <nav class="flex-1 space-y-1 p-3">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="menu-item px-3"
            :class="isActive(item.path) ? 'menu-item-active' : 'menu-item-default'"
            @click="mobileDrawerVisible = false"
          >
            <el-icon class="text-base"><component :is="item.icon" /></el-icon>
            <span class="truncate text-sm">{{ item.label }}</span>
          </router-link>
        </nav>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Management,
  Document,
  Collection,
  HomeFilled,
  SwitchButton,
  User,
  Monitor,
  ChatDotSquare,
  Setting,
  Timer,
  DataLine,
  Odometer,
  Picture,
  Menu,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'
import { ElMessage } from 'element-plus'
import UserAvatar from '../../components/UserAvatar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isCollapsed = ref(false)
const mobileDrawerVisible = ref(false)

const menuItems = [
  { path: '/admin/dashboard', label: '仪表盘', icon: Odometer },
  { path: '/admin/articles', label: '文章管理', icon: Document },
  { path: '/admin/categories', label: '分类/标签', icon: Collection },
  { path: '/admin/comments', label: '评论管理', icon: ChatDotSquare },
  { path: '/admin/users', label: '用户管理', icon: User },
  { path: '/admin/resources', label: '图库管理', icon: Picture },
  { path: '/admin/monitor', label: '服务器监控', icon: Monitor },
  { path: '/admin/visits', label: '访问记录', icon: DataLine },
  { path: '/admin/settings', label: '站点设置', icon: Setting },
  { path: '/admin/mail-settings', label: '邮件配置', icon: Setting },
  { path: '/admin/ai-settings', label: 'AI 配置', icon: Setting },
  { path: '/admin/changelogs', label: '建站日志', icon: Timer }
]

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)
const activeMenuLabel = computed(() => menuItems.find(item => isActive(item.path))?.label || '后台管理')

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

watch(
  () => route.path,
  () => {
    mobileDrawerVisible.value = false
  }
)

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.admin-shell {
  --admin-surface: #ffffff;
  --admin-text: #0f172a;
  --admin-muted: #64748b;
  --admin-soft: #f1f5f9;
}

.admin-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 0% 0%, rgba(14, 165, 233, 0.08), transparent 42%),
    radial-gradient(circle at 100% 100%, rgba(30, 41, 59, 0.06), transparent 40%),
    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.menu-item {
  display: flex;
  height: 42px;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.menu-item-default {
  color: var(--admin-muted);
}

.menu-item-default:hover {
  background: #f8fafc;
  color: var(--admin-text);
}

.menu-item-active {
  background: #e2e8f0;
  color: #0f172a;
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

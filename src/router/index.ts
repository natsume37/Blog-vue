import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import { useUserStore } from '../stores/user'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guestOnly: true }  // 仅游客可访问，已登录用户跳转
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetail.vue')
  },
  {
    path: '/message',
    name: 'MessageBoard',
    component: () => import('../views/MessageBoard.vue')
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('../views/Category.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/changelog',
    name: 'Changelog',
    component: () => import('../views/Changelog.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }  // 需要登录才能访问
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/articles'
      },
      {
        path: 'articles',
        name: 'AdminArticles',
        component: () => import('../views/admin/ArticleList.vue')
      },
      {
        path: 'articles/:id',
        name: 'AdminArticleEditor',
        component: () => import('../views/admin/ArticleEditor.vue')
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../views/admin/CategoryManage.vue')
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('../views/admin/CommentManage.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/UserManage.vue')
      },
      {
        path: 'monitor',
        name: 'AdminMonitor',
        component: () => import('../views/admin/ServerMonitor.vue')
      },
      {
        path: 'visits',
        name: 'AdminVisits',
        component: () => import('../views/admin/VisitLog.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/SiteSettings.vue')
      },
      {
        path: 'changelogs',
        name: 'AdminChangelogs',
        component: () => import('../views/admin/ChangelogManage.vue')
      }
    ]
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/errors/Forbidden.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 标记是否已初始化验证
let isInitialized = false

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  
  // 首次加载时验证 token
  if (!isInitialized && userStore.token) {
    isInitialized = true
    await userStore.verifyToken()
  } else {
    isInitialized = true
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 未登录，跳转到登录页
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
    
    // 检查是否需要 admin 权限
    if (to.meta.requiresAdmin && !userStore.isAdmin) {
      // 已登录但不是管理员
      next('/403')
      return
    }
  }

  // 已登录用户访问登录页，跳转到首页或 admin
  if (to.meta.guestOnly && userStore.isLoggedIn) {
    next(userStore.isAdmin ? '/admin' : '/')
    return
  }

  next()
})

export default router
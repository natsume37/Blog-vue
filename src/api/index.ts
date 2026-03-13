import request from './request'
export { generateArticleDraft } from './ai'
export { generateArticleSummary } from './ai'
export { getAIConfig, updateAIConfig } from './ai'
export { testAIConfig } from './ai'
export { listMcpTools, callMcpTool } from './ai'

// Auth
export const login = (data: any) => request.post('/auth/login', data)
export const logout = () => request.post('/auth/logout')
export const register = (data: any) => request.post('/auth/register', data)
export const getCurrentUser = () => request.get('/auth/me')
export const updateProfile = (data: any) => request.put('/auth/profile', data)
export const forgotPassword = (data: any) => request.post('/auth/forgot-password', data)
export const resetPassword = (data: any) => request.post('/auth/reset-password', data)
export const sendRegisterCode = (data: any) => request.post('/auth/register/send-code', data)

// Articles
export const getArticles = (params: any) => request.get('/articles', { params })
export const getAdminArticles = (params: any) => request.get('/articles/admin/list', { params })
export const getArticle = (id: number, params?: any) => request.get(`/articles/${id}`, { params })
export const createArticle = (data: any) => request.post('/articles', data)
export const updateArticle = (id: number, data: any) => request.put(`/articles/${id}`, data)
export const deleteArticle = (id: number) => request.delete(`/articles/${id}`)
export const getArticleVersions = (id: number) => request.get(`/articles/${id}/versions`)
export const restoreArticleVersion = (id: number, versionId: number) => request.post(`/articles/${id}/versions/${versionId}/restore`)
export const duplicateArticle = (id: number) => request.post(`/articles/${id}/duplicate`)
export const batchOperateArticles = (data: { ids: number[]; action: string }) => request.post('/articles/admin/batch', data)
export const renderArticleForWechat = (data: {
  title?: string
  summary?: string
  content: string
  include_summary?: boolean
}) => request.post('/articles/admin/render/wechat', data)
export const likeArticle = (id: number) => request.post(`/articles/${id}/like`)
export const unlikeArticle = (id: number) => request.delete(`/articles/${id}/like`)
export const getArticleLikeStatus = (id: number) => request.get(`/articles/${id}/like/status`)
export const getHomeArticles = () => request.get('/articles/home/categorized')

// Categories
export const getCategories = () => request.get('/categories')
export const createCategory = (data: any) => request.post('/categories', data)
export const updateCategory = (id: number, data: any) => request.put(`/categories/${id}`, data)
export const deleteCategory = (id: number) => request.delete(`/categories/${id}`)

// Tags
export const getTags = (params?: any) => request.get('/tags', { params })
export const createTag = (data: any) => request.post('/tags', data)
export const updateTag = (id: number, data: any) => request.put(`/tags/${id}`, data)
export const deleteTag = (id: number) => request.delete(`/tags/${id}`)

// Messages
export const getMessages = (params: any) => request.get('/messages', { params })
export const createMessage = (data: any) => request.post('/messages', data)

// Site
export const getSiteInfo = () => request.get('/site/info')
export const getSiteConfig = () => request.get('/site/config')
export const updateSiteConfig = (data: any) => request.put('/site/config', data)
export const getCommentRiskConfig = () => request.get('/site/comment-risk-config')
export const updateCommentRiskConfig = (data: any) => request.put('/site/comment-risk-config', data)
export const getNewsNowRealtime = (params?: any) => request.get('/plugins/newsnow/realtime', { params })

// Changelog
export const getChangelogs = () => request.get('/changelogs')
export const createChangelog = (data: any) => request.post('/changelogs', data)
export const updateChangelog = (id: number, data: any) => request.put(`/changelogs/${id}`, data)
export const deleteChangelog = (id: number) => request.delete(`/changelogs/${id}`)

// Friend Links
export const getFriendLinks = (params?: any) => request.get('/friend-links', { params })
export const submitFriendLinkApplication = (data: any) => request.post('/friend-links/apply', data)
export const getAdminFriendLinks = (params?: any) => request.get('/friend-links/admin/list', { params })
export const createFriendLink = (data: any) => request.post('/friend-links', data)
export const updateFriendLink = (id: number, data: any) => request.put(`/friend-links/${id}`, data)
export const deleteFriendLink = (id: number) => request.delete(`/friend-links/${id}`)

// Tool Items
export const getToolItems = (params?: any) => request.get('/tools', { params })
export const getAdminToolItems = (params?: any) => request.get('/tools/admin/list', { params })
export const createToolItem = (data: any) => request.post('/tools', data)
export const updateToolItem = (id: number, data: any) => request.put(`/tools/${id}`, data)
export const deleteToolItem = (id: number) => request.delete(`/tools/${id}`)

// Users (Admin)
export const getAdminUsers = (params: any) => request.get('/users/admin/list', { params })
export const createAdminUser = (data: any) => request.post('/users/admin', data)
export const updateAdminUser = (id: number, data: any) => request.put(`/users/admin/${id}`, data)
export const deleteAdminUser = (id: number) => request.delete(`/users/admin/${id}`)

// Monitor (Admin)
export const getSystemInfo = () => request.get('/monitor/system')
export const getRealtimeStats = () => request.get('/monitor/realtime')
export const getProcesses = (params: any) => request.get('/monitor/processes', { params })
export const getConnections = () => request.get('/monitor/connections')
export const getVisitLogs = (params: any) => request.get('/monitor/visits', { params })
export const getMapStats = () => request.get('/monitor/map-stats')
export const getDashboardStats = () => request.get('/monitor/dashboard')
export const getAuditLogs = (params: any) => request.get('/audit-logs/admin/list', { params })
export const getLoginLogs = (params: any) => request.get('/login-logs/admin/list', { params })

// Comments
// contentType: 'article' | 'changelog' | 'message_board'
export const getComments = (contentType: string, contentId: number, params: any) => 
  request.get(`/comments/${contentType}/${contentId}`, { params })
export const createComment = (data: any) => request.post('/comments', data)
export const deleteComment = (id: number) => request.delete(`/comments/${id}`)
export const likeComment = (id: number) => request.post(`/comments/${id}/like`)

// Comments (Admin)
export const getAdminComments = (params: any) => request.get('/comments/admin/list', { params })
export const getAdminCommentStats = () => request.get('/comments/admin/stats')
export const updateAdminComment = (id: number, data: any) => request.put(`/comments/admin/${id}`, data)
export const deleteAdminComment = (id: number) => request.delete(`/comments/admin/${id}`)

// Mail settings (Admin)
export const getMailConfig = () => request.get('/site/mail-config')
export const updateMailConfig = (data: any) => request.put('/site/mail-config', data)
export const testMailConfig = (config: any, emailTo: string) =>
  request.post('/site/mail-config/test', { ...config, emailTo })

// Plugins (Admin)
export const getAdminPluginCatalog = () => request.get('/plugins')
export const getAdminPluginMarket = () => request.get('/plugins/market')
export const getPublicPlugins = () => request.get('/plugins/public')
export const installAdminPlugin = (pluginId: string) => request.post(`/plugins/${pluginId}/install`)
export const enableAdminPlugin = (pluginId: string) => request.post(`/plugins/${pluginId}/enable`)
export const disableAdminPlugin = (pluginId: string) => request.post(`/plugins/${pluginId}/disable`)
export const getAdminPluginConfig = (pluginId: string) => request.get(`/plugins/${pluginId}/settings`)
export const updateAdminPluginConfig = (pluginId: string, data: any) => request.put(`/plugins/${pluginId}/settings`, { values: data })
export const callAdminPluginAction = (pluginId: string, action: string, data: any) =>
  request.post(`/plugins/${pluginId}/actions/${action}`, { payload: data })

// Upload
export const getUploadToken = () => request.get('/upload/token')
export const getPrivateUrl = (key: string) => request.get(`/upload/private-url`, { params: { key } })
export const getSignedUrl = (key: string, t: number, sign: string) => 
  request.get(`/upload/signed-url`, { params: { key, t, sign } })
export const encryptResourceKey = (key: string) => 
  request.get(`/upload/encrypt-key`, { params: { key } })
export const getBatchPrivateUrls = (keys: string[]) => 
  request.get(`/upload/batch-private-urls`, { params: { keys: keys.join(',') } })

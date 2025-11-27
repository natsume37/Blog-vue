import request from './request'

// Auth
export const login = (data: any) => request.post('/auth/login', data)
export const register = (data: any) => request.post('/auth/register', data)
export const getCurrentUser = () => request.get('/auth/me')
export const updateProfile = (data: any) => request.put('/auth/profile', data)

// Articles
export const getArticles = (params: any) => request.get('/articles', { params })
export const getAdminArticles = (params: any) => request.get('/articles/admin/list', { params })
export const getArticle = (id: number) => request.get(`/articles/${id}`)
export const createArticle = (data: any) => request.post('/articles', data)
export const updateArticle = (id: number, data: any) => request.put(`/articles/${id}`, data)
export const deleteArticle = (id: number) => request.delete(`/articles/${id}`)
export const likeArticle = (id: number) => request.post(`/articles/${id}/like`)
export const unlikeArticle = (id: number) => request.delete(`/articles/${id}/like`)
export const getArticleLikeStatus = (id: number) => request.get(`/articles/${id}/like/status`)

// Categories
export const getCategories = () => request.get('/categories')
export const createCategory = (data: any) => request.post('/categories', data)
export const updateCategory = (id: number, data: any) => request.put(`/categories/${id}`, data)
export const deleteCategory = (id: number) => request.delete(`/categories/${id}`)

// Tags
export const getTags = () => request.get('/tags')
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

// Changelog
export const getChangelogs = () => request.get('/changelogs')
export const createChangelog = (data: any) => request.post('/changelogs', data)
export const updateChangelog = (id: number, data: any) => request.put(`/changelogs/${id}`, data)
export const deleteChangelog = (id: number) => request.delete(`/changelogs/${id}`)

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

// Comments
export const getArticleComments = (articleId: number, params: any) => 
  request.get(`/comments/article/${articleId}`, { params })
export const createComment = (data: any) => request.post('/comments', data)
export const deleteComment = (id: number) => request.delete(`/comments/${id}`)
export const likeComment = (id: number) => request.post(`/comments/${id}/like`)

// Comments (Admin)
export const getAdminComments = (params: any) => request.get('/comments/admin/list', { params })
export const updateAdminComment = (id: number, data: any) => request.put(`/comments/admin/${id}`, data)
export const deleteAdminComment = (id: number) => request.delete(`/comments/admin/${id}`)

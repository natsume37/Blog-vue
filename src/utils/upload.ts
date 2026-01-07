// @ts-ignore
import * as qiniu from 'qiniu-js'
// @ts-ignore
import { getUploadToken, getPrivateUrl } from '../api'
import { createResource } from '../api/resource'
import { ElMessage } from 'element-plus'

export const uploadToQiniu = async (file: File): Promise<string> => {
  try {
    // 1. 获取凭证
    const res: any = await getUploadToken()
    if (res.code !== 200) {
      throw new Error(res.msg || '获取上传凭证失败')
    }
    
    const { token, domain } = res.data
    
    // 2. 构建 Key (文件名)
    // 根据文件类型决定文件夹
    let folder = 'other'
    if (file.type.startsWith('image/')) folder = 'img'
    else if (file.type.startsWith('video/')) folder = 'video'
    else if (file.type.startsWith('audio/')) folder = 'audio'
    
    // 生成随机文件名（UUID）以隐藏真实文件名
    const ext = file.name.substring(file.name.lastIndexOf('.'))
    const randomName = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    const key = `${folder}/${randomName}${ext}`
    
    // 3. 配置
    const config = {
      useCdnDomain: true,
      // @ts-ignore
      // region: qiniu.region.z0 // 根据实际区域调整，z0 是华东
    }
    
    const putExtra = {
      fname: file.name,
      params: {},
      mimeType: null
    }
    
    // 4. 上传
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const observable = qiniu.upload(file, key, token, putExtra, config)
      
      observable.subscribe({
        next: (_res: any) => {
          // res.total.percent
        },
        error: (err: any) => {
          reject(err)
        },
        complete: async (res: any) => {
          // 5. 构建基础URL（不带签名参数，用于存储）
          // 重要：存储的URL不应该带签名，因为签名会过期
          const baseUrl = `${domain}/${res.key}`
          
          // 6. 获取当前可用的私有链接（用于立即显示）
          let displayUrl = baseUrl
          try {
            const privateRes: any = await getPrivateUrl(res.key)
            if (privateRes.code === 200 && privateRes.data?.url) {
              displayUrl = privateRes.data.url
            }
          } catch (e) {
            console.warn('Failed to get private URL, using base URL', e)
          }
          
          // 7. 记录到后端（存储基础URL，不带签名）
          try {
             await createResource({
               filename: file.name,
               key: res.key,
               url: baseUrl,  // 存储基础URL，不带签名
               media_type: folder,
               mime_type: file.type,
               size: file.size
             })
          } catch (e) {
             console.error('Failed to record resource', e)
             // Non-blocking
          }
          
          // 上传成功，返回带签名的可访问URL
          resolve(displayUrl)
        }
      })
    })
    
  } catch (error) {
    console.error('Upload failed', error)
    ElMessage.error('上传失败')
    throw error
  }
}

export interface Resource {
  id: number
  filename: string
  key: string
  url: string
  media_type: string
  mime_type?: string
  size: number
  created_at: string
}

import request from './request'

export const createResource = (data: any) => {
  return request({
    url: '/resources',
    method: 'post',
    data
  })
}

export const getResources = (params: any) => {
  return request({
    url: '/resources',
    method: 'get',
    params
  })
}

export const deleteResource = (id: number) => {
  return request({
    url: `/resources/${id}`,
    method: 'delete'
  })
}

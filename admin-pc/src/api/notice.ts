import request from '../utils/request'

// ========== 请求参数类型 ==========
export interface CreateNoticeParams {
  title: string
  content: string
}

// ========== 响应数据类型 ==========
export interface Notice {
  id: string
  title: string
  content: string
  publisherId: string
  publishedAt: number
  createdAt: number
}

export interface NoticeSummary {
  id: string
  title: string
  publishedAt: number
  read: boolean
}

export interface NoticeListData {
  page: number
  pageSize: number
  total: number
  list: NoticeSummary[]
}

export interface NoticeStats {
  noticeId: string
  total: number
  readCount: number
  unreadCount: number
}

// ========== API 方法 ==========

/** 发布通知 */
export function createNotice(params: CreateNoticeParams) {
  return request.post<{ id: string }>('/notices', params)
}

/** 获取通知列表 */
export function getNoticeList(page: number = 1, pageSize: number = 20) {
  return request.get<NoticeListData>('/notices', { params: { page, pageSize } })
}

/** 获取通知详情 */
export function getNoticeDetail(id: string) {
  return request.get<Notice>(`/notices/${id}`)
}

/** 标记已读（学生端） */
export function markRead(id: string) {
  return request.post<{ readAt: number }>(`/notices/${id}/read`)
}

/** 获取通知统计（管理端） */
export function getNoticeStats(id: string) {
  return request.get<NoticeStats>(`/notices/${id}/stats`)
}

import { config } from './config'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  header?: Record<string, string>
  showLoading?: boolean
}

interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

const getToken = (): string => {
  try {
    return wx.getStorageSync('token') || ''
  } catch {
    return ''
  }
}

const showLoading = (show: boolean) => {
  if (show) {
    wx.showLoading({ title: '加载中...', mask: true })
  }
}

const hideLoading = () => {
  wx.hideLoading()
}

const request = <T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    const token = getToken()

    showLoading(options.showLoading !== false)

    wx.request({
      url: config.baseURL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success(res) {
        hideLoading()
        const { statusCode } = res
        const data = res.data as ApiResponse<T>

        if (statusCode === 200) {
          if (data.code === 0) {
            resolve(data)
          } else if (data.code === 40101) {
            // token 过期或未登录
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            wx.redirectTo({ url: '/pages/login/login' })
            reject(data)
          } else {
            wx.showToast({
              title: data.message || '请求失败',
              icon: 'none',
              duration: 2000,
            })
            reject(data)
          }
        } else if (statusCode === 500) {
          wx.showToast({
            title: '服务器内部错误，请稍后重试',
            icon: 'none',
            duration: 2000,
          })
          reject(data)
        } else {
          wx.showToast({
            title: data.message || '网络异常，请稍后重试',
            icon: 'none',
            duration: 2000,
          })
          reject(data)
        }
      },
      fail(err) {
        hideLoading()
        wx.showToast({
          title: '网络连接失败',
          icon: 'none',
          duration: 2000,
        })
        reject(err)
      },
    })
  })
}

export const get = <T = unknown>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
  return request<T>({ url, method: 'GET', data })
}

export const post = <T = unknown>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
  return request<T>({ url, method: 'POST', data })
}

export const put = <T = unknown>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
  return request<T>({ url, method: 'PUT', data })
}

export const del = <T = unknown>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
  return request<T>({ url, method: 'DELETE', data })
}

export default request

import { post, get } from './request'

export const isLoggedIn = (): boolean => {
  try { return !!wx.getStorageSync('token') } catch { return false }
}

export const getUserInfo = (): SysUser | null => {
  try { return wx.getStorageSync('userInfo') || null } catch { return null }
}

export const getToken = (): string => {
  try { return wx.getStorageSync('token') || '' } catch { return '' }
}

export const saveLoginState = (token: string, user: SysUser): void => {
  try { wx.setStorageSync('token', token); wx.setStorageSync('userInfo', user) } catch {}
}

export const logout = (): void => {
  try { wx.removeStorageSync('token'); wx.removeStorageSync('userInfo') } catch {}
}

// POST /api/auth/login
export const login = (username: string, password: string) =>
  post<{ token: string; user: SysUser }>('/auth/login', { username, password })

// GET /api/auth/me
export const fetchMe = () => get<SysUser>('/auth/me')

// Mock（后端未就绪时使用）
export const mockLogin = (username: string, _password: string): Promise<{ token: string; user: SysUser }> => {
  return new Promise(resolve => {
    setTimeout(() => resolve({
      token: 'mock_token_' + Date.now(),
      user: { id: 'u_' + username, username, role: username === 'admin' ? 'admin' : 'student' },
    }), 500)
  })
}

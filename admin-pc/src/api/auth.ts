import request from '../utils/request'

/** 登录 */
export function login(username: string, password: string) {
  return request.post<{
    token: string
    user: { id: string; username: string; role: string }
  }>('/auth/login', { username, password })
}

/** 校验 token 并获取当前用户信息 */
export function getMe() {
  return request.get<{ id: string; username: string; role: string }>('/auth/me')
}

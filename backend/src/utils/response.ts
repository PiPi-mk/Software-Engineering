export type ApiResponse<T> = { code: number; message: string; data: T }

export function ok<T>(data: T, message = 'ok'): ApiResponse<T> {
  return { code: 0, message, data }
}

export function fail(
  message: string,
  code: number,
  data: null = null,
): ApiResponse<null> {
  return { code, message, data }
}


// API 服务工具函数
import { getAuthToken } from '../authService';

// 创建带有认证的请求头
const createHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// 处理 401 响应的回调函数类型
type UnauthorizedHandler = () => void;

// 全局 401 处理函数
let unauthorizedHandler: UnauthorizedHandler | null = null;

// 设置 401 处理函数
export const setUnauthorizedHandler = (handler: UnauthorizedHandler): void => {
  unauthorizedHandler = handler;
};

// 通用 API 请求函数
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  includeAuth: boolean = true,
  responseType: 'json' | 'blob' | 'arraybuffer' = 'json'
): Promise<T | Blob | ArrayBuffer> => {
  try {
    // 合并请求头
    const headers = {
      ...createHeaders(),
      ...options.headers,
    };

    // 如果不需要认证，移除 Authorization 头
    if (!includeAuth) {
      delete (headers as any)['Authorization'];
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 处理 401 响应
    if (response.status === 401) {
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
      throw new Error('Unauthorized: Session expired or invalid token');
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: await response.text() };
      }
      throw new Error(errorData.message || errorData.error_description || errorData.error || `${response.status} ${response.statusText}`);
    }

    // 处理空响应
    if (response.status === 204) {
      return {} as T;
    }

    // 根据指定的响应类型处理响应
    switch (responseType) {
      case 'json':
        return response.json() as Promise<T>;
      case 'blob':
        return response.blob();
      case 'arraybuffer':
        return response.arrayBuffer();
      default:
        return response.json() as Promise<T>;
    }
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

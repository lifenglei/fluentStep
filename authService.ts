// Supabase 认证服务
const SUPABASE_URL = 'https://zaxwascdrpnioqtvuain.supabase.co';
const SUPABASE_AUTH_ENDPOINT = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface AuthError {
  error: string;
  error_description: string;
}

export interface SignupResponse {
  user: {
    id: string;
    email: string;
  };
  requiresVerification: boolean;
}

// 从 localStorage 获取 token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// 从 localStorage 获取用户信息
export const getUser = (): { id: string; email: string } | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// 保存认证信息到 localStorage
export const saveAuth = (authResponse: AuthResponse): void => {
  localStorage.setItem('auth_token', authResponse.access_token);
  localStorage.setItem('refresh_token', authResponse.refresh_token);
  localStorage.setItem('user', JSON.stringify(authResponse.user));
};

// 清除认证信息
export const clearAuth = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// 登录
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(SUPABASE_AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      let errorData: AuthError;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.error_description || errorData.error || 'Login failed');
    }

    const data: any = await response.json();
    
    // 检查用户是否已验证邮箱
    if (data.user && !data.user.email_confirmed_at) {
      throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
    }
    
    // 处理 Supabase 响应格式
    const authResponse: AuthResponse = {
      access_token: data.access_token,
      token_type: data.token_type || 'bearer',
      expires_in: data.expires_in || 3600,
      refresh_token: data.refresh_token,
      user: {
        id: data.user?.id || data.user_id,
        email: data.user?.email || email,
      },
    };
    
    saveAuth(authResponse);
    return authResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Login failed');
  }
};

// 注册
export const signup = async (email: string, password: string): Promise<SignupResponse> => {
  try {
    // Supabase 注册接口
    const signupEndpoint = `${SUPABASE_URL}/auth/v1/signup`;
    
    const response = await fetch(signupEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        email,
        password,
        options: {
          emailRedirectTo: 'https://gemini.heartstack.space/',
        },
      }),
    });

    if (!response.ok) {
      let errorData: AuthError;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.error_description || errorData.error || 'Signup failed');
    }

    const data: any = await response.json();
    
    // 注册成功后不自动登录，需要邮箱验证
    // 检查用户是否需要验证邮箱
    const requiresVerification = !data.access_token || data.user?.email_confirmed_at === null;
    
    return {
      user: {
        id: data.user?.id || data.user_id,
        email: data.user?.email || email,
      },
      requiresVerification: requiresVerification,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Signup failed');
  }
};

// 登出
export const logout = (): void => {
  clearAuth();
};


import { getAuthToken, getUser } from '../authService';
import { apiRequest } from './apiService';

// Supabase API 配置
const SUPABASE_URL = 'https://zaxwascdrpnioqtvuain.supabase.co';
const SUPABASE_API_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// 接口定义
export interface UserStats {
  streak: number;
  totalLearningDays: number;
  totalPoints: number;
  earnedBadges: number;
  lastCheckIn?: string;
}

export interface UserBadge {
  id: number;
  name: string;
  description: string;
  earned: boolean;
}

export interface CheckInResponse {
  success: boolean;
  streak: number;
  lastCheckIn: string;
}

// 获取用户统计数据
export const fetchUserStats = async (): Promise<UserStats> => {
  try {
    const user = getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const stats = await apiRequest(`${SUPABASE_API_URL}/user_stats?user_id=eq.${user.id}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    // 处理可能的响应格式（单对象或数组）
    const rawData = Array.isArray(stats) ? stats[0] : stats;
    
    // 将API返回的下划线命名转换为驼峰命名
    const result: UserStats = {
      streak: rawData?.streak || 0,
      totalLearningDays: rawData?.total_learning_days || 0,
      totalPoints: rawData?.total_points || 0,
      earnedBadges: rawData?.earned_badges || 0,
      lastCheckIn: rawData?.last_check_in,
    };
    
    return result;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // 返回默认值，避免应用崩溃
    return {
      streak: 0,
      totalLearningDays: 0,
      totalPoints: 0,
      earnedBadges: 0,
      lastCheckIn: undefined,
    };
  }
};

// 获取用户徽章
export const fetchUserBadges = async (): Promise<UserBadge[]> => {
  try {
    const user = getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const badges = await apiRequest<UserBadge[]>(`${SUPABASE_API_URL}/user_badges?user_id=eq.${user.id}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    return Array.isArray(badges) ? badges : [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    // 返回空数组，避免应用崩溃
    return [];
  }
};

// 执行打卡操作
export const checkIn = async (): Promise<CheckInResponse> => {
  try {
    const user = getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const data = await apiRequest<CheckInResponse>(`${SUPABASE_API_URL}/rpc/check_in_user`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ p_user_id: user.id })
    });

    // 确保返回符合CheckInResponse接口的安全数据
    return {
      success: data.success || false,
      streak: data.streak || 0,
      lastCheckIn: data.lastCheckIn || new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error during check-in:', error);
    throw error;
  }
};

// 获取用户打卡历史
export const fetchCheckInHistory = async (): Promise<{ date: string; checked: boolean }[]> => {
  try {
    const user = getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const history = await apiRequest<{ date: string; checked: boolean }[]>(`${SUPABASE_API_URL}/check_in_history?user_id=eq.${user.id}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Error fetching check-in history:', error);
    return [];
  }
};

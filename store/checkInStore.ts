import { create } from 'zustand';
import { fetchUserStats, fetchUserBadges, checkIn as apiCheckIn, CheckInResponse, UserStats, UserBadge } from '../services/userService';

export interface CheckInStore {
  // Check-in data
  streak: number;
  lastCheckIn: string | null;
  checkInStatus: 'not_checked' | 'checked' | 'already_checked' | 'loading';
  
  // User stats
  totalLearningDays: number;
  totalPoints: number;
  earnedBadges: number;
  
  // Badges
  badges: UserBadge[];
  
  // Actions
  checkIn: () => Promise<boolean>;
  loadUserStats: () => Promise<void>;
  loadUserBadges: () => Promise<void>;
  reset: () => void;
}

export const useCheckInStore = create<CheckInStore>()(
  (set, get) => ({
    // Initial state
    streak: 0,
    lastCheckIn: null,
    checkInStatus: 'loading',
    totalLearningDays: 0,
    totalPoints: 0,
    earnedBadges: 0,
    badges: [],
    
    // Check-in action
    checkIn: async () => {
      try {
        set({ checkInStatus: 'checked' });
        const response = await apiCheckIn();
        
        set({
          streak: response.streak,
          lastCheckIn: response.lastCheckIn,
          checkInStatus: 'already_checked',
        });
        
        // 重新加载用户统计数据
        await get().loadUserStats();
        
        return true;
      } catch (error) {
        console.error('Error during check-in:', error);
        set({ checkInStatus: 'not_checked' });
        return false;
      }
    },
    
    // Load user stats from API
    loadUserStats: async () => {
      try {
        const stats = await fetchUserStats();
        
        // 确保stats对象存在，添加额外的防护措施
        const safeStats = stats || {
          streak: 0,
          totalLearningDays: 0,
          totalPoints: 0,
          earnedBadges: 0,
          lastCheckIn: undefined,
        };
        
        // 更新状态，包括从API获取的lastCheckIn
        set({
          streak: safeStats.streak,
          totalLearningDays: safeStats.totalLearningDays,
          totalPoints: safeStats.totalPoints,
          earnedBadges: safeStats.earnedBadges,
          ...(safeStats.lastCheckIn && { lastCheckIn: safeStats.lastCheckIn }),
        });
        
        // 检查今日是否已打卡
        const today = new Date().toISOString().split('T')[0];
        const lastCheckInDate = safeStats.lastCheckIn || get().lastCheckIn;
        
        if (lastCheckInDate === today) {
          set({ checkInStatus: 'already_checked' });
        } else {
          set({ checkInStatus: 'not_checked' });
        }
      } catch (error) {
        console.error('Error loading user stats:', error);
        set({ checkInStatus: 'not_checked' });
      }
    },
    
    // Load user badges from API
    loadUserBadges: async () => {
      try {
        const badges = await fetchUserBadges();
        set({ badges });
      } catch (error) {
        console.error('Error loading user badges:', error);
      }
    },
    
    // Reset state
    reset: () => set({
      streak: 0,
      lastCheckIn: null,
      checkInStatus: 'not_checked',
      totalLearningDays: 0,
      totalPoints: 0,
      earnedBadges: 0,
      badges: [],
    })
  })
);

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCheckInStore } from '../store/checkInStore';
import { useAppStore } from '../store/appStore';

interface CheckInPageProps {
  onBack: () => void;
}

const CheckInPage: React.FC<CheckInPageProps> = ({ onBack }) => {
  const {
    streak,
    lastCheckIn,
    checkInStatus,
    totalLearningDays,
    totalPoints,
    earnedBadges,
    badges,
    checkIn,
    loadUserStats,
    loadUserBadges,
  } = useCheckInStore();
  
  const { reset } = useAppStore();
  
  const [todayDate, setTodayDate] = useState('');
  const [currentMonthDays, setCurrentMonthDays] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 并行加载用户统计数据和徽章
        await Promise.all([
          loadUserStats(),
          loadUserBadges()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadUserStats, loadUserBadges]);

  // Generate calendar days for current month
  useEffect(() => {
    const date = new Date();
    setTodayDate(date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }));
    setCurrentMonth(date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }));

    // Generate days for current month calendar
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    // Add days before first day of month to fill grid
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days after last day of month to fill grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    setCurrentMonthDays(days);
  }, []);

  const handleCheckIn = () => {
    if (checkInStatus === 'already_checked' || checkInStatus === 'loading') return;
    checkIn();
  };

  const handleStartLearning = () => {
    // Navigate to homepage by resetting app state
    reset();
    onBack();
  };

  // Check if a date is checked in
  const isDateCheckedIn = (date: Date) => {
    if (!lastCheckIn) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    const lastCheckInDate = new Date(lastCheckIn);
    const checkDate = new Date(date);
    
    // Check if date is within the current streak
    const streakDate = new Date(lastCheckInDate);
    streakDate.setDate(streakDate.getDate() - streak + 1);
    
    return checkDate >= streakDate && checkDate <= lastCheckInDate;
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  // Stats data from store
  const stats = [
    { id: 1, title: '连续打卡', value: `${streak} 天`, icon: 'fa-fire', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
    { id: 2, title: '累计学习', value: `${totalLearningDays} 天`, icon: 'fa-book-open', color: 'var(--accent-primary)', bgColor: 'var(--accent-soft)' },
    { id: 3, title: '总积分', value: `${totalPoints} 分`, icon: 'fa-coins', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
    { id: 4, title: '获得徽章', value: `${earnedBadges} 个`, icon: 'fa-trophy', color: 'var(--accent-secondary)', bgColor: 'var(--accent-soft)' }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-[var(--accent-soft)] to-[var(--accent-soft)]/50 flex flex-col overflow-hidden">

      {/* Header with Back Button */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="p-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
        >
          <FontAwesomeIcon icon="fa-solid fa-arrow-left" size="lg" className="text-[var(--text-primary)]" />
        </button>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">学习中心</h1>
        <div className="w-10"></div> {/* For spacing */}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8">
        <div className="max-w-4xl mx-auto mt-6">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <FontAwesomeIcon icon="fa-solid fa-spinner fa-spin" size="3x" className="text-[var(--accent-primary)] mb-4" />
                <p className="text-lg text-[var(--text-secondary)]">加载中...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Today's Learning Task */}
              <div className="bg-[var(--card-bg)] rounded-xl p-5 mb-6 flex justify-between items-center shadow-md border border-[var(--border-primary)]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                      <FontAwesomeIcon icon="fa-solid fa-check-square" className="text-[var(--text-muted)]" />
                      <h2 className="text-lg font-semibold text-[var(--text-primary)]">今日学习任务</h2>
                    </div>
                    <p className="text-[var(--text-secondary)]">学习30个新单词</p>
                    <p className="text-sm text-[var(--text-muted)]">预计用时: 5-10分钟</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleStartLearning}
                    style={{ 
                      background: 'var(--text-primary)', 
                      color: 'var(--bg-primary)' 
                    }}
                    className="px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-colors"
                  >
                    开始学习
                  </button>
                  <button
                    onClick={handleCheckIn}
                    disabled={checkInStatus === 'already_checked' || checkInStatus === 'loading'}
                    className={`px-6 py-3 rounded-lg font-medium transition-all transform ${checkInStatus === 'already_checked' 
                      ? 'bg-[var(--success)] text-[var(--accent-text)] cursor-not-allowed' 
                      : 'bg-[var(--accent-primary)] text-[var(--accent-text)] hover:opacity-90'}`}
                  >
                    {checkInStatus === 'already_checked' ? (
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon="fa-solid fa-check-circle" /> 已打卡
                      </span>
                    ) : checkInStatus === 'checked' ? (
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon="fa-solid fa-spinner fa-spin" /> 打卡中...
                      </span>
                    ) : checkInStatus === 'loading' ? (
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon="fa-solid fa-spinner fa-spin" /> 加载中...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon="fa-solid fa-calendar-check" /> 立即打卡
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {stats.map((stat) => (
                  <div key={stat.id} style={{ 
                    background: 'var(--card-bg)',
                    borderColor: 'var(--border-primary)'
                  }} className="rounded-xl p-5 shadow-md border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">{stat.title}</p>
                        <p style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div style={{ 
                        background: stat.bgColor,
                        color: stat.color
                      }} className="w-12 h-12 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={stat.icon as any} size="lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar and Achievement Badges in Horizontal Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-in Calendar */}
                <div style={{ 
                  background: 'var(--card-bg)',
                  borderColor: 'var(--border-primary)'
                }} className="rounded-xl p-4 shadow-md border">
                  <div className="flex justify-between items-center mb-3">
                    <h2 style={{ color: 'var(--text-primary)' }} className="text-base font-semibold">{currentMonth}</h2>
                    <div className="flex gap-2">
                      <button style={{ 
                        color: 'var(--text-secondary)',
                        '--hover-color': 'var(--accent-primary)'
                      }} className="hover:text-[var(--hover-color)] text-sm">
                        <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
                      </button>
                      <button style={{ 
                        color: 'var(--text-secondary)',
                        '--hover-color': 'var(--accent-primary)'
                      }} className="hover:text-[var(--hover-color)] text-sm">
                        <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
                      </button>
                    </div>
                  </div>

                  {/* Week days header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day, index) => (
                      <div key={index} style={{ color: 'var(--text-secondary)' }} className="text-center text-xs font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {currentMonthDays.map((day, index) => {
                      const isToday = day.toDateString() === new Date().toDateString();
                      const isCheckedIn = isDateCheckedIn(day);
                      const isCurrentMonth = day.getMonth() === new Date().getMonth();

                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded-md flex flex-col items-center justify-center transition-all cursor-pointer relative
                            ${isCurrentMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}
                            ${isToday ? 'ring-2 ring-[var(--accent-primary)]' : ''}
                            ${isCheckedIn 
                              ? 'bg-[var(--accent-primary)] text-[var(--accent-text)]' 
                              : 'hover:bg-[var(--bg-secondary)]'}
                          `}
                        >
                          <span className="text-xs">{day.getDate()}</span>
                          {isCheckedIn && (
                            <div className="absolute bottom-1 w-1 h-1 bg-white dark:bg-white rounded-full" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="bg-[var(--card-bg)] rounded-xl p-6 shadow-md border border-[var(--border-primary)]">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">成就徽章</h2>
                    <button className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] font-medium">
                      查看全部
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge, index) => (
                      <div
                        key={index}
                        className={`bg-gradient-to-br ${badge.earned ? 'from-[var(--warning-bg)] to-[var(--warning-bg)]/70' : 'from-[var(--bg-secondary)] to-[var(--bg-secondary)]/70'} rounded-lg p-3 transition-all border
                        ${badge.earned ? 'border-[var(--warning)]/30' : 'border-[var(--border-primary)]'}`}
                        style={{ opacity: badge.earned ? 1 : 0.6 }}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                            ${badge.earned ? 'bg-gradient-to-br from-[var(--warning)] to-[var(--warning)]/80' : 'bg-[var(--bg-secondary)]'}
                          `}>
                            <FontAwesomeIcon 
                              icon={badge.earned ? 'fa-medal' : 'fa-lock'} 
                              size="lg" 
                              className={badge.earned ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}
                            />
                          </div>
                          <h3 className="text-xs font-semibold text-center text-[var(--text-primary)]">{badge.name}</h3>
                          <p className="text-[10px] text-center text-[var(--text-secondary)] mt-0.5">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CheckInPage;
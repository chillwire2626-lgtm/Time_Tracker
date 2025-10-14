// Utility functions for Study Timer app

/**
 * Generates a unique identifier with optional prefix
 */
export const uid = (prefix: string = 'id'): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${randomStr}`;
};

/**
 * Gets current timestamp in ISO format
 */
export const isoNow = (): string => {
  return new Date().toISOString();
};

/**
 * Converts seconds to hours:minutes:seconds format
 */
export const secondsToHms = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Gets the start of day in ISO format
 */
export const startOfDayISO = (date?: Date): string => {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay.toISOString();
};

/**
 * Checks if two ISO date strings are on the same day
 */
export const isSameDayISO = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Formats a date string to a readable format
 */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString();
};

/**
 * Formats a time string to a readable format
 */
export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Calculates the number of days between two dates
 */
export const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Gets the date string for a specific number of days ago
 */
export const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function to limit function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generates a random motivational message
 */
export const getMotivationalMessage = (): string => {
  const messages = [
    "Every expert was once a beginner!",
    "The future belongs to those who learn!",
    "Study hard, dream big!",
    "Knowledge is power!",
    "Success is the sum of small efforts!",
    "Today's study is tomorrow's success!",
    "Learning never exhausts the mind!",
    "The only way to do great work is to love what you do!",
    "Education is the passport to the future!",
    "Study smart, not just hard!",
  ];
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Calculates study streak from sessions
 */
export const calculateStreak = (sessions: Array<{ startAt: string }>): number => {
  if (sessions.length === 0) return 0;
  
  const sessionDates = sessions.map(s => s.startAt.split('T')[0]);
  const uniqueDates = [...new Set(sessionDates)].sort();
  
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  
  // Count consecutive days from today backwards
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];
    
    if (uniqueDates.includes(expectedDateStr)) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Formats duration in minutes to a readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
};

/**
 * Converts minutes to seconds
 */
export const minutesToSeconds = (minutes: number): number => {
  return minutes * 60;
};

/**
 * Converts seconds to minutes
 */
export const secondsToMinutes = (seconds: number): number => {
  return Math.round(seconds / 60);
};

/**
 * Safely vibrate the device with error handling
 */
export const safeVibrate = (pattern: number[] | number): void => {
  try {
    const { Vibration } = require('react-native');
    Vibration.vibrate(pattern);
  } catch (error) {
    console.log('Vibration not available:', error);
    // Vibration is optional, continue without it
  }
};
// Core data models for Study Timer app

export interface Course {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  color?: string; // optional accent color for task card
}

export interface Session {
  id: string;
  courseId: string;
  startAt: string; // ISO date string
  durationSeconds: number;
  targetSeconds: number;
  isPartial: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultDurationMinutes: number;
  notificationsEnabled: boolean;
  dailyReminderTime: string; // HH:MM format
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string; // HH:MM format
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string; // ISO date string
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Analytics: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  CourseScreen: { courseId: string };
  TimerScreen: { courseId: string; durationMinutes: number };
  SettingsScreen: undefined;
};

// Theme types
export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

// Storage keys
export const STORAGE_KEYS = {
  COURSES: 'study_timer_courses_v1',
  SESSIONS: 'study_timer_sessions_v1',
  SETTINGS: 'study_timer_settings_v1',
  USER: 'study_timer_user_v1',
} as const;

// Default values
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  defaultDurationMinutes: 20,
  notificationsEnabled: true,
  dailyReminderTime: '09:00',
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

// Timer state
export interface TimerState {
  isRunning: boolean;
  remainingSeconds: number;
  elapsedSeconds: number;
  targetSeconds: number;
  startTime: number | null;
}

// Export data types
export interface CSVRow {
  Course: string;
  Date: string; // YYYY-MM-DD
  StartTime: string; // HH:MM
  Duration: number; // minutes
  SessionType: 'full' | 'partial';
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export const ERROR_CODES = {
  STORAGE_ERROR: 'STORAGE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR',
} as const;

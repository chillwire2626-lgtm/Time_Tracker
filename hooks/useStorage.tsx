import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Course, 
  Session, 
  AppSettings, 
  User, 
  STORAGE_KEYS, 
  DEFAULT_SETTINGS 
} from '../types';
import { uid, isoNow } from '../lib/utils';

interface UseStorageReturn {
  // Data
  courses: Course[];
  sessions: Session[];
  settings: AppSettings;
  user: User | null;
  
  // Course operations
  addCourse: (name: string) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  removeCourse: (id: string) => Promise<void>;
  
  // Session operations
  addSession: (session: Omit<Session, 'id'>) => Promise<void>;
  
  // Settings operations
  setAppSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  // User operations
  setUser: (user: User) => Promise<void>;
  clearUser: () => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export const useStorage = (): UseStorageReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [coursesData, sessionsData, settingsData, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.COURSES),
        AsyncStorage.getItem(STORAGE_KEYS.SESSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (coursesData) {
        setCourses(JSON.parse(coursesData));
      }

      if (sessionsData) {
        setSessions(JSON.parse(sessionsData));
      }

      if (settingsData) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) });
      }

      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('Loaded user from storage:', parsedUser);
        setUserState(parsedUser);
      } else {
        console.log('No user data found in storage');
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data from storage');
    } finally {
      setLoading(false);
    }
  };
  const reload = useCallback(async () => {
    await loadData();
  }, []);

  // Course operations
  const addCourse = useCallback(async (name: string) => {
    try {
      const palette = ['#FF6B6B', '#4ECDC4', '#FFD166', '#6C63FF', '#FF8C42'];
      const assignedColor = palette[Math.floor(Math.random() * palette.length)];
      const newCourse: Course = {
        id: uid('c_'),
        name: name.trim(),
        createdAt: isoNow(),
        color: assignedColor,
      };

      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updatedCourses));
    } catch (err) {
      console.error('Failed to add course:', err);
      setError('Failed to add course');
      throw err;
    }
  }, [courses]);

  const updateCourse = useCallback(async (id: string, updates: Partial<Course>) => {
    try {
      const updatedCourses = courses.map(course =>
        course.id === id ? { ...course, ...updates } : course
      );
      setCourses(updatedCourses);
      await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updatedCourses));
    } catch (err) {
      console.error('Failed to update course:', err);
      setError('Failed to update course');
      throw err;
    }
  }, [courses]);

  const removeCourse = useCallback(async (id: string) => {
    try {
      // Remove course
      const updatedCourses = courses.filter(course => course.id !== id);
      setCourses(updatedCourses);
      await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updatedCourses));

      // Remove associated sessions
      const updatedSessions = sessions.filter(session => session.courseId !== id);
      setSessions(updatedSessions);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
    } catch (err) {
      console.error('Failed to remove course:', err);
      setError('Failed to remove course');
      throw err;
    }
  }, [courses, sessions]);

  // Session operations
  const addSession = useCallback(async (sessionData: Omit<Session, 'id'>) => {
    try {
      const newSession: Session = {
        id: uid('s_'),
        ...sessionData,
      };

      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
    } catch (err) {
      console.error('Failed to add session:', err);
      setError('Failed to add session');
      throw err;
    }
  }, [sessions]);

  // Settings operations
  const setAppSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to update settings');
      throw err;
    }
  }, [settings]);

  // User operations
  const setUser = useCallback(async (userData: User) => {
    try {
      console.log('Setting user state:', userData);
      setUserState(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      console.log('User saved to AsyncStorage successfully');
    } catch (err) {
      console.error('Failed to save user:', err);
      setError('Failed to save user data');
      throw err;
    }
  }, []);

  const clearUser = useCallback(async () => {
    try {
      setUserState(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (err) {
      console.error('Failed to clear user:', err);
      setError('Failed to clear user data');
      throw err;
    }
  }, []);

  return {
    // Data
    courses,
    sessions,
    settings,
    user,
    
    // Course operations
    addCourse,
    updateCourse,
    removeCourse,
    
    // Session operations
    addSession,
    
    // Settings operations
    setAppSettings,
    
    // User operations
    setUser,
    clearUser,
    
    // Loading states
    loading,
    error,
    reload,
  };
};

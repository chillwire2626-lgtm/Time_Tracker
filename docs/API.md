# Study Timer - API Documentation

## 📚 Overview

This document provides comprehensive API documentation for all hooks, utilities, and core functions in the Study Timer application.

## 🎣 Custom Hooks

### useStorage Hook

Centralized data management hook for all local storage operations.

#### Import
```typescript
import { useStorage } from '../hooks/useStorage';
```

#### Interface
```typescript
interface UseStorageReturn {
  // Data
  courses: Course[];
  sessions: Session[];
  settings: AppSettings;
  
  // Course operations
  addCourse: (name: string) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  removeCourse: (id: string) => Promise<void>;
  
  // Session operations
  addSession: (session: Omit<Session, 'id'>) => Promise<void>;
  
  // Settings operations
  setAppSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}
```

#### Usage Example
```typescript
function HomeScreen() {
  const { courses, addCourse, loading } = useStorage();
  
  const handleAddCourse = async (name: string) => {
    try {
      await addCourse(name);
      // Course added successfully
    } catch (error) {
      console.error('Failed to add course:', error);
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <View>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </View>
  );
}
```

#### Methods

##### addCourse(name: string)
Creates a new course with the specified name.

**Parameters:**
- `name` (string): The name of the course/topic

**Returns:** Promise<void>

**Example:**
```typescript
await addCourse('React Native Development');
```

##### updateCourse(id: string, updates: Partial<Course>)
Updates an existing course with the provided updates.

**Parameters:**
- `id` (string): The course ID to update
- `updates` (Partial<Course>): The fields to update

**Returns:** Promise<void>

**Example:**
```typescript
await updateCourse('c_123', { name: 'Updated Course Name' });
```

##### removeCourse(id: string)
Removes a course and all associated sessions.

**Parameters:**
- `id` (string): The course ID to remove

**Returns:** Promise<void>

**Example:**
```typescript
await removeCourse('c_123');
```

##### addSession(session: Omit<Session, 'id'>)
Adds a new study session.

**Parameters:**
- `session` (Omit<Session, 'id'>): Session data without ID (auto-generated)

**Returns:** Promise<void>

**Example:**
```typescript
await addSession({
  courseId: 'c_123',
  startAt: '2024-01-15T10:00:00.000Z',
  durationSeconds: 1200,
  targetSeconds: 1200,
  isPartial: false
});
```

##### setAppSettings(settings: Partial<AppSettings>)
Updates app settings.

**Parameters:**
- `settings` (Partial<AppSettings>): Settings to update

**Returns:** Promise<void>

**Example:**
```typescript
await setAppSettings({
  theme: 'dark',
  defaultDurationMinutes: 25,
  notificationsEnabled: true
});
```

### useTheme Hook

Theme management hook with system preference support.

#### Import
```typescript
import { useTheme } from '../hooks/useTheme';
```

#### Interface
```typescript
interface UseThemeReturn {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  colors: ColorScheme;
  isDark: boolean;
}
```

#### Usage Example
```typescript
function SettingsScreen() {
  const { theme, setTheme, colors } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Current theme: {theme}</Text>
      <Button 
        title="Switch to Dark" 
        onPress={() => setTheme('dark')} 
      />
    </View>
  );
}
```

#### Methods

##### setTheme(theme: 'light' | 'dark' | 'system')
Updates the app theme.

**Parameters:**
- `theme`: The theme mode to set

**Returns:** void

**Example:**
```typescript
setTheme('system'); // Follows system preference
```

## 🔧 Utility Functions

### lib/utils.ts

General utility functions for the application.

#### Import
```typescript
import { uid, isoNow, secondsToHms, startOfDayISO, isSameDayISO } from '../lib/utils';
```

#### Functions

##### uid(prefix?: string)
Generates a unique identifier with optional prefix.

**Parameters:**
- `prefix` (string, optional): Prefix for the ID (default: 'id')

**Returns:** string

**Example:**
```typescript
const courseId = uid('c_'); // Returns: "c_abc123def456"
const sessionId = uid('s_'); // Returns: "s_xyz789ghi012"
```

##### isoNow()
Gets current timestamp in ISO format.

**Returns:** string

**Example:**
```typescript
const now = isoNow(); // Returns: "2024-01-15T10:30:00.000Z"
```

##### secondsToHms(seconds: number)
Converts seconds to hours:minutes:seconds format.

**Parameters:**
- `seconds` (number): Number of seconds to convert

**Returns:** string

**Example:**
```typescript
const timeString = secondsToHms(3661); // Returns: "1:01:01"
const shortTime = secondsToHms(125); // Returns: "2:05"
```

##### startOfDayISO(date?: Date)
Gets the start of day in ISO format.

**Parameters:**
- `date` (Date, optional): Date to get start of day for (default: current date)

**Returns:** string

**Example:**
```typescript
const startOfToday = startOfDayISO(); // Returns: "2024-01-15T00:00:00.000Z"
const startOfSpecificDay = startOfDayISO(new Date('2024-01-20')); // Returns: "2024-01-20T00:00:00.000Z"
```

##### isSameDayISO(date1: string, date2: string)
Checks if two ISO date strings are on the same day.

**Parameters:**
- `date1` (string): First ISO date string
- `date2` (string): Second ISO date string

**Returns:** boolean

**Example:**
```typescript
const sameDay = isSameDayISO(
  '2024-01-15T10:30:00.000Z',
  '2024-01-15T15:45:00.000Z'
); // Returns: true
```

## 🔔 Notification System

### lib/notifications.tsx

Local notification system with permission management.

#### Import
```typescript
import { useNotifications, initNotifications } from '../lib/notifications';
```

#### useNotifications Hook

##### Interface
```typescript
interface UseNotificationsReturn {
  permission: 'granted' | 'denied' | 'undetermined';
  sendImmediate: (title: string, body: string) => Promise<void>;
  requestPermission: () => Promise<boolean>;
}
```

##### Usage Example
```typescript
function TimerScreen() {
  const { permission, sendImmediate } = useNotifications();
  
  const handleTimerComplete = async () => {
    if (permission === 'granted') {
      await sendImmediate(
        'Study Session Complete!',
        'Great job! Take a 5-minute break.'
      );
    }
  };
  
  return (
    <View>
      {/* Timer UI */}
    </View>
  );
}
```

##### Methods

###### sendImmediate(title: string, body: string)
Sends an immediate local notification.

**Parameters:**
- `title` (string): Notification title
- `body` (string): Notification body text

**Returns:** Promise<void>

**Example:**
```typescript
await sendImmediate('Break Time!', 'Your 25-minute study session is complete.');
```

###### requestPermission()
Requests notification permission from the user.

**Returns:** Promise<boolean> - true if permission granted

**Example:**
```typescript
const granted = await requestPermission();
if (granted) {
  console.log('Notifications enabled');
}
```

#### initNotifications()
Initializes the notification system. Call this in App.tsx.

**Returns:** Promise<void>

**Example:**
```typescript
// In App.tsx
useEffect(() => {
  initNotifications();
}, []);
```

## 📊 Export System

### lib/export.ts

CSV and PDF export functionality.

#### Import
```typescript
import { exportSessionsCSV, exportAnalyticsPDF } from '../lib/export';
```

#### Functions

##### exportSessionsCSV(sessions: Session[], courses: Course[])
Exports sessions data as a CSV file and opens sharing dialog.

**Parameters:**
- `sessions` (Session[]): Array of sessions to export
- `courses` (Course[]): Array of courses for name lookup

**Returns:** Promise<void>

**Example:**
```typescript
const { sessions, courses } = useStorage();

const handleExportCSV = async () => {
  try {
    await exportSessionsCSV(sessions, courses);
    // CSV file generated and sharing dialog opened
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

**CSV Format:**
```csv
Course,Date,StartTime,Duration(mins),SessionType
React Native,2024-01-15,10:00,25,full
JavaScript,2024-01-15,14:30,15,partial
```

##### exportAnalyticsPDF(htmlContent: string)
Exports analytics data as a PDF file and opens sharing dialog.

**Parameters:**
- `htmlContent` (string): HTML content to convert to PDF

**Returns:** Promise<void>

**Example:**
```typescript
const generateAnalyticsHTML = () => {
  return `
    <html>
      <body>
        <h1>Study Analytics</h1>
        <p>Total Study Time: ${totalHours} hours</p>
        <p>Total Sessions: ${sessionCount}</p>
      </body>
    </html>
  `;
};

const handleExportPDF = async () => {
  try {
    const html = generateAnalyticsHTML();
    await exportAnalyticsPDF(html);
    // PDF file generated and sharing dialog opened
  } catch (error) {
    console.error('PDF export failed:', error);
  }
};
```

## 🎨 Theme System

### Color Scheme Interface
```typescript
interface ColorScheme {
  primary: string;        // Primary brand color
  secondary: string;      // Secondary brand color
  background: string;     // Main background color
  surface: string;        // Card/surface background
  text: string;          // Primary text color
  textSecondary: string; // Secondary text color
  border: string;        // Border color
  success: string;       // Success state color
  warning: string;       // Warning state color
  error: string;         // Error state color
}
```

### Default Color Schemes

#### Light Theme
```typescript
const lightColors: ColorScheme = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  textSecondary: '#6D6D70',
  border: '#C6C6C8',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30'
};
```

#### Dark Theme
```typescript
const darkColors: ColorScheme = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A'
};
```

## 📱 Navigation API

### Navigation Structure
```typescript
// Root Stack Navigator
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Main Tab Navigator
type MainTabParamList = {
  Home: undefined;
  Analytics: undefined;
  Settings: undefined;
};

// Home Stack Navigator
type HomeStackParamList = {
  HomeScreen: undefined;
  CourseScreen: { courseId: string };
  TimerScreen: { courseId: string; durationMinutes: number };
};
```

### Navigation Usage
```typescript
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  
  const navigateToCourse = (courseId: string) => {
    navigation.navigate('CourseScreen', { courseId });
  };
  
  const startTimer = (courseId: string, duration: number) => {
    navigation.navigate('TimerScreen', { 
      courseId, 
      durationMinutes: duration 
    });
  };
}
```

## 🔄 Timer API

### Timer State Interface
```typescript
interface TimerState {
  isRunning: boolean;
  remainingSeconds: number;
  elapsedSeconds: number;
  targetSeconds: number;
  startTime: number | null;
}
```

### Timer Methods
```typescript
interface TimerMethods {
  start: () => void;
  pause: () => void;
  reset: () => void;
  complete: () => Promise<void>;
  terminate: () => Promise<void>;
}
```

### Timer Usage Example
```typescript
function TimerScreen({ route }) {
  const { courseId, durationMinutes } = route.params;
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    remainingSeconds: durationMinutes * 60,
    elapsedSeconds: 0,
    targetSeconds: durationMinutes * 60,
    startTime: null
  });
  
  const { addSession } = useStorage();
  
  const handleComplete = async () => {
    // Create full session
    await addSession({
      courseId,
      startAt: isoNow(),
      durationSeconds: timerState.targetSeconds,
      targetSeconds: timerState.targetSeconds,
      isPartial: false
    });
    
    // Play alarm and show notification
    playAlarm();
    sendNotification('Session Complete!', 'Great job!');
  };
  
  const handleTerminate = async () => {
    if (timerState.elapsedSeconds > 0) {
      // Create partial session
      await addSession({
        courseId,
        startAt: isoNow(),
        durationSeconds: timerState.elapsedSeconds,
        targetSeconds: timerState.targetSeconds,
        isPartial: true
      });
    }
    
    playAlarm();
    sendNotification('Session Terminated', 'Keep up the good work!');
  };
}
```

## 🧪 Testing Utilities

### Storage Testing
```typescript
// Mock AsyncStorage for testing
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useStorage } from '../hooks/useStorage';

test('should add course', async () => {
  const { result } = renderHook(() => useStorage());
  
  await act(async () => {
    await result.current.addCourse('Test Course');
  });
  
  expect(result.current.courses).toHaveLength(1);
  expect(result.current.courses[0].name).toBe('Test Course');
});
```

## 📋 Error Handling

### Error Types
```typescript
interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Common error codes
const ERROR_CODES = {
  STORAGE_ERROR: 'STORAGE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR'
};
```

### Error Handling Example
```typescript
const handleStorageOperation = async () => {
  try {
    await addCourse('New Course');
  } catch (error) {
    if (error.code === 'STORAGE_ERROR') {
      // Handle storage-specific error
      showAlert('Storage Error', 'Failed to save data. Please try again.');
    } else {
      // Handle generic error
      showAlert('Error', 'Something went wrong. Please try again.');
    }
  }
};
```

## 🔧 Configuration

### App Configuration
```typescript
interface AppConfig {
  defaultDurationMinutes: number;
  maxCourses: number;
  maxSessionsPerCourse: number;
  exportFormats: ('csv' | 'pdf')[];
  supportedThemes: ('light' | 'dark' | 'system')[];
}

const defaultConfig: AppConfig = {
  defaultDurationMinutes: 25,
  maxCourses: 50,
  maxSessionsPerCourse: 1000,
  exportFormats: ['csv', 'pdf'],
  supportedThemes: ['light', 'dark', 'system']
};
```

This API documentation provides comprehensive coverage of all the hooks, utilities, and core functions in the Study Timer application. Each section includes detailed interfaces, usage examples, and practical implementation guidance.

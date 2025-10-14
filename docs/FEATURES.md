# Study Timer - Features Documentation

## 📱 Core Features

### 1. Course Management
**Location**: `screens/HomeScreen.tsx`, `screens/CourseScreen.tsx`

#### Create Course
- Add new study topics/courses with custom names
- Automatic ID generation with `c_` prefix
- Timestamp tracking for creation date

#### Course List
- Display all created courses in a scrollable list
- Course cards showing name and creation date
- Quick access to course details and timer

#### Course Details
- View course information
- Edit course name (future enhancement)
- Delete course and associated sessions
- Session bubble visualization

### 2. Pomodoro Timer
**Location**: `screens/TimerScreen.tsx`

#### Timer Controls
- **Start**: Begin countdown timer
- **Pause**: Pause/resume timer
- **Stop**: Terminate session early
- **Reset**: Reset timer to initial state

#### Timer Features
- Customizable duration (default: 25 minutes)
- Visual countdown display
- Progress indicator
- Background app state handling

#### Session Completion
- **Full Session**: Timer completes naturally (creates full session)
- **Partial Session**: Timer terminated early (creates partial session)
- **No Session**: Timer terminated immediately (no session created)

### 3. Session Tracking
**Location**: `hooks/useStorage.tsx`

#### Session Types
```typescript
interface Session {
  id: string;              // Unique identifier (s_*)
  courseId: string;        // Reference to course
  startAt: string;         // ISO timestamp
  durationSeconds: number; // Actual duration
  targetSeconds: number;   // Intended duration
  isPartial: boolean;      // Completion status
}
```

#### Session Creation Logic
- **Full Session**: `durationSeconds === targetSeconds`, `isPartial: false`
- **Partial Session**: `durationSeconds < targetSeconds`, `isPartial: true`
- **Minimum Duration**: Partial sessions require at least 1 second

### 4. Visual Session Bubbles
**Location**: `screens/CourseScreen.tsx`

#### Bubble Representation
- **Full Bubbles**: Complete sessions (solid color)
- **Partial Bubbles**: Incomplete sessions (proportional fill)
- **Bubble Size**: Based on session duration relative to target
- **Color Coding**: Different colors for full vs partial sessions

#### Bubble Calculation
```typescript
const progress = session.durationSeconds / session.targetSeconds;
const bubbleSize = Math.max(progress, 0.01); // Minimum 1% visibility
```

### 5. Streak Tracking
**Location**: `screens/HomeScreen.tsx`

#### Streak Calculation
- Counts consecutive calendar days with at least one session
- Resets when a day passes without any sessions
- Displays current streak on home screen

#### Streak Logic
```typescript
const calculateStreak = (sessions: Session[]) => {
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
```

### 6. Analytics & Insights
**Location**: `screens/AnalyticsScreen.tsx`

#### Summary Statistics
- **Total Study Time**: Sum of all session durations
- **Total Sessions**: Count of all sessions
- **Most Studied Course**: Course with highest total time
- **Average Session Duration**: Mean session length

#### Time Calculations
```typescript
const totalStudyTime = sessions.reduce((sum, session) => 
  sum + session.durationSeconds, 0
);

const averageSessionDuration = totalStudyTime / sessions.length;

const mostStudiedCourse = courses.reduce((max, course) => {
  const courseTime = sessions
    .filter(s => s.courseId === course.id)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  return courseTime > max.time ? { course, time: courseTime } : max;
}, { course: null, time: 0 });
```

### 7. Data Export
**Location**: `lib/export.ts`

#### CSV Export
- **Format**: Course, Date, StartTime, Duration(mins), SessionType
- **File Name**: `study-sessions-YYYY-MM-DD.csv`
- **Sharing**: Uses expo-sharing for file sharing

#### PDF Export
- **Content**: Analytics summary with charts (future enhancement)
- **Format**: HTML to PDF conversion
- **Sharing**: Uses expo-sharing for file sharing

#### Export Example
```csv
Course,Date,StartTime,Duration(mins),SessionType
React Native,2024-01-15,10:00,25,full
JavaScript,2024-01-15,14:30,15,partial
Python,2024-01-16,09:15,30,full
```

### 8. Local Notifications
**Location**: `lib/notifications.tsx`

#### Notification Types
- **Session Complete**: When timer finishes naturally
- **Session Terminated**: When timer is stopped early
- **Daily Reminders**: Scheduled study reminders (future enhancement)

#### Permission Handling
- Request notification permission on app start
- Graceful fallback if permissions denied
- Platform-specific notification handling

#### Notification Content
```typescript
// Session complete
await sendImmediate(
  'Study Session Complete!',
  'Great job! Take a 5-minute break.'
);

// Session terminated
await sendImmediate(
  'Session Terminated',
  'Keep up the good work!'
);
```

### 9. Theme System
**Location**: `hooks/useTheme.tsx`

#### Theme Options
- **Light Theme**: Bright, clean interface
- **Dark Theme**: Dark, easy-on-eyes interface
- **System Theme**: Follows device system preference

#### Theme Persistence
- User preference stored in AsyncStorage
- Automatic theme switching based on system preference
- Consistent theming across all screens

#### Color Scheme
```typescript
interface ColorScheme {
  primary: string;        // Brand color
  secondary: string;      // Accent color
  background: string;     // Main background
  surface: string;        // Card background
  text: string;          // Primary text
  textSecondary: string; // Secondary text
  border: string;        // Border color
  success: string;       // Success state
  warning: string;       // Warning state
  error: string;         // Error state
}
```

### 10. Settings & Preferences
**Location**: `screens/SettingsScreen.tsx`

#### App Settings
- **Theme Selection**: Light/Dark/System
- **Default Timer Duration**: 5-60 minutes
- **Notification Preferences**: Enable/disable notifications
- **Daily Reminder Time**: Set reminder time
- **Quiet Hours**: Set do-not-disturb period

#### Settings Persistence
```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultDurationMinutes: number;
  notificationsEnabled: boolean;
  dailyReminderTime: string;    // HH:MM format
  quietHoursStart: string;      // HH:MM format
  quietHoursEnd: string;        // HH:MM format
}
```

## 🔄 User Flows

### 1. First-Time User Flow
1. **App Launch** → Welcome screen
2. **Authentication** → Simple email/password (local demo)
3. **Home Screen** → Empty state with "Add Course" button
4. **Create Course** → Enter course name
5. **Start Studying** → Navigate to timer

### 2. Study Session Flow
1. **Select Course** → From home screen or course list
2. **Set Duration** → Use default or custom duration
3. **Start Timer** → Begin countdown
4. **Study** → Timer runs in background
5. **Complete/Terminate** → Session saved, notification sent

### 3. Analytics Flow
1. **View Analytics** → Navigate to analytics tab
2. **Review Statistics** → See study time, sessions, streaks
3. **Export Data** → Choose CSV or PDF format
4. **Share Data** → Use device sharing capabilities

### 4. Settings Flow
1. **Access Settings** → Navigate to settings tab
2. **Modify Preferences** → Change theme, duration, notifications
3. **Save Changes** → Settings persisted automatically
4. **Apply Changes** → Immediate effect on app behavior

## 🎯 Future Enhancements

### 1. Advanced Analytics
- **Weekly/Monthly Reports**: Detailed time period analysis
- **Productivity Trends**: Study pattern insights
- **Goal Setting**: Set and track study goals
- **Achievement System**: Badges and milestones

### 2. Enhanced Notifications
- **Scheduled Reminders**: Daily study reminders
- **Break Reminders**: Rest period notifications
- **Streak Alerts**: Motivation for maintaining streaks
- **Custom Notifications**: User-defined notification types

### 3. Social Features
- **Study Groups**: Share progress with friends
- **Leaderboards**: Friendly competition
- **Study Challenges**: Group study goals
- **Progress Sharing**: Social media integration

### 4. Advanced Timer Features
- **Custom Timer Presets**: Save favorite durations
- **Timer History**: View past timer sessions
- **Break Timer**: Automatic break periods
- **Long Break Timer**: Extended rest periods

### 5. Data Management
- **Cloud Sync**: Backup and sync across devices
- **Data Import/Export**: Advanced data portability
- **Data Backup**: Automatic backup system
- **Data Recovery**: Restore from backup

### 6. Accessibility Features
- **Voice Commands**: Hands-free timer control
- **Large Text**: Accessibility-friendly text sizes
- **High Contrast**: Enhanced visibility options
- **Screen Reader**: Full screen reader support

## 🔧 Technical Features

### 1. Local Storage
- **AsyncStorage**: All data stored locally
- **Data Versioning**: Future-proof data structure
- **Error Handling**: Graceful storage failure handling
- **Data Migration**: Automatic data structure updates

### 2. Cross-Platform Support
- **iOS**: Full native functionality
- **Android**: Full native functionality
- **Web**: Limited functionality (no notifications, limited sharing)

### 3. Performance Optimization
- **Lazy Loading**: Screens loaded on demand
- **Memoization**: Expensive calculations cached
- **Efficient Rendering**: Optimized list rendering
- **Memory Management**: Proper cleanup and garbage collection

### 4. Error Handling
- **Graceful Degradation**: App continues working with limited functionality
- **User Feedback**: Clear error messages and recovery options
- **Logging**: Comprehensive error logging for debugging
- **Recovery**: Automatic recovery from common errors

This features documentation provides a comprehensive overview of all current and planned features in the Study Timer application. Each feature is documented with its location, implementation details, and usage examples.

# Study Timer - Architecture Documentation

## 🏗 High-Level Architecture

Study Timer follows a modular, component-based architecture built on React Native CLI with TypeScript. The app uses local storage for data persistence and implements a clean separation of concerns across different layers.

### Architecture Principles

- **Local-First**: All data stored locally using AsyncStorage
- **Component-Based**: Modular React components with clear responsibilities
- **Hook-Based State Management**: Custom hooks for data and theme management
- **Type Safety**: Full TypeScript implementation with strict typing
- **Cross-Platform**: Single codebase for iOS, Android, and Web

## 📱 Application Layers

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│  (Screens, Components, Navigation)  │
├─────────────────────────────────────┤
│           Business Logic Layer      │
│     (Hooks, State Management)       │
├─────────────────────────────────────┤
│           Data Access Layer         │
│    (AsyncStorage, File System)      │
├─────────────────────────────────────┤
│           Platform Layer            │
│  (Notifications, Audio, Sharing)    │
└─────────────────────────────────────┘
```

## 🗂 Folder Structure & Responsibilities

### `/screens/` - Presentation Layer
Contains all UI screens and their specific logic:

- **AuthScreen.tsx**: Local authentication interface
- **HomeScreen.tsx**: Main dashboard with course management
- **CourseScreen.tsx**: Individual course view with session bubbles
- **TimerScreen.tsx**: Core Pomodoro timer functionality
- **AnalyticsScreen.tsx**: Study analytics and export options
- **SettingsScreen.tsx**: App configuration and preferences

### `/hooks/` - Business Logic Layer
Custom React hooks for state management:

- **useStorage.tsx**: Centralized data persistence and retrieval
- **useTheme.tsx**: Theme management and context provider

### `/lib/` - Platform Integration Layer
Utilities and platform-specific integrations:

- **notifications.tsx**: Local notification system
- **export.ts**: CSV/PDF generation and sharing
- **utils.ts**: General utility functions

### `/types/` - Type Definitions
TypeScript interfaces and type definitions:

- **index.ts**: Core data models and app interfaces

## 🔄 Data Flow Architecture

### 1. Authentication Flow
```
User Input → AuthScreen → Local Storage → Navigation Update
```

### 2. Course Management Flow
```
HomeScreen → useStorage.addCourse → AsyncStorage → UI Update
```

### 3. Timer Session Flow
```
CourseScreen → TimerScreen → Session Creation → Analytics Update
```

### 4. Data Export Flow
```
AnalyticsScreen → Export Functions → File Generation → Sharing
```

## 🗄 Data Architecture

### Storage Keys
All data is stored in AsyncStorage with versioned keys:

```typescript
const STORAGE_KEYS = {
  COURSES: 'study_timer_courses_v1',
  SESSIONS: 'study_timer_sessions_v1',
  SETTINGS: 'study_timer_settings_v1',
  USER: 'study_timer_user_v1'
};
```

### Data Models

#### Course Model
```typescript
interface Course {
  id: string;           // Unique identifier (c_*)
  name: string;         // Course/topic name
  createdAt: string;    // ISO timestamp
}
```

#### Session Model
```typescript
interface Session {
  id: string;           // Unique identifier (s_*)
  courseId: string;     // Reference to course
  startAt: string;      // ISO timestamp
  durationSeconds: number;    // Actual session duration
  targetSeconds: number;      // Intended session duration
  isPartial: boolean;   // Whether session was completed
}
```

#### App Settings Model
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

## 🎯 Core Components Architecture

### App.tsx - Application Root
```typescript
// Provider hierarchy
<SafeAreaProvider>
  <ThemeProvider>
    <NotificationsProvider>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </NotificationsProvider>
  </ThemeProvider>
</SafeAreaProvider>
```

### Navigation Architecture
```
RootStack
├── AuthStack (if not authenticated)
│   └── AuthScreen
└── MainTabs (if authenticated)
    ├── HomeTab
    │   ├── HomeScreen
    │   ├── CourseScreen
    │   └── TimerScreen
    ├── AnalyticsTab
    │   └── AnalyticsScreen
    └── SettingsTab
        └── SettingsScreen
```

## 🔧 State Management Architecture

### useStorage Hook
Centralized data management with the following responsibilities:

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
}
```

### useTheme Hook
Theme management with system preference support:

```typescript
interface UseThemeReturn {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  colors: ColorScheme;
}
```

## 🔔 Notification Architecture

### Notification System Components
1. **Permission Management**: Request and check notification permissions
2. **Immediate Notifications**: Session completion alerts
3. **Scheduled Notifications**: Daily reminders (future enhancement)
4. **Quiet Hours**: Respect user-defined quiet time periods

### Notification Flow
```
Timer Completion → Check Settings → Request Permission → Send Notification
```

## 📊 Export System Architecture

### CSV Export Flow
```
Sessions Data → Format as CSV → Generate File → Share via expo-sharing
```

### PDF Export Flow
```
Analytics Data → Generate HTML → Convert to PDF → Share via expo-sharing
```

### Export Data Structure
```typescript
// CSV Format
interface CSVRow {
  Course: string;
  Date: string;           // YYYY-MM-DD
  StartTime: string;      // HH:MM
  Duration: number;       // minutes
  SessionType: 'full' | 'partial';
}
```

## 🎨 Theme Architecture

### Theme Provider Structure
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: ThemeMode) => void;
  colors: ColorScheme;
  isDark: boolean;
}
```

### Color Scheme Definition
```typescript
interface ColorScheme {
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
```

## 🔄 Timer Architecture

### Timer State Management
```typescript
interface TimerState {
  isRunning: boolean;
  remainingSeconds: number;
  elapsedSeconds: number;
  targetSeconds: number;
  startTime: number | null;
}
```

### Timer Lifecycle
1. **Initialization**: Set target duration from course settings
2. **Running**: Update remaining time, handle app state changes
3. **Completion**: Create full session, play alarm, show notification
4. **Termination**: Create partial session (if elapsed > 0), play alarm

### App State Handling
```typescript
// Handle app backgrounding/foregrounding
useEffect(() => {
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && isRunning) {
      // Reconcile elapsed time
      reconcileElapsedTime();
    }
  };
  
  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => subscription?.remove();
}, [isRunning]);
```

## 🧪 Testing Architecture

### Test Structure
```
__tests__/
├── components/          # Component unit tests
├── hooks/              # Hook unit tests
├── lib/                # Utility function tests
└── integration/        # Integration tests
```

### Key Testing Areas
1. **useStorage Hook**: Data persistence and retrieval
2. **Timer Logic**: Session creation and completion
3. **Export Functions**: CSV/PDF generation
4. **Theme System**: Theme switching and persistence

## 🚀 Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Screen components loaded on demand
2. **Memoization**: React.memo for expensive components
3. **Storage Optimization**: Batch operations where possible
4. **Image Optimization**: Proper image sizing and caching

### Memory Management
1. **Cleanup**: Proper cleanup of timers and listeners
2. **Storage Limits**: Monitor AsyncStorage usage
3. **Component Unmounting**: Clear subscriptions and timers

## 🔒 Security Architecture

### Data Security
1. **Local Storage**: All data stored locally (no cloud sync)
2. **No Sensitive Data**: No passwords or personal information stored
3. **Input Validation**: Sanitize user inputs
4. **File System**: Secure file operations for exports

### Privacy Considerations
1. **No Analytics**: No third-party analytics or tracking
2. **Local Notifications**: No external notification services
3. **Export Control**: User controls all data exports

## 🔄 Future Architecture Considerations

### Scalability
1. **Database Migration**: Easy migration to SQLite or other databases
2. **Cloud Sync**: Architecture supports future cloud integration
3. **Offline-First**: Maintains offline functionality

### Extensibility
1. **Plugin Architecture**: Modular feature additions
2. **Theme System**: Easy addition of new themes
3. **Export Formats**: Extensible export system
4. **Notification Types**: Support for various notification types

## 📋 Architecture Decision Records (ADRs)

### ADR-001: Local Storage vs Database
**Decision**: Use AsyncStorage for simplicity and offline-first approach
**Rationale**: Study timer data is personal and doesn't require complex queries

### ADR-002: React Navigation vs Native Navigation
**Decision**: Use React Navigation for cross-platform consistency
**Rationale**: Provides consistent navigation experience across platforms

### ADR-003: Custom Hooks vs State Management Library
**Decision**: Use custom hooks for state management
**Rationale**: Simpler architecture for the app's complexity level

### ADR-004: Local Auth vs Cloud Auth
**Decision**: Start with local demo auth
**Rationale**: Faster development, can be upgraded to cloud auth later

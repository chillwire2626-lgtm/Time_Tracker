# Study Timer - Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (>= 20)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Initial Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd TimeTracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Install additional dependencies**
```bash
# Core dependencies
npm install @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Optional dependencies (for full functionality)
npm install expo-notifications expo-av expo-file-system expo-sharing expo-print
```

4. **iOS setup (macOS only)**
```bash
cd ios && pod install && cd ..
```

5. **Start development**
```bash
npm start
```

## 🏗 Project Structure

```
TimeTracker/
├── App.tsx                 # App entry point
├── index.js               # React Native entry point
├── screens/               # UI screens
│   ├── AuthScreen.tsx
│   ├── HomeScreen.tsx
│   ├── CourseScreen.tsx
│   ├── TimerScreen.tsx
│   ├── AnalyticsScreen.tsx
│   └── SettingsScreen.tsx
├── hooks/                 # Custom hooks
│   ├── useStorage.tsx
│   └── useTheme.tsx
├── lib/                   # Utilities
│   ├── notifications.tsx
│   ├── export.ts
│   └── utils.ts
├── types/                 # TypeScript types
│   └── index.ts
├── assets/               # Static assets
├── android/              # Android-specific code
├── ios/                  # iOS-specific code
└── docs/                 # Documentation
```

## 🔧 Development Workflow

### 1. Feature Development

When adding a new feature:

1. **Create the component/screen**
```bash
# Create new screen
touch screens/NewScreen.tsx

# Create new hook
touch hooks/useNewFeature.tsx
```

2. **Add TypeScript types**
```typescript
// In types/index.ts
export interface NewFeature {
  id: string;
  name: string;
  // ... other properties
}
```

3. **Implement the feature**
4. **Add tests**
5. **Update documentation**

### 2. Code Style Guidelines

#### TypeScript
- Use strict typing
- Define interfaces for all data structures
- Use type guards for runtime type checking

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Bad
const user = {
  id: '123',
  name: 'John',
  email: 'john@example.com'
};
```

#### React Components
- Use functional components with hooks
- Implement proper prop types
- Use React.memo for performance optimization

```typescript
// Good
interface CourseCardProps {
  course: Course;
  onPress: (courseId: string) => void;
}

const CourseCard = React.memo<CourseCardProps>(({ course, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(course.id)}>
      <Text>{course.name}</Text>
    </TouchableOpacity>
  );
});
```

#### File Naming
- Use PascalCase for components: `TimerScreen.tsx`
- Use camelCase for utilities: `utils.ts`
- Use kebab-case for assets: `alarm-sound.mp3`

### 3. State Management

#### Local State
Use `useState` for component-specific state:

```typescript
const [isRunning, setIsRunning] = useState(false);
const [remainingSeconds, setRemainingSeconds] = useState(1500);
```

#### Global State
Use custom hooks for shared state:

```typescript
// In hooks/useStorage.tsx
export const useStorage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // ... implementation
  
  return {
    courses,
    sessions,
    addCourse,
    addSession,
    // ... other methods
  };
};
```

## 🧪 Testing

### Test Structure
```
__tests__/
├── components/
│   ├── TimerScreen.test.tsx
│   └── CourseScreen.test.tsx
├── hooks/
│   ├── useStorage.test.tsx
│   └── useTheme.test.tsx
├── lib/
│   ├── utils.test.ts
│   └── export.test.ts
└── __mocks__/
    └── AsyncStorage.js
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

#### Component Tests
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimerScreen } from '../screens/TimerScreen';

describe('TimerScreen', () => {
  it('should start timer when start button is pressed', () => {
    const { getByText } = render(<TimerScreen />);
    const startButton = getByText('Start');
    
    fireEvent.press(startButton);
    
    expect(getByText('Pause')).toBeTruthy();
  });
});
```

#### Hook Tests
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useStorage } from '../hooks/useStorage';

describe('useStorage', () => {
  it('should add course', async () => {
    const { result } = renderHook(() => useStorage());
    
    await act(async () => {
      await result.current.addCourse('Test Course');
    });
    
    expect(result.current.courses).toHaveLength(1);
    expect(result.current.courses[0].name).toBe('Test Course');
  });
});
```

#### Utility Tests
```typescript
import { secondsToHms, isSameDayISO } from '../lib/utils';

describe('utils', () => {
  it('should convert seconds to H:M:S format', () => {
    expect(secondsToHms(3661)).toBe('1:01:01');
    expect(secondsToHms(125)).toBe('2:05');
    expect(secondsToHms(59)).toBe('0:59');
  });
  
  it('should check if dates are on same day', () => {
    expect(isSameDayISO(
      '2024-01-15T10:30:00.000Z',
      '2024-01-15T15:45:00.000Z'
    )).toBe(true);
    
    expect(isSameDayISO(
      '2024-01-15T10:30:00.000Z',
      '2024-01-16T10:30:00.000Z'
    )).toBe(false);
  });
});
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Metro Bundler Issues
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear npm cache
npm start -- --reset-cache
```

#### 2. Android Build Issues
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

#### 3. iOS Build Issues
```bash
# Clean iOS build
cd ios
rm -rf build
pod install
cd ..

# Rebuild
npm run ios
```

#### 4. AsyncStorage Issues
```typescript
// Check if AsyncStorage is properly imported
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure proper error handling
try {
  const value = await AsyncStorage.getItem('key');
  if (value !== null) {
    // Use the value
  }
} catch (error) {
  console.error('AsyncStorage error:', error);
}
```

#### 5. Navigation Issues
```typescript
// Ensure proper navigation setup
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Check navigation params
const navigation = useNavigation();
const route = useRoute();

// Access route params safely
const { courseId } = route.params || {};
```

### Platform-Specific Issues

#### Android
- **Permissions**: Add required permissions to `android/app/src/main/AndroidManifest.xml`
- **Proguard**: Configure Proguard rules in `android/app/proguard-rules.pro`
- **Gradle**: Update Gradle version in `android/gradle/wrapper/gradle-wrapper.properties`

#### iOS
- **Info.plist**: Add required permissions to `ios/TimeTracker/Info.plist`
- **Podfile**: Update iOS deployment target in `ios/Podfile`
- **Xcode**: Clean build folder in Xcode (Product → Clean Build Folder)

#### Web
- **Polyfills**: Add necessary polyfills for web compatibility
- **Platform checks**: Use `Platform.OS === 'web'` for web-specific code
- **Expo modules**: Some Expo modules may not work on web

## 🔧 Customization Guide

### 1. Changing Default Timer Duration

**Location**: `screens/SettingsScreen.tsx`

```typescript
// Default duration in minutes
const DEFAULT_DURATION = 25; // Change this value

// In settings
const defaultSettings: AppSettings = {
  theme: 'system',
  defaultDurationMinutes: DEFAULT_DURATION,
  notificationsEnabled: true,
  dailyReminderTime: '09:00',
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
};
```

### 2. Adding New Themes

**Location**: `hooks/useTheme.tsx`

```typescript
// Add new theme colors
const customColors: ColorScheme = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#F7F7F7',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#BDC3C7',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C'
};

// Add to theme options
const themes = {
  light: lightColors,
  dark: darkColors,
  custom: customColors, // Add this
  system: systemColors
};
```

### 3. Customizing Alarm Sound

**Location**: `screens/TimerScreen.tsx`

```typescript
// Option 1: Use local asset
import alarmSound from '../assets/alarm.mp3';

const playAlarm = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(alarmSound);
    await sound.playAsync();
  } catch (error) {
    console.error('Failed to play alarm:', error);
  }
};

// Option 2: Use remote URL
const ALARM_URL = 'https://your-domain.com/alarm.mp3';

const playAlarm = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri: ALARM_URL });
    await sound.playAsync();
  } catch (error) {
    console.error('Failed to play alarm:', error);
  }
};
```

### 4. Adding New Export Formats

**Location**: `lib/export.ts`

```typescript
// Add JSON export
export const exportSessionsJSON = async (sessions: Session[], courses: Course[]) => {
  try {
    const data = sessions.map(session => {
      const course = courses.find(c => c.id === session.courseId);
      return {
        course: course?.name || 'Unknown',
        date: session.startAt.split('T')[0],
        startTime: session.startAt.split('T')[1].split('.')[0],
        durationMinutes: Math.round(session.durationSeconds / 60),
        sessionType: session.isPartial ? 'partial' : 'full'
      };
    });
    
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `study-sessions-${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, jsonString);
    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error('JSON export failed:', error);
    throw error;
  }
};
```

### 5. Customizing Session Bubbles

**Location**: `screens/CourseScreen.tsx`

```typescript
// Customize bubble appearance
const renderSessionBubble = (session: Session, index: number) => {
  const progress = session.durationSeconds / session.targetSeconds;
  const isPartial = session.isPartial;
  
  return (
    <View
      key={session.id}
      style={[
        styles.bubble,
        {
          backgroundColor: isPartial ? colors.warning : colors.success,
          opacity: isPartial ? 0.7 : 1.0,
          transform: [{ scale: progress }] // Custom scaling
        }
      ]}
    />
  );
};
```

## 🚀 Performance Optimization

### 1. Component Optimization

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handlePress = useCallback((id: string) => {
  onItemPress(id);
}, [onItemPress]);
```

### 2. List Optimization

```typescript
// Use FlatList for large lists
<FlatList
  data={sessions}
  renderItem={({ item }) => <SessionItem session={item} />}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### 3. Storage Optimization

```typescript
// Batch storage operations
const batchUpdateSessions = async (updates: Session[]) => {
  try {
    const currentSessions = await AsyncStorage.getItem(SESSIONS_KEY);
    const sessions = currentSessions ? JSON.parse(currentSessions) : [];
    
    const updatedSessions = sessions.map((session: Session) => {
      const update = updates.find(u => u.id === session.id);
      return update ? { ...session, ...update } : session;
    });
    
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Batch update failed:', error);
  }
};
```

## 📱 Platform-Specific Development

### Android-Specific

#### Permissions
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

#### Proguard Rules
```proguard
# android/app/proguard-rules.pro
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
```

### iOS-Specific

#### Info.plist
```xml
<!-- ios/TimeTracker/Info.plist -->
<key>UIBackgroundModes</key>
<array>
    <string>background-processing</string>
</array>
```

#### Podfile
```ruby
# ios/Podfile
platform :ios, '11.0'
```

### Web-Specific

#### Platform Checks
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web-specific code
  console.log('Running on web');
} else {
  // Native-specific code
  console.log('Running on native');
}
```

## 🔍 Debugging

### 1. React Native Debugger
```bash
# Install React Native Debugger
npm install -g react-native-debugger

# Start debugger
react-native-debugger
```

### 2. Flipper Integration
```bash
# Install Flipper
# Download from https://fbflipper.com/

# Add Flipper plugins
npm install react-native-flipper
```

### 3. Console Logging
```typescript
// Use console.log for debugging
console.log('Timer state:', { isRunning, remainingSeconds });

// Use console.warn for warnings
console.warn('Low storage space');

// Use console.error for errors
console.error('Failed to save session:', error);
```

### 4. Performance Monitoring
```typescript
// Use Performance API
import { Performance } from 'react-native-performance';

const startTime = Performance.now();
// ... expensive operation
const endTime = Performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);
```

## 📦 Building for Production

### Android Release Build
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate AAB (recommended for Play Store)
./gradlew bundleRelease
```

### iOS Release Build
1. Open `ios/TimeTracker.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Distribute App

### Web Build
```bash
# Build for web (if using Expo web)
expo build:web
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
      - run: npm run lint
```

This development guide provides comprehensive information for developing, testing, debugging, and customizing the Study Timer application. Follow these guidelines to maintain code quality and ensure smooth development workflow.

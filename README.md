# Study Timer - React Native CLI

A mobile-first React Native app for managing study topics/courses and running focused timed sessions (Pomodoro-style). Study Timer provides session bubbles (full/partial), daily streak tracking, local persistence, analytics with CSV/PDF exports, and local notifications.

## 🚀 Features

- **Course Management**: Create and manage study topics/courses
- **Pomodoro Timer**: Focused timed study sessions with customizable duration
- **Session Tracking**: Visual bubble representation (full/partial sessions)
- **Streak Tracking**: Daily study streak monitoring
- **Local Persistence**: All data stored locally using AsyncStorage
- **Analytics & Exports**: CSV and PDF export capabilities
- **Local Notifications**: Optional study reminders and session completion alerts
- **Theme Support**: Light, dark, and system theme modes
- **Cross-Platform**: iOS, Android, and Web support

## 📱 Screenshots

*Screenshots will be added once the app is implemented*

## 🛠 Tech Stack

- **Framework**: React Native CLI (0.81.4)
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Storage**: AsyncStorage for local persistence
- **Notifications**: expo-notifications
- **Audio**: expo-av for alarm sounds
- **Exports**: expo-file-system, expo-sharing, expo-print
- **UI**: React Native Safe Area Context

## 📋 Prerequisites

- Node.js (>= 20)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd TimeTracker
npm install
```

### 2. Install Additional Dependencies

```bash
# Core dependencies
npm install @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# For notifications and audio (when implementing)
npm install expo-notifications expo-av expo-file-system expo-sharing expo-print
```

### 3. iOS Setup (macOS only)

```bash
cd ios && pod install && cd ..
```

### 4. Run the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 📁 Project Structure

```
TimeTracker/
├── App.tsx                 # App entry point with providers and navigation
├── screens/                # UI screens
│   ├── AuthScreen.tsx      # Authentication screen
│   ├── HomeScreen.tsx      # Main dashboard with courses
│   ├── CourseScreen.tsx    # Individual course view
│   ├── TimerScreen.tsx     # Pomodoro timer interface
│   ├── AnalyticsScreen.tsx # Study analytics and exports
│   └── SettingsScreen.tsx  # App settings and preferences
├── hooks/                  # Custom React hooks
│   ├── useStorage.tsx      # Local storage management
│   └── useTheme.tsx        # Theme management
├── lib/                    # Utilities and integrations
│   ├── notifications.tsx   # Notification system
│   ├── export.ts           # CSV/PDF export functionality
│   └── utils.ts            # General utilities
├── types/                  # TypeScript type definitions
│   └── index.ts            # Data models and interfaces
└── assets/                 # Static assets (images, audio)
```

## 🏗 Architecture Overview

### Data Flow
1. **Authentication**: Local demo auth → Main app navigation
2. **Course Creation**: HomeScreen → useStorage → AsyncStorage
3. **Timer Sessions**: TimerScreen → Session creation → Analytics
4. **Data Persistence**: All data stored locally with AsyncStorage
5. **Export System**: Analytics → CSV/PDF generation → Sharing

### Key Components

- **useStorage Hook**: Centralized data management for courses, sessions, and settings
- **Theme System**: Light/dark/system theme support with context provider
- **Notification System**: Local notifications with permission handling
- **Export System**: CSV and PDF generation with sharing capabilities

## 📊 Data Models

### Course
```typescript
interface Course {
  id: string;
  name: string;
  createdAt: string; // ISO date
}
```

### Session
```typescript
interface Session {
  id: string;
  courseId: string;
  startAt: string; // ISO date
  durationSeconds: number;
  targetSeconds: number;
  isPartial: boolean;
}
```

### App Settings
```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultDurationMinutes: number;
  notificationsEnabled: boolean;
  dailyReminderTime: string;
  quietHoursStart: string;
  quietHoursEnd: string;
}
```

## 🔧 Development

### Available Scripts

```bash
npm start          # Start Metro bundler
npm run android    # Run on Android
npm run ios        # Run on iOS
npm test           # Run tests
npm run lint       # Run ESLint
```

### Key Development Areas

1. **Timer Logic**: Core Pomodoro functionality in `TimerScreen.tsx`
2. **Data Persistence**: Storage management in `hooks/useStorage.tsx`
3. **Export System**: CSV/PDF generation in `lib/export.ts`
4. **Notifications**: Local notification system in `lib/notifications.tsx`

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to fetch" errors on web**:
   - Caused by network requests being blocked
   - Audio fallback to vibration implemented
   - Check browser extensions and network settings

2. **Export functionality not working**:
   - Ensure device supports expo-sharing
   - Test on physical device for best results
   - Check file system permissions

3. **Notifications not showing**:
   - Grant permissions when prompted
   - Test on real device (emulator limitations)
   - Check notification settings in device

### Platform-Specific Notes

- **Web**: Limited notification and sharing support
- **iOS/Android**: Full feature support with proper permissions
- **Background**: Timer doesn't run when app is killed (Expo limitation)

## 🚀 Deployment

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
1. Open `ios/TimeTracker.xcworkspace` in Xcode
2. Select your target device/simulator
3. Build and run

## 📈 Future Enhancements

1. **Firebase Authentication**: Replace local auth with cloud accounts
2. **Scheduled Notifications**: Daily reminder system with quiet hours
3. **Local Audio Assets**: Replace remote alarm with bundled audio
4. **Advanced Analytics**: Chart integration and visualizations
5. **Milestone Animations**: Streak celebration with Lottie animations
6. **Testing**: Unit tests for storage and timer logic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the development guide

---

**Note**: This is a React Native CLI project. Do not use Expo CLI commands as this project uses the standard React Native CLI workflow.
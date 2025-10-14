# Study Timer - Setup Guide

## 🚀 Quick Setup

This guide will help you set up the Study Timer React Native CLI project from scratch.

## 📋 Prerequisites

### Required Software
- **Node.js** (>= 20) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **React Native CLI** - Install with `npm install -g @react-native-community/cli`

### Platform-Specific Requirements

#### For Android Development
- **Android Studio** - [Download here](https://developer.android.com/studio)
- **Android SDK** (API level 21 or higher)
- **Java Development Kit (JDK)** (version 11 or higher)

#### For iOS Development (macOS only)
- **Xcode** (latest version) - [Download from App Store](https://apps.apple.com/us/app/xcode/id497799835)
- **CocoaPods** - Install with `sudo gem install cocoapods`

#### For Web Development
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🔧 Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd TimeTracker
```

### 2. Install Dependencies
```bash
# Install main dependencies
npm install

# Install React Navigation dependencies
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Install storage and utility dependencies
npm install @react-native-async-storage/async-storage

# Install optional dependencies (for full functionality)
npm install expo-notifications expo-av expo-file-system expo-sharing expo-print
```

### 3. Platform Setup

#### Android Setup
1. **Install Android Studio**
2. **Set up Android SDK**
   - Open Android Studio
   - Go to SDK Manager
   - Install Android SDK Platform 33 (or latest)
   - Install Android SDK Build-Tools
   - Install Android SDK Platform-Tools

3. **Set up Environment Variables**
   ```bash
   # Add to your ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

4. **Create Android Virtual Device (AVD)**
   - Open Android Studio
   - Go to AVD Manager
   - Create a new virtual device
   - Choose a device definition (e.g., Pixel 4)
   - Select a system image (API 33 or higher)

#### iOS Setup (macOS only)
1. **Install Xcode**
2. **Install Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

3. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

4. **Install iOS Dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

## 🚀 Running the App

### Start Metro Bundler
```bash
npm start
```

### Run on Android
```bash
# Make sure Android emulator is running or device is connected
npm run android
```

### Run on iOS (macOS only)
```bash
# Make sure iOS simulator is available or device is connected
npm run ios
```

### Run on Web
```bash
# Note: Some features may not work on web
npm run web
```

## 🔍 Verification

### Check if Everything is Working
1. **Metro bundler starts** without errors
2. **App builds** successfully on your target platform
3. **App launches** and shows the main screen
4. **No red error screens** appear

### Test Basic Functionality
1. Navigate through the app
2. Check if all screens load properly
3. Verify that basic interactions work
4. Test on both platforms (if available)

## 🐛 Common Setup Issues

### Metro Bundler Issues
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear npm cache
npm start -- --reset-cache
```

### Android Issues
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Check if Android SDK is properly configured
npx react-native doctor
```

### iOS Issues
```bash
# Clean iOS build
cd ios
rm -rf build
pod install
cd ..

# Check if Xcode is properly configured
npx react-native doctor
```

### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Should be >= 20. If not, update Node.js
# Use nvm to manage Node.js versions
nvm install 20
nvm use 20
```

### Permission Issues (macOS)
```bash
# Fix CocoaPods permission issues
sudo chown -R $(whoami) /usr/local/lib/node_modules
sudo chown -R $(whoami) /usr/local/bin
```

## 🔧 Development Environment

### Recommended VS Code Extensions
- **React Native Tools** - Microsoft
- **TypeScript Importer** - pmneo
- **ES7+ React/Redux/React-Native snippets** - dsznajder
- **Prettier** - Prettier
- **ESLint** - Microsoft

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  }
}
```

### Recommended Tools
- **React Native Debugger** - Standalone debugging tool
- **Flipper** - Mobile development platform
- **React DevTools** - React component inspector

## 📱 Device Setup

### Android Device
1. **Enable Developer Options**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect Device**
   ```bash
   # Check if device is connected
   adb devices
   
   # Should show your device
   ```

### iOS Device
1. **Enable Developer Mode**
   - Go to Settings → Privacy & Security → Developer Mode
   - Enable Developer Mode

2. **Trust Developer Certificate**
   - Connect device to Mac
   - Open Xcode
   - Go to Window → Devices and Simulators
   - Select your device and trust the developer certificate

## 🧪 Testing Setup

### Install Testing Dependencies
```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

### Configure Jest
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
};
```

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Production Build

### Android Production Build
```bash
# Generate release APK
cd android
./gradlew assembleRelease

# APK will be in android/app/build/outputs/apk/release/
```

### iOS Production Build
1. Open `ios/TimeTracker.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Follow the distribution wizard

## 📚 Next Steps

After successful setup:

1. **Read the Architecture Documentation** - `docs/ARCHITECTURE.md`
2. **Review the API Documentation** - `docs/API.md`
3. **Follow the Development Guide** - `docs/DEVELOPMENT.md`
4. **Start implementing features** based on the provided specifications

## 🆘 Getting Help

If you encounter issues:

1. **Check the troubleshooting section** in `docs/DEVELOPMENT.md`
2. **Search existing issues** in the repository
3. **Create a new issue** with detailed information:
   - Operating system
   - Node.js version
   - React Native version
   - Error messages
   - Steps to reproduce

## 📝 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation Documentation](https://reactnavigation.org/)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Note**: This is a React Native CLI project. Do not use Expo CLI commands as this project uses the standard React Native CLI workflow.

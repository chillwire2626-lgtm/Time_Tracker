import React, { useState } from 'react';
import { Text, View, Animated, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../hooks/useTheme';
import { useStorage } from '../hooks/useStorage';
import { RootStackParamList, MainTabParamList, HomeStackParamList } from '../types';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import CourseScreen from '../screens/CourseScreen';
import TimerScreen from '../screens/TimerScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SplashScreen from '../components/SplashScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

// Home Stack Navigator
const HomeStackNavigator = () => {
  const { colors } = useTheme();
  const appBarColor = '#0EA5E9';
  
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: appBarColor,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '800',
          color: '#FFFFFF',
        },
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ title: 'Study Timer' }}
      />
      <HomeStack.Screen 
        name="CourseScreen" 
        component={CourseScreen}
        options={{ 
          title: 'Course Details',
          headerStyle: { backgroundColor: appBarColor },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { color: '#FFFFFF', fontWeight: '800' }
        }}
      />
      <HomeStack.Screen 
        name="TimerScreen" 
        component={TimerScreen}
        options={{ 
          title: 'Study Session',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: appBarColor },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { color: '#FFFFFF', fontWeight: '800' }
        }}
      />
      {/* Settings moved to bottom tabs; route kept but hidden */}
    </HomeStack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator = () => {
  const { colors } = useTheme();
  const appBarColor = '#0EA5E9';
  
  return (
    <MainTabs.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: appBarColor,
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <MainTabs.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{ 
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="home" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <MainTabs.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="settings" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <MainTabs.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ 
          title: 'Analytics',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="chart" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
};

// Simple tab icon component (we'll use text for now)
const TabIcon: React.FC<{ name: string; color: string; size: number; focused?: boolean }> = ({ 
  name, 
  color, 
  size,
  focused
}) => {
  const getIconText = () => {
    switch (name) {
      case 'home': return '🏠';
      case 'chart': return '📊';
      case 'settings': return '⚙️';
      default: return '📱';
    }
  };

  return (
    <Text style={{ fontSize: focused ? size + 2 : size, color, transform: [{ translateY: focused ? -1 : 0 }] }}>
      {getIconText()}
    </Text>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { loading } = useStorage();
  const [showSplash, setShowSplash] = useState(true);
  
  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  
  // Show loading screen while data is being loaded
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '800',
          },
        },
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainTabNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

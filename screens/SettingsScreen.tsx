import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useTheme, useThemedStyles } from '../hooks/useTheme';
import { useStorage } from '../hooks/useStorage';
import { ThemeMode } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, HomeStackParamList } from '../types';

type SettingsScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'SettingsScreen'>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { colors, theme, setTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { settings, setAppSettings, user, clearUser } = useStorage();
  
  const [defaultDuration, setDefaultDuration] = useState(settings.defaultDurationMinutes);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setAppSettings({ theme: newTheme });
  };

  const handleDurationChange = (duration: number) => {
    setDefaultDuration(duration);
    setAppSettings({ defaultDurationMinutes: duration });
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    setAppSettings({ notificationsEnabled: enabled });
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearUser();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Data export functionality will be implemented in a future update.',
      [{ text: 'OK' }]
    );
  };

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }> = ({ title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (onPress && <Text style={styles.settingArrow}>›</Text>)}
    </TouchableOpacity>
  );

  const DurationButton: React.FC<{ minutes: number; isSelected: boolean }> = ({ 
    minutes, 
    isSelected 
  }) => (
    <TouchableOpacity
      style={[
        styles.durationButton,
        isSelected && styles.durationButtonSelected,
      ]}
      onPress={() => handleDurationChange(minutes)}
    >
      <Text
        style={[
          styles.durationButtonText,
          isSelected && styles.durationButtonTextSelected,
        ]}
      >
        {minutes}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'Study Timer User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <SettingItem
          title="Theme"
          subtitle={`Current: ${theme}`}
          onPress={() => {
            Alert.alert(
              'Select Theme',
              'Choose your preferred theme',
              [
                { text: 'Light', onPress: () => handleThemeChange('light') },
                { text: 'Dark', onPress: () => handleThemeChange('dark') },
                { text: 'System', onPress: () => handleThemeChange('system') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        />
      </View>

      {/* Timer Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timer Settings</Text>
        
        <View style={styles.durationSection}>
          <Text style={styles.durationLabel}>Default Duration (minutes)</Text>
          <View style={styles.durationButtons}>
            {[15, 20, 25, 30, 45, 60].map((minutes) => (
              <DurationButton
                key={minutes}
                minutes={minutes}
                isSelected={defaultDuration === minutes}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <SettingItem
          title="Enable Notifications"
          subtitle="Get notified when study sessions complete"
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notificationsEnabled ? colors.background : colors.textSecondary}
            />
          }
        />
      </View>

      {/* Data & Export */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Export</Text>
        
        <SettingItem
          title="Export Data"
          subtitle="Export your study data as CSV or PDF"
          onPress={handleExportData}
        />
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        
        <SettingItem
          title="Version"
          subtitle="1.0.0"
        />
        
        <SettingItem
          title="About"
          subtitle="Study Timer - Focus, Study, Achieve"
        />
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Study Timer - Built with React Native
        </Text>
        <Text style={styles.footerText}>
          Your data is stored locally on your device
        </Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  userSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingArrow: {
    fontSize: 20,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  durationSection: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  durationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  durationButtonTextSelected: {
    color: colors.background,
  },
  signOutButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default SettingsScreen;

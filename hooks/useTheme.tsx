import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ColorScheme, ThemeMode } from '../types';

// Color schemes
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
  error: '#FF3B30',
};

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
  error: '#FF453A',
};

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  colors: ColorScheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'system',
  onThemeChange,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);

  // Resolve the actual theme based on mode
  const resolvedTheme = themeMode === 'system' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : themeMode;

  const colors = resolvedTheme === 'dark' ? darkColors : lightColors;
  const isDark = resolvedTheme === 'dark';

  const setTheme = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
    onThemeChange?.(newTheme);
  };

  // Update theme when system color scheme changes (for 'system' mode)
  useEffect(() => {
    if (themeMode === 'system') {
      // Theme will automatically update due to resolvedTheme calculation
    }
  }, [systemColorScheme, themeMode]);

  const value: ThemeContextType = {
    theme: resolvedTheme,
    setTheme,
    colors,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for getting theme-aware styles
export const useThemedStyles = <T extends Record<string, any>>(
  createStyles: (colors: ColorScheme) => T
): T => {
  const { colors } = useTheme();
  return createStyles(colors);
};

// Utility function to create theme-aware styles
export const createThemedStyles = <T extends Record<string, any>>(
  createStyles: (colors: ColorScheme) => T
) => {
  return createStyles;
};

// Common style patterns
export const commonStyles = {
  container: (colors: ColorScheme) => ({
    flex: 1,
    backgroundColor: colors.background,
  }),
  card: (colors: ColorScheme) => ({
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
  button: (colors: ColorScheme) => ({
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }),
  buttonText: (colors: ColorScheme) => ({
    color: colors.background,
    fontSize: 16,
    fontWeight: '600' as const,
  }),
  input: (colors: ColorScheme) => ({
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  }),
  text: (colors: ColorScheme) => ({
    color: colors.text,
    fontSize: 16,
  }),
  textSecondary: (colors: ColorScheme) => ({
    color: colors.textSecondary,
    fontSize: 14,
  }),
  title: (colors: ColorScheme) => ({
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold' as const,
  }),
  subtitle: (colors: ColorScheme) => ({
    color: colors.text,
    fontSize: 18,
    fontWeight: '600' as const,
  }),
  errorText: (colors: ColorScheme) => ({
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  }),
  successText: (colors: ColorScheme) => ({
    color: colors.success,
    fontSize: 14,
    marginTop: 4,
  }),
  warningText: (colors: ColorScheme) => ({
    color: colors.warning,
    fontSize: 14,
    marginTop: 4,
  }),
};

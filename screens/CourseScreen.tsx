import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../hooks/useTheme';
import { useStorage } from '../hooks/useStorage';
import { formatDate, formatTime, secondsToMinutes } from '../lib/utils';
import { Course, Session } from '../types';

const CourseScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const navigation = useNavigation();
  const { courses, sessions, settings, removeCourse, reload } = useStorage();
  
  const { courseId } = route.params as { courseId: string };
  const [duration, setDuration] = useState(settings.defaultDurationMinutes);
  const [customDuration, setCustomDuration] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Real-time update state
  const [localSessions, setLocalSessions] = useState<Session[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const course = courses.find(c => c.id === courseId);
  const courseSessions = localSessions.filter(s => s.courseId === courseId);

  // Initialize local sessions with current sessions and real-time updates
  useEffect(() => {
    setLocalSessions(sessions);
  }, [sessions]);

  // Real-time update effect - check for new sessions every 2 seconds
  useEffect(() => {
    const startRealTimeUpdates = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(async () => {
        try {
          // Reload data from storage to get latest sessions
          await reload();
          setLastUpdateTime(Date.now());
        } catch (error) {
          console.error('Failed to reload sessions:', error);
        }
      }, 2000); // Check every 2 seconds to reduce frequency
    };

    startRealTimeUpdates();

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reload]);

  // Refresh sessions when screen comes into focus (e.g., returning from timer)
  useFocusEffect(
    React.useCallback(() => {
      // Force immediate reload when screen comes into focus
      reload().catch(console.error);
    }, [reload])
  );

  const totalStudyTime = useMemo(() => {
    return courseSessions.reduce((total, session) => total + session.durationSeconds, 0);
  }, [courseSessions]);

  const fullSessions = courseSessions.filter(s => !s.isPartial).length;
  const partialSessions = courseSessions.filter(s => s.isPartial).length;

  const handleStartTimer = () => {
    // If custom input is still open, validate it first
    if (showCustomInput) {
      if (customDuration) {
        const customMinutes = parseInt(customDuration);
        if (customMinutes > 0 && customMinutes <= 480) {
          // Set the duration and close custom input
          setDuration(customMinutes);
          setShowCustomInput(false);
          setCustomDuration('');
        } else {
          Alert.alert('Invalid Duration', 'Please enter a duration between 1 and 480 minutes.');
          return;
        }
      } else {
        Alert.alert('Invalid Duration', 'Please enter a duration or cancel.');
        return;
      }
    }
    
    navigation.navigate('TimerScreen', { 
      courseId, 
      durationMinutes: duration 
    });
  };

  const handleDeleteCourse = () => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete "${course?.name}"? This will also delete all associated sessions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCourse(courseId);
              // Navigate back to home screen to ensure proper cleanup
              navigation.navigate('HomeScreen');
            } catch (error) {
              console.error('Failed to delete course:', error);
              Alert.alert('Error', 'Failed to delete course. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderSessionBubble = useCallback((session: Session, index: number) => {
    const Animated = require('react-native').Animated;
    const scale = new Animated.Value(0.85);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, delay: index * 40 }).start();
    const progress = session.durationSeconds / session.targetSeconds;
    const isComplete = progress >= 1.0;
    const durationMinutes = Math.round(session.targetSeconds / 60);
    
    if (isComplete) {
      // Full green for complete sessions
      return (
        <Animated.View
          key={session.id}
          style={[
            styles.bubble,
            {
              backgroundColor: colors.success,
              opacity: 1.0,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
              transform: [{ scale }],
            },
          ]}
        >
          <Text style={styles.bubbleDurationText}>{durationMinutes}m</Text>
        </Animated.View>
      );
    } else {
      // Proportional coloring for partial sessions
      const greenPercentage = Math.min(progress, 1.0) * 100;
      const redPercentage = 100 - greenPercentage;
      
      return (
        <Animated.View
          key={session.id}
          style={[
            styles.bubble,
              {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3,
              transform: [{ scale }],
              },
          ]}
        >
          {/* Green half (completed portion) */}
          <View
            style={[
              styles.bubbleHalf,
              {
                backgroundColor: colors.success,
                width: `${greenPercentage}%`,
              },
            ]}
          />
          {/* Red half (remaining portion) */}
          <View
            style={[
              styles.bubbleHalf,
              {
                backgroundColor: colors.error,
                width: `${redPercentage}%`,
              },
            ]}
          />
          {/* Duration text overlay */}
          <View style={styles.bubbleTextOverlay}>
            <Text style={styles.bubbleDurationText}>{durationMinutes}m</Text>
          </View>
        </Animated.View>
      );
    }
  }, [colors]);

  if (!course) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Course not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Course Header */}
      <View style={styles.header}>
        <Text style={styles.courseName}>{course.name}</Text>
        <Text style={styles.courseDate}>Created {formatDate(course.createdAt)}</Text>
      </View>

      {/* Course Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{courseSessions.length}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{secondsToMinutes(totalStudyTime)}</Text>
          <Text style={styles.statLabel}>Minutes Studied</Text>
        </View>
      </View>

      {/* Real-time Update Indicator */}
      <View style={styles.updateIndicator}>
        <View style={[styles.updateDot, { backgroundColor: colors.success }]} />
        <Text style={styles.updateText}>Live updates active</Text>
      </View>

      {/* Session Bubbles */}
      {courseSessions.length > 0 && (
        <View style={styles.bubblesSection}>
          <Text style={styles.sectionTitle}>Sessions</Text>
          <View style={styles.bubblesContainer}>
            {courseSessions.map((session, index) => renderSessionBubble(session, index))}
          </View>
        </View>
      )}

      {/* Timer Section */}
      <View style={styles.timerSection}>
        <Text style={styles.sectionTitle}>Start Session</Text>
        
        <View style={styles.durationSelector}>
          <Text style={styles.durationLabel}>Duration (minutes):</Text>
          <View style={styles.durationButtons}>
            {[10, 20, 30, 40, 60].map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.durationButton,
                  duration === minutes && !showCustomInput && styles.durationButtonActive,
                ]}
                onPress={() => {
                  setDuration(minutes);
                  setShowCustomInput(false);
                }}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    duration === minutes && !showCustomInput && styles.durationButtonTextActive,
                  ]}
                >
                  {minutes}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.durationButton,
                showCustomInput && styles.durationButtonActive,
              ]}
              onPress={() => {
                if (showCustomInput) {
                  // If already showing custom input, close it
                  setShowCustomInput(false);
                  setCustomDuration('');
                } else {
                  // Show custom input
                  setShowCustomInput(true);
                }
              }}
            >
              <Text
                style={[
                  styles.durationButtonText,
                  showCustomInput && styles.durationButtonTextActive,
                ]}
              >
                {showCustomInput ? 'Cancel' : 'Custom'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showCustomInput && (
            <View style={styles.customDurationContainer}>
              <TextInput
                style={styles.customDurationInput}
                value={customDuration}
                onChangeText={setCustomDuration}
                placeholder="Enter minutes (1-480)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={3}
                autoFocus={true}
                selectTextOnFocus={true}
              />
              <View style={styles.customDurationButtons}>
                <TouchableOpacity
                  style={[styles.customButton, styles.customButtonSecondary]}
                  onPress={() => {
                    setShowCustomInput(false);
                    setCustomDuration('');
                  }}
                >
                  <Text style={styles.customButtonTextSecondary}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.customButton, styles.customButtonPrimary]}
                  onPress={() => {
                    if (customDuration && parseInt(customDuration) > 0 && parseInt(customDuration) <= 480) {
                      setDuration(parseInt(customDuration));
                      setShowCustomInput(false);
                    } else {
                      Alert.alert('Invalid Duration', 'Please enter a duration between 1 and 480 minutes.');
                    }
                  }}
                >
                  <Text style={styles.customButtonTextPrimary}>Set</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStartTimer}>
          <Text style={styles.startButtonText}>Start Timer</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Sessions */}
      {courseSessions.length > 0 && (
        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {courseSessions.slice(0, 5).map((session) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionDate}>
                  {formatDate(session.startAt)} at {formatTime(session.startAt)}
                </Text>
                <Text style={styles.sessionDuration}>
                  {secondsToMinutes(session.durationSeconds)} / {secondsToMinutes(session.targetSeconds)} minutes
                </Text>
              </View>
              <View style={[
                styles.sessionStatus,
                { backgroundColor: session.isPartial ? colors.warning : colors.success }
              ]}>
                <Text style={styles.sessionStatusText}>
                  {session.isPartial ? 'Partial' : 'Complete'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Delete Course Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteCourse}>
        <Text style={styles.deleteButtonText}>Delete Course</Text>
      </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
  },
  header: {
    marginBottom: 24,
  },
  courseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  courseDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  timerSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  durationSelector: {
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  durationButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  durationButtonTextActive: {
    color: colors.background,
  },
  customDurationContainer: {
    marginTop: 12,
  },
  customDurationInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  customDurationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  customButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  customButtonPrimary: {
    backgroundColor: colors.primary,
  },
  customButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customButtonTextPrimary: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  customButtonTextSecondary: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '600',
  },
  bubblesSection: {
    marginBottom: 24,
  },
  bubblesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  bubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bubbleHalf: {
    height: '100%',
    borderRadius: 0,
  },
  bubbleTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  bubbleDurationText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.background,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sessionsSection: {
    marginBottom: 24,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sessionStatusText: {
    fontSize: 12,
    color: colors.background,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  updateText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default CourseScreen;

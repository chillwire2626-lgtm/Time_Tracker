import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AppState,
  AppStateStatus,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, G, Path, Circle } from 'react-native-svg';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../hooks/useTheme';
import { useStorage } from '../hooks/useStorage';
import { secondsToHms, minutesToSeconds, isoNow, safeVibrate } from '../lib/utils';
import { TimerState } from '../types';

// Convert polar angle to cartesian; angle 0° at 12 o’clock, clockwise
function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// Build an SVG arc path from angle 0→sweep (<= 360)
function arcPath(cx: number, cy: number, r: number, sweep: number) {
  if (sweep <= 0.01) {
    const p = polarToCartesian(cx, cy, r, 0.01);
    return `M ${p.x} ${p.y}`;
  }
  if (sweep >= 359.99) {
    const p0 = polarToCartesian(cx, cy, r, 0);
    const p180 = polarToCartesian(cx, cy, r, 180);
    return [
      `M ${p0.x} ${p0.y}`,
      `A ${r} ${r} 0 1 1 ${p180.x} ${p180.y}`,
      `A ${r} ${r} 0 1 1 ${p0.x} ${p0.y}`,
    ].join(' ');
  }
  const start = polarToCartesian(cx, cy, r, 0);
  const end = polarToCartesian(cx, cy, r, sweep);
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const TimerScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const navigation = useNavigation();
  const { courses, addSession, reload } = useStorage();
  
  const { courseId, durationMinutes } = route.params as { 
    courseId: string; 
    durationMinutes: number; 
  };
  
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: true, // Start automatically
    remainingSeconds: minutesToSeconds(durationMinutes),
    elapsedSeconds: 0,
    targetSeconds: minutesToSeconds(durationMinutes),
    startTime: Date.now(), // Start immediately
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // State for completion flow
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);

  const course = courses.find(c => c.id === courseId);

  // Animated progress (for SVG ring)
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Timer logic
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          const now = Date.now();
          const elapsed = prev.startTime ? Math.floor((now - prev.startTime) / 1000) : 0;
          const remaining = Math.max(0, prev.targetSeconds - elapsed);
          
          if (remaining <= 0) {
            // Timer completed
            handleTimerComplete();
            return {
              ...prev,
              isRunning: false,
              remainingSeconds: 0,
              elapsedSeconds: prev.targetSeconds,
            };
          }
          
          return {
            ...prev,
            remainingSeconds: remaining,
            elapsedSeconds: elapsed,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground, reconcile timer
        if (timerState.isRunning && timerState.startTime) {
          const now = Date.now();
          const elapsed = Math.floor((now - timerState.startTime) / 1000);
          const remaining = Math.max(0, timerState.targetSeconds - elapsed);
          
          setTimerState(prev => ({
            ...prev,
            remainingSeconds: remaining,
            elapsedSeconds: elapsed,
          }));
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [timerState.isRunning, timerState.startTime, timerState.targetSeconds]);

  const handleResume = () => {
    const now = Date.now();
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      startTime: now - (prev.targetSeconds - prev.remainingSeconds) * 1000, // Adjust start time to account for elapsed time
    }));
  };

  const handlePause = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
    }));
  };

  const handleReset = () => {
    setTimerState({
      isRunning: false,
      remainingSeconds: minutesToSeconds(durationMinutes),
      elapsedSeconds: 0,
      targetSeconds: minutesToSeconds(durationMinutes),
      startTime: null,
    });
  };

  const handleTimerComplete = async () => {
    try {
      // Create full session
      await addSession({
        courseId,
        startAt: isoNow(),
        durationSeconds: timerState.targetSeconds,
        targetSeconds: timerState.targetSeconds,
        isPartial: false,
      });

      // Play alarm (vibration for now)
      safeVibrate([0, 500, 200, 500]);

      // Show completion modal
      setShowCompletionModal(true);

      // Ensure home/course screens reflect the new session immediately
      try { await reload(); } catch {}
    } catch (error) {
      console.error('Failed to save session:', error);
      Alert.alert('Error', 'Failed to save session. Please try again.');
    }
  };

  const handleTerminate = async () => {
    if (timerState.elapsedSeconds === 0) {
      // No session created if timer was terminated immediately
      navigation.goBack();
      return;
    }

    try {
      // Create partial session
      await addSession({
        courseId,
        startAt: isoNow(),
        durationSeconds: timerState.elapsedSeconds,
        targetSeconds: timerState.targetSeconds,
        isPartial: true,
      });

      // Play alarm
      safeVibrate([0, 300, 100, 300]);

      // Navigate back immediately without popup
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save session:', error);
      Alert.alert('Error', 'Failed to save session. Please try again.');
    }
  };

  // New cycle handlers
  const handleStartNewCycle = () => {
    setShowCompletionModal(false);
    setShowNewCycleModal(true);
  };

  const handleExit = () => {
    setShowCompletionModal(false);
    navigation.goBack();
  };

  const handleSameTime = () => {
    setShowNewCycleModal(false);
    // Reset timer with same duration
    setTimerState({
      isRunning: true,
      remainingSeconds: minutesToSeconds(durationMinutes),
      elapsedSeconds: 0,
      targetSeconds: minutesToSeconds(durationMinutes),
      startTime: Date.now(),
    });
  };

  const handleCustomTime = () => {
    setShowNewCycleModal(false);
    setShowCustomTimeInput(true);
  };

  const handleCustomTimeSubmit = () => {
    const customMinutes = parseInt(customTimeInput);
    if (customMinutes > 0 && customMinutes <= 480) { // Max 8 hours
      setShowCustomTimeInput(false);
      setCustomTimeInput('');
      // Reset timer with custom duration
      setTimerState({
        isRunning: true,
        remainingSeconds: minutesToSeconds(customMinutes),
        elapsedSeconds: 0,
        targetSeconds: minutesToSeconds(customMinutes),
        startTime: Date.now(),
      });
    } else {
      Alert.alert('Invalid Duration', 'Please enter a duration between 1 and 480 minutes.');
    }
  };

  const progress = timerState.elapsedSeconds / timerState.targetSeconds;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

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
    <View style={styles.container}>
      {/* Minimal Header */}
      <View style={styles.header}>
        <Text style={styles.courseName}>{course.name}</Text>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <View style={styles.svgWrapper}>
          {(() => {
            const strokeWidth = 20;
            const size = 300;
            const radius = (size - strokeWidth) / 2;
            const cx = size / 2;
            const cy = size / 2;
            const sweep = 360 * progress;
            const path = arcPath(cx, cy, radius, sweep);

            return (
              <>
                <Svg width={size} height={size}>
                  <Defs>
                    <LinearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor="#3D5AFE" />
                      <Stop offset="0.5" stopColor="#7C4DFF" />
                      <Stop offset="1" stopColor="#FF4FD8" />
                    </LinearGradient>
                  </Defs>

                  {/* background track */}
                  <Circle cx={cx} cy={cy} r={radius} stroke="#E9ECF2" strokeWidth={strokeWidth} fill="none" />
                  {/* progress arc */}
                  <G>
                    <Path d={path} stroke="url(#timerGrad)" strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
                  </G>
                </Svg>

                <View style={styles.timerCenterOverlay}>
                  <Text style={styles.timerText}>{secondsToHms(timerState.remainingSeconds)}</Text>
                  <Text style={styles.timerLabel}>Time Remaining</Text>
                </View>
              </>
            );
          })()}
        </View>
      </View>

      {/* Timer Controls - three equal tiles in one row */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.tileButton, styles.tileBlue]}
          onPress={timerState.isRunning ? handlePause : handleResume}
          activeOpacity={0.9}
        >
          <Text style={styles.tileText}>{timerState.isRunning ? 'Pause' : 'Resume'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tileButton, styles.tileGreen]}
          onPress={handleReset}
          activeOpacity={0.9}
        >
          <Text style={styles.tileText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tileButton, styles.tileRed]}
          onPress={handleTerminate}
          activeOpacity={0.9}
        >
          <Text style={styles.tileText}>Terminate</Text>
        </TouchableOpacity>
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionInfoText}>Elapsed: {secondsToHms(timerState.elapsedSeconds)}</Text>
      </View>

      {/* Session Complete Modal */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Session Complete!</Text>
            <Text style={styles.modalMessage}>
              Great job! Your study session is complete.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleStartNewCycle}
              >
                <Text style={styles.primaryButtonText}>Start New Cycle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={handleExit}
              >
                <Text style={styles.secondaryButtonText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Cycle Options Modal */}
      <Modal
        visible={showNewCycleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewCycleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start New Cycle</Text>
            <Text style={styles.modalMessage}>
              Choose your next study session duration:
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleSameTime}
              >
                <Text style={styles.primaryButtonText}>Same Time ({durationMinutes} min)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={handleCustomTime}
              >
                <Text style={styles.secondaryButtonText}>Custom Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Time Input Modal */}
      <Modal
        visible={showCustomTimeInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomTimeInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom Duration</Text>
            <Text style={styles.modalMessage}>
              Enter the duration for your next study session:
            </Text>
            
            <TextInput
              style={styles.timeInput}
              value={customTimeInput}
              onChangeText={setCustomTimeInput}
              placeholder="Enter minutes (1-480)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={3}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleCustomTimeSubmit}
              >
                <Text style={styles.primaryButtonText}>Start Session</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => {
                  setShowCustomTimeInput(false);
                  setCustomTimeInput('');
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
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
    alignItems: 'center',
    marginBottom: 28,
  },
  headerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  durationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerCenterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackTimerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerRingOuter: {
    width: 300,
    height: 300,
    borderRadius: 150,
    position: 'absolute',
    backgroundColor: colors.surface,
    borderWidth: 20,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  timerRingFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 150,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timerCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    opacity: 0.8,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  tileButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tileText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  tileBlue: { backgroundColor: '#3B82F6' },
  tileGreen: { backgroundColor: '#10B981' },
  tileRed: { backgroundColor: '#EF4444' },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  sessionInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.border,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    width: '100%',
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default TimerScreen;

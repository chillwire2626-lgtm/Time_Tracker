import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../hooks/useTheme';
import { useStorage } from '../hooks/useStorage';
import { calculateStreak, getMotivationalMessage, formatDate } from '../lib/utils';
import { Course } from '../types';

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { courses, sessions, addCourse, updateCourse, removeCourse, loading } = useStorage();
  
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [addingCourse, setAddingCourse] = useState(false);
  const [renameCourseId, setRenameCourseId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameColor, setRenameColor] = useState<string>('#6C63FF');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const streak = calculateStreak(sessions);
  const motivationalMessage = getMotivationalMessage();

  // Memoize total minutes to ensure they update when sessions change
  const totalMinutes = useMemo(() => {
    const minutes: { [courseId: string]: number } = {};
    courses.forEach(course => {
      const courseSessions = sessions.filter(s => s.courseId === course.id);
      const totalMinutesForCourse = courseSessions.reduce((sum, session) => {
        return sum + (session.durationMinutes || 0);
      }, 0);
      minutes[course.id] = totalMinutesForCourse;
    });
    return minutes;
  }, [courses, sessions, refreshTrigger]);

  // Header fade-in
  const headerOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerOpacity]);

  // Refresh data when screen comes into focus (e.g., after session completion)
  useFocusEffect(
    React.useCallback(() => {
      // Force a re-render to update session counts instantly
      setRefreshTrigger(prev => prev + 1);
    }, [])
  );

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) {
      Alert.alert('Error', 'Please enter a course name');
      return;
    }

    setAddingCourse(true);
    try {
      await addCourse(newCourseName.trim());
      setNewCourseName('');
      setShowAddCourseModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add course. Please try again.');
    } finally {
      setAddingCourse(false);
    }
  };

  const handleCoursePress = (course: Course) => {
    navigation.navigate('CourseScreen', { courseId: course.id });
  };

  const renderCourseItem = ({ item, index }: { item: Course; index: number }) => {
    const Animated = require('react-native').Animated;
    const scale = new Animated.Value(1);
    const onPressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

    // Use memoized total minutes for instant updates
    const totalMinutesForCourse = totalMinutes[item.id] || 0;
    const palette = ['#FF6B6B', '#4ECDC4', '#FFD166', '#6C63FF', '#FF8C42'];
    const accentColor = palette[index % palette.length];

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[styles.courseCard, { borderLeftColor: item.color || accentColor, borderLeftWidth: 4 }]}
          onPress={() => handleCoursePress(item)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.9}
        >
          <View style={styles.courseHeader}>
            <Text style={styles.courseName}>{item.name}</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                accessibilityLabel="Rename task"
                onPress={() => {
                setRenameCourseId(item.id);
                setRenameValue(item.name);
                setRenameColor(item.color || accentColor);
                }}
              >
                <Text style={styles.pencilIcon}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Delete task"
                onPress={() => {
                  Alert.alert('Delete Task', 'Are you sure you want to delete this task and its sessions?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: async () => { try { await removeCourse(item.id); } catch (e) { Alert.alert('Error', 'Failed to delete task.'); } } },
                  ]);
                }}
              >
                <Text style={styles.trashIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.courseDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.courseStatsRow}>
            <Text style={styles.courseStatsText}>{totalMinutesForCourse} min</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No courses yet</Text>
      <Text style={styles.emptyStateText}>
        Create your first course to start tracking your study sessions!
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => setShowAddCourseModal(true)}
      >
        <Text style={styles.emptyStateButtonText}>Create Course</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        {/* Motivational card only */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText} numberOfLines={2}>{motivationalMessage}</Text>
        </View>
      </Animated.View>

      {/* Courses section */}
      <View style={styles.coursesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Tasks</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddCourseModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Task</Text>
          </TouchableOpacity>
        </View>

        {courses.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={courses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.coursesList}
          />
        )}
      </View>

      {/* Add Course Modal */}
      <Modal
        visible={showAddCourseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddCourseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newCourseName}
              onChangeText={setNewCourseName}
              placeholder="Enter task name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddCourseModal(false);
                  setNewCourseName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, addingCourse && styles.buttonDisabled]}
                onPress={handleAddCourse}
                disabled={addingCourse}
              >
                <Text style={styles.confirmButtonText}>
                  {addingCourse ? 'Adding...' : 'Add Task'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename Task Modal */}
      <Modal
        visible={!!renameCourseId}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameCourseId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Task</Text>

            <TextInput
              style={styles.modalInput}
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Enter new name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />

            {/* Color tag selector */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12, gap: 8 }}>
              {['#FF6B6B','#4ECDC4','#FFD166','#6C63FF','#FF8C42','#00B894'].map(color => (
                <TouchableOpacity key={color} onPress={() => setRenameColor(color)}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color, marginHorizontal: 4, borderWidth: renameColor===color?2:1, borderColor: renameColor===color?colors.text:colors.border }} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setRenameCourseId(null);
                  setRenameValue('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={async () => {
                  const name = renameValue.trim();
                  if (!name || !renameCourseId) return;
                  try {
                    await updateCourse(renameCourseId, { name, color: renameColor });
                    setRenameCourseId(null);
                    setRenameValue('');
                    setRenameColor('#6C63FF');
                  } catch (e) {
                    Alert.alert('Error', 'Failed to rename task.');
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#E8F8EF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  settingsButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsButtonText: {
    fontSize: 18,
  },
  motivationCard: {
    backgroundColor: '#E8F8EF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BDEAD6',
    padding: 14,
  },
  motivationText: {
    fontSize: 14,
    color: '#155E3D',
    fontWeight: '600',
  },
  coursesSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  coursesList: {
    paddingBottom: 20,
  },
  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pencilIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  trashIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  courseDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseStatsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // removed progress track/fill
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;


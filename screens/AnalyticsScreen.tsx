import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../hooks/useTheme';
import { useStorage } from '../hooks/useStorage';
import { calculateStreak, secondsToMinutes, formatDate } from '../lib/utils';

const AnalyticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { courses, sessions } = useStorage();

  const analytics = useMemo(() => {
    const totalStudyTime = sessions.reduce((sum, session) => sum + session.durationSeconds, 0);
    const totalSessions = sessions.length;
    const fullSessions = sessions.filter(s => !s.isPartial).length;
    const partialSessions = sessions.filter(s => s.isPartial).length;
    const streak = calculateStreak(sessions);

    // Most studied course
    const courseStats = courses.map(course => {
      const courseSessions = sessions.filter(s => s.courseId === course.id);
      const courseTime = courseSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      return {
        course,
        time: courseTime,
        sessionCount: courseSessions.length,
      };
    });

    const mostStudiedCourse = courseStats.reduce((max, current) => 
      current.time > max.time ? current : max, 
      { course: null, time: 0, sessionCount: 0 }
    );

    // Average session duration
    const averageSessionDuration = totalSessions > 0 ? totalStudyTime / totalSessions : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSessions = sessions.filter(s => 
      new Date(s.startAt) >= sevenDaysAgo
    );

    return {
      totalStudyTime,
      totalSessions,
      fullSessions,
      partialSessions,
      streak,
      mostStudiedCourse,
      averageSessionDuration,
      recentSessions,
    };
  }, [courses, sessions]);

  const handleExportCSV = () => {
    Alert.alert(
      'Export CSV',
      'CSV export functionality will be implemented in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleExportPDF = () => {
    Alert.alert(
      'Export PDF',
      'PDF export functionality will be implemented in a future update.',
      [{ text: 'OK' }]
    );
  };

  const StatCard: React.FC<{ title: string; value: string; subtitle?: string }> = ({ 
    title, 
    value, 
    subtitle 
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Study Analytics</Text>
          <Text style={styles.subtitle}>Track your learning progress</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('SettingsScreen')}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Streak Card removed intentionally */}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Study Time"
          value={`${secondsToMinutes(analytics.totalStudyTime)} min`}
          subtitle={`${Math.round(analytics.totalStudyTime / 3600 * 10) / 10} hours`}
        />
        <StatCard
          title="Total Sessions"
          value={analytics.totalSessions.toString()}
          subtitle={`${analytics.fullSessions} complete, ${analytics.partialSessions} partial`}
        />
        <StatCard
          title="Average Session"
          value={`${secondsToMinutes(analytics.averageSessionDuration)} min`}
          subtitle="Per session"
        />
        <StatCard
          title="Recent Activity"
          value={analytics.recentSessions.length.toString()}
          subtitle="Sessions in last 7 days"
        />
      </View>

      {/* Most Studied Course */}
      {analytics.mostStudiedCourse.course && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Studied Course</Text>
          <View style={styles.courseCard}>
            <Text style={styles.courseName}>
              {analytics.mostStudiedCourse.course.name}
            </Text>
            <Text style={styles.courseStats}>
              {secondsToMinutes(analytics.mostStudiedCourse.time)} minutes • {' '}
              {analytics.mostStudiedCourse.sessionCount} sessions
            </Text>
          </View>
        </View>
      )}

      {/* Course Breakdown */}
      {courses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Breakdown</Text>
          {courses.map(course => {
            const courseSessions = sessions.filter(s => s.courseId === course.id);
            const courseTime = courseSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
            const percentage = analytics.totalStudyTime > 0 
              ? (courseTime / analytics.totalStudyTime) * 100 
              : 0;

            return (
              <View key={course.id} style={styles.courseBreakdownItem}>
                <View style={styles.courseBreakdownHeader}>
                  <Text style={styles.courseBreakdownName}>{course.name}</Text>
                  <Text style={styles.courseBreakdownTime}>
                    {secondsToMinutes(courseTime)} min
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${percentage}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.courseBreakdownSessions}>
                  {courseSessions.length} sessions • {percentage.toFixed(1)}% of total time
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Export Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        <View style={styles.exportButtons}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportCSV}>
            <Text style={styles.exportButtonText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Sessions */}
      {analytics.recentSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {analytics.recentSessions.slice(0, 5).map(session => {
            const course = courses.find(c => c.id === session.courseId);
            return (
              <View key={session.id} style={styles.recentSessionItem}>
                <View style={styles.recentSessionInfo}>
                  <Text style={styles.recentSessionCourse}>
                    {course?.name || 'Unknown Course'}
                  </Text>
                  <Text style={styles.recentSessionDate}>
                    {formatDate(session.startAt)}
                  </Text>
                </View>
                <View style={styles.recentSessionStats}>
                  <Text style={styles.recentSessionDuration}>
                    {secondsToMinutes(session.durationSeconds)} min
                  </Text>
                  <View style={[
                    styles.recentSessionStatus,
                    { backgroundColor: session.isPartial ? colors.warning : colors.success }
                  ]}>
                    <Text style={styles.recentSessionStatusText}>
                      {session.isPartial ? 'Partial' : 'Complete'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Data Yet</Text>
          <Text style={styles.emptyStateText}>
            Start studying to see your analytics here!
          </Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsButtonText: {
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  // streak styles removed
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  courseStats: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  courseBreakdownItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  courseBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseBreakdownName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  courseBreakdownTime: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  courseBreakdownSessions: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  recentSessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recentSessionInfo: {
    flex: 1,
  },
  recentSessionCourse: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  recentSessionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recentSessionStats: {
    alignItems: 'flex-end',
  },
  recentSessionDuration: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentSessionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recentSessionStatusText: {
    fontSize: 10,
    color: colors.background,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;

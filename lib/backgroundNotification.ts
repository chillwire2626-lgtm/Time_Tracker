import { Platform, Alert } from 'react-native';

class BackgroundNotificationManager {
  private isInitialized = false;

  constructor() {
    this.initializeNotifications();
  }

  private initializeNotifications(): void {
    if (this.isInitialized) {
      return;
    }

    // Simple initialization without external libraries
    console.log('Background notification manager initialized');
    this.isInitialized = true;
  }

  public scheduleTimerCompletionNotification(courseName: string, durationMinutes: number): void {
    try {
      // Just log the completion without showing popup
      console.log(`Timer Complete: ${courseName} session (${durationMinutes} min) is finished!`);
      
      // Note: Removed Alert.alert() to eliminate popup notification
      // The sound/vibration alerts are handled separately in TimerScreen
    } catch (error) {
      console.log('Failed to schedule notification:', error);
    }
  }

  public cancelAllNotifications(): void {
    console.log('Cancelled all notifications (using simple implementation)');
  }

  public cancelNotification(notificationId: number): void {
    console.log(`Cancelled notification ${notificationId} (using simple implementation)`);
  }
}

// Export singleton instance
export const backgroundNotificationManager = new BackgroundNotificationManager();

import { Platform } from 'react-native';

// Simple sound alert manager that uses system sounds and vibration
class SoundAlertManager {
  private alertInterval: NodeJS.Timeout | null = null;
  private isAlerting = false;
  private alertStartTime: number = 0;
  private readonly ALERT_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
  private readonly ALERT_INTERVAL = 2000; // Play sound every 2 seconds

  constructor() {
    // Initialize without external dependencies
  }

  public startContinuousAlert(): void {
    if (this.isAlerting) {
      return; // Already alerting
    }

    this.isAlerting = true;
    this.alertStartTime = Date.now();

    // Start playing alert immediately
    this.playAlertSound();

    // Set up interval to play sound every 2 seconds
    this.alertInterval = setInterval(() => {
      const elapsed = Date.now() - this.alertStartTime;
      
      if (elapsed >= this.ALERT_DURATION) {
        // Stop after 2 minutes
        this.stopContinuousAlert();
        return;
      }

      this.playAlertSound();
    }, this.ALERT_INTERVAL);
  }

  public stopContinuousAlert(): void {
    if (!this.isAlerting) {
      return;
    }

    this.isAlerting = false;
    
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
  }

  private playAlertSound(): void {
    // Use system vibration as sound alternative
    // This will work even without external sound libraries
    try {
      // Import Vibration dynamically to avoid issues
      const { Vibration } = require('react-native');
      Vibration.vibrate([0, 500, 200, 500]);
    } catch (error) {
      console.log('Vibration not available:', error);
    }
  }

  public isCurrentlyAlerting(): boolean {
    return this.isAlerting;
  }

  public getRemainingAlertTime(): number {
    if (!this.isAlerting) {
      return 0;
    }
    
    const elapsed = Date.now() - this.alertStartTime;
    return Math.max(0, this.ALERT_DURATION - elapsed);
  }

  public cleanup(): void {
    this.stopContinuousAlert();
  }
}

// Export singleton instance
export const soundAlertManager = new SoundAlertManager();

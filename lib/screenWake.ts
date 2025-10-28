import { Platform } from 'react-native';

class ScreenWakeManager {
  private isWaking = false;

  public wakeScreen(): void {
    if (this.isWaking) {
      return; // Already waking
    }

    this.isWaking = true;
    
    try {
      // Try to import KeepAwake dynamically to avoid import issues
      const KeepAwake = require('react-native-keep-awake');
      KeepAwake.activate();
      console.log('Screen wake activated');
    } catch (error) {
      console.log('KeepAwake not available, using alternative method:', error);
      // Fallback: try to keep screen awake using other methods
      this.keepScreenAwakeFallback();
    }
  }

  private keepScreenAwakeFallback(): void {
    // Simple fallback that doesn't require external libraries
    console.log('Using fallback screen wake method');
    // This is a placeholder - in a real implementation you might use
    // other React Native APIs or native modules
  }

  public releaseWake(): void {
    if (!this.isWaking) {
      return;
    }

    this.isWaking = false;
    
    try {
      const KeepAwake = require('react-native-keep-awake');
      KeepAwake.deactivate();
      console.log('Screen wake released');
    } catch (error) {
      console.log('KeepAwake not available for release:', error);
    }
  }

  public isScreenWaking(): boolean {
    return this.isWaking;
  }
}

// Export singleton instance
export const screenWakeManager = new ScreenWakeManager();

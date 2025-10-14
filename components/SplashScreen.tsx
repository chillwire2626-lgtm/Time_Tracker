import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { colors } = useTheme();

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient Background */}
      <View style={styles.gradientBackground}>
        {/* STUDYSYNC Logo */}
        <View style={styles.logoContainer}>
          {/* Book and Clock Icon */}
          <View style={styles.iconContainer}>
            {/* Open Book */}
            <View style={styles.book}>
              <View style={[styles.bookCover, { backgroundColor: '#2E7D8A' }]} />
              <View style={[styles.bookPages, { backgroundColor: '#FF8C42' }]} />
              <View style={[styles.bookSpine, { backgroundColor: '#1A5A63' }]} />
            </View>
            
            {/* Alarm Clock */}
            <View style={styles.clock}>
              <View style={[styles.clockBody, { backgroundColor: '#2E7D8A' }]} />
              <View style={[styles.clockFace, { backgroundColor: '#FFFFFF' }]}>
                {/* Clock hands */}
                <View style={[styles.clockHand, styles.hourHand, { backgroundColor: '#2E7D8A' }]} />
                <View style={[styles.clockHand, styles.minuteHand, { backgroundColor: '#2E7D8A' }]} />
                <View style={[styles.clockCenter, { backgroundColor: '#FF8C42' }]} />
              </View>
              <View style={[styles.clockBell, { backgroundColor: '#2E7D8A' }]} />
            </View>
          </View>
          
          {/* STUDYSYNC Text */}
          <Text style={[styles.logoText, { color: colors.text }]}>STUDYSYNC</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // Gradient effect using multiple views
    backgroundColor: '#FF8C42', // Orange-brown start
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    // Add shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Book styles
  book: {
    width: 60,
    height: 40,
    position: 'relative',
  },
  bookCover: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 30,
    height: 40,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  bookPages: {
    position: 'absolute',
    left: 25,
    top: 0,
    width: 35,
    height: 40,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  bookSpine: {
    position: 'absolute',
    left: 28,
    top: 0,
    width: 4,
    height: 40,
  },
  // Clock styles
  clock: {
    width: 50,
    height: 50,
    position: 'relative',
    marginLeft: -15, // Overlap with book
  },
  clockBody: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
  },
  clockFace: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    top: 5,
    left: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockHand: {
    position: 'absolute',
    borderRadius: 1,
  },
  hourHand: {
    width: 2,
    height: 12,
    top: 8,
    left: 19,
    transform: [{ rotate: '30deg' }],
  },
  minuteHand: {
    width: 2,
    height: 16,
    top: 4,
    left: 19,
    transform: [{ rotate: '60deg' }],
  },
  clockCenter: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    top: 18,
    left: 18,
  },
  clockBell: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: -4,
    left: 21,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    // Add shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

const styles = createStyles({});

export default SplashScreen;

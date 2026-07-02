import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useTheme } from '@/hooks/use-theme';

export default function SplashScreen() {
  const theme = useTheme();
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);
  const taglineAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    // Animate logo in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Then animate tagline
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });

    // Navigate after 2.5 seconds
    const timer = setTimeout(() => {
      const state = useAuthStore.getState();
      if (!state.isLoggedIn) {
        router.replace('/(auth)/login');
      } else if (state.role === 'vendor') {
        router.replace('/(vendor)/(tabs)');
      } else if (state.role === 'admin') {
        router.replace('/(admin)/(tabs)');
      } else {
        router.replace('/(user)/(tabs)');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, taglineAnim]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        style={[
          styles.tagline,
          { 
            opacity: taglineAnim, 
            color: theme.textSecondary,
            transform: [{ translateY: taglineAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] 
          },
        ]}
      >
        Homemade goodness, delivered
      </Animated.Text>

      <Animated.Text style={[styles.version, { opacity: taglineAnim, color: theme.border }]}>
        v1.0.0
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: '#60646C',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  version: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    color: '#B0B4BA',
  },
});

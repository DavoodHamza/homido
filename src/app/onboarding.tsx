import React from 'react';
import { View, StyleSheet, Text, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#E5E9DC', '#F8F3E9', '#D6DAC9']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top + 20 }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            KAZA <Text style={styles.logoSubtext}>Swap</Text>
          </Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>beta</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </Pressable>
          <Pressable style={[styles.iconButton, styles.userButton]}>
            <Ionicons name="person-outline" size={20} color="#000" />
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Connect and{'\n'}easily send a swap{'\n'}request when{'\n'}ready.
        </Text>
        <Text style={styles.subtitle}>
          Engage in direct messaging to discuss the details{'\n'}with your potential exchanger partner.
        </Text>

        <Pressable 
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.primaryButtonText}>Register your place</Text>
        </Pressable>
      </View>

      {/* Floating Cards Area */}
      <View style={styles.cardsContainer}>
        {/* Decorative Person Background Image (Placeholder) */}
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' }}
          style={styles.personImage}
          contentFit="cover"
        />

        {/* Left Floating Card */}
        <BlurView 
          intensity={80} 
          tint="light"
          style={[styles.floatingCard, styles.leftCard]}
        >
          {/* Yellow Overlay for Glassmorphism */}
          <View style={styles.cardYellowOverlay} />
          
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80' }}
            style={styles.cardPropertyImage}
            contentFit="cover"
          />
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' }}
            style={styles.cardAvatar}
            contentFit="cover"
          />
          <Text style={styles.cardLabel}>Swap for</Text>
          <Text style={styles.cardCities}>Berlin · Paris · Madrid</Text>
          <Pressable style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Accept</Text>
          </Pressable>
        </BlurView>

        {/* Right Floating Card */}
        <BlurView 
          intensity={80} 
          tint="light"
          style={[styles.floatingCard, styles.rightCard]}
        >
          <View style={styles.cardYellowOverlay} />

          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80' }}
            style={styles.cardPropertyImage}
            contentFit="cover"
          />
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' }}
            style={styles.cardAvatar}
            contentFit="cover"
          />
          <Text style={styles.cardLabel}>Swap for</Text>
          <Text style={styles.cardCities}>Milan · Rome · Amsterdam</Text>
          <Pressable style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Accept</Text>
          </Pressable>
        </BlurView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
  },
  logoSubtext: {
    fontWeight: '400',
    fontSize: 20,
  },
  betaBadge: {
    backgroundColor: '#96A582',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  betaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  userButton: {
    backgroundColor: '#96A582', // Sage Green
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  primaryButton: {
    backgroundColor: '#96A582', // Sage green
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cardsContainer: {
    flex: 1,
    marginTop: 20,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  personImage: {
    position: 'absolute',
    bottom: -50,
    width: width * 0.9,
    height: width * 1.1,
    borderRadius: 30,
  },
  floatingCard: {
    position: 'absolute',
    width: 160,
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardYellowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(150, 165, 130, 0.4)', // Sage green tint for the cards
  },
  leftCard: {
    left: 10,
    top: 40,
    transform: [{ rotate: '-8deg' }],
  },
  rightCard: {
    right: 10,
    top: 10,
    transform: [{ rotate: '8deg' }],
  },
  cardPropertyImage: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    marginBottom: -20,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  cardLabel: {
    fontSize: 10,
    color: '#444',
    marginTop: 8,
    fontWeight: '600',
  },
  cardCities: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  cardButton: {
    backgroundColor: '#96A582', // Sage green
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

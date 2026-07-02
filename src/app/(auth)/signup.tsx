import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { useAuthStore } from '@/hooks/useAuthStore';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const { login } = useAuthStore();
  const theme = useTheme();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'vendor'>('user');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !phoneNumber.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.auth.signup(name.trim(), phoneNumber.trim(), password, role);
      const res = await api.auth.login(phoneNumber.trim(), password);
      login(res.accessToken, res.user);

      if (role === 'vendor') {
        router.replace('/(vendor)/(tabs)');
      } else {
        router.replace('/(user)/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Signup Failed', err.message || 'Could not register. Try a different phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background === '#FFF5EB' ? '#FCFBF9' : '#0B0B0C' }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Neon Glow Accents */}
          <View style={styles.neonGlowContainer}>
            <View style={[styles.glowOrb, styles.orbLeft, { backgroundColor: '#FF7A00' }]} />
            <View style={[styles.glowOrb, styles.orbRight, { backgroundColor: '#FFB800' }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
              Join the Homido community today
            </ThemedText>
          </View>

          {/* Glassmorphic Form Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.background === '#FFF5EB' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(24, 24, 28, 0.75)',
                borderColor: theme.background === '#FFF5EB' ? 'rgba(234, 223, 207, 0.5)' : 'rgba(255, 255, 255, 0.08)',
              },
            ]}
          >
            <ThemedText style={styles.cardTitle}>Create Account</ThemedText>
            <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Fill in your details to get started
            </ThemedText>

            {/* Modern Segmented Role Selector */}
            <View style={[styles.roleContainer, { backgroundColor: theme.background === '#FFF5EB' ? '#F6F5F2' : '#141416', borderColor: theme.border }]}>
              <Pressable
                style={[
                  styles.roleTab,
                  role === 'user' && { backgroundColor: theme.primary, shadowColor: theme.primary, shadowOpacity: 0.15, shadowRadius: 10 },
                ]}
                onPress={() => setRole('user')}
                disabled={loading}
              >
                <Ionicons
                  name="person"
                  size={16}
                  color={role === 'user' ? '#FFF' : theme.textSecondary}
                />
                <ThemedText style={[styles.roleTabText, { color: role === 'user' ? '#FFF' : theme.textSecondary }]}>
                  Customer
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.roleTab,
                  role === 'vendor' && { backgroundColor: theme.primary, shadowColor: theme.primary, shadowOpacity: 0.15, shadowRadius: 10 },
                ]}
                onPress={() => setRole('vendor')}
                disabled={loading}
              >
                <Ionicons
                  name="storefront"
                  size={16}
                  color={role === 'vendor' ? '#FFF' : theme.textSecondary}
                />
                <ThemedText style={[styles.roleTabText, { color: role === 'vendor' ? '#FFF' : theme.textSecondary }]}>
                  Sell Food
                </ThemedText>
              </Pressable>
            </View>

            {role === 'vendor' && (
              <View style={[styles.vendorHint, { backgroundColor: theme.accent + '12', borderColor: theme.accent + '30' }]}>
                <Ionicons name="information-circle" size={18} color={theme.accent} />
                <ThemedText style={[styles.vendorHintText, { color: theme.accent }]}>
                  Vendor accounts require admin approval before going live.
                </ThemedText>
              </View>
            )}

            {/* Name Input */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background === '#FFF5EB' ? '#F6F5F2' : '#141416' }]}>
              <Ionicons name="person-outline" size={20} color={theme.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Full Name"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            {/* Phone Input */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background === '#FFF5EB' ? '#F6F5F2' : '#141416' }]}>
              <Ionicons name="call-outline" size={20} color={theme.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Phone Number"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background === '#FFF5EB' ? '#F6F5F2' : '#141416' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password (min. 6 characters)"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>

            {/* Premium Signup Button */}
            <Pressable
              onPress={handleSignup}
              disabled={loading}
              style={({ pressed }) => [
                styles.gradientBtn,
                { backgroundColor: theme.primary, opacity: pressed || loading ? 0.85 : 1 },
              ]}
            >
              <ThemedText style={styles.btnText}>
                {loading ? 'Creating...' : 'Create Account'}
              </ThemedText>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </Pressable>

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>
                Already have an account?{' '}
              </ThemedText>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <ThemedText style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>Sign In</ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  neonGlowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  glowOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.12,
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined,
  },
  orbLeft: {
    top: -50,
    left: -80,
  },
  orbRight: {
    top: 200,
    right: -80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 170,
    height: 80,
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 18,
  },
  roleContainer: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  roleTabText: {
    fontWeight: '700',
    fontSize: 14,
  },
  vendorHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  vendorHintText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 6,
  },
  gradientBtn: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

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
import { useThemeStore } from '@/hooks/useThemeStore';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login } = useAuthStore();
  const theme = useTheme();
  const { themeMode } = useThemeStore();
  const isLight = themeMode === 'light';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your phone number and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.login(phoneNumber.trim(), password);
      login(res.accessToken, res.user);

      const userRole = res.user.role;
      if (userRole === 'vendor') {
        router.replace('/(vendor)/(tabs)');
      } else if (userRole === 'admin') {
        router.replace('/(admin)/(tabs)');
      } else {
        router.replace('/(user)/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Please check your phone number and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isLight ? '#FCFBF9' : '#0B0B0C' }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Soft Green Glow Accents */}
          <View style={styles.neonGlowContainer}>
            <View style={[styles.glowOrb, styles.orbLeft, { backgroundColor: '#96A582' }]} />
            <View style={[styles.glowOrb, styles.orbRight, { backgroundColor: '#C2CAB1' }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
              Homemade food, delivered with love
            </ThemedText>
          </View>

          {/* Glassmorphic Form Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(24, 24, 28, 0.75)',
                borderColor: isLight ? 'rgba(234, 223, 207, 0.5)' : 'rgba(255, 255, 255, 0.08)',
              },
            ]}
          >
            <ThemedText style={styles.cardTitle}>Welcome Back</ThemedText>
            <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Sign in to continue your culinary journey
            </ThemedText>

            {/* Input field 1 */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: isLight ? '#F6F5F2' : '#141416' }]}>
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

            {/* Input field 2 */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: isLight ? '#F6F5F2' : '#141416' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
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

            {/* Premium Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.gradientBtn,
                { backgroundColor: theme.primary, opacity: pressed || loading ? 0.85 : 1 },
              ]}
            >
              <ThemedText style={styles.btnText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </ThemedText>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <ThemedText style={[styles.dividerText, { color: theme.textSecondary }]}>quick test logins</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Modern Demo Panel */}
            <View style={[styles.demoWrapper, { backgroundColor: isLight ? 'rgba(150, 165, 130, 0.1)' : 'rgba(150, 165, 130, 0.05)' }]}>
              {['User', 'Vendor', 'Admin'].map((roleType, index) => {
                const creds = ['9876543210', '9876543211', '9876543212'];
                return (
                  <Pressable
                    key={roleType}
                    onPress={() => {
                      setPhoneNumber(creds[index]);
                      setPassword('password123');
                    }}
                    style={[styles.demoChip, { borderColor: theme.border, backgroundColor: theme.card }]}
                  >
                    <Ionicons name="key" size={12} color={theme.primary} />
                    <ThemedText style={styles.demoChipText}>{roleType}</ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>
                Don&apos;t have an account?{' '}
              </ThemedText>
              <Pressable onPress={() => router.push('/(auth)/signup')}>
                <ThemedText style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>Create Account</ThemedText>
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
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined, // Standard blur filter for web
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
    marginBottom: 24,
    lineHeight: 18,
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
    shadowColor: '#96A582',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.4,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  demoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 18,
    gap: 8,
    marginBottom: 24,
  },
  demoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  demoChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

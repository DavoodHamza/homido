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
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login } = useAuthStore();
  const theme = useTheme();

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.tagline}>
              Homemade food, delivered with love
            </ThemedText>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ThemedText style={styles.cardTitle}>Welcome Back 👋</ThemedText>
            <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Sign in to continue
            </ThemedText>

            {/* Phone Input */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <Ionicons name="call-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
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
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
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

            {/* Login Button */}
            <Button
              title={loading ? 'Signing in...' : 'Sign In'}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginBtn}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <ThemedText style={[styles.dividerText, { color: theme.textSecondary }]}>or</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Credentials hint */}
            <View style={[styles.credentialsBox, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '30' }]}>
              <View style={styles.credentialsHeader}>
                <Ionicons name="key-outline" size={16} color={theme.primary} />
                <ThemedText style={[styles.credentialsTitle, { color: theme.primary }]}>
                  Demo Credentials
                </ThemedText>
              </View>
              <View style={styles.credentialsGrid}>
                <View style={styles.credRow}>
                  <ThemedText style={[styles.credRole, { color: theme.textSecondary }]}>User</ThemedText>
                  <ThemedText style={[styles.credValue, { color: theme.text }]}>9876543210 / password123</ThemedText>
                </View>
                <View style={styles.credRow}>
                  <ThemedText style={[styles.credRole, { color: theme.textSecondary }]}>Vendor</ThemedText>
                  <ThemedText style={[styles.credValue, { color: theme.text }]}>9876543211 / password123</ThemedText>
                </View>
                <View style={styles.credRow}>
                  <ThemedText style={[styles.credRole, { color: theme.textSecondary }]}>Admin</ThemedText>
                  <ThemedText style={[styles.credValue, { color: theme.text }]}>9876543212 / password123</ThemedText>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedText style={{ color: theme.textSecondary }}>
                Don&apos;t have an account?{' '}
              </ThemedText>
              <Pressable onPress={() => router.push('/(auth)/signup')}>
                <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>Sign Up</ThemedText>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 80,
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  loginBtn: {
    height: 54,
    borderRadius: 14,
    marginTop: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
  },
  credentialsBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  credentialsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  credentialsTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  credentialsGrid: {
    gap: 6,
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credRole: {
    fontSize: 12,
    fontWeight: '600',
    width: 50,
  },
  credValue: {
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

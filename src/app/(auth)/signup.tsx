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
              Join the Homido community today
            </ThemedText>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ThemedText style={styles.cardTitle}>Create Account</ThemedText>
            <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Fill in your details to get started
            </ThemedText>

            {/* Role Selector */}
            <View style={[styles.roleContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Pressable
                style={[
                  styles.roleTab,
                  role === 'user' && { backgroundColor: theme.primary },
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
                  role === 'vendor' && { backgroundColor: theme.primary },
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
              <View style={[styles.vendorHint, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '40' }]}>
                <Ionicons name="information-circle" size={16} color={theme.accent} />
                <ThemedText style={[styles.vendorHintText, { color: theme.accent }]}>
                  Vendor accounts require admin approval before going live.
                </ThemedText>
              </View>
            )}

            {/* Name Input */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
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

            {/* Signup Button */}
            <Button
              title={loading ? 'Creating Account...' : `Sign Up as ${role === 'user' ? 'Customer' : 'Vendor'}`}
              onPress={handleSignup}
              disabled={loading}
              style={styles.signupBtn}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedText style={{ color: theme.textSecondary }}>
                Already have an account?{' '}
              </ThemedText>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>Sign In</ThemedText>
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
    marginBottom: 22,
  },
  roleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
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
    paddingVertical: 10,
    borderRadius: 10,
  },
  roleTabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  vendorHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
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
  signupBtn: {
    height: 54,
    borderRadius: 14,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
});

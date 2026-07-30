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
  Dimensions,
  Text,
} from 'react-native';
import { useAuthStore } from '@/hooks/useAuthStore';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const HEADER_IMAGE_HEIGHT = width * 0.75;

export default function SignupScreen() {
  const { login } = useAuthStore();

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
    <View style={styles.container}>
      {/* Back Button (Fixed at top over the image) */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#3A5A40" />
      </Pressable>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Image Background with curve */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/auth_header_food.png')}
              style={styles.headerImage}
              resizeMode="cover"
            />
            <View style={styles.curveOverlay} />
          </View>

          <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            {/* Header Text */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Register</Text>
              <Text style={styles.subtitle}>
                Create your new account
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>

              {/* Role Selector */}
              <View style={styles.roleContainer}>
                <Pressable
                  style={[
                    styles.roleTab,
                    role === 'user' && styles.roleTabActive,
                  ]}
                  onPress={() => setRole('user')}
                  disabled={loading}
                >
                  <Ionicons
                    name="person"
                    size={16}
                    color={role === 'user' ? '#FFF' : '#6B8E70'}
                  />
                  <Text style={[styles.roleTabText, { color: role === 'user' ? '#FFF' : '#8BA989' }]}>
                    Customer
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.roleTab,
                    role === 'vendor' && styles.roleTabActive,
                  ]}
                  onPress={() => setRole('vendor')}
                  disabled={loading}
                >
                  <Ionicons
                    name="storefront"
                    size={16}
                    color={role === 'vendor' ? '#FFF' : '#6B8E70'}
                  />
                  <Text style={[styles.roleTabText, { color: role === 'vendor' ? '#FFF' : '#8BA989' }]}>
                    Vendor
                  </Text>
                </Pressable>
              </View>

              {role === 'vendor' && (
                <View style={styles.vendorHint}>
                  <Ionicons name="information-circle" size={18} color="#FF7A00" />
                  <Text style={styles.vendorHintText}>
                    Vendor accounts require admin approval before going live.
                  </Text>
                </View>
              )}

              {/* Name Input */}
              <View style={styles.inputWrapper}>
                <Ionicons name="person" size={20} color="#6B8E70" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#8BA989"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
                {name.length > 0 && (
                  <Ionicons name="checkmark" size={20} color="#7ED957" style={styles.rightIcon} />
                )}
              </View>

              {/* Phone Input */}
              <View style={styles.inputWrapper}>
                <Ionicons name="call" size={20} color="#6B8E70" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#8BA989"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  editable={!loading}
                />
                {phoneNumber.length > 0 && (
                  <Ionicons name="checkmark" size={20} color="#7ED957" style={styles.rightIcon} />
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color="#6B8E70" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#8BA989"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#6B8E70"
                  />
                </Pressable>
              </View>

              {/* Register Button */}
              <Pressable
                onPress={handleSignup}
                disabled={loading}
                style={({ pressed }) => [
                  styles.loginBtn,
                  { opacity: pressed || loading ? 0.85 : 1, marginTop: 10 },
                ]}
              >
                <Text style={styles.loginBtnText}>
                  {loading ? 'Creating Account...' : 'Register'}
                </Text>
              </Pressable>

              {/* Sign In Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Already have an account? </Text>
                <Pressable onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.signupLink}>Sign In</Text>
                </Pressable>
              </View>
            </View>

            {/* Social Logins */}
            <View style={styles.socialContainer}>
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.socialText}>Or continue with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialIconsRow}>
                <Pressable style={styles.socialIconBtn}>
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </Pressable>
                <Pressable style={styles.socialIconBtn}>
                  <Ionicons name="logo-google" size={24} color="#DB4437" />
                </Pressable>
                <Pressable style={styles.socialIconBtn}>
                  <Ionicons name="logo-apple" size={24} color="#000000" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: HEADER_IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  curveOverlay: {
    position: 'absolute',
    bottom: -150,
    left: -50,
    width: width + 100,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    transform: [{ scaleX: 1.5 }],
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2A4A35',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8BA989',
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 30,
  },
  roleContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: '#EEF2EC',
    padding: 4,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  roleTabActive: {
    backgroundColor: '#3A5A40',
    shadowColor: '#3A5A40',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  roleTabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  vendorHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    padding: 12,
    marginBottom: 16,
  },
  vendorHintText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#FF7A00',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2EC',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2A4A35',
    fontWeight: '500',
    height: '100%',
  },
  rightIcon: {
    marginLeft: 12,
    padding: 4,
  },
  loginBtn: {
    backgroundColor: '#3A5A40',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3A5A40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 13,
    color: '#8BA989',
    fontWeight: '500',
  },
  signupLink: {
    fontSize: 13,
    color: '#3A5A40',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  socialContainer: {
    marginTop: 'auto',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E6DD',
  },
  socialText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#8BA989',
    fontWeight: '500',
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialIconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});

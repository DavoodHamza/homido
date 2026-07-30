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

export default function LoginScreen() {
  const { login } = useAuthStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Login to your account
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
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

              {/* Options Row */}
              <View style={styles.optionsRow}>
                <Pressable
                  style={styles.rememberMeBtn}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={14} color="#FFF" />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember Me</Text>
                </Pressable>
                <Pressable>
                  <Text style={styles.forgotText}>Forgot Password ?</Text>
                </Pressable>
              </View>

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [
                  styles.loginBtn,
                  { opacity: pressed || loading ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.loginBtnText}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </Pressable>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have account? </Text>
                <Pressable onPress={() => router.push('/(auth)/signup')}>
                  <Text style={styles.signupLink}>Sign up</Text>
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  rememberMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#7ED957',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#7ED957',
    borderColor: '#7ED957',
  },
  rememberMeText: {
    fontSize: 13,
    color: '#8BA989',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: '#2A4A35',
    fontWeight: '600',
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

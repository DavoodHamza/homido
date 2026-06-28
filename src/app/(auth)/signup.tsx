import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Link } from 'expo-router';

export default function SignupScreen() {
  const { login } = useAuthStore();
  const theme = useTheme();
  
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <ThemedText style={{ textAlign: 'center', marginTop: 10, color: theme.textSecondary }}>
            Join the HomeMade Hub community
          </ThemedText>
        </View>

        <Card style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Create Account</ThemedText>
          
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
            placeholder="Full Name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
            placeholder="Phone Number"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <View style={styles.buttonGroup}>
            <Button 
              title="Sign Up as User" 
              onPress={() => login('user')} 
              style={styles.button}
            />
          </View>

          <View style={styles.footer}>
            <ThemedText style={{ color: theme.textSecondary }}>Already have an account? </ThemedText>
            <Link href="/(auth)/login" asChild>
              <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Login</ThemedText>
            </Link>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 100,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardTitle: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 10,
  },
  button: {
    width: '100%',
    height: 55,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  }
});

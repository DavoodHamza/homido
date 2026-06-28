import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';

export default function VendorTestScreen() {
  const { login } = useAuthStore();
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Vendor Dashboard Test
        </ThemedText>
        
        <ThemedText style={styles.description}>
          This is a testing screen to easily switch your role. Click the buttons below to switch your role and access the respective dashboards.
        </ThemedText>

        <View style={styles.buttonContainer}>
          <Button 
            title="Switch to Vendor Dashboard" 
            onPress={() => {
              login('vendor');
              router.replace('/(vendor)/(tabs)');
            }}
            size="lg"
            style={{ marginBottom: 16 }}
          />
          <Button 
            title="Switch to Admin Dashboard" 
            onPress={() => {
              login('admin');
              router.replace('/(admin)/(tabs)');
            }}
            size="lg"
            variant="secondary"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
  }
});

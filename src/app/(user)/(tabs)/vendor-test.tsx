import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VendorTestScreen() {
  const { login } = useAuthStore();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBar}>
          <ThemedText style={styles.headerTitle}>Role Testing</ThemedText>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.infoIconBg, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="information-circle" size={28} color={theme.primary} />
          </View>
          <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
            Use the buttons below to quickly switch between different app roles for testing purposes.
          </ThemedText>
        </View>

        <Pressable
          onPress={() => {
            login('vendor');
            router.replace('/(vendor)/(tabs)');
          }}
          style={[styles.roleCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.roleIconBg, { backgroundColor: '#FF7A0015' }]}>
            <Ionicons name="storefront" size={32} color="#FF7A00" />
          </View>
          <View style={styles.roleInfo}>
            <ThemedText style={styles.roleName}>Vendor Dashboard</ThemedText>
            <ThemedText style={[styles.roleDesc, { color: theme.textSecondary }]}>
              Manage your store, menu items, and incoming orders
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={() => {
            login('admin');
            router.replace('/(admin)/(tabs)');
          }}
          style={[styles.roleCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.roleIconBg, { backgroundColor: '#5856D615' }]}>
            <Ionicons name="shield-checkmark" size={32} color="#5856D6" />
          </View>
          <View style={styles.roleInfo}>
            <ThemedText style={styles.roleName}>Admin Dashboard</ThemedText>
            <ThemedText style={[styles.roleDesc, { color: theme.textSecondary }]}>
              Oversee platform operations, vendors, and analytics
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.currentRole, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
          <ThemedText style={[styles.currentRoleText, { color: theme.primary }]}>
            Currently logged in as: User
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerBar: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    gap: 14,
  },
  infoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  roleIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  roleName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  currentRole: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
    gap: 8,
  },
  currentRoleText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

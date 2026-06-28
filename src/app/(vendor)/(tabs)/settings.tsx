import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function VendorSettings() {
  const theme = useTheme();
  const { logout } = useAuthStore();
  
  const [diningEnabled, setDiningEnabled] = useState(false);
  const [capacity, setCapacity] = useState('10');
  const [diningCharge, setDiningCharge] = useState('50');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <ThemedText type="title">Settings</ThemedText>
        </View>

        {/* Profile Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <ThemedText style={{ color: '#FFF', fontWeight: 'bold', fontSize: 24 }}>S</ThemedText>
            </View>
            <View style={{ marginLeft: 16 }}>
              <ThemedText type="subtitle">Sarah's Sweets</ThemedText>
              <ThemedText style={{ color: theme.textSecondary }}>sarah@example.com</ThemedText>
            </View>
          </View>
          <Button title="Edit Profile" variant="outline" style={{ marginTop: 16 }} />
        </Card>

        {/* Dining Configuration */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Dining Configuration</ThemedText>
        </View>
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.settingTitle}>Enable Dine-in</ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
                Allow customers to dine at your location.
              </ThemedText>
            </View>
            <Switch
              value={diningEnabled}
              onValueChange={setDiningEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          {diningEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              
              <View style={styles.inputRow}>
                <ThemedText style={styles.settingTitle}>Dining Capacity (Persons)</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                  keyboardType="number-pad"
                  value={capacity}
                  onChangeText={setCapacity}
                />
              </View>

              <View style={styles.inputRow}>
                <ThemedText style={styles.settingTitle}>Extra Dining Charge (₹)</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                  keyboardType="number-pad"
                  value={diningCharge}
                  onChangeText={setDiningCharge}
                />
                <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
                  Applied to the total bill for dine-in orders.
                </ThemedText>
              </View>
              
              <Button title="Save Changes" style={{ marginTop: 16 }} />
            </>
          )}
        </Card>

        {/* Business Settings */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Business</ThemedText>
        </View>
        <Card style={styles.sectionCard}>
          <View style={styles.linkRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={20} color={theme.text} style={{ marginRight: 12 }} />
              <ThemedText>Operating Hours</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.linkRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={20} color={theme.text} style={{ marginRight: 12 }} />
              <ThemedText>Pickup Location</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        </Card>

        <Button 
          title="Logout" 
          variant="secondary" 
          onPress={logout}
          style={{ marginTop: 24, marginBottom: 40 }} 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  inputRow: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    fontSize: 16,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  }
});

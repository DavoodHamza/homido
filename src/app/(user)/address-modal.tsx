import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/hooks/useAuthStore';
import { api } from '@/services/api';

export default function AddressModalScreen() {
  const theme = useTheme();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState(user?.addressLocation || '');
  const [landmark, setLandmark] = useState(user?.addressLandmark || '');
  const [phone, setPhone] = useState(user?.addressPhone || user?.phoneNumber || '');
  const [secondaryPhone, setSecondaryPhone] = useState(user?.addressSecondaryPhone || '');

  const handleSave = async () => {
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Please enter your delivery location/address.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your primary contact number.');
      return;
    }

    setLoading(true);
    try {
      const updatedFields = {
        addressLocation: location,
        addressLandmark: landmark,
        addressPhone: phone,
        addressSecondaryPhone: secondaryPhone,
      };

      await api.users.update(updatedFields);
      updateUser(updatedFields);
      
      Alert.alert('Success', 'Address saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Delivery Address</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ThemedText style={styles.sectionDescription}>
          Please enter your delivery details so we can reach you quickly.
        </ThemedText>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Location / Address *</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Signature Towers, Hitech City"
            placeholderTextColor={theme.text + '80'}
            value={location}
            onChangeText={setLocation}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Landmark (Optional)</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Opposite Metro Station"
            placeholderTextColor={theme.text + '80'}
            value={landmark}
            onChangeText={setLandmark}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Primary Contact Number *</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. 9876543210"
            placeholderTextColor={theme.text + '80'}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Secondary Number (Optional)</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. 9876543211"
            placeholderTextColor={theme.text + '80'}
            value={secondaryPhone}
            onChangeText={setSecondaryPhone}
            keyboardType="phone-pad"
          />
        </View>

        <Pressable 
          style={[styles.saveButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Save Address</ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

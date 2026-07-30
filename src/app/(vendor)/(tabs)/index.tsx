import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Modal, FlatList, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/hooks/useAuthStore';
import { api } from '@/services/api';
import MediaPicker from '@/components/MediaPicker';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const INDIAN_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Bank of India',
  'Union Bank of India',
  'Canara Bank',
  'IndusInd Bank',
  'Yes Bank',
  'IDFC FIRST Bank',
];

export default function VendorDashboard() {
  const theme = useTheme();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<{ totalSales: number; totalAmount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Kitchen Profile Form
  const [kitchenName, setKitchenName] = useState('');
  const [category, setCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  const [timeVal, setTimeVal] = useState('20');
  const [imageUrl, setImageUrl] = useState('');
  const [locationStr, setLocationStr] = useState('Signature Towers, Hitech City');
  
  // Bank Details & Certificates
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIFSC, setBankIFSC] = useState('');
  const [fssaiCertificate, setFssaiCertificate] = useState('');
  const [isBankModalVisible, setBankModalVisible] = useState(false);
  const [uploadingFssai, setUploadingFssai] = useState(false);

  const loadData = async () => {
    try {
      const cats = await api.categories.getAll();
      setCategoriesList(cats);
      if (cats.length > 0 && !category) {
        setCategory(cats[0].name.toLowerCase());
      }

      const prof = await api.vendors.getProfileMe();
      setProfile(prof);

      if (prof) {
        const ords = await api.orders.get();
        setOrders(ords);

        try {
          const stats = await api.orders.getVendorAnalytics();
          setAnalytics(stats);
        } catch (err) {
          console.error('Failed to load vendor analytics:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleUploadFssai = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload certificate.');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) return;
      const asset = pickerResult.assets[0];

      setUploadingFssai(true);
      const uploadedUrl = await api.upload.image(
        asset.uri,
        asset.fileName ?? undefined,
        asset.mimeType ?? 'image/jpeg',
      );
      setFssaiCertificate(uploadedUrl);
      Alert.alert('Success', 'Certificate uploaded successfully.');
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to upload certificate. Please try again.');
    } finally {
      setUploadingFssai(false);
    }
  };


  const handleRegisterKitchen = async () => {
    if (!kitchenName.trim()) {
      Alert.alert('Error', 'Please enter a kitchen name.');
      return;
    }
    if (!bankName || !bankAccountName || !bankAccountNumber || !bankIFSC || !fssaiCertificate) {
      Alert.alert('Error', 'Please provide all bank details and upload your FSSAI certificate.');
      return;
    }
    const acctRegex = /^[0-9]{9,18}$/;
    if (!acctRegex.test(bankAccountNumber.trim())) {
      Alert.alert('Invalid Account', 'Account number must be 9 to 18 digits.');
      return;
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankIFSC.trim())) {
      Alert.alert('Invalid IFSC', 'Please enter a valid IFSC code (e.g. SBIN0001234).');
      return;
    }

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let latitude: number | undefined;
      let longitude: number | undefined;
      let finalLocationStr = locationStr.trim();

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
        
        if (!finalLocationStr || finalLocationStr === 'Signature Towers, Hitech City') {
          const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (geocoded.length > 0) {
            const item = geocoded[0];
            finalLocationStr = [item.street, item.district, item.city].filter(Boolean).join(', ');
          }
        }
      }

      const prof = await api.vendors.register(
        kitchenName.trim(),
        imageUrl.trim() || undefined,
        parseInt(timeVal) || 20,
        category,
        finalLocationStr || undefined,
        latitude,
        longitude,
        bankName,
        bankAccountName,
        bankAccountNumber,
        bankIFSC,
        fssaiCertificate
      );
      setProfile(prof);
      Alert.alert('Success', 'Kitchen profile registered successfully!');
      loadData();
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not register kitchen.');
      setLoading(false);
    }
  };

  // Calculations
  const getTodayRevenue = () => {
    const today = new Date().toDateString();
    return orders
      .filter((o) => o.status === 'Delivered' && new Date(o.date).toDateString() === today)
      .reduce((sum, o) => sum + Number(o.total), 0);
  };

  const getPendingOrdersCount = () => {
    return orders.filter((o) => o.status === 'Pending').length;
  };

  const getEstMonthlySales = () => {
    return analytics?.totalAmount || 0;
  };

  const getTotalSalesCount = () => {
    return analytics?.totalSales || 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // 1. If no kitchen profile registered yet
  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <ThemedText style={{ color: theme.textSecondary }}>Welcome back,</ThemedText>
              <ThemedText type="title">{user?.name || 'Chef'}</ThemedText>
            </View>
          </View>

          <Card style={styles.formCard}>
            <ThemedText type="subtitle" style={styles.formTitle}>Register Your Kitchen</ThemedText>
            <ThemedText style={{ color: theme.textSecondary, marginBottom: 20, fontSize: 13 }}>
              Enter your kitchen details to start selling homemade goodness on Homido!
            </ThemedText>

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
              placeholder="Kitchen Name (e.g. Grandma's Pickles)"
              placeholderTextColor={theme.textSecondary}
              value={kitchenName}
              onChangeText={setKitchenName}
            />

            <ThemedText style={{ color: theme.textSecondary, marginBottom: 8, fontSize: 13 }}>Primary Category:</ThemedText>
            <View style={styles.categoryPickerRow}>
              {categoriesList.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.name.toLowerCase())}
                  style={[
                    styles.pickerBtn,
                    { borderColor: theme.border },
                    category === cat.name.toLowerCase() && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  <ThemedText style={[styles.pickerBtnText, category === cat.name.toLowerCase() && { color: '#FFF' }]}>
                    {cat.name.toUpperCase()}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card, marginTop: 16 }]}
              placeholder="Est. Prep & Delivery Time (mins)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={timeVal}
              onChangeText={setTimeVal}
            />

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
              placeholder="Kitchen Location / Address"
              placeholderTextColor={theme.textSecondary}
              value={locationStr}
              onChangeText={setLocationStr}
            />

            <ThemedText style={{ color: theme.textSecondary, marginBottom: 8, fontSize: 13 }}>Kitchen Cover Photo:</ThemedText>
            <MediaPicker
              value={imageUrl}
              onUploaded={(url) => setImageUrl(url)}
              mediaType="image"
              label="Add Kitchen Cover Photo"
            />

            <ThemedText style={{ color: theme.textSecondary, marginBottom: 8, fontSize: 13, marginTop: 16 }}>Bank Details:</ThemedText>
            <Pressable
              style={[styles.input, { borderColor: theme.border, backgroundColor: theme.card, justifyContent: 'center' }]}
              onPress={() => setBankModalVisible(true)}
            >
              <ThemedText style={{ color: bankName ? theme.text : theme.textSecondary }}>
                {bankName || 'Select Bank Name'}
              </ThemedText>
            </Pressable>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card, marginTop: 12 }]}
              placeholder="Account Holder Name"
              placeholderTextColor={theme.textSecondary}
              value={bankAccountName}
              onChangeText={setBankAccountName}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card, marginTop: 12 }]}
              placeholder="Bank Account Number"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card, marginTop: 12 }]}
              placeholder="IFSC Code"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
              value={bankIFSC}
              onChangeText={setBankIFSC}
            />

            <ThemedText style={{ color: theme.textSecondary, marginBottom: 8, fontSize: 13, marginTop: 16 }}>FSSAI Certificate:</ThemedText>
            {fssaiCertificate ? (
              <View style={{ marginBottom: 12 }}>
                <Image source={{ uri: fssaiCertificate }} style={{ width: '100%', height: 150, borderRadius: 8 }} />
                <Button title="Re-upload Certificate" variant="outline" onPress={handleUploadFssai} style={{ marginTop: 8 }} disabled={uploadingFssai} />
              </View>
            ) : (
              <Button title={uploadingFssai ? "Uploading..." : "Upload FSSAI Certificate"} variant="outline" onPress={handleUploadFssai} style={{ marginBottom: 16 }} disabled={uploadingFssai} />
            )}

            <Button title="Create Kitchen Profile" onPress={handleRegisterKitchen} style={{ height: 50, marginTop: 10 }} />
          </Card>

          <Modal visible={isBankModalVisible} animationType="slide" transparent>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
              <View style={{ backgroundColor: theme.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%', padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <ThemedText type="subtitle">Select Bank</ThemedText>
                  <Pressable onPress={() => setBankModalVisible(false)}><Ionicons name="close" size={24} color={theme.text} /></Pressable>
                </View>
                <FlatList
                  data={INDIAN_BANKS}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}
                      onPress={() => {
                        setBankName(item);
                        setBankModalVisible(false);
                      }}
                    >
                      <ThemedText style={{ color: bankName === item ? theme.primary : theme.text, fontWeight: bankName === item ? 'bold' : 'normal' }}>
                        {item}
                      </ThemedText>
                    </Pressable>
                  )}
                />
              </View>
            </View>
          </Modal>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. Kitchen Profile Registered
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f2faed', '#ffffff']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.modernHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarCircle}>
                <ThemedText style={styles.avatarText}>{profile.name.charAt(0)}</ThemedText>
              </View>
              <View>
                <ThemedText style={styles.greetingText}>Hi, {user?.name?.split(' ')[0] || 'Chef'}</ThemedText>
                <ThemedText style={styles.welcomeText}>Welcome Back!</ThemedText>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Pressable style={styles.headerIconBtn} onPress={loadData}>
                <Ionicons name="refresh" size={20} color="#333" />
              </Pressable>
              <Pressable style={styles.headerIconBtn}>
                <Ionicons name="notifications-outline" size={20} color="#333" />
              </Pressable>
            </View>
          </View>

          <ThemedText style={styles.pageTitle}>Let's Track Your{"\n"}Sales</ThemedText>

          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <ThemedText style={styles.heroLabel}>Total Earnings</ThemedText>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <ThemedText 
                  style={[styles.heroValue, { fontSize: 24, flexWrap: 'wrap' }]} 
                >
                  ₹{getEstMonthlySales()}
                </ThemedText>
                <ThemedText style={[styles.heroSubText, { marginTop: 4 }]}>All Time</ThemedText>
              </View>
            </View>
            <View style={styles.heroRight}>
              <View style={styles.fauxChartOuter}>
                <View style={styles.fauxChartInner}>
                  <Ionicons name="flame" size={36} color="#FF6B6B" />
                </View>
              </View>
            </View>
          </View>

          {/* Metrics Row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
            {/* Today */}
            <View style={styles.metricPill}>
              <ThemedText style={styles.metricTitle}>Today</ThemedText>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '60%', backgroundColor: '#b4d89a' }]} />
              </View>
              <ThemedText style={styles.metricValue}>₹{getTodayRevenue()}</ThemedText>
            </View>

            {/* Pending */}
            <View style={styles.metricPill}>
              <ThemedText style={styles.metricTitle}>Pending</ThemedText>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '40%', backgroundColor: '#90cdf4' }]} />
              </View>
              <ThemedText style={styles.metricValue}>{getPendingOrdersCount()} Ords</ThemedText>
            </View>

            {/* Total Sales */}
            <View style={styles.metricPill}>
              <ThemedText style={styles.metricTitle}>Completed</ThemedText>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '85%', backgroundColor: '#feb2b2' }]} />
              </View>
              <ThemedText style={styles.metricValue}>{getTotalSalesCount()} Total</ThemedText>
            </View>
          </ScrollView>

          {/* List Section */}
          <View style={styles.listSection}>
             {orders.slice(0, 5).map((ord, idx) => (
                <View key={ord.id || idx} style={styles.activityCard}>
                  <View style={styles.activityLeft}>
                    <View style={[styles.activityIcon, { backgroundColor: ord.status === 'Delivered' ? '#f0fdf4' : '#fff7ed' }]}>
                      <Ionicons name={ord.status === 'Delivered' ? 'flame' : 'time'} size={20} color={ord.status === 'Delivered' ? '#b4d89a' : '#ea580c'} />
                    </View>
                    <View>
                      <ThemedText style={styles.activityName}>Order #{ord.id?.substring(0,6) || 'N/A'}</ThemedText>
                      <ThemedText style={styles.activityStatus}>{ord.status} • ₹{ord.total}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.activityRight}>
                    <View style={styles.activityPlus}>
                      <Ionicons name="add" size={16} color="#666" />
                    </View>
                  </View>
                </View>
             ))}
             {orders.length === 0 && (
                <View style={styles.activityCard}>
                  <ThemedText style={styles.activityName}>No recent orders</ThemedText>
                </View>
             )}
          </View>
          
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    lineHeight: 38,
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: '#e6f4d5',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  heroLeft: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5d3f',
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2a3b20',
  },
  heroSubText: {
    fontSize: 16,
    color: '#4a5d3f',
    fontWeight: '500',
  },
  heroRight: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fauxChartOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: '#c6e0b0',
    borderTopColor: '#f59e0b',
    borderRightColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  fauxChartInner: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#e6f4d5',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 24,
  },
  metricPill: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    width: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  listSection: {
    marginTop: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  activityStatus: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  activityRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Registration Form Styles remain intact
  formCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pickerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
});

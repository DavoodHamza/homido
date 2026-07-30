import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert, Image, Linking, Modal, TextInput, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function AdminVendors() {
  const theme = useTheme();

  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'deactivated'>('pending');

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const fetchVendors = async () => {
    try {
      const res = await api.orders.getAdminVendorAnalytics();
      setVendors(res);
    } catch (err) {
      console.error('Failed to fetch vendors for admin:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVendors();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'deactivated') => {
    setLoading(true);
    try {
      await api.vendors.approve(id, status);
      Alert.alert('Status Updated', `Vendor marked as ${status}.`);
      fetchVendors();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update vendor status.');
      setLoading(false);
    }
  };

  const handlePayVendor = async () => {
    if (!selectedVendorId || !payAmount) return;
    setPaying(true);
    try {
      await api.vendors.addPayment(selectedVendorId, parseFloat(payAmount));
      Alert.alert('Success', 'Payment recorded successfully.');
      setPayModalVisible(false);
      setPayAmount('');
      fetchVendors();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not process payment.');
    } finally {
      setPaying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.accent;
      case 'approved': return theme.success;
      case 'rejected': return theme.error;
      case 'deactivated': return '#60646C'; // Neutral grey for deactivated
      default: return theme.textSecondary;
    }
  };

  const getFilteredVendors = () => {
    return vendors.filter((v) => {
      if (activeTab === 'pending') {
        return v.status === 'pending';
      }
      if (activeTab === 'deactivated') {
        return v.status === 'deactivated';
      }
      return v.status === 'approved';
    });
  };

  const renderVendor = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);
    const dateFormatted = new Date(item.createdAt).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card style={styles.vendorCard}>
        <View style={styles.vendorHeader}>
          <View style={styles.avatar}>
            <ThemedText style={{ fontWeight: 'bold', color: theme.primary }}>
              {item.name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.vendorInfo}>
            <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</ThemedText>
            <ThemedText style={{ color: theme.textSecondary, fontSize: 14 }}>
              Owner: {item.user?.name || 'N/A'} ({item.user?.phoneNumber})
            </ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: statusColor }}>
              {item.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.vendorDetails}>
          {/* Main Info */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <ThemedText style={styles.detailLabel}>Category</ThemedText>
              <ThemedText style={styles.detailValue}>{item.category.toUpperCase()}</ThemedText>
            </View>
            <View style={styles.gridItem}>
              <ThemedText style={styles.detailLabel}>Applied On</ThemedText>
              <ThemedText style={styles.detailValue}>{dateFormatted}</ThemedText>
            </View>
          </View>
          
          {/* Financials Box */}
          <View style={[styles.financeBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
            <ThemedText style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 14, color: theme.primary }}>Financial Overview</ThemedText>
            
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <ThemedText style={styles.detailLabel}>Total Sales</ThemedText>
                <ThemedText style={[styles.detailValue, { color: theme.primary, fontSize: 16 }]}>{item.totalSales || 0}</ThemedText>
              </View>
              <View style={styles.gridItem}>
                <ThemedText style={styles.detailLabel}>Total Revenue</ThemedText>
                <ThemedText style={[styles.detailValue, { color: theme.success, fontSize: 16 }]}>₹{item.totalAmount || 0}</ThemedText>
              </View>
            </View>
            
            <View style={[styles.gridRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.primary + '20' }]}>
              <View style={styles.gridItem}>
                <ThemedText style={styles.detailLabel}>Paid Amount</ThemedText>
                <ThemedText style={[styles.detailValue, { fontSize: 16 }]}>₹{item.totalPaid || 0}</ThemedText>
              </View>
              <View style={styles.gridItem}>
                <ThemedText style={styles.detailLabel}>Due Amount</ThemedText>
                <ThemedText style={[styles.detailValue, { color: theme.error, fontSize: 16 }]}>₹{(item.totalAmount || 0) - (item.totalPaid || 0)}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.vendorDetails, { paddingTop: 0 }]}>
          <ThemedText style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 14 }}>Contact Details</ThemedText>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <ThemedText style={styles.detailLabel}>Name</ThemedText>
              <ThemedText style={styles.detailValue}>{item.contactName || 'N/A'}</ThemedText>
            </View>
            <View style={styles.gridItem}>
              <ThemedText style={styles.detailLabel}>Phone</ThemedText>
              <ThemedText style={styles.detailValue}>{item.contactPhone || 'N/A'}</ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.vendorDetails, { paddingTop: 0 }]}>
          <ThemedText style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 14 }}>Bank & Certificate Details</ThemedText>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <ThemedText style={styles.detailLabel}>Bank Name</ThemedText>
              <ThemedText style={styles.detailValue}>{item.bankName || 'N/A'}</ThemedText>
            </View>
            <View style={styles.gridItem}>
              <ThemedText style={styles.detailLabel}>Account Holder</ThemedText>
              <ThemedText style={styles.detailValue}>{item.bankAccountName || 'N/A'}</ThemedText>
            </View>
          </View>
          <View style={[styles.gridRow, { marginTop: 12 }]}>
            <View style={styles.gridItem}>
              <ThemedText style={styles.detailLabel}>Account Number</ThemedText>
              <ThemedText style={styles.detailValue}>{item.bankAccountNumber || 'N/A'}</ThemedText>
            </View>
            <View style={styles.gridItem}>
              <ThemedText style={styles.detailLabel}>IFSC Code</ThemedText>
              <ThemedText style={styles.detailValue}>{item.bankIFSC || 'N/A'}</ThemedText>
            </View>
          </View>
          
          {item.fssaiCertificate && (
            <View style={{ marginTop: 12 }}>
              <ThemedText style={styles.detailLabel}>FSSAI Certificate</ThemedText>
              <Pressable onPress={() => Linking.openURL(item.fssaiCertificate)}>
                <Image 
                  source={{ uri: item.fssaiCertificate }} 
                  style={{ width: '100%', height: 120, borderRadius: 8, marginTop: 8, backgroundColor: theme.border }} 
                  resizeMode="cover"
                />
                <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <ThemedText style={{ color: '#fff', fontSize: 10 }}>Tap to view full</ThemedText>
                </View>
              </Pressable>
            </View>
          )}
        </View>

        {item.status === 'pending' && (
          <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
            <Button
              title="Reject"
              variant="outline"
              size="sm"
              style={{ flex: 1, marginRight: 8 }}
              onPress={() => handleUpdateStatus(item.id, 'rejected')}
            />
            <Button
              title="Approve"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => handleUpdateStatus(item.id, 'approved')}
            />
          </View>
        )}
        
        {item.status === 'approved' && (
          <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
            <Button
              title="Deactivate"
              variant="outline"
              size="sm"
              style={{ flex: 1, marginRight: 8, borderColor: theme.error }}
              textStyle={{ color: theme.error }}
              onPress={() => {
                Alert.alert('Confirm', 'Are you sure you want to deactivate this vendor?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Deactivate', style: 'destructive', onPress: () => handleUpdateStatus(item.id, 'deactivated') }
                ]);
              }}
            />
            <Button
              title="Pay Vendor"
              size="sm"
              style={{ flex: 1, backgroundColor: theme.primary }}
              onPress={() => {
                setSelectedVendorId(item.id);
                setPayModalVisible(true);
              }}
            />
          </View>
        )}
        
        {item.status === 'deactivated' && (
          <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
            <Button
              title="Activate Vendor"
              size="sm"
              style={{ flex: 1, backgroundColor: theme.success }}
              onPress={() => handleUpdateStatus(item.id, 'approved')}
            />
          </View>
        )}
      </Card>
    );
  };

  const filtered = getFilteredVendors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title">Vendors</ThemedText>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterTabs}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <Pressable
            onPress={() => setActiveTab('pending')}
            style={[styles.tab, activeTab === 'pending' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          >
            <ThemedText
              style={activeTab === 'pending' ? { color: theme.primary, fontWeight: 'bold' } : { color: theme.textSecondary }}
            >
              Pending ({vendors.filter(v => v.status === 'pending').length})
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('approved')}
            style={[styles.tab, activeTab === 'approved' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          >
            <ThemedText
              style={activeTab === 'approved' ? { color: theme.primary, fontWeight: 'bold' } : { color: theme.textSecondary }}
            >
              Approved ({vendors.filter(v => v.status === 'approved').length})
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('deactivated')}
            style={[styles.tab, activeTab === 'deactivated' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          >
            <ThemedText
              style={activeTab === 'deactivated' ? { color: theme.primary, fontWeight: 'bold' } : { color: theme.textSecondary }}
            >
              Deactivated ({vendors.filter(v => v.status === 'deactivated').length})
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>

      {loading && vendors.length === 0 ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderVendor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={48} color={theme.textSecondary} />
              <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>
                No {activeTab} vendors found.
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Pay Modal */}
      <Modal visible={payModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Add Payment</ThemedText>
              <Pressable onPress={() => setPayModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>
            
            <ThemedText style={{ color: theme.textSecondary, marginBottom: 8, fontSize: 13 }}>Amount (₹)</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              value={payAmount}
              onChangeText={setPayAmount}
              placeholder="e.g. 1500"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
            />

            <Pressable 
              style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: paying ? 0.7 : 1 }]}
              onPress={handlePayVendor}
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <ThemedText style={styles.saveBtnText}>Submit Payment</ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  filterTabs: {
    flexDirection: 'row',
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EADFCF',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  vendorCard: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  vendorHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EADFCF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF7A0020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vendorDetails: {
    padding: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    paddingRight: 8,
  },
  financeBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#60646C',
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9F9F910',
    borderTopWidth: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveBtn: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

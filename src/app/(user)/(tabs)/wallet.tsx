import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Share,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';

export default function WalletScreen() {
  const theme = useTheme();
  const [wallet, setWallet] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWallet = async () => {
    try {
      const [walletData, userData] = await Promise.all([
        api.wallets.getMe(),
        api.users.me(),
      ]);
      setWallet(walletData);
      setUserProfile(userData);
    } catch (err) {
      console.error('Failed to fetch wallet', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWallet();
  };

  const shareReferralCode = async () => {
    if (!userProfile?.referralCode) return;
    try {
      await Share.share({
        message: `Join Homido using my referral code: ${userProfile.referralCode} and we both earn cashback!`,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Wallet</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCircle}>
            <Ionicons name="wallet" size={32} color="#FFF" />
          </View>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{wallet?.balance || '0.00'}</Text>
          <Text style={styles.balanceInfo}>
            Use your wallet balance to get automatic discounts on your next orders!
          </Text>
        </View>

        {/* Referral Section */}
        {userProfile?.referralCode && (
          <View style={[styles.referralCard, { backgroundColor: theme.card }]}>
            <View style={styles.referralHeader}>
              <View style={[styles.referralIconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="gift" size={24} color={theme.primary} />
              </View>
              <View style={styles.referralTexts}>
                <Text style={[styles.referralTitle, { color: theme.text }]}>Invite & Earn</Text>
                <Text style={[styles.referralSubtitle, { color: theme.textSecondary }]}>
                  Share your code and get cashback for every friend who joins!
                </Text>
              </View>
            </View>

            <View style={styles.codeRow}>
              <View style={styles.codeContainer}>
                <Text style={[styles.codeText, { color: theme.text }]}>{userProfile.referralCode}</Text>
              </View>
              <Pressable style={[styles.shareBtn, { backgroundColor: theme.primary }]} onPress={shareReferralCode}>
                <Ionicons name="share-social" size={18} color="#FFF" />
                <Text style={styles.shareBtnText}>Share</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Transactions */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
        
        {wallet?.transactions?.length > 0 ? (
          wallet.transactions.map((tx: any) => (
            <View key={tx.id} style={[styles.txItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.txIcon, { backgroundColor: tx.amount > 0 ? '#4CAF5020' : '#F4433620' }]}>
                <Ionicons
                  name={tx.amount > 0 ? 'arrow-down' : 'arrow-up'}
                  size={20}
                  color={tx.amount > 0 ? '#4CAF50' : '#F44336'}
                />
              </View>
              <View style={styles.txDetails}>
                <Text style={[styles.txDesc, { color: theme.text }]}>{tx.description}</Text>
                <Text style={[styles.txDate, { color: theme.textSecondary }]}>
                  {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount > 0 ? '#4CAF50' : theme.text }]}>
                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No transactions yet</Text>
          </View>
        )}
        
        {/* Spacer for bottom tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  balanceCard: {
    backgroundColor: '#3A5A40',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3A5A40',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  balanceCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 12,
  },
  balanceInfo: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  referralCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  referralTexts: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  referralSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  shareBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
});

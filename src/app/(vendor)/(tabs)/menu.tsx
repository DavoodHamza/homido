import { View, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const PRODUCTS = [
  {
    id: '1',
    title: 'Double Chocolate Fudge Cake',
    price: '₹850',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80',
    status: 'Active',
    sales: 42,
  },
  {
    id: '2',
    title: 'Red Velvet Cupcakes (Box of 6)',
    price: '₹450',
    image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=200&q=80',
    status: 'Active',
    sales: 18,
  },
  {
    id: '3',
    title: 'Custom Birthday Cake (1kg)',
    price: '₹1200',
    image: 'https://images.unsplash.com/photo-1557925923-33b251d59265?w=200&q=80',
    status: 'Inactive',
    sales: 5,
  }
];

export default function VendorMenu() {
  const theme = useTheme();

  const renderProduct = ({ item }: { item: typeof PRODUCTS[0] }) => (
    <Card style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <View>
          <ThemedText style={styles.productTitle} numberOfLines={2}>{item.title}</ThemedText>
          <ThemedText style={{ color: theme.primary, fontWeight: 'bold', marginTop: 4 }}>{item.price}</ThemedText>
        </View>
        <View style={styles.productMeta}>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? theme.success + '20' : theme.textSecondary + '20' }]}>
            <ThemedText style={{ fontSize: 12, color: item.status === 'Active' ? theme.success : theme.textSecondary, fontWeight: 'bold' }}>
              {item.status}
            </ThemedText>
          </View>
          <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{item.sales} sold</ThemedText>
        </View>
      </View>
      <Pressable style={styles.editButton}>
        <Ionicons name="pencil" size={20} color={theme.textSecondary} />
      </Pressable>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Menu</ThemedText>
          <ThemedText style={{ color: theme.textSecondary, marginTop: 4 }}>Manage your products</ThemedText>
        </View>
        <Button 
          title="Add Item" 
          size="sm"
        />
      </View>

      <FlatList
        data={PRODUCTS}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  productCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
    height: 80,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  editButton: {
    padding: 12,
  }
});

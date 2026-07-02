import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, Pressable, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { api } from '@/services/api';

export default function VendorMenu() {
  const theme = useTheme();

  const [profile, setProfile] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('cakes');
  const [available, setAvailable] = useState(true);

  const fetchMenu = async () => {
    try {
      const prof = await api.vendors.getProfileMe();
      setProfile(prof);
      
      if (prof) {
        const items = await api.menu.getByVendor(prof.id);
        setMenuItems(items);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setImage('');
    setCategory('cakes');
    setAvailable(true);
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setImage(item.image || '');
    setCategory(item.category || 'cakes');
    setAvailable(item.available);
    setModalVisible(true);
  };

  const handleSaveItem = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Validation Error', 'Please enter a name and price.');
      return;
    }

    setLoading(true);
    try {
      const parsedPrice = parseFloat(price) || 0;
      if (editingItem) {
        // Edit Item
        await api.menu.update(editingItem.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: parsedPrice,
          image: image.trim() || undefined,
          category,
          available,
        });
        Alert.alert('Success', 'Menu item updated successfully.');
      } else {
        // Add Item
        await api.menu.create(
          name.trim(),
          description.trim(),
          parsedPrice,
          image.trim(),
          category
        );
        Alert.alert('Success', 'Menu item added successfully.');
      }
      setModalVisible(false);
      fetchMenu();
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save menu item.');
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this menu item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.menu.delete(id);
            Alert.alert('Deleted', 'Item deleted.');
            fetchMenu();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not delete item.');
            setLoading(false);
          }
        }
      }
    ]);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <Card style={styles.productCard}>
      <Image 
        source={{ uri: item.image || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80' }} 
        style={styles.productImage} 
      />
      <View style={styles.productInfo}>
        <View>
          <ThemedText style={styles.productTitle} numberOfLines={2}>{item.name}</ThemedText>
          <ThemedText style={{ color: theme.primary, fontWeight: 'bold', marginTop: 4 }}>₹{item.price}</ThemedText>
        </View>
        <View style={styles.productMeta}>
          <View style={[styles.statusBadge, { backgroundColor: item.available ? theme.success + '20' : theme.textSecondary + '20' }]}>
            <ThemedText style={{ fontSize: 12, color: item.available ? theme.success : theme.textSecondary, fontWeight: 'bold' }}>
              {item.available ? 'Active' : 'Inactive'}
            </ThemedText>
          </View>
          <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{item.category}</ThemedText>
        </View>
      </View>
      <View style={styles.actionRow}>
        <Pressable style={styles.editButton} onPress={() => openEditModal(item)}>
          <Ionicons name="pencil" size={18} color={theme.primary} />
        </Pressable>
        <Pressable style={styles.editButton} onPress={() => handleDeleteItem(item.id)}>
          <Ionicons name="trash-outline" size={18} color={theme.error} />
        </Pressable>
      </View>
    </Card>
  );

  if (loading && menuItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="restaurant-outline" size={48} color={theme.textSecondary} />
          <ThemedText style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center' }}>
            Please register your kitchen dashboard profile first on the Home tab.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

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
          onPress={openAddModal}
        />
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ paddingVertical: 80, alignItems: 'center' }}>
            <Ionicons name="fast-food-outline" size={48} color={theme.textSecondary} />
            <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>
              Your menu is empty. Add items to start selling!
            </ThemedText>
          </View>
        }
      />

      {/* Add / Edit Menu Item Modal */}
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</ThemedText>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
              placeholder="Item Name (e.g. Red Velvet Cupcake)"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card, height: 100 }]}
              placeholder="Description"
              placeholderTextColor={theme.textSecondary}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
              placeholder="Price (₹)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
              placeholder="Image URL"
              placeholderTextColor={theme.textSecondary}
              value={image}
              onChangeText={setImage}
            />

            <ThemedText style={{ color: theme.textSecondary, marginBottom: 8, fontSize: 13 }}>Category:</ThemedText>
            <View style={styles.categoryPickerRow}>
              {['cakes', 'meals', 'pickles', 'desserts', 'snacks'].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.pickerBtn,
                    { borderColor: theme.border },
                    category === cat && { backgroundColor: theme.primary, borderColor: theme.primary }
                  ]}
                >
                  <ThemedText style={[styles.pickerBtnText, category === cat && { color: '#FFF' }]}>
                    {cat.toUpperCase()}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {editingItem && (
              <View style={styles.availabilityRow}>
                <ThemedText style={{ fontWeight: '600' }}>Item Available for Order:</ThemedText>
                <Pressable 
                  onPress={() => setAvailable(!available)}
                  style={[
                    styles.toggleBtn, 
                    { borderColor: theme.border },
                    available && { backgroundColor: theme.success, borderColor: theme.success }
                  ]}
                >
                  <ThemedText style={{ color: available ? '#FFF' : theme.text, fontSize: 12, fontWeight: '700' }}>
                    {available ? 'YES' : 'NO'}
                  </ThemedText>
                </Pressable>
              </View>
            )}

            <Button 
              title={editingItem ? "Update Item" : "Create Item"} 
              onPress={handleSaveItem} 
              style={{ height: 50, marginTop: 24 }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeBtn: {
    padding: 4,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});

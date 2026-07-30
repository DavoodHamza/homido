import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';

export default function AdminCategoriesScreen() {
  const theme = useTheme();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleAddCategory = async () => {
    if (!newName.trim()) {
      Alert.alert('Validation Error', 'Category name is required');
      return;
    }
    
    setSaving(true);
    try {
      await api.categories.create({ name: newName.trim(), icon: newIcon.trim() });
      setModalVisible(false);
      setNewName('');
      setNewIcon('');
      fetchCategories();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Category', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.categories.delete(id);
            fetchCategories();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete category');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Categories</ThemedText>
          <ThemedText style={{ color: theme.textSecondary }}>Manage app categories</ThemedText>
        </View>
        <Pressable 
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {categories.map((cat) => (
          <View key={cat.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardLeft}>
              {cat.icon ? <ThemedText style={styles.cardIcon}>{cat.icon}</ThemedText> : null}
              <ThemedText style={styles.cardTitle}>{cat.name}</ThemedText>
            </View>
            <Pressable onPress={() => handleDelete(cat.id, cat.name)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </Pressable>
          </View>
        ))}
        {categories.length === 0 && (
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>No categories found. Add one!</ThemedText>
        )}
      </ScrollView>

      {/* Add Category Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">New Category</ThemedText>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>
            
            <ThemedText style={{ color: theme.textSecondary, marginBottom: 8, fontSize: 13 }}>Name</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Burgers"
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText style={{ color: theme.textSecondary, marginTop: 16, marginBottom: 8, fontSize: 13 }}>Icon (Emoji or URL)</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              value={newIcon}
              onChangeText={setNewIcon}
              placeholder="e.g. 🍔"
              placeholderTextColor={theme.textSecondary}
            />

            <Pressable 
              style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }]}
              onPress={handleAddCategory}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <ThemedText style={styles.saveBtnText}>Save Category</ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { padding: 20, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: { fontSize: 24 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  deleteBtn: { padding: 8 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  
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

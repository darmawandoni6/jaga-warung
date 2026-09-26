import { useState } from 'react';

import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Check, Plus, Tag } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';

import { useCategories } from '../hooks/useCategories';

export interface CategorySelectorProps {
  selectedCategory?: string | null;
  onSelectCategory: (category: string) => void;
}

export function CategorySelector({ selectedCategory, onSelectCategory }: CategorySelectorProps) {
  const { categories, addCategory } = useCategories();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      Alert.alert('Nama Kosong', 'Silakan masukkan nama kategori.');
      return;
    }

    const exists = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      onSelectCategory(exists.name);
      setShowAddModal(false);
      setNewCatName('');
      return;
    }

    setIsSaving(true);
    try {
      await addCategory(trimmed);
      onSelectCategory(trimmed);
      setShowAddModal(false);
      setNewCatName('');
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menambahkan kategori.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-slate-700">Kategori Produk</Text>
        {selectedCategory ? (
          <Pressable onPress={() => onSelectCategory('')} hitSlop={6}>
            <Text className="text-xs font-medium text-slate-400">Hapus Pilihan</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {/* Add New Category Chip */}
        <Pressable
          onPress={() => setShowAddModal(true)}
          className="mr-2 flex-row items-center gap-1 rounded-xl border border-dashed border-emerald-500 bg-emerald-50/50 px-3 py-2 active:bg-emerald-100"
        >
          <Plus size={14} color="#059669" strokeWidth={2.5} />
          <Text className="text-xs font-semibold text-emerald-700">+ Baru</Text>
        </Pressable>

        {/* Existing Categories */}
        {categories.map(cat => {
          const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(isSelected ? '' : cat.name)}
              className={`mr-2 flex-row items-center gap-1.5 rounded-xl border px-3 py-2 ${
                isSelected ? 'border-emerald-600 bg-emerald-500' : 'border-slate-200 bg-white active:bg-slate-50'
              }`}
            >
              {isSelected ? <Check size={14} color="#FFFFFF" strokeWidth={2.5} /> : <Tag size={12} color="#64748B" />}
              <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Modal Quick Add Category */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
            <Text className="text-base font-bold text-slate-900">Kategori Baru</Text>
            <Text className="mb-3 text-xs text-slate-500">Tambahkan kategori baru untuk mengelompokkan produk</Text>

            <TextInput
              value={newCatName}
              onChangeText={setNewCatName}
              placeholder="Contoh: Snack, Minuman Dingin..."
              placeholderTextColor="#94A3B8"
              autoFocus
              className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900"
            />

            <View className="flex-row justify-end gap-2">
              <Button
                label="Batal"
                variant="ghost"
                size="sm"
                onPress={() => setShowAddModal(false)}
                disabled={isSaving}
              />
              <Button
                label={isSaving ? 'Menyimpan...' : 'Simpan'}
                variant="primary"
                size="sm"
                onPress={handleCreateCategory}
                disabled={isSaving || !newCatName.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

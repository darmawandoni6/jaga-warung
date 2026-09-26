import { useState } from 'react';

import { Alert, FlatList, KeyboardAvoidingView, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { useRouter } from 'expo-router';
import { ArrowLeft, Edit2, FolderPlus, Tag, Trash2 } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import type { CategoryWithCount } from '@/types/category';

import { useCategories } from '../hooks/useCategories';

export function CategoryManagementScreen() {
  const router = useRouter();
  const { categories, isLoading, addCategory, editCategory, removeCategory } = useCategories();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [editName, setEditName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      Alert.alert('Nama Kosong', 'Silakan masukkan nama kategori.');
      return;
    }

    const exists = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      Alert.alert('Kategori Sudah Ada', `Kategori "${trimmed}" sudah terdaftar.`);
      return;
    }

    setIsAdding(true);
    try {
      await addCategory(trimmed);
      setNewCategoryName('');
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menambahkan kategori.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenEdit = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert('Nama Kosong', 'Nama kategori tidak boleh kosong.');
      return;
    }

    const exists = categories.some(c => c.id !== editingCategory.id && c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      Alert.alert('Kategori Sudah Ada', `Kategori "${trimmed}" sudah terdaftar.`);
      return;
    }

    setIsSavingEdit(true);
    try {
      await editCategory(editingCategory.id, trimmed, editingCategory.name);
      setEditingCategory(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui kategori.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = (category: CategoryWithCount) => {
    const message =
      category.product_count > 0
        ? `Kategori "${category.name}" memiliki ${category.product_count} produk terkait. Jika dihapus, kategori produk tersebut akan dikosongkan.`
        : `Hapus kategori "${category.name}"?`;

    Alert.alert('Hapus Kategori', message, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCategory(category.id, category.name);
          } catch (error) {
            console.error(error);
            Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus kategori.');
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-slate-50" behavior="padding">
      {/* Header */}
      <View className="border-b border-slate-100 bg-white px-4 pb-4 pt-14">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <ArrowLeft size={20} color="#334155" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-900">Kelola Kategori</Text>
            <Text className="text-xs text-slate-500">Atur kelompok menu dan produk warung</Text>
          </View>
        </View>
      </View>

      {/* Quick Add Form */}
      <View className="border-b border-slate-100 bg-white px-4 py-3">
        <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Tambah Kategori Baru
        </Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            placeholder="Contoh: Bumbu Dapur, ATK..."
            placeholderTextColor="#94A3B8"
            onSubmitEditing={handleAddCategory}
            returnKeyType="done"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900"
          />
          <Button
            label={isAdding ? '...' : 'Tambah'}
            variant="primary"
            size="sm"
            onPress={handleAddCategory}
            disabled={isAdding || !newCategoryName.trim()}
          />
        </View>
      </View>

      {/* Category List */}
      {isLoading ? (
        <LoadingScreen message="Memuat kategori..." />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <EmptyState
              title="Belum Ada Kategori"
              subtitle="Tambahkan kategori baru menggunakan formulir di atas."
              icon={<FolderPlus size={36} color="#94A3B8" />}
            />
          }
          renderItem={({ item }) => (
            <Card className="mb-2.5 flex-row items-center justify-between p-3.5">
              <View className="flex-1 flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                  <Tag size={18} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-900">{item.name}</Text>
                  <Text className="text-xs text-slate-500">{item.product_count} produk</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-1.5">
                <Badge
                  label={item.product_count > 0 ? `${item.product_count} Produk` : 'Kosong'}
                  variant={item.product_count > 0 ? 'neutral' : 'warning'}
                />

                {/* Edit Button */}
                <Pressable
                  onPress={() => handleOpenEdit(item)}
                  hitSlop={6}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100 active:bg-slate-200"
                  accessibilityRole="button"
                  accessibilityLabel={`Edit kategori ${item.name}`}
                >
                  <Edit2 size={15} color="#475569" />
                </Pressable>

                {/* Delete Button */}
                <Pressable
                  onPress={() => handleDelete(item)}
                  hitSlop={6}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-red-50 active:bg-red-100"
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus kategori ${item.name}`}
                >
                  <Trash2 size={15} color="#DC2626" />
                </Pressable>
              </View>
            </Card>
          )}
        />
      )}

      {/* Edit Category Modal */}
      <Modal visible={Boolean(editingCategory)} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
            <Text className="text-base font-bold text-slate-900">Ubah Kategori</Text>
            <Text className="mb-3 text-xs text-slate-500">Ubah nama kategori &quot;{editingCategory?.name}&quot;</Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Nama kategori"
              placeholderTextColor="#94A3B8"
              autoFocus
              className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900"
            />

            <View className="flex-row justify-end gap-2">
              <Button
                label="Batal"
                variant="ghost"
                size="sm"
                onPress={() => setEditingCategory(null)}
                disabled={isSavingEdit}
              />
              <Button
                label={isSavingEdit ? 'Menyimpan...' : 'Simpan'}
                variant="primary"
                size="sm"
                onPress={handleSaveEdit}
                disabled={isSavingEdit || !editName.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

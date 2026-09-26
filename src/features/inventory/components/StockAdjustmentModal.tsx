import { useState } from 'react';

import { Alert, KeyboardAvoidingView, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ArrowRight, Sliders, X } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import type { Product } from '@/types/product';

import { useStockManagement } from '../hooks/useStockManagement';

export interface StockAdjustmentModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onSuccess?: (finalStock: number) => void;
}

interface StockAdjustmentFormProps {
  product: Product;
  onClose: () => void;
  onSuccess?: (finalStock: number) => void;
}

const ADJUSTMENT_REASONS = [
  { label: 'Rusak / Bocor', emoji: '🗑️' },
  { label: 'Kedaluwarsa', emoji: '⏳' },
  { label: 'Selisih Opname', emoji: '🔍' },
  { label: 'Dipakai Pribadi', emoji: '🍽️' },
  { label: 'Lainnya', emoji: '📝' },
];

function StockAdjustmentForm({ product, onClose, onSuccess }: StockAdjustmentFormProps) {
  const { adjust, isSubmitting } = useStockManagement();

  const [type, setType] = useState<'adjustment_loss' | 'adjustment_gain'>('adjustment_loss');
  const [quantity, setQuantity] = useState('');
  const [selectedReason, setSelectedReason] = useState(ADJUSTMENT_REASONS[0].label);
  const [customNote, setCustomNote] = useState('');

  const currentStock = product.stock;
  const numQty = parseInt(quantity, 10);
  const validQty = !isNaN(numQty) && numQty > 0 ? numQty : 0;
  const finalStock = type === 'adjustment_loss' ? Math.max(0, currentStock - validQty) : currentStock + validQty;

  const handleSubmit = async () => {
    if (validQty <= 0) {
      Alert.alert('Jumlah Tidak Valid', 'Masukkan jumlah barang minimal 1 pcs.');
      return;
    }

    if (type === 'adjustment_loss' && validQty > currentStock) {
      Alert.alert(
        'Jumlah Melebihi Stok',
        `Stok saat ini hanya ${currentStock} pcs, tidak dapat mengurangi ${validQty} pcs.`,
      );
      return;
    }

    const fullReason = customNote.trim() ? `${selectedReason}: ${customNote.trim()}` : selectedReason;

    try {
      const result = await adjust({
        productBarcode: product.barcode,
        type,
        quantity: validQty,
        reason: fullReason,
      });

      Alert.alert('Penyesuaian Berhasil', `Stok ${product.name} telah disesuaikan menjadi ${result.finalStock} pcs.`);

      onSuccess?.(result.finalStock);
      onClose();
    } catch (error) {
      console.error('Failed to adjust stock', error);
      Alert.alert('Gagal Menyesuaikan Stok', 'Terjadi kesalahan saat memproses penyesuaian.');
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 justify-end bg-black/50" behavior="padding">
      <View className="max-h-[90%] rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-2xl">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between border-b border-slate-100 pb-3">
          <View className="flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <Sliders size={20} color="#D97706" />
            </View>
            <View>
              <Text className="text-base font-bold text-slate-900">Penyesuaian Stok (Opname)</Text>
              <Text className="text-xs text-slate-500" numberOfLines={1}>
                {product.name}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
          >
            <X size={16} color="#475569" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Adjustment Type Switch (Loss vs Gain) */}
          <View className="mb-4 flex-row rounded-xl bg-slate-100 p-1">
            <Pressable
              onPress={() => setType('adjustment_loss')}
              className={`flex-1 items-center justify-center rounded-lg py-2 ${
                type === 'adjustment_loss' ? 'bg-red-500' : 'bg-transparent'
              }`}
            >
              <Text className={`text-xs font-bold ${type === 'adjustment_loss' ? 'text-white' : 'text-slate-600'}`}>
                Kurangi Stok (Rusak/Hilang)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setType('adjustment_gain')}
              className={`flex-1 items-center justify-center rounded-lg py-2 ${
                type === 'adjustment_gain' ? 'bg-emerald-600' : 'bg-transparent'
              }`}
            >
              <Text className={`text-xs font-bold ${type === 'adjustment_gain' ? 'text-white' : 'text-slate-600'}`}>
                Tambah Stok (Kelebihan)
              </Text>
            </Pressable>
          </View>

          {/* Current vs New Stock Banner */}
          <View className="mb-4 flex-row items-center justify-between rounded-xl bg-slate-50 p-3">
            <View>
              <Text className="text-xs text-slate-500">Stok Saat Ini</Text>
              <Text className="text-sm font-bold text-slate-900">{currentStock} pcs</Text>
            </View>
            <ArrowRight size={16} color="#94A3B8" />
            <View className="items-end">
              <Text className="text-xs text-slate-500">Stok Hasil Penyesuaian</Text>
              <Text className={`text-sm font-bold ${finalStock < currentStock ? 'text-red-600' : 'text-emerald-600'}`}>
                {finalStock} pcs
              </Text>
            </View>
          </View>

          {/* Input Quantity */}
          <View className="mb-4">
            <Text className="mb-1 text-sm font-semibold text-slate-700">
              Jumlah {type === 'adjustment_loss' ? 'Pengurangan' : 'Penambahan'} (pcs){' '}
              <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Contoh: 2, 5..."
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              autoFocus
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base text-slate-900"
            />
          </View>

          {/* Reason Selector Chips */}
          <View className="mb-4">
            <Text className="mb-1.5 text-sm font-semibold text-slate-700">Alasan Penyesuaian</Text>
            <View className="flex-row flex-wrap gap-2">
              {ADJUSTMENT_REASONS.map(r => {
                const isSelected = selectedReason === r.label;
                return (
                  <Pressable
                    key={r.label}
                    onPress={() => setSelectedReason(r.label)}
                    className={`flex-row items-center gap-1 rounded-xl border px-3 py-2 ${
                      isSelected ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white active:bg-slate-50'
                    }`}
                  >
                    <Text className="text-xs">{r.emoji}</Text>
                    <Text className={`text-xs font-semibold ${isSelected ? 'text-amber-800' : 'text-slate-700'}`}>
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Custom Note */}
          <View className="mb-5">
            <Text className="mb-1 text-sm font-semibold text-slate-700">Keterangan Tambahan</Text>
            <TextInput
              value={customNote}
              onChangeText={setCustomNote}
              placeholder="Contoh: Dimakan tikus, kardus basah saat hujan..."
              placeholderTextColor="#94A3B8"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900"
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-2.5">
            <Button label="Batal" variant="ghost" className="flex-1" onPress={onClose} disabled={isSubmitting} />
            <Button
              label={isSubmitting ? 'Menyimpan...' : 'Simpan Penyesuaian'}
              variant={type === 'adjustment_loss' ? 'danger' : 'primary'}
              className="flex-2"
              onPress={handleSubmit}
              disabled={isSubmitting || validQty <= 0}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

export function StockAdjustmentModal({ product, visible, onClose, onSuccess }: StockAdjustmentModalProps) {
  if (!product || !visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <StockAdjustmentForm key={product.barcode} product={product} onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}

import { useState } from 'react';

import { Alert, KeyboardAvoidingView, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';

import { ArrowRight, PackagePlus, X } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { PriceText } from '@/components/ui/PriceText';
import type { Product } from '@/types/product';
import { formatRupiah } from '@/utils/currency';

import { useStockManagement } from '../hooks/useStockManagement';

export interface RestockModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onSuccess?: (finalStock: number) => void;
}

interface RestockFormProps {
  product: Product;
  onClose: () => void;
  onSuccess?: (finalStock: number) => void;
}

function RestockForm({ product, onClose, onSuccess }: RestockFormProps) {
  const { restock, isSubmitting } = useStockManagement();

  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState(String(product.buy_price));
  const [recordToCashFlow, setRecordToCashFlow] = useState(true);
  const [note, setNote] = useState('');

  const currentStock = product.stock;
  const numQty = parseInt(quantity, 10);
  const validQty = !isNaN(numQty) && numQty > 0 ? numQty : 0;
  const numPrice = parseFloat(buyPrice);
  const validPrice = !isNaN(numPrice) && numPrice >= 0 ? numPrice : product.buy_price;
  const totalCost = validQty * validPrice;
  const finalStock = currentStock + validQty;

  const handleSubmit = async () => {
    if (validQty <= 0) {
      Alert.alert('Jumlah Tidak Valid', 'Masukkan jumlah barang masuk minimal 1 pcs.');
      return;
    }

    try {
      const result = await restock({
        productId: product.id,
        quantity: validQty,
        buyPrice: validPrice,
        recordToCashFlow,
        note: note.trim() || undefined,
      });

      Alert.alert(
        'Stok Berhasil Ditambahkan',
        `Stok ${product.name} bertambah +${validQty} pcs (total: ${result.finalStock} pcs).${
          recordToCashFlow && totalCost > 0 ? `\nPengeluaran kas tercatat: ${formatRupiah(totalCost)}` : ''
        }`,
      );

      onSuccess?.(result.finalStock);
      onClose();
    } catch (error) {
      console.error('Failed to restock', error);
      Alert.alert('Gagal Menambah Stok', 'Terjadi kesalahan saat memproses stok.');
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 justify-end bg-black/50" behavior="padding">
      <View className="max-h-[90%] rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-2xl">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between border-b border-slate-100 pb-3">
          <View className="flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <PackagePlus size={20} color="#059669" />
            </View>
            <View>
              <Text className="text-base font-bold text-slate-900">Tambah Stok / Kulakan</Text>
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
          {/* Current Stock Banner */}
          <View className="mb-4 flex-row items-center justify-between rounded-xl bg-slate-50 p-3">
            <View>
              <Text className="text-xs text-slate-500">Stok Saat Ini</Text>
              <Text className="text-sm font-bold text-slate-900">{currentStock} pcs</Text>
            </View>
            <ArrowRight size={16} color="#94A3B8" />
            <View className="items-end">
              <Text className="text-xs text-slate-500">Stok Baru</Text>
              <Text className="text-sm font-bold text-emerald-600">{finalStock} pcs</Text>
            </View>
          </View>

          {/* Input Quantity */}
          <View className="mb-4">
            <Text className="mb-1 text-sm font-semibold text-slate-700">
              Jumlah Masuk (+pcs) <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Contoh: 12, 24, 48..."
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              autoFocus
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base text-slate-900"
            />
          </View>

          {/* Input Buy Price */}
          <View className="mb-4">
            <Text className="mb-1 text-sm font-semibold text-slate-700">Harga Modal per Unit (Rp)</Text>
            <TextInput
              value={buyPrice}
              onChangeText={setBuyPrice}
              placeholder="Harga beli"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base text-slate-900"
            />
            <Text className="mt-1 text-[11px] text-slate-400">
              Harga modal default: {formatRupiah(product.buy_price)}
            </Text>
          </View>

          {/* Total Cost Card */}
          {validQty > 0 && (
            <View className="mb-4 flex-row items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
              <View>
                <Text className="text-xs font-medium text-emerald-800">Total Biaya Kulakan</Text>
                <Text className="text-[11px] text-emerald-600">
                  {validQty} pcs × {formatRupiah(validPrice)}
                </Text>
              </View>
              <PriceText amount={totalCost} size="lg" color="success" bold />
            </View>
          )}

          {/* Cash Flow Switch */}
          <View className="mb-4 flex-row items-center justify-between rounded-xl border border-slate-100 bg-white p-3">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-semibold text-slate-800">Catat ke Pengeluaran Kas</Text>
              <Text className="text-xs text-slate-500">
                Otomatis mencatat {formatRupiah(totalCost)} sebagai pengeluaran di menu Kas.
              </Text>
            </View>
            <Switch
              value={recordToCashFlow}
              onValueChange={setRecordToCashFlow}
              trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Note Input */}
          <View className="mb-5">
            <Text className="mb-1 text-sm font-semibold text-slate-700">Catatan (Opsional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Contoh: Kulakan Grosir Jaya, Faktur #123..."
              placeholderTextColor="#94A3B8"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900"
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-2.5">
            <Button label="Batal" variant="ghost" className="flex-1" onPress={onClose} disabled={isSubmitting} />
            <Button
              label={isSubmitting ? 'Menyimpan...' : 'Simpan Stok'}
              variant="primary"
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

export function RestockModal({ product, visible, onClose, onSuccess }: RestockModalProps) {
  if (!product || !visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <RestockForm key={product.id} product={product} onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}

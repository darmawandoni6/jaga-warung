import { useState } from 'react';

import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { X } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { Debt } from '@/types/debt';
import { formatRupiah } from '@/utils/currency';

export interface DebtPaymentModalProps {
  debt: Debt | null;
  onClose: () => void;
  onConfirm: (amount: number, note?: string) => Promise<void>;
}

export function DebtPaymentModal({ debt, onClose, onConfirm }: DebtPaymentModalProps) {
  const [amountText, setAmountText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!debt) return null;

  const remaining = Math.max(0, debt.total_debt - debt.paid_amount);
  const amount = parseInt(amountText.replace(/[^0-9]/g, ''), 10);
  const paymentAmount = isNaN(amount) ? 0 : amount;
  const isValid = paymentAmount > 0 && paymentAmount <= remaining;

  const handleClose = () => {
    setAmountText('');
    setNoteText('');
    setIsSaving(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    try {
      await onConfirm(paymentAmount, noteText.trim() || undefined);
      setAmountText('');
      setNoteText('');
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Pembayaran gagal disimpan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleClose}>
      <View className="flex-1 items-center justify-center bg-slate-900/50 px-6">
        <Card className="w-full p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900">Bayar Utang</Text>
              <Text className="text-xs text-slate-500">{debt.customer_name}</Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} className="rounded-full p-1.5 active:bg-slate-100">
              <X size={18} color="#64748B" />
            </Pressable>
          </View>

          <View className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-2.5">
            <Text className="text-xs font-medium text-amber-800">Sisa Utang</Text>
            <PriceText amount={remaining} size="lg" color="warning" />
          </View>

          <Text className="mb-1.5 text-sm font-semibold text-slate-700">
            Jumlah Pembayaran <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <Text className="mr-2 text-base font-bold text-slate-500">Rp</Text>
            <TextInput
              value={amountText}
              onChangeText={setAmountText}
              placeholder="0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              className="flex-1 p-0 text-base font-bold text-slate-900"
            />
          </View>

          <View className="mt-3 flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => setAmountText(String(remaining))}
              className="rounded-lg bg-emerald-50 px-3 py-1.5 active:bg-emerald-100"
            >
              <Text className="text-xs font-semibold text-emerald-700">Lunas {formatRupiah(remaining)}</Text>
            </Pressable>
            {remaining > 10000 && (
              <Pressable
                onPress={() => setAmountText(String(Math.floor(remaining / 2 / 1000) * 1000))}
                className="rounded-lg bg-slate-100 px-3 py-1.5 active:bg-slate-200"
              >
                <Text className="text-xs font-semibold text-slate-700">50%</Text>
              </Pressable>
            )}
          </View>

          {paymentAmount > remaining && <Text className="mt-2 text-xs text-red-500">Jumlah melebihi sisa utang</Text>}

          {/* Optional Note */}
          <Text className="mb-1.5 mt-3 text-sm font-semibold text-slate-700">Catatan (opsional)</Text>
          <View className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Contoh: Titip lewat anak, transfer..."
              placeholderTextColor="#94A3B8"
              className="p-0 text-sm text-slate-900"
            />
          </View>

          <View className="mt-5 gap-2">
            <Button
              label="Simpan Pembayaran"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isValid}
              loading={isSaving}
              onPress={handleConfirm}
            />
            <Button label="Batal" variant="ghost" size="md" fullWidth onPress={handleClose} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

import { useState } from 'react';

import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { X } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { CreateCashFlowData } from '@/db/repositories/cashFlowRepository';
import type { CashFlowType } from '@/types/cash-flow';
import { formatRupiah } from '@/utils/currency';

export interface CashFlowFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateCashFlowData) => Promise<void>;
}

function getToday(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const TYPE_TABS: { key: CashFlowType; label: string; activeClass: string }[] = [
  { key: 'income', label: 'Kas Masuk', activeClass: 'bg-emerald-500' },
  { key: 'expense', label: 'Kas Keluar', activeClass: 'bg-red-500' },
];

export function CashFlowFormModal({ visible, onClose, onSave }: CashFlowFormModalProps) {
  const [type, setType] = useState<CashFlowType>('income');
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const amount = parseInt(amountText.replace(/[^0-9]/g, ''), 10);
  const amountValue = isNaN(amount) ? 0 : amount;
  const isValid = amountValue > 0 && note.trim().length > 0;

  const handleClose = () => {
    setType('income');
    setAmountText('');
    setNote('');
    setIsSaving(false);
    onClose();
  };

  const handleSave = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    try {
      await onSave({
        type,
        amount: amountValue,
        note: note.trim(),
        date: getToday(),
      });
      handleClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal Menyimpan', 'Transaksi kas gagal disimpan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={handleClose}>
      <View className="flex-1 items-center justify-center bg-slate-900/50 px-6">
        <Card className="w-full p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900">Catat Arus Kas</Text>
            <Pressable onPress={handleClose} hitSlop={8} className="rounded-full p-1.5 active:bg-slate-100">
              <X size={18} color="#64748B" />
            </Pressable>
          </View>

          {/* Type Toggle */}
          <View className="mb-4 flex-row gap-2">
            {TYPE_TABS.map(tab => {
              const isActive = type === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setType(tab.key)}
                  className={`flex-1 rounded-lg py-2 ${
                    isActive ? tab.activeClass : 'bg-slate-100 active:bg-slate-200'
                  }`}
                >
                  <Text className={`text-center text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-600'}`}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Amount */}
          <Text className="mb-1.5 text-sm font-semibold text-slate-700">
            Nominal <Text className="text-red-500">*</Text>
          </Text>
          <View className="mb-4 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
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
          {amountValue > 0 && (
            <View className="mb-4 rounded-lg bg-slate-50 px-3 py-2">
              <Text className="text-xs text-slate-500">{formatRupiah(amountValue)}</Text>
            </View>
          )}

          {/* Note */}
          <Text className="mb-1.5 text-sm font-semibold text-slate-700">
            Keterangan <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={type === 'income' ? 'Contoh: Hasil penjualan sore' : 'Contoh: Kulakan gas LPG'}
            placeholderTextColor="#94A3B8"
            className="mb-1 h-16 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"
            multiline
            textAlignVertical="top"
          />
          {note.trim().length === 0 && note.length > 0 && (
            <Text className="mb-3 text-xs text-red-500">Keterangan wajib diisi</Text>
          )}

          <View className="mt-4 gap-2">
            <Button
              label="Simpan"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isValid}
              loading={isSaving}
              onPress={handleSave}
            />
            <Button label="Batal" variant="ghost" size="md" fullWidth onPress={handleClose} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

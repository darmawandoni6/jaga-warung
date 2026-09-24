import { useMemo, useState } from 'react';

import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, Printer } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import { saveTransaction } from '@/db/repositories/transactionRepository';
import { useAppStore } from '@/store/useAppStore';
import { useCartStore } from '@/store/useCartStore';
import { formatRupiah } from '@/utils/currency';

export interface CheckoutSheetProps {
  onSuccess?: () => void;
}

export function CheckoutSheet({ onSuccess }: CheckoutSheetProps) {
  const router = useRouter();
  const db = useSQLiteContext();
  const items = useCartStore(s => s.items);
  const totalPrice = useCartStore(s => s.totalPrice());
  const clearCart = useCartStore(s => s.clearCart);
  const isPrinterEnabled = useAppStore(s => s.isPrinterEnabled);

  const [paymentText, setPaymentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const paymentAmount = useMemo(() => {
    const numeric = parseInt(paymentText.replace(/[^0-9]/g, ''), 10);
    return isNaN(numeric) ? 0 : numeric;
  }, [paymentText]);

  const changeAmount = paymentAmount - totalPrice;
  const isSufficient = paymentAmount >= totalPrice && totalPrice > 0;

  const quickAmounts = useMemo(() => {
    const list: number[] = [totalPrice];
    const denominations = [10000, 20000, 50000, 100000];
    for (const d of denominations) {
      if (d > totalPrice && !list.includes(d)) {
        list.push(d);
      }
    }
    return list.slice(0, 4);
  }, [totalPrice]);

  const handleConfirm = async () => {
    if (!isSufficient || isSaving) return;

    const change = changeAmount;

    setIsSaving(true);
    try {
      await saveTransaction(db, {
        transaction: {
          total_amount: totalPrice,
          payment_amount: paymentAmount,
          change_amount: change,
        },
        items: items.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          sell_price: item.product.sell_price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      });

      clearCart();

      Alert.alert('Transaksi Berhasil', `Kembalian: ${formatRupiah(change)}`, [
        {
          text: 'Selesai',
          onPress: () => {
            if (onSuccess) {
              onSuccess();
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Transaksi Gagal', 'Data tidak tersimpan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-4 pb-3 pt-14">
        <Pressable onPress={() => router.back()} className="rounded-full p-2 active:bg-slate-100" hitSlop={8}>
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-900">Pembayaran Kasir</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Total Bill Card */}
        <Card className="mb-4 items-center p-5">
          <Text className="text-xs font-medium text-slate-500">Total Tagihan</Text>
          <PriceText amount={totalPrice} size="xl" color="default" bold className="mt-1 text-2xl" />
        </Card>

        {/* Order Items Summary */}
        <Card className="mb-4 p-4">
          <Text className="mb-2 text-xs font-semibold uppercase text-slate-400">Rincian Barang</Text>
          {items.map(item => (
            <View key={item.product.id} className="flex-row items-center justify-between border-b border-slate-50 py-2">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-medium text-slate-800" numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text className="text-xs text-slate-400">
                  {item.quantity} x {formatRupiah(item.product.sell_price)}
                </Text>
              </View>
              <PriceText amount={item.subtotal} size="sm" color="default" bold />
            </View>
          ))}
        </Card>

        {/* Payment Amount Input */}
        <Card className="mb-4 p-4">
          <Text className="mb-2 text-xs font-semibold uppercase text-slate-400">Uang Diterima</Text>
          <View className="flex-row items-center rounded-xl bg-slate-100 px-3 py-2.5">
            <Text className="mr-2 text-base font-bold text-slate-500">Rp</Text>
            <TextInput
              className="flex-1 p-0 text-lg font-bold text-slate-900"
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
              value={paymentText}
              onChangeText={setPaymentText}
            />
          </View>

          {/* Quick Amount Chips */}
          <View className="mt-3 flex-row flex-wrap gap-2">
            {quickAmounts.map(amt => (
              <Pressable
                key={amt}
                onPress={() => setPaymentText(String(amt))}
                className="rounded-lg bg-slate-100 px-3 py-1.5 active:bg-slate-200"
              >
                <Text className="text-xs font-semibold text-slate-700">
                  {amt === totalPrice ? 'Uang Pas' : formatRupiah(amt)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Change / Deficiency Calculation */}
        <Card className="mb-6 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-slate-600">{changeAmount >= 0 ? 'Kembalian' : 'Kekurangan'}</Text>
            {changeAmount >= 0 ? (
              <PriceText amount={changeAmount} size="lg" color="success" bold />
            ) : (
              <PriceText amount={Math.abs(changeAmount)} size="lg" color="danger" bold />
            )}
          </View>
        </Card>
      </ScrollView>

      {/* Footer Action Buttons */}
      <View className="border-t border-slate-200 bg-white p-4 pb-8">
        <Button
          label={isSaving ? 'Menyimpan...' : 'Konfirmasi Transaksi'}
          onPress={handleConfirm}
          variant="primary"
          size="lg"
          disabled={!isSufficient || isSaving}
          fullWidth
        />
        {isPrinterEnabled && (
          <Button
            label="Cetak Struk"
            onPress={handleConfirm}
            variant="secondary"
            size="md"
            icon={<Printer size={16} color="#475569" />}
            disabled={!isSufficient || isSaving}
            fullWidth
            className="mt-2"
          />
        )}
        <Button label="Batal" onPress={() => router.back()} variant="ghost" size="md" fullWidth className="mt-2" />
      </View>
    </View>
  );
}

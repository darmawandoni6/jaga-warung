import { useState } from 'react';

import { Alert, Text, View } from 'react-native';

import { useSQLiteContext } from 'expo-sqlite';
import { Database, RefreshCw, Trash2 } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createDebt } from '@/db/repositories/debtRepository';
import { createProduct } from '@/db/repositories/productRepository';
import { deleteAllTransactions } from '@/db/repositories/transactionRepository';
import { MOCK_DEBTS } from '@/mocks/debts';
import { MOCK_PRODUCTS } from '@/mocks/products';

export function DatabaseActionsCard() {
  const db = useSQLiteContext();
  const [isBusy, setIsBusy] = useState(false);

  const handleResetData = () => {
    Alert.alert(
      'Konfirmasi Hapus Data',
      'Apakah Anda yakin ingin menghapus semua riwayat transaksi? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Hapus',
          style: 'destructive',
          onPress: async () => {
            setIsBusy(true);
            try {
              await db.withTransactionAsync(async () => {
                await deleteAllTransactions(db);
              });
              Alert.alert('Sukses', 'Riwayat transaksi telah direset.');
            } catch (error) {
              console.error(error);
              Alert.alert('Gagal', 'Reset gagal. Silakan coba lagi.');
            } finally {
              setIsBusy(false);
            }
          },
        },
      ],
    );
  };

  const handleSeedDemo = () => {
    Alert.alert('Muat Data Contoh', 'Data contoh produk dan utang pelanggan akan dimuat ke aplikasi.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Muat Data',
        onPress: async () => {
          setIsBusy(true);
          try {
            await db.withTransactionAsync(async () => {
              for (const product of MOCK_PRODUCTS) {
                await createProduct(db, {
                  name: product.name,
                  buy_price: product.buy_price,
                  sell_price: product.sell_price,
                  stock: product.stock,
                  min_stock: product.min_stock,
                  barcode: product.barcode ?? null,
                  type: product.type ?? null,
                  image: product.image ?? null,
                });
              }
              for (const debt of MOCK_DEBTS) {
                await createDebt(db, {
                  customer_name: debt.customer_name,
                  phone: debt.phone,
                  total_debt: debt.total_debt,
                  paid_amount: debt.paid_amount,
                  status: debt.status,
                  note: debt.note,
                });
              }
            });
            Alert.alert('Sukses', 'Data contoh berhasil dimuat ulang.');
          } catch (error) {
            console.error(error);
            Alert.alert('Gagal', 'Muat data contoh gagal. Silakan coba lagi.');
          } finally {
            setIsBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <Card className="border border-slate-100 bg-white p-4">
      {/* Header */}
      <View className="mb-2 flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-slate-100">
          <Database size={15} color="#475569" />
        </View>
        <Text className="text-sm font-bold text-slate-800">Manajemen Database</Text>
      </View>

      <Text className="mb-3.5 text-xs text-slate-500">
        Kelola penyimpanan data lokal atau muat data simulasi untuk keperluan uji coba.
      </Text>

      {/* Buttons */}
      <View className="space-y-2">
        <Button
          variant="secondary"
          label={isBusy ? 'Memproses...' : 'Muat Ulang Data Contoh'}
          icon={<RefreshCw size={15} color="#475569" />}
          onPress={handleSeedDemo}
          size="sm"
          disabled={isBusy}
        />

        <Button
          variant="danger"
          label="Reset Riwayat Transaksi"
          icon={<Trash2 size={15} color="#FFFFFF" />}
          onPress={handleResetData}
          size="sm"
          disabled={isBusy}
        />
      </View>
    </Card>
  );
}

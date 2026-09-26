import { useState } from 'react';

import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, CheckCircle2, TrendingUp } from 'lucide-react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import { createProduct, updateProduct } from '@/db/repositories/productRepository';
import type { Product } from '@/types/product';
import { formatRupiah } from '@/utils/currency';

import { CategorySelector } from './CategorySelector';

export const productSchema = z
  .object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters'),
    type: z.string().trim().optional(),
    buy_price: z
      .string()
      .trim()
      .min(1, 'Buy price is required')
      .refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Buy price must be at least 0'),
    sell_price: z
      .string()
      .trim()
      .min(1, 'Sell price is required')
      .refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Sell price must be at least 0'),
    stock: z
      .string()
      .trim()
      .min(1, 'Stock is required')
      .refine(
        val => !isNaN(Number(val)) && Number.isInteger(Number(val)) && Number(val) >= 0,
        'Stock must be an integer ≥ 0',
      ),
    min_stock: z
      .string()
      .trim()
      .min(1, 'Minimum stock is required')
      .refine(
        val => !isNaN(Number(val)) && Number.isInteger(Number(val)) && Number(val) >= 0,
        'Minimum stock must be an integer ≥ 0',
      ),
  })
  .refine(
    data => {
      const buy = Number(data.buy_price);
      const sell = Number(data.sell_price);
      if (isNaN(buy) || isNaN(sell)) return true;
      return sell > buy;
    },
    {
      message: 'Sell price must be greater than buy price',
      path: ['sell_price'],
    },
  );

export type ProductFormValues = z.infer<typeof productSchema>;

export interface ProductSubmitData {
  name: string;
  type?: string | null;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
}

export interface ProductFormProps {
  initialProduct?: Product;
  onSubmitSuccess?: (data: ProductSubmitData) => void;
}

export function ProductForm({ initialProduct, onSubmitSuccess }: ProductFormProps) {
  const router = useRouter();
  const db = useSQLiteContext();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onBlur',
    defaultValues: initialProduct
      ? {
          name: initialProduct.name,
          type: initialProduct.type ?? '',
          buy_price: String(initialProduct.buy_price),
          sell_price: String(initialProduct.sell_price),
          stock: String(initialProduct.stock),
          min_stock: String(initialProduct.min_stock),
        }
      : {
          name: '',
          type: '',
          buy_price: '',
          sell_price: '',
          stock: '',
          min_stock: '5',
        },
  });

  const watchBuy = useWatch({ control, name: 'buy_price' });
  const watchSell = useWatch({ control, name: 'sell_price' });

  const buyNum = Number(watchBuy);
  const sellNum = Number(watchSell);
  const hasValidProfit = !isNaN(buyNum) && !isNaN(sellNum) && sellNum > buyNum && buyNum >= 0;
  const profit = hasValidProfit ? sellNum - buyNum : 0;
  const marginPercent = hasValidProfit && sellNum > 0 ? Math.round((profit / sellNum) * 100) : 0;

  const onSubmit = async (values: ProductFormValues) => {
    if (isSaving) return;

    const formattedData: ProductSubmitData = {
      name: values.name.trim(),
      type: values.type?.trim() || null,
      buy_price: Number(values.buy_price),
      sell_price: Number(values.sell_price),
      stock: Number(values.stock),
      min_stock: Number(values.min_stock),
    };

    setIsSaving(true);
    try {
      if (initialProduct) {
        await updateProduct(db, initialProduct.id, formattedData);
      } else {
        await createProduct(db, { ...formattedData, barcode: null, image: null });
      }
      setIsSubmitted(true);

      Alert.alert(
        initialProduct ? 'Produk Diperbarui' : 'Produk Ditambahkan',
        `Nama: ${formattedData.name}\nHarga Beli: ${formatRupiah(formattedData.buy_price)}\nHarga Jual: ${formatRupiah(formattedData.sell_price)}\nStok: ${formattedData.stock} pcs`,
        [
          {
            text: 'Selesai',
            onPress: () => {
              onSubmitSuccess?.(formattedData);
              router.back();
            },
          },
        ],
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan produk. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const isEditMode = Boolean(initialProduct);

  return (
    <KeyboardAvoidingView className="flex-1 bg-slate-50" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-4 pb-4 pt-14">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
          >
            <ArrowLeft size={20} color="#334155" />
          </Pressable>
          <View>
            <Text className="text-lg font-bold text-slate-900">
              {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
            </Text>
            <Text className="text-xs text-slate-500">
              {isEditMode ? 'Perbarui informasi barang' : 'Masukkan detail barang baru'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Card className="mb-4 p-4">
          {/* Product Name */}
          <View className="mb-4">
            <Text className="mb-1 text-sm font-semibold text-slate-700">
              Nama Produk <Text className="text-red-500">*</Text>
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Contoh: Indomie Goreng Spesial"
                  placeholderTextColor="#94A3B8"
                  className={`rounded-xl border bg-slate-50 px-3.5 py-3 text-base text-slate-900 ${
                    errors.name ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
              )}
            />
            {errors.name && <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>}
          </View>

          {/* Category Selector */}
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <CategorySelector selectedCategory={value} onSelectCategory={onChange} />
            )}
          />

          {/* Price Section */}
          <View className="mb-4 flex-row gap-3">
            {/* Buy Price */}
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-slate-700">
                Harga Modal (Beli) <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="buy_price"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Contoh: 2500"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    className={`rounded-xl border bg-slate-50 px-3.5 py-3 text-base text-slate-900 ${
                      errors.buy_price ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                )}
              />
              {errors.buy_price && <Text className="mt-1 text-xs text-red-500">{errors.buy_price.message}</Text>}
            </View>

            {/* Sell Price */}
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-slate-700">
                Harga Jual <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="sell_price"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Contoh: 3000"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    className={`rounded-xl border bg-slate-50 px-3.5 py-3 text-base text-slate-900 ${
                      errors.sell_price ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                )}
              />
              {errors.sell_price && <Text className="mt-1 text-xs text-red-500">{errors.sell_price.message}</Text>}
            </View>
          </View>

          {/* Profit Preview Callout */}
          {hasValidProfit && (
            <View className="mb-4 flex-row items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2.5">
              <View className="flex-row items-center gap-2">
                <TrendingUp size={16} color="#059669" />
                <Text className="text-xs font-semibold text-emerald-800">Estimasi Margin (+{marginPercent}%):</Text>
              </View>
              <PriceText amount={profit} size="sm" color="success" />
            </View>
          )}

          {/* Stock Section */}
          <View className="flex-row gap-3">
            {/* Initial Stock */}
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-slate-700">
                Jumlah Stok <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="stock"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Contoh: 20"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    className={`rounded-xl border bg-slate-50 px-3.5 py-3 text-base text-slate-900 ${
                      errors.stock ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                )}
              />
              {errors.stock && <Text className="mt-1 text-xs text-red-500">{errors.stock.message}</Text>}
            </View>

            {/* Minimum Stock */}
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-slate-700">
                Stok Minimum <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="min_stock"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Contoh: 5"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    className={`rounded-xl border bg-slate-50 px-3.5 py-3 text-base text-slate-900 ${
                      errors.min_stock ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                )}
              />
              {errors.min_stock && <Text className="mt-1 text-xs text-red-500">{errors.min_stock.message}</Text>}
            </View>
          </View>
          <Text className="mt-1.5 text-xs text-slate-400">
            Peringatan stok menipis otomatis aktif jika stok ≤ batas minimum.
          </Text>
        </Card>

        {/* Action Buttons */}
        <View className="gap-2.5">
          <Button
            label={isSaving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Produk'}
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSaving}
            icon={isSubmitted ? <CheckCircle2 size={20} color="#FFFFFF" /> : undefined}
            onPress={handleSubmit(onSubmit)}
          />
          <Button label="Batal" variant="ghost" size="md" fullWidth onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

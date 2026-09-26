import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import { createDebt } from '@/db/repositories/debtRepository';
import { formatRupiah } from '@/utils/currency';

export const debtSchema = z.object({
  customer_name: z.string().trim().min(2, 'Nama pelanggan minimal 2 karakter'),
  phone: z.string().trim().optional(),
  amount: z
    .string()
    .trim()
    .min(1, 'Jumlah utang wajib diisi')
    .refine(val => !isNaN(Number(val)) && Number(val) >= 1000, 'Jumlah utang minimal Rp 1.000'),
  note: z.string().trim().optional(),
});

export type DebtFormValues = z.infer<typeof debtSchema>;

export interface DebtSubmitData {
  customer_name: string;
  phone: string | null;
  amount: number;
  note: string | null;
}

export interface DebtFormProps {
  onSuccess?: (data: DebtSubmitData) => void;
}

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

export function DebtForm({ onSuccess }: DebtFormProps) {
  const router = useRouter();
  const db = useSQLiteContext();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    mode: 'onBlur',
    defaultValues: {
      customer_name: '',
      phone: '',
      amount: '',
      note: '',
    },
  });

  const watchAmount = useWatch({ control, name: 'amount' });
  const amountNum = Number(watchAmount);
  const isValidAmount = !isNaN(amountNum) && amountNum >= 1000;

  const handleQuickAddAmount = (addValue: number) => {
    const current = isNaN(amountNum) ? 0 : amountNum;
    setValue('amount', String(current + addValue), { shouldValidate: true });
  };

  const onSubmit = async (values: DebtFormValues) => {
    const formattedData: DebtSubmitData = {
      customer_name: values.customer_name.trim(),
      phone: values.phone && values.phone.trim().length > 0 ? values.phone.trim() : null,
      amount: Number(values.amount),
      note: values.note && values.note.trim().length > 0 ? values.note.trim() : null,
    };

    try {
      await createDebt(db, {
        customer_name: formattedData.customer_name,
        phone: formattedData.phone,
        total_debt: formattedData.amount,
        note: formattedData.note,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan utang. Silakan coba lagi.');
      return;
    }

    Alert.alert(
      'Catatan Utang Berhasil Disimpan',
      `Nama: ${formattedData.customer_name}\nJumlah: ${formatRupiah(formattedData.amount)}${
        formattedData.note ? `\nCatatan: ${formattedData.note}` : ''
      }`,
      [
        {
          text: 'Selesai',
          onPress: () => {
            onSuccess?.(formattedData);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-slate-50" behavior="padding">
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
            <Text className="text-lg font-bold text-slate-900">Catat Utang Baru</Text>
            <Text className="text-xs text-slate-500">Tambah data piutang pelanggan warung</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Card className="mb-4 p-4">
          {/* Customer Name */}
          <View className="mb-4">
            <Text className="mb-1 text-sm font-semibold text-slate-700">
              Nama Pelanggan <Text className="text-red-500">*</Text>
            </Text>
            <Controller
              control={control}
              name="customer_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Contoh: Pak Budi (Bengkel)"
                  placeholderTextColor="#94A3B8"
                  className={`rounded-xl border bg-slate-50 px-3.5 py-3 text-base text-slate-900 ${
                    errors.customer_name ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
              )}
            />
            {errors.customer_name && <Text className="mt-1 text-xs text-red-500">{errors.customer_name.message}</Text>}
          </View>

          {/* Phone Number */}
          <View className="mb-4">
            <Text className="mb-1 text-sm font-semibold text-slate-700">
              Nomor WhatsApp / HP <Text className="text-xs font-normal text-slate-400">(Opsional)</Text>
            </Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Contoh: 081234567890"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-base text-slate-900"
                />
              )}
            />
          </View>

          {/* Debt Amount */}
          <View className="mb-4">
            <Text className="mb-1 text-sm font-semibold text-slate-700">
              Nominal Utang <Text className="text-red-500">*</Text>
            </Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Contoh: 25000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  className={`rounded-xl border bg-slate-50 px-3.5 py-3 text-base text-slate-900 ${
                    errors.amount ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
              )}
            />
            {errors.amount && <Text className="mt-1 text-xs text-red-500">{errors.amount.message}</Text>}

            {/* Quick Amount Buttons */}
            <View className="mt-2.5 flex-row flex-wrap gap-2">
              {QUICK_AMOUNTS.map(amt => (
                <Pressable
                  key={amt}
                  onPress={() => handleQuickAddAmount(amt)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 active:bg-slate-100"
                >
                  <Text className="text-xs font-medium text-slate-700">+{formatRupiah(amt)}</Text>
                </Pressable>
              ))}
            </View>

            {/* Amount Preview Callout */}
            {isValidAmount && (
              <View className="mt-3 flex-row items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-2.5">
                <Text className="text-xs font-semibold text-amber-800">Total Dicatat:</Text>
                <PriceText amount={amountNum} size="md" color="warning" />
              </View>
            )}
          </View>

          {/* Notes */}
          <View>
            <Text className="mb-1 text-sm font-semibold text-slate-700">
              Catatan Barang / Keterangan <Text className="text-xs font-normal text-slate-400">(Opsional)</Text>
            </Text>
            <Controller
              control={control}
              name="note"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Contoh: Ambil rokok Surya 1 bks & beras 2kg"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="h-20 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"
                />
              )}
            />
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="gap-2.5">
          <Button
            label="Simpan Catatan Utang"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            icon={<UserPlus size={18} color="#FFFFFF" />}
            onPress={handleSubmit(onSubmit)}
          />
          <Button label="Batal" variant="ghost" size="md" fullWidth onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

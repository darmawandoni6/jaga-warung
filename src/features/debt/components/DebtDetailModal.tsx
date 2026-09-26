import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Calendar, CheckCircle2, Clock, Phone, User, Wallet, X } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { Debt, DebtStatus } from '@/types/debt';
import { formatRupiah } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';

import { useDebtPayments } from '../hooks/useDebtPayments';

export interface DebtDetailModalProps {
  debt: Debt | null;
  visible: boolean;
  onClose: () => void;
  onPay: (debt: Debt) => void;
}

interface StatusConfig {
  label: string;
  variant: 'warning' | 'info' | 'success' | 'danger';
}

const STATUS_CONFIG: Record<DebtStatus, StatusConfig> = {
  active: { label: 'Belum Lunas', variant: 'warning' },
  partial: { label: 'Cicilan Sebagian', variant: 'info' },
  paid: { label: 'Lunas', variant: 'success' },
  bad_debt: { label: 'Macet', variant: 'danger' },
};

export function DebtDetailModal({ debt, visible, onClose, onPay }: DebtDetailModalProps) {
  const { payments, isLoading } = useDebtPayments(debt?.id ?? null);

  if (!debt || !visible) return null;

  const remaining = Math.max(0, debt.total_debt - debt.paid_amount);
  const statusMeta = STATUS_CONFIG[debt.status];
  const progressPercent =
    debt.total_debt > 0 ? Math.min(100, Math.round((debt.paid_amount / debt.total_debt) * 100)) : 0;
  const isPaid = debt.status === 'paid' || remaining <= 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-slate-900/50 px-5 py-10">
        <Card className="max-h-[90%] w-full p-5">
          {/* Header */}
          <View className="mb-4 flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <User size={18} color="#059669" />
                <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
                  {debt.customer_name}
                </Text>
              </View>
              {debt.phone && (
                <View className="mt-1 flex-row items-center gap-1">
                  <Phone size={13} color="#64748B" />
                  <Text className="text-xs text-slate-500">{debt.phone}</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              <Badge label={statusMeta.label} variant={statusMeta.variant} />
              <Pressable onPress={onClose} hitSlop={8} className="rounded-full p-1 active:bg-slate-100">
                <X size={20} color="#64748B" />
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-grow-0">
            {/* Debt Progress & Financial Summary */}
            <View className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-slate-500">Total Utang</Text>
                <PriceText amount={debt.total_debt} size="md" color="default" bold />
              </View>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-slate-500">Sudah Dibayar</Text>
                <PriceText amount={debt.paid_amount} size="md" color="success" bold />
              </View>
              <View className="mb-3 flex-row items-center justify-between border-t border-slate-200/80 pt-2">
                <Text className="text-xs font-bold text-slate-700">Sisa Tagihan</Text>
                <PriceText amount={remaining} size="lg" color={isPaid ? 'muted' : 'warning'} bold />
              </View>

              {/* Progress Bar */}
              <View className="mt-1">
                <View className="mb-1 flex-row justify-between">
                  <Text className="text-[11px] text-slate-500">Pelunasan</Text>
                  <Text className="text-[11px] font-bold text-emerald-700">{progressPercent}%</Text>
                </View>
                <View className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <View className="h-full rounded-full bg-emerald-500" style={{ width: `${progressPercent}%` }} />
                </View>
              </View>
            </View>

            {/* Note if provided */}
            {debt.note && (
              <View className="mb-4 rounded-xl border border-slate-100 bg-white p-3">
                <Text className="text-[11px] font-semibold text-slate-400">Catatan Utang Awal:</Text>
                <Text className="mt-0.5 text-xs text-slate-700">{debt.note}</Text>
              </View>
            )}

            {/* Payment History Log Section */}
            <View className="mb-2">
              <View className="mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <Clock size={15} color="#059669" />
                  <Text className="text-sm font-bold text-slate-900">Riwayat Pembayaran</Text>
                </View>
                <Text className="text-xs text-slate-500">{payments.length} transaksi</Text>
              </View>

              {isLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator size="small" color="#059669" />
                  <Text className="mt-2 text-xs text-slate-400">Memuat riwayat...</Text>
                </View>
              ) : payments.length === 0 ? (
                <View className="items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
                  {debt.paid_amount > 0 ? (
                    <>
                      <CheckCircle2 size={22} color="#10B981" />
                      <Text className="mt-1.5 text-center text-xs font-semibold text-slate-700">
                        Total terbayar: {formatRupiah(debt.paid_amount)}
                      </Text>
                      <Text className="mt-0.5 text-center text-[11px] text-slate-400">
                        (Pembayaran tercatat sebelum sistem log riwayat aktif)
                      </Text>
                    </>
                  ) : (
                    <>
                      <Wallet size={22} color="#94A3B8" />
                      <Text className="mt-1 text-xs text-slate-500">Belum ada pembayaran dicatat</Text>
                    </>
                  )}
                </View>
              ) : (
                <View className="gap-2">
                  {payments.map(item => (
                    <View key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1">
                          <Calendar size={12} color="#64748B" />
                          <Text className="text-xs font-medium text-slate-500">{formatDateTime(item.created_at)}</Text>
                        </View>
                        <PriceText amount={item.amount} size="sm" color="success" bold />
                      </View>
                      {item.note && <Text className="mt-1 text-xs text-slate-600">{item.note}</Text>}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="mt-4 gap-2 pt-2">
            {!isPaid && (
              <Button
                label="Bayar Cicilan"
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => {
                  onPay(debt);
                }}
              />
            )}
            <Button label="Tutup" variant="ghost" size="md" fullWidth onPress={onClose} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

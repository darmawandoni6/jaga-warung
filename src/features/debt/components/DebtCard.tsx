import { Pressable, Text, View } from 'react-native';

import { Calendar, Phone, User, Wallet } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { Debt, DebtStatus } from '@/types/debt';
import { formatRupiah } from '@/utils/currency';
import { formatDate } from '@/utils/date';

export interface DebtCardProps {
  debt: Debt;
  onPress?: (debt: Debt) => void;
  onPay?: (debt: Debt) => void;
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

export function DebtCard({ debt, onPress, onPay }: DebtCardProps) {
  const remainingDebt = Math.max(0, debt.total_debt - debt.paid_amount);
  const statusMeta = STATUS_CONFIG[debt.status];

  const priceColor = debt.status === 'paid' ? 'muted' : debt.status === 'bad_debt' ? 'danger' : 'warning';

  return (
    <Card className="mb-3 p-4">
      <Pressable onPress={() => onPress?.(debt)}>
        {/* Top Header: Customer Name & Status Badge */}
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <User size={16} color="#475569" />
              <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                {debt.customer_name}
              </Text>
            </View>
            {debt.phone ? (
              <View className="mt-1 flex-row items-center gap-1">
                <Phone size={13} color="#64748B" />
                <Text className="text-xs text-slate-500">{debt.phone}</Text>
              </View>
            ) : null}
          </View>
          <Badge label={statusMeta.label} variant={statusMeta.variant} />
        </View>

        {/* Note if available */}
        {debt.note ? (
          <View className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2">
            <Text className="text-xs text-slate-600" numberOfLines={2}>
              Catatan: {debt.note}
            </Text>
          </View>
        ) : null}

        {/* Divider */}
        <View className="my-3 border-t border-slate-100" />

        {/* Financial Summary */}
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-xs text-slate-400">Sisa Utang</Text>
            <PriceText amount={remainingDebt} size="lg" color={priceColor} />
          </View>

          <View className="items-end">
            <Text className="text-xs text-slate-500">Total: {formatRupiah(debt.total_debt)}</Text>
            {debt.paid_amount > 0 && debt.status !== 'paid' ? (
              <Text className="text-xs text-emerald-600">Terbayar: {formatRupiah(debt.paid_amount)}</Text>
            ) : null}
            {debt.created_at ? (
              <View className="mt-1 flex-row items-center gap-1">
                <Calendar size={11} color="#94A3B8" />
                <Text className="text-[11px] text-slate-400">{formatDate(debt.created_at)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>

      {/* Pay Button — only when debt not fully paid */}
      {remainingDebt > 0 && onPay ? (
        <Button
          label="Bayar"
          variant="primary"
          size="sm"
          icon={<Wallet size={14} color="#FFFFFF" />}
          className="mt-3"
          fullWidth
          onPress={() => onPay(debt)}
        />
      ) : null}
    </Card>
  );
}

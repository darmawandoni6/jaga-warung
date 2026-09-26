import { Text, View } from 'react-native';

import { Calendar } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { PeriodTimelineItem } from '@/types/report';

export interface PeriodTimelineCardProps {
  timeline: PeriodTimelineItem[];
}

export function PeriodTimelineCard({ timeline }: PeriodTimelineCardProps) {
  if (timeline.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 border border-slate-100 bg-white p-4">
      {/* Header */}
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-100">
          <Calendar size={16} color="#475569" />
        </View>
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rincian Harian</Text>
          <Text className="text-[11px] text-slate-400">Riwayat omzet & pengeluaran per tanggal</Text>
        </View>
      </View>

      {/* Daily Rows */}
      <View className="divide-y divide-slate-100">
        {timeline.slice(0, 10).map(row => (
          <View key={row.date} className="flex-row items-center justify-between py-2.5">
            <View className="flex-1 pr-2">
              <Text className="text-xs font-semibold text-slate-800">{row.label}</Text>
            </View>

            <View className="flex-row items-center gap-3">
              {row.sales > 0 && (
                <View className="items-end">
                  <Text className="text-[10px] text-slate-400">Masuk</Text>
                  <PriceText amount={row.sales} size="xs" color="success" bold />
                </View>
              )}

              {row.expense > 0 && (
                <View className="items-end">
                  <Text className="text-[10px] text-slate-400">Keluar</Text>
                  <PriceText amount={row.expense} size="xs" color="danger" bold />
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

import { Pressable, Text, View } from 'react-native';

import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react-native';

import type { ReportPeriod } from '@/types/report';
import { cn } from '@/utils';

export interface ReportPeriodSelectorProps {
  period: ReportPeriod;
  label: string;
  offset: number;
  onPeriodChange: (period: ReportPeriod) => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

const PERIOD_TABS: { key: ReportPeriod; label: string }[] = [
  { key: 'week', label: 'Mingguan' },
  { key: 'month', label: 'Bulanan' },
  { key: 'year', label: 'Tahunan' },
];

export function ReportPeriodSelector({
  period,
  label,
  offset,
  onPeriodChange,
  onPrev,
  onNext,
  onReset,
}: ReportPeriodSelectorProps) {
  const isCurrent = offset === 0;

  return (
    <View className="mb-4">
      {/* Segmented Control */}
      <View className="mb-3 flex-row rounded-xl bg-slate-200/70 p-1">
        {PERIOD_TABS.map(tab => {
          const isActive = period === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onPeriodChange(tab.key)}
              className={cn(
                'flex-1 items-center justify-center rounded-lg py-2 active:opacity-80',
                isActive ? 'border border-slate-200/80 bg-white' : 'bg-transparent',
              )}
            >
              <Text className={cn('text-xs font-bold', isActive ? 'text-emerald-700' : 'text-slate-600')}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Date Range Navigator */}
      <View className="flex-row items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2.5">
        <Pressable
          onPress={onPrev}
          className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 active:opacity-70"
          hitSlop={8}
        >
          <ChevronLeft size={18} color="#334155" />
        </Pressable>

        <View className="flex-1 items-center px-2">
          <Text className="text-xs font-bold text-slate-800" numberOfLines={1}>
            {label}
          </Text>
          {!isCurrent && (
            <Pressable
              onPress={onReset}
              className="mt-1 flex-row items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 active:opacity-70"
            >
              <RotateCcw size={10} color="#059669" />
              <Text className="text-[10px] font-semibold text-emerald-700">Kembali ke sekarang</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={onNext}
          disabled={isCurrent}
          className={cn(
            'h-8 w-8 items-center justify-center rounded-full active:opacity-70',
            isCurrent ? 'bg-slate-50 opacity-40' : 'bg-slate-100',
          )}
          hitSlop={8}
        >
          <ChevronRight size={18} color="#334155" />
        </Pressable>
      </View>
    </View>
  );
}

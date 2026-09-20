import { Pressable, Text, View } from 'react-native';

import { Minus, Plus } from 'lucide-react-native';

export interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max = 999,
  disabled = false,
  className = '',
}: QuantityControlProps) {
  return (
    <View className={`flex-row items-center gap-2 ${className}`}>
      <Pressable
        onPress={onDecrement}
        disabled={disabled || quantity <= min}
        className="rounded-full bg-slate-100 p-1.5 active:bg-slate-200 disabled:opacity-40"
        hitSlop={6}
      >
        <Minus size={14} color="#475569" />
      </Pressable>

      <Text className="w-7 text-center text-sm font-bold text-slate-900">{quantity}</Text>

      <Pressable
        onPress={onIncrement}
        disabled={disabled || quantity >= max}
        className="rounded-full bg-emerald-100 p-1.5 active:bg-emerald-200 disabled:opacity-40"
        hitSlop={6}
      >
        <Plus size={14} color="#059669" />
      </Pressable>
    </View>
  );
}

import { Pressable, Text, View } from 'react-native';

import { Trash2 } from 'lucide-react-native';

import { PriceText } from '@/components/ui/PriceText';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { type CartItem as CartItemType, useCartStore } from '@/store/useCartStore';

export interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const addItem = useCartStore(s => s.addItem);
  const decrementItem = useCartStore(s => s.decrementItem);
  const removeItem = useCartStore(s => s.removeItem);

  return (
    <View className="flex-row items-center gap-2 border-b border-slate-100 py-2.5">
      <View className="flex-1">
        <Text className="text-sm font-medium text-slate-800" numberOfLines={1}>
          {item.product.name}
        </Text>
        <PriceText amount={item.product.sell_price} size="xs" color="muted" bold={false} />
      </View>

      <QuantityControl
        quantity={item.quantity}
        onIncrement={() => addItem(item.product)}
        onDecrement={() => decrementItem(item.product.id)}
      />

      <View className="w-20 items-end">
        <PriceText amount={item.subtotal} size="sm" color="default" bold />
      </View>

      <Pressable onPress={() => removeItem(item.product.id)} hitSlop={8} className="p-1">
        <Trash2 size={16} color="#EF4444" />
      </Pressable>
    </View>
  );
}

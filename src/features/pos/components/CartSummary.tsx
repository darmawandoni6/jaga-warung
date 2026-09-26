import { useState } from 'react';

import { FlatList, Pressable, Text, View } from 'react-native';

import { ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { PriceText } from '@/components/ui/PriceText';
import { useCartStore } from '@/store/useCartStore';

import { CartItem } from './CartItem';

export interface CartSummaryProps {
  onCheckout?: () => void;
}

export function CartSummary({ onCheckout }: CartSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const items = useCartStore(s => s.items);
  const totalItems = useCartStore(s => s.totalItems());
  const totalPrice = useCartStore(s => s.totalPrice());

  const isEmpty = items.length === 0;

  return (
    <View className="border-t border-slate-200 bg-white px-4 pb-6 pt-3 shadow-md">
      {/* Expanded item list */}
      {isExpanded && !isEmpty && (
        <View className="mb-3 max-h-56">
          <FlatList
            data={items}
            keyExtractor={item => item.product.barcode}
            renderItem={({ item }) => <CartItem item={item} />}
          />
        </View>
      )}

      {/* Bar header / summary */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => !isEmpty && setIsExpanded(prev => !prev)}
          disabled={isEmpty}
          className="flex-1 flex-row items-center gap-2"
        >
          <View className="rounded-full bg-emerald-100 p-2">
            <ShoppingBag size={20} color="#10B981" />
          </View>
          <View>
            <View className="flex-row items-center gap-1">
              <Text className="text-xs font-medium text-slate-500">
                {isEmpty ? 'Keranjang Kosong' : `${totalItems} Barang`}
              </Text>
              {!isEmpty &&
                (isExpanded ? <ChevronDown size={14} color="#64748B" /> : <ChevronUp size={14} color="#64748B" />)}
            </View>
            <PriceText amount={totalPrice} size="lg" color="default" bold />
          </View>
        </Pressable>

        <Button
          label="Bayar"
          onPress={() => onCheckout?.()}
          variant="primary"
          size="md"
          disabled={isEmpty}
          className="px-6"
        />
      </View>
    </View>
  );
}

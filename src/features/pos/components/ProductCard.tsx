import { Pressable, Text, View } from 'react-native';

import { AlertTriangle, Plus } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import { useCartStore } from '@/store/useCartStore';
import type { Product } from '@/types/product';
import { getStockStatus } from '@/utils/stock';

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem);
  const cartQuantity = useCartStore(s => s.getItemQuantity(product.id));

  const stockStatus = getStockStatus(product.stock, product.min_stock);
  const isOutOfStock = stockStatus === 'empty';

  const badgeVariant = stockStatus === 'ok' ? 'neutral' : stockStatus === 'low' ? 'warning' : 'danger';

  const badgeLabel = isOutOfStock ? 'Habis' : stockStatus === 'low' ? `Sisa ${product.stock}` : `Stok ${product.stock}`;

  return (
    <Pressable
      onPress={() => !isOutOfStock && addItem(product)}
      disabled={isOutOfStock}
      className={`m-1.5 flex-1 ${isOutOfStock ? 'opacity-50' : 'active:opacity-80'}`}
    >
      <Card className="h-full justify-between p-3.5" elevated={cartQuantity > 0}>
        <View className="gap-1">
          <View className="flex-row items-center justify-between">
            <Badge label={badgeLabel} variant={badgeVariant} />
            {stockStatus === 'low' && <AlertTriangle size={14} color="#F59E0B" />}
            {cartQuantity > 0 && (
              <View className="h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                <Text className="text-xs font-bold text-white">{cartQuantity}</Text>
              </View>
            )}
          </View>
          <Text className="mt-1 text-sm font-semibold text-slate-900" numberOfLines={2}>
            {product.name}
          </Text>
        </View>

        <View className="mt-3 flex-row items-center justify-between border-t border-slate-50 pt-2">
          <PriceText amount={product.sell_price} size="sm" color="default" bold />
          {!isOutOfStock && (
            <View className="rounded-full bg-emerald-50 p-1">
              <Plus size={14} color="#10B981" />
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

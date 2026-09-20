import { Pressable, Text, View } from 'react-native';

import { AlertTriangle, Edit3 } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { Product } from '@/types/product';
import { getStockStatus } from '@/utils/stock';

export interface ProductListItemProps {
  product: Product;
  onEdit?: (product: Product) => void;
}

export function ProductListItem({ product, onEdit }: ProductListItemProps) {
  const stockStatus = getStockStatus(product.stock, product.min_stock);
  const isOutOfStock = stockStatus === 'empty';

  const badgeVariant = stockStatus === 'ok' ? 'neutral' : stockStatus === 'low' ? 'warning' : 'danger';

  const badgeLabel = isOutOfStock ? 'Habis' : stockStatus === 'low' ? `Sisa ${product.stock}` : `Stok ${product.stock}`;

  const profit = product.sell_price - product.buy_price;

  return (
    <Card className="mb-2.5 p-3.5">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Badge label={badgeLabel} variant={badgeVariant} />
            {stockStatus === 'low' && <AlertTriangle size={14} color="#F59E0B" />}
          </View>
          <Text className="mt-1.5 text-base font-semibold text-slate-900" numberOfLines={1}>
            {product.name}
          </Text>
        </View>

        <Pressable
          onPress={() => onEdit?.(product)}
          className="rounded-lg bg-slate-100 p-2 active:bg-slate-200"
          hitSlop={8}
        >
          <Edit3 size={16} color="#475569" />
        </Pressable>
      </View>

      <View className="mt-3 flex-row items-center justify-between border-t border-slate-50 pt-2.5">
        <View>
          <Text className="text-xs text-slate-400">Harga Jual</Text>
          <PriceText amount={product.sell_price} size="md" color="default" bold />
        </View>

        <View>
          <Text className="text-xs text-slate-400">Modal</Text>
          <PriceText amount={product.buy_price} size="sm" color="muted" bold={false} />
        </View>

        <View className="items-end">
          <Text className="text-xs text-slate-400">Untung/Margin</Text>
          <PriceText amount={profit} size="sm" color="success" bold />
        </View>
      </View>
    </Card>
  );
}

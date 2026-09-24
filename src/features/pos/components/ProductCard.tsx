import { Image, Pressable, Text, View } from 'react-native';

import { Minus, Plus } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import { useCartStore } from '@/store/useCartStore';
import type { Product } from '@/types/product';
import { getProductAlias } from '@/utils/product';
import { getStockStatus } from '@/utils/stock';

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem);
  const decrementItem = useCartStore(s => s.decrementItem);
  const cartQuantity = useCartStore(s => s.getItemQuantity(product.id));

  const stockStatus = getStockStatus(product.stock, product.min_stock);
  const isOutOfStock = stockStatus === 'empty';

  const badgeVariant = stockStatus === 'ok' ? 'neutral' : stockStatus === 'low' ? 'warning' : 'danger';
  const badgeLabel = isOutOfStock ? 'Habis' : `Sisa ${product.stock}`;

  const alias = getProductAlias(product.name);

  return (
    <Pressable
      onPress={() => !isOutOfStock && addItem(product)}
      disabled={isOutOfStock}
      accessibilityRole="button"
      className={`mb-2.5 flex-1 ${isOutOfStock ? 'opacity-50' : 'active:opacity-80'}`}
    >
      <Card className="min-h-[175px] overflow-hidden" elevated={cartQuantity > 0}>
        {/* Top Media: Image or Fallback Alias (Full Width) */}
        <View className="relative h-28 w-full bg-slate-100">
          {product.image ? (
            <Image source={{ uri: product.image }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <View className="h-full w-full items-center justify-center bg-emerald-50">
              <Text className="text-2xl font-bold text-emerald-800">{alias}</Text>
            </View>
          )}

          {/* Stock Badge Overlay */}
          <View className="absolute left-2 top-2">
            <Badge label={badgeLabel} variant={badgeVariant} size="sm" />
          </View>

          {/* Cart Quantity Badge Overlay */}
          {cartQuantity > 0 && (
            <View className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm">
              <Text className="text-xs font-bold text-white">{cartQuantity}</Text>
            </View>
          )}
        </View>

        {/* Card Body */}
        <View className="flex-1 justify-between p-3">
          <View>
            {/* Product Name (Primary) */}
            <Text className="text-base font-bold leading-5 text-slate-900" numberOfLines={2}>
              {product.name}
            </Text>

            {/* Product Type / Category (Secondary) */}
            <View className="mt-1">
              <Text className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {product.type ?? 'Umum'}
              </Text>
            </View>
          </View>

          {/* Bottom Section: Price & Quick Action */}
          <View className="mt-3 flex-row items-center justify-between border-t border-slate-50 pt-2.5">
            <PriceText amount={product.sell_price} size="lg" color="default" bold />
            {!isOutOfStock &&
              (cartQuantity > 0 ? (
                <View className="flex-row items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/80 p-0.5">
                  <Pressable
                    onPress={e => {
                      e.stopPropagation();
                      decrementItem(product.id);
                    }}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`Kurangi ${product.name}`}
                    className="shadow-xs h-7 w-7 items-center justify-center rounded-md bg-white active:bg-slate-100"
                  >
                    <Minus size={13} color="#059669" strokeWidth={2.5} />
                  </Pressable>
                  <Text className="min-w-[18px] text-center text-xs font-bold text-emerald-900">{cartQuantity}</Text>
                  <Pressable
                    onPress={e => {
                      e.stopPropagation();
                      if (cartQuantity < product.stock) {
                        addItem(product);
                      }
                    }}
                    hitSlop={6}
                    disabled={cartQuantity >= product.stock}
                    accessibilityRole="button"
                    accessibilityLabel={`Tambah ${product.name}`}
                    className="h-7 w-7 items-center justify-center rounded-md bg-emerald-500 active:bg-emerald-600 disabled:opacity-40"
                  >
                    <Plus size={13} color="#FFFFFF" strokeWidth={2.5} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={e => {
                    e.stopPropagation();
                    addItem(product);
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Tambah ${product.name}`}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-sm active:bg-emerald-600"
                >
                  <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                </Pressable>
              ))}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

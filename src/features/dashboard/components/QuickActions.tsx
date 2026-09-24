import { Pressable, Text, View } from 'react-native';

import { useRouter } from 'expo-router';
import { BookPlus, PlusCircle, ShoppingCart, Wallet } from 'lucide-react-native';

interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  iconBg: string;
  iconColor: string;
  onPress: () => void;
}

export function QuickActions() {
  const router = useRouter();

  const actions: QuickActionItem[] = [
    {
      id: 'pos',
      title: 'Buka Kasir',
      subtitle: 'Mulai Transaksi',
      icon: ShoppingCart,
      iconBg: 'bg-emerald-100',
      iconColor: '#059669',
      onPress: () => router.push('/(tabs)/pos'),
    },
    {
      id: 'add-product',
      title: 'Tambah Produk',
      subtitle: 'Barang Baru',
      icon: PlusCircle,
      iconBg: 'bg-blue-100',
      iconColor: '#2563EB',
      onPress: () => router.push('/(modals)/add-product'),
    },
    {
      id: 'add-debt',
      title: 'Catat Utang',
      subtitle: 'Bon Pelanggan',
      icon: BookPlus,
      iconBg: 'bg-amber-100',
      iconColor: '#D97706',
      onPress: () => router.push('/(modals)/add-debt'),
    },
    {
      id: 'cash-flow',
      title: 'Catat Kas',
      subtitle: 'Keluar / Masuk',
      icon: Wallet,
      iconBg: 'bg-purple-100',
      iconColor: '#7C3AED',
      onPress: () => router.push('/(tabs)/cash-flow'),
    },
  ];

  return (
    <View>
      <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Aksi Cepat</Text>
      <View className="flex-row flex-wrap gap-2.5">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.id}
              onPress={action.onPress}
              accessibilityRole="button"
              className="w-[48%] flex-row items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-3 shadow-sm active:bg-slate-50"
            >
              <View className={`h-10 w-10 items-center justify-center rounded-lg ${action.iconBg}`}>
                <Icon size={20} color={action.iconColor} />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-800">{action.title}</Text>
                <Text className="text-[10px] text-slate-500" numberOfLines={1}>
                  {action.subtitle}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

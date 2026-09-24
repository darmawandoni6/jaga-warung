import { Tabs } from 'expo-router';
import { BookOpen, LayoutDashboard, Package, ShoppingCart, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F1F5F9',
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: 'Kasir',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Produk',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="debt"
        options={{
          title: 'Utang',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="cash-flow"
        options={{
          title: 'Kas',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size ?? 22} />,
        }}
      />
    </Tabs>
  );
}

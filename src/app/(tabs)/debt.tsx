import { Text } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';

export default function DebtTab() {
  return (
    <ScreenContainer className="items-center justify-center">
      <Text className="text-xl font-bold text-slate-900">📖 Buku Utang</Text>
      <Text className="mt-1 text-sm text-slate-500">Catatan Utang Pelanggan</Text>
    </ScreenContainer>
  );
}

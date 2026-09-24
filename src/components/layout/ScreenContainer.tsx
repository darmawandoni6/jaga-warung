import type { ReactNode } from 'react';

import { View, type ViewStyle } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export interface ScreenContainerProps {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
  edges?: readonly ('top' | 'right' | 'bottom' | 'left')[];
}

export function ScreenContainer({
  children,
  className = '',
  style,
  edges = ['top', 'left', 'right'],
}: ScreenContainerProps) {
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: '#F8FAFC' }, style]}>
      <View className={`flex-1 bg-slate-50 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}

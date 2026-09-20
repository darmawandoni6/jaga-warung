import type { ReactNode } from 'react';

import type { ViewStyle } from 'react-native';

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
    <SafeAreaView edges={edges} className={`flex-1 bg-slate-50 ${className}`} style={style}>
      {children}
    </SafeAreaView>
  );
}

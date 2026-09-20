import type { ReactNode } from 'react';

import { Text, View } from 'react-native';

export interface EmptyStateProps {
  emoji?: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ emoji = '📦', icon, title, subtitle, action, className = '' }: EmptyStateProps) {
  return (
    <View className={`flex-1 items-center justify-center gap-2 p-8 ${className}`}>
      {icon ? icon : <Text className="text-5xl">{emoji}</Text>}
      <Text className="mt-1 text-center text-base font-semibold text-slate-700">{title}</Text>
      {subtitle ? <Text className="text-center text-sm text-slate-400">{subtitle}</Text> : null}
      {action}
    </View>
  );
}

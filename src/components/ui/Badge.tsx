import type { ReactNode } from 'react';

import { Text, View } from 'react-native';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  className?: string;
}

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700' },
  danger: { bg: 'bg-red-100', text: 'text-red-700' },
  neutral: { bg: 'bg-slate-100', text: 'text-slate-600' },
  info: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export function Badge({ label, variant = 'neutral', size = 'sm', icon, className = '' }: BadgeProps) {
  const style = BADGE_STYLES[variant];
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View className={`flex-row items-center gap-1 self-start rounded-full px-2 py-0.5 ${style.bg} ${className}`}>
      {icon}
      <Text className={`${textSize} font-medium ${style.text}`}>{label}</Text>
    </View>
  );
}

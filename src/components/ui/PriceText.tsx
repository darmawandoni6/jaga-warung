import { Text } from 'react-native';

import { formatRupiah } from '@/utils/currency';

export interface PriceTextProps {
  amount: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'success' | 'danger' | 'warning' | 'default' | 'muted';
  bold?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const COLOR_MAP = {
  success: 'text-emerald-600',
  danger: 'text-red-500',
  warning: 'text-amber-600',
  default: 'text-slate-900',
  muted: 'text-slate-500',
};

export function PriceText({ amount, size = 'md', color = 'default', bold = true, className = '' }: PriceTextProps) {
  return (
    <Text className={`${SIZE_MAP[size]} ${COLOR_MAP[color]} ${bold ? 'font-bold' : ''} ${className}`}>
      {formatRupiah(amount)}
    </Text>
  );
}

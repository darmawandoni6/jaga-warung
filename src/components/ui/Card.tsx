import type { ReactNode } from 'react';

import { View, type ViewProps } from 'react-native';

import { cn } from '@/utils';

export interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = '', elevated = false, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-xl border bg-white', elevated ? 'border-slate-200' : 'border-slate-100', className)}
      {...props}
    >
      {children}
    </View>
  );
}

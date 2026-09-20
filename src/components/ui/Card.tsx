import type { ReactNode } from 'react';

import { View, type ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = '', elevated = false, ...props }: CardProps) {
  return (
    <View
      className={`rounded-xl border border-slate-100 bg-white ${
        elevated ? 'shadow-sm shadow-slate-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

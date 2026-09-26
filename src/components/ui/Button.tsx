import type { ReactNode } from 'react';

import { ActivityIndicator, Pressable, Text } from 'react-native';

import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label?: string;
  children?: ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-emerald-500 active:bg-emerald-600', text: 'text-white' },
  secondary: { container: 'bg-slate-100 active:bg-slate-200', text: 'text-slate-700' },
  danger: { container: 'bg-red-500 active:bg-red-600', text: 'text-white' },
  ghost: { container: 'bg-transparent active:bg-slate-100', text: 'text-slate-600' },
};

const SIZE_STYLES: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'px-3 py-1.5 rounded-lg', text: 'text-sm' },
  md: { container: 'px-5 py-2.5 rounded-xl', text: 'text-base' },
  lg: { container: 'px-6 py-3.5 rounded-xl', text: 'text-lg' },
};

export function Button({
  label,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  className = '',
}: ButtonProps) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2',
        v.container,
        s.container,
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'ghost' ? '#0F172A' : '#FFFFFF'}
        />
      ) : (
        icon
      )}
      {label ? (
        <Text numberOfLines={1} className={cn('font-semibold', v.text, s.text)}>
          {label}
        </Text>
      ) : null}
      {children}
    </Pressable>
  );
}

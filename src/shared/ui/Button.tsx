/**
 * RN-порт shared/ui/Button из sct-web. Пропсы зеркалят веб 1:1
 * (variant/size/fullWidth/loading/leftIcon/rightIcon), чтобы код экранов
 * переносился без правок. Реализация — Pressable + Text + NativeWind.
 */
import { forwardRef, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from 'react-native'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

const container: Record<Variant, string> = {
  primary: 'bg-brandBlue',
  secondary: 'bg-surfaceLight border border-borderLight',
  ghost: 'bg-transparent',
  danger: 'bg-red-50 border border-red-100',
  dark: 'bg-textPrimary',
}

const labelColor: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-textPrimary',
  ghost: 'text-textSecondary',
  danger: 'text-red-600',
  dark: 'text-white',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4',
  md: 'h-12 px-6',
  lg: 'h-14 px-8',
}

const labelSize: Record<Size, string> = {
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
}

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    loading,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading
  const lightSpinner = variant === 'primary' || variant === 'dark'

  return (
    <Pressable
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-sct active:opacity-90',
        container[variant],
        sizes[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-60',
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={lightSpinner ? '#fff' : '#1F5FAF'} />
      ) : (
        leftIcon
      )}
      {typeof children === 'string' ? (
        <Text
          style={{ fontFamily: 'Inter_900Black' }}
          className={cn('uppercase tracking-widest', labelColor[variant], labelSize[size])}
        >
          {children}
        </Text>
      ) : (
        children
      )}
      {!loading && rightIcon}
    </Pressable>
  )
})

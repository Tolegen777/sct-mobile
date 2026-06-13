/**
 * Текстовое поле с лейблом, ошибкой и опциональным слотом справа.
 * RN-порт shared/ui/Input.tsx из веба — пропсы зеркалят веб (label/hint/error/
 * rightSlot) + любые TextInputProps. forwardRef на TextInput (совместимо с RHF
 * через Controller).
 */
import { forwardRef, type ReactNode } from 'react'
import { Text, TextInput, View, type TextInputProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

export interface InputProps extends TextInputProps {
  label?: string
  hint?: string
  error?: string
  rightSlot?: ReactNode
  className?: string
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, hint, error, rightSlot, className, ...rest },
  ref,
) {
  return (
    <View className="w-full">
      {label ? (
        <Text
          style={{ fontFamily: 'Inter_700Bold' }}
          className="mb-2 text-[11px] uppercase tracking-widest text-textSecondary"
        >
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'flex-row items-center rounded-sct border bg-surfaceLight px-4',
          error ? 'border-red-400' : 'border-borderLight',
        )}
      >
        <TextInput
          ref={ref}
          placeholderTextColor="#9AA5B1"
          className={cn('h-12 flex-1 text-sm text-textPrimary', className)}
          {...rest}
        />
        {rightSlot ? <View className="pl-2">{rightSlot}</View> : null}
      </View>
      {error ? (
        <Text className="mt-1.5 text-[11px] text-red-600">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-[11px] text-textSecondary">{hint}</Text>
      ) : null}
    </View>
  )
})

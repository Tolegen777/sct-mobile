/**
 * Многострочное поле (RN-порт shared/ui/Textarea.tsx) — TextInput multiline.
 * Пропсы зеркалят веб: label/hint/error + TextInputProps. `rows` → высота.
 */
import { forwardRef } from 'react'
import { Text, TextInput, View, type TextInputProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

export interface TextareaProps extends TextInputProps {
  label?: string
  hint?: string
  error?: string
  rows?: number
  className?: string
}

export const Textarea = forwardRef<TextInput, TextareaProps>(function Textarea(
  { label, hint, error, rows = 4, className, ...rest },
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
      <TextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#9AA5B1"
        style={{ minHeight: rows * 22 }}
        className={cn(
          'rounded-sct border bg-surfaceLight px-4 py-3 text-sm text-textPrimary',
          error ? 'border-red-400' : 'border-borderLight',
          className,
        )}
        {...rest}
      />
      {error ? (
        <Text className="mt-1.5 text-[11px] text-red-600">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-[11px] text-textSecondary">{hint}</Text>
      ) : null}
    </View>
  )
})

/**
 * Выпадающий список (RN-порт shared/ui/Select.tsx).
 *
 * ⚠️ Отличие от веба: в RN нет нативного <select>/<option>, поэтому API —
 * на массиве `options` (а не children). Поле = Pressable, открывающее Modal
 * со списком. Для длинных списков (выбор модели среди сотен) использовать
 * отдельный SearchableSelect — см. порт features/garage/add-car.
 */
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Modal } from './Modal'
import { cn } from '@/shared/lib/cn'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps {
  label?: string
  hint?: string
  error?: string
  value?: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

export function Select({
  label,
  hint,
  error,
  value,
  onChange,
  options,
  placeholder = 'Выберите…',
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

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

      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          'h-12 flex-row items-center justify-between rounded-sct border bg-surfaceLight px-4',
          error ? 'border-red-400' : 'border-borderLight',
          disabled && 'opacity-50',
        )}
      >
        <Text className={cn('text-sm', selected ? 'text-textPrimary' : 'text-textSecondary')}>
          {selected?.label ?? placeholder}
        </Text>
        <Text className="text-textSecondary">▾</Text>
      </Pressable>

      {error ? (
        <Text className="mt-1.5 text-[11px] text-red-600">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-[11px] text-textSecondary">{hint}</Text>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title={label}>
        <View className="gap-1">
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  'rounded-sct px-4 py-3',
                  active ? 'bg-brandBlue/10' : 'bg-transparent',
                )}
              >
                <Text className={cn('text-base', active ? 'text-brandBlue' : 'text-textPrimary')}>
                  {opt.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </Modal>
    </View>
  )
}

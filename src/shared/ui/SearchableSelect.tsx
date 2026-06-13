/**
 * Combobox с поиском (RN-порт shared/ui/SearchableSelect.tsx).
 *
 * Триггер выглядит как Select; по тапу открывается модалка-шит снизу с полем
 * поиска и списком опций (фильтр по `label` + `keywords`). Нужен для длинных
 * списков (напр. 400+ марок авто).
 *
 * Управляемый: `value` — строка ('' = ничего не выбрано), `onChange` отдаёт
 * строковое значение опции (или '' при сбросе) — совместимо с тем, как ведёт
 * себя Select в этом проекте.
 */
import { useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/shared/lib/cn'

export interface SearchableSelectOption {
  value: string | number
  label: string
  /** Доп. строка для поиска (не показывается). Напр. латинское имя марки —
   *  чтобы ввод «toyo» находил «Тойота». */
  keywords?: string
}

interface SearchableSelectProps {
  label?: string
  value: string
  options: SearchableSelectOption[]
  onChange: (next: string) => void
  disabled?: boolean
  /** Текст в свёрнутом состоянии, когда ничего не выбрано. */
  placeholder?: string
  /** Подпись опции сброса в списке (по умолчанию = placeholder). */
  emptyLabel?: string
}

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder = 'Все',
  emptyLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = options.find((o) => String(o.value) === value) ?? null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => `${o.label} ${o.keywords ?? ''}`.toLowerCase().includes(q))
  }, [options, query])

  const close = () => {
    setOpen(false)
    setQuery('')
  }
  const pick = (next: string) => {
    onChange(next)
    close()
  }

  return (
    <View className="w-full">
      {label ? (
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="mb-2 text-[11px] uppercase tracking-widest text-textSecondary">
          {label}
        </Text>
      ) : null}

      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          'h-12 flex-row items-center justify-between gap-2 rounded-sct border border-borderLight bg-surfaceLight px-4',
          disabled && 'opacity-50',
        )}
      >
        <Text numberOfLines={1} className={cn('flex-1 text-sm', selected ? 'text-textPrimary' : 'text-textSecondary')}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#4B5968" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        {/* Затемнённый фон — тап закрывает */}
        <Pressable onPress={close} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          {/* Шит снизу — тап по нему НЕ закрывает (перехватываем onPress) */}
          <Pressable
            onPress={() => {}}
            style={{
              marginTop: 'auto',
              height: '75%',
              backgroundColor: '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 16,
            }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Inter_900Black' }} numberOfLines={1} className="flex-1 text-base uppercase text-textPrimary">
                {label || 'Выбор'}
              </Text>
              <Pressable onPress={close} hitSlop={8} className="ml-3">
                <Ionicons name="close" size={22} color="#18202A" />
              </Pressable>
            </View>

            <View className="mb-3 flex-row items-center gap-2 rounded-sct border border-borderLight bg-surfaceLight px-3">
              <Ionicons name="search" size={16} color="#9AA5B1" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Поиск…"
                placeholderTextColor="#9AA5B1"
                autoCapitalize="none"
                className="h-11 flex-1 text-sm text-textPrimary"
              />
            </View>

            <FlatList
              style={{ flex: 1 }}
              data={filtered}
              keyExtractor={(o) => String(o.value)}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <Pressable onPress={() => pick('')} className="py-3">
                  <Text
                    style={{ fontFamily: !selected ? 'Inter_700Bold' : undefined }}
                    className={cn('text-sm', !selected ? 'text-brandBlue' : 'text-textSecondary')}
                  >
                    {emptyLabel ?? placeholder}
                  </Text>
                </Pressable>
              }
              renderItem={({ item: o }) => {
                const active = String(o.value) === value
                return (
                  <Pressable onPress={() => pick(String(o.value))} className="border-t border-borderLight py-3">
                    <Text
                      style={{ fontFamily: active ? 'Inter_700Bold' : undefined }}
                      className={cn('text-sm', active ? 'text-brandBlue' : 'text-textPrimary')}
                    >
                      {o.label}
                    </Text>
                  </Pressable>
                )
              }}
              ListEmptyComponent={
                <Text className="py-4 text-center text-sm text-textSecondary">Ничего не найдено</Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

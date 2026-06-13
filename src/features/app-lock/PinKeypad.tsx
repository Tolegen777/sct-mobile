/**
 * Презентационная цифровая клавиатура с индикатором-точками.
 * Не хранит состояние пина — родитель передаёт `filled` и обрабатывает ввод.
 */
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PinKeypadProps {
  /** Сколько точек заполнено. */
  filled: number
  /** Всего точек. */
  total: number
  onDigit: (digit: string) => void
  onDelete: () => void
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
]

export function PinKeypad({ filled, total, onDigit, onDelete }: PinKeypadProps) {
  return (
    <View className="items-center gap-8">
      {/* Точки */}
      <View className="flex-row gap-4">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            className={`h-4 w-4 rounded-full ${
              i < filled ? 'bg-brandBlue' : 'bg-borderLight'
            }`}
          />
        ))}
      </View>

      {/* Клавиатура */}
      <View className="gap-4">
        {ROWS.map((row, r) => (
          <View key={r} className="flex-row gap-6">
            {row.map((key, c) => {
              if (key === '') return <View key={c} className="h-16 w-16" />
              if (key === 'del')
                return (
                  <Pressable
                    key={c}
                    onPress={onDelete}
                    className="h-16 w-16 items-center justify-center"
                  >
                    <Ionicons name="backspace-outline" size={28} color="#18202A" />
                  </Pressable>
                )
              return (
                <Pressable
                  key={c}
                  onPress={() => onDigit(key)}
                  className="h-16 w-16 items-center justify-center rounded-full border border-borderLight active:bg-surfaceLight"
                >
                  <Text
                    style={{ fontFamily: 'Inter_700Bold' }}
                    className="text-2xl text-textPrimary"
                  >
                    {key}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}

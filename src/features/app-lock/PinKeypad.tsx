/**
 * Презентационная цифровая клавиатура с индикатором-точками.
 * Не хранит состояние пина — родитель передаёт `filled` и обрабатывает ввод.
 *
 * `tone`:
 *   'light' — светлый текст/точки для тёмного (navy) фона (замок, setup)
 *   'dark'  — тёмный текст для светлого фона
 */
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Tone = 'light' | 'dark'

interface PinKeypadProps {
  /** Сколько точек заполнено. */
  filled: number
  /** Всего точек. */
  total: number
  onDigit: (digit: string) => void
  onDelete: () => void
  tone?: Tone
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
]

export function PinKeypad({
  filled,
  total,
  onDigit,
  onDelete,
  tone = 'dark',
}: PinKeypadProps) {
  const light = tone === 'light'
  const dotFilled = light ? 'bg-brandYellow' : 'bg-brandBlue'
  const dotEmpty = light ? 'bg-white/25' : 'bg-borderLight'
  const keyBorder = light ? 'border-white/20' : 'border-borderLight'
  const keyText = light ? 'text-white' : 'text-textPrimary'
  const iconColor = light ? '#FFFFFF' : '#18202A'

  return (
    <View className="items-center gap-8">
      {/* Точки */}
      <View className="flex-row gap-4">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            className={`h-4 w-4 rounded-full ${i < filled ? dotFilled : dotEmpty}`}
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
                    <Ionicons name="backspace-outline" size={28} color={iconColor} />
                  </Pressable>
                )
              return (
                <Pressable
                  key={c}
                  onPress={() => onDigit(key)}
                  className={`h-16 w-16 items-center justify-center rounded-full border ${keyBorder} active:bg-white/10`}
                >
                  <Text
                    style={{ fontFamily: 'Inter_700Bold' }}
                    className={`text-2xl ${keyText}`}
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

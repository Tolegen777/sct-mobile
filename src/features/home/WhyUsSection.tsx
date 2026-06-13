/**
 * «Преимущества» на гостевой главной — RN-порт features/home/WhyUsSection.tsx.
 * Статический контент. SVG-иконки заменены на @expo/vector-icons.
 */
import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const BENEFITS: { title: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    title: 'Гарантия качества',
    desc: 'Официальная гарантия на все выполненные работы и установленные запчасти.',
    icon: 'shield-checkmark-outline',
  },
  {
    title: 'Полная прозрачность',
    desc: 'Никаких скрытых платежей. Точная стоимость пакета известна заранее.',
    icon: 'pricetags-outline',
  },
  {
    title: 'Экономия времени',
    desc: 'Онлайн-запись в два клика, удобное время и филиал в личном кабинете.',
    icon: 'time-outline',
  },
]

export function WhyUsSection() {
  return (
    <View className="gap-4">
      {BENEFITS.map((b) => (
        <View key={b.title} className="rounded-sct border border-borderLight bg-white p-6">
          <View className="flex-row items-center gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Ionicons name={b.icon} size={24} color="#1F5FAF" />
            </View>
            <Text style={{ fontFamily: 'Inter_900Black' }} className="flex-1 text-base uppercase leading-tight text-textPrimary">
              {b.title}
            </Text>
          </View>
          <Text className="mt-4 text-sm leading-relaxed text-textSecondary">{b.desc}</Text>
        </View>
      ))}
    </View>
  )
}

/**
 * Кнопка «Записаться на сервис» — RN-порт features/service-book/
 * BookServiceCTA.tsx. Ведёт на /services.
 */
import { Pressable, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export function BookServiceCTA() {
  const router = useRouter()
  return (
    <Pressable
      onPress={() => router.push('/services')}
      className="flex-row items-center justify-center gap-3 rounded-sct bg-brandBlue px-6 py-4 active:opacity-90"
    >
      <Ionicons name="calendar-outline" size={20} color="#ffffff" />
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-sm uppercase tracking-widest text-white">
        Записаться на сервис
      </Text>
    </Pressable>
  )
}

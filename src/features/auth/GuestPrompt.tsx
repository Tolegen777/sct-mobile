/**
 * Экран для гостя на страницах, где данные требуют auth — RN-порт
 * features/auth/GuestPrompt.tsx. Кнопки ведут на экраны /register и /login
 * (во вебе открывали глобальные модалки через ?modal=...).
 */
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

export function GuestPrompt({ title, description }: { title: string; description: string }) {
  const router = useRouter()

  return (
    <View className="flex-1 items-center justify-center bg-surfaceLight p-6">
      <Card className="w-full items-center p-8">
        <View className="mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-brandBlue/10">
          <Ionicons name="lock-closed-outline" size={32} color="#1F5FAF" />
        </View>
        <Text
          style={{ fontFamily: 'Inter_900Black' }}
          className="text-center text-2xl uppercase text-textPrimary"
        >
          {title}
        </Text>
        <Text className="mt-3 text-center text-textSecondary">{description}</Text>

        <View className="mt-8 w-full gap-3">
          <Button fullWidth size="lg" onPress={() => router.push('/register')}>
            Зарегистрироваться
          </Button>
          <Button fullWidth size="lg" variant="ghost" onPress={() => router.push('/login')}>
            У меня уже есть аккаунт
          </Button>
        </View>
      </Card>
    </View>
  )
}

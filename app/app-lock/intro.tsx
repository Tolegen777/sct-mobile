/**
 * Экран-предложение настроить код-пароль — показывается ОДИН раз после входа,
 * если замок ещё не включён. Флаг «показано» ставим при монтировании, чтобы
 * больше не предлагать автоматически (включить можно в профиле).
 */
import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { RequireAuth } from '@/shared/ui/RequireAuth'
import { Button } from '@/shared/ui/Button'
import * as storage from '@/features/app-lock/storage'

export default function AppLockIntroScreen() {
  return (
    <RequireAuth>
      <IntroContent />
    </RequireAuth>
  )
}

function IntroContent() {
  const router = useRouter()

  useEffect(() => {
    void storage.setPromptSeen()
  }, [])

  return (
    <View className="flex-1 items-center justify-center bg-white px-6 gap-6">
      <View className="h-20 w-20 items-center justify-center rounded-sct-lg bg-navy">
        <Ionicons name="lock-closed" size={36} color="#fff" />
      </View>

      <View className="items-center gap-2">
        <Text
          style={{ fontFamily: 'Inter_900Black' }}
          className="text-xl uppercase text-textPrimary"
        >
          Быстрый вход
        </Text>
        <Text className="text-center text-sm leading-5 text-textSecondary">
          Входите по коду или Face ID — быстрее и безопаснее, чем вводить пароль
          каждый раз.
        </Text>
      </View>

      <View className="w-full gap-3 pt-2">
        <Button
          fullWidth
          size="lg"
          onPress={() => router.replace('/app-lock/setup?from=intro')}
        >
          Включить код-пароль
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.replace('/')}>
          Позже
        </Button>
      </View>
    </View>
  )
}

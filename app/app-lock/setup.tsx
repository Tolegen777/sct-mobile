/**
 * Экран задания/смены пина: шаг «ввести» → шаг «повторить».
 * Используется и для первичной установки, и для смены кода.
 * Маршрут защищён RequireAuth (пин задаёт только авторизованный юзер).
 *
 * Параметр `from=intro` означает, что пришли с экрана-предложения после входа —
 * после сохранения уводим на главную, а не назад (назад там — стек логина).
 */
import { useState } from 'react'
import { View, Text } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { RequireAuth } from '@/shared/ui/RequireAuth'
import { PinKeypad } from '@/features/app-lock/PinKeypad'
import { useAppLockStore } from '@/features/app-lock/store'
import { generateSalt, hashPin } from '@/features/app-lock/crypto'
import * as storage from '@/features/app-lock/storage'
import { PIN_LENGTH } from '@/features/app-lock/config'

export default function AppLockSetupScreen() {
  return (
    <RequireAuth>
      <SetupForm />
    </RequireAuth>
  )
}

function SetupForm() {
  const router = useRouter()
  const { from } = useLocalSearchParams<{ from?: string }>()
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [first, setFirst] = useState('')
  const [entered, setEntered] = useState('')
  const [error, setError] = useState<string | null>(null)

  const save = async (pin: string) => {
    const salt = await generateSalt()
    const hash = await hashPin(pin, salt)
    await storage.setPin(salt, hash)
    await storage.setEnabled(true)
    await storage.setFailedAttempts(0)
    await useAppLockStore.getState().reloadConfig()
    if (from === 'intro') router.replace('/')
    else router.back()
  }

  const onComplete = (pin: string) => {
    if (step === 'enter') {
      setFirst(pin)
      setEntered('')
      setError(null)
      setStep('confirm')
      return
    }
    if (pin !== first) {
      setError('Коды не совпали. Попробуйте снова.')
      setFirst('')
      setEntered('')
      setStep('enter')
      return
    }
    void save(pin)
  }

  const onDigit = (d: string) => {
    if (entered.length >= PIN_LENGTH) return
    const next = entered + d
    setError(null)
    setEntered(next)
    if (next.length === PIN_LENGTH) {
      // сбрасываем видимый ввод и передаём в обработчик
      setEntered('')
      onComplete(next)
    }
  }

  const onDelete = () => setEntered((p) => p.slice(0, -1))

  return (
    <View className="flex-1 items-center justify-center bg-navy px-6 gap-10">
      <View className="items-center gap-2">
        <Text
          style={{ fontFamily: 'Inter_700Bold' }}
          className="text-base text-white"
        >
          {step === 'enter' ? 'Придумайте код' : 'Повторите код'}
        </Text>
        {error ? (
          <Text className="text-sm text-brandYellow">{error}</Text>
        ) : (
          <Text className="text-sm text-white/60">
            {PIN_LENGTH} цифры для входа в приложение
          </Text>
        )}
      </View>

      <PinKeypad
        filled={entered.length}
        total={PIN_LENGTH}
        onDigit={onDigit}
        onDelete={onDelete}
        tone="light"
      />
    </View>
  )
}

/**
 * Экран замка (оверлей). Авто-вызов биометрии при появлении, ввод пина,
 * счётчик попыток, выход после MAX_ATTEMPTS.
 *
 * Очистку хранилища при выходе делает AppLockGate (по переходу phase→guest),
 * поэтому здесь достаточно вызвать authStore.logout() и увести на /login.
 */
import { useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/features/auth/store'
import { PinKeypad } from './PinKeypad'
import { useAppLockStore } from './store'
import { hashPin } from './crypto'
import * as storage from './storage'
import { isBiometricAvailable, authenticateBiometric } from './biometrics'
import { PIN_LENGTH, MAX_ATTEMPTS } from './config'

export function LockScreen() {
  const router = useRouter()
  const unlock = useAppLockStore((s) => s.unlock)
  const biometricEnabled = useAppLockStore((s) => s.biometricEnabled)
  const logout = useAuthStore((s) => s.logout)

  const [entered, setEntered] = useState('')
  const [error, setError] = useState<string | null>(null)

  const tryBiometric = async () => {
    if (!(await isBiometricAvailable())) return
    if (await authenticateBiometric()) unlock()
  }

  // Авто-вызов биометрии при появлении замка.
  useEffect(() => {
    if (biometricEnabled) void tryBiometric()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = () => {
    logout() // phase→guest; AppLockGate сотрёт пин и снимет замок
    router.replace('/login')
  }

  const verify = async (pin: string) => {
    const cfg = await storage.loadConfig()
    const hash = await hashPin(pin, cfg.salt ?? '')
    if (hash === cfg.hash) {
      unlock()
      return
    }
    const attempts = (await storage.getFailedAttempts()) + 1
    await storage.setFailedAttempts(attempts)
    if (attempts >= MAX_ATTEMPTS) {
      handleLogout()
      return
    }
    setError(`Неверный код. Осталось попыток: ${MAX_ATTEMPTS - attempts}`)
    setEntered('')
  }

  const onDigit = (d: string) => {
    if (entered.length >= PIN_LENGTH) return
    const next = entered + d
    setError(null)
    setEntered(next)
    if (next.length === PIN_LENGTH) void verify(next)
  }

  const onDelete = () => setEntered((p) => p.slice(0, -1))

  return (
    <View className="absolute inset-0 z-50 bg-white px-6 pt-24 pb-10">
      <View className="flex-1 items-center justify-between">
        <View className="items-center gap-3">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-brandBlue">
            <Ionicons name="lock-closed" size={28} color="#fff" />
          </View>
          <Text
            style={{ fontFamily: 'Inter_900Black' }}
            className="text-lg uppercase text-textPrimary"
          >
            Введите код
          </Text>
          {error ? (
            <Text className="text-sm text-red-600">{error}</Text>
          ) : (
            <Text className="text-sm text-textSecondary">
              Для входа в приложение
            </Text>
          )}
        </View>

        <PinKeypad
          filled={entered.length}
          total={PIN_LENGTH}
          onDigit={onDigit}
          onDelete={onDelete}
        />

        <View className="w-full items-center gap-4">
          {biometricEnabled ? (
            <Pressable
              onPress={tryBiometric}
              className="flex-row items-center gap-2"
            >
              <Ionicons name="scan-outline" size={20} color="#18202A" />
              <Text className="text-textPrimary">Использовать Face ID</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={handleLogout}>
            <Text className="text-sm text-textSecondary underline">
              Войти паролем
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

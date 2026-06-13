/**
 * Экран замка (оверлей). Авто-вызов биометрии при появлении, ввод пина,
 * счётчик попыток, выход после MAX_ATTEMPTS. Фирменный navy-фон + приветствие.
 *
 * Очистку хранилища при выходе делает AppLockGate (по переходу phase→guest),
 * поэтому здесь достаточно вызвать authStore.logout() и увести на /login.
 */
import { useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/features/auth/store'
import type { ClientProfile } from '@/shared/api/types'
import { PinKeypad } from './PinKeypad'
import { useAppLockStore } from './store'
import { hashPin } from './crypto'
import * as storage from './storage'
import { isBiometricAvailable, authenticateBiometric } from './biometrics'
import { PIN_LENGTH, MAX_ATTEMPTS } from './config'

function initials(p: ClientProfile | null): string {
  if (!p) return '—'
  const f = p.first_name?.charAt(0) ?? ''
  const l = p.last_name?.charAt(0) ?? ''
  return (f + l).toUpperCase() || (p.phone?.slice(-2) ?? '—')
}

export function LockScreen() {
  const router = useRouter()
  const unlock = useAppLockStore((s) => s.unlock)
  const biometricEnabled = useAppLockStore((s) => s.biometricEnabled)
  const logout = useAuthStore((s) => s.logout)
  const profile = useAuthStore((s) => s.profile)

  const [entered, setEntered] = useState('')
  const [error, setError] = useState<string | null>(null)

  const firstName = profile?.first_name?.trim()
  const greeting = firstName ? `Здравствуйте, ${firstName}` : 'С возвращением'

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
    <View className="absolute inset-0 z-50 bg-navy px-6 pt-24 pb-10">
      <View className="flex-1 items-center justify-between">
        <View className="items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-brandBlue">
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-lg text-white">
              {initials(profile)}
            </Text>
          </View>
          <View className="items-center gap-1">
            <Text
              style={{ fontFamily: 'Inter_700Bold' }}
              className="text-base text-white"
            >
              {greeting}
            </Text>
            {error ? (
              <Text className="text-sm text-brandYellow">{error}</Text>
            ) : (
              <Text className="text-sm text-white/60">Введите код для входа</Text>
            )}
          </View>
        </View>

        <PinKeypad
          filled={entered.length}
          total={PIN_LENGTH}
          onDigit={onDigit}
          onDelete={onDelete}
          tone="light"
        />

        <View className="w-full items-center gap-4">
          {biometricEnabled ? (
            <Pressable
              onPress={tryBiometric}
              className="flex-row items-center gap-2"
            >
              <Ionicons name="scan-outline" size={20} color="#F2C94C" />
              <Text className="text-white">Войти по Face ID</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={handleLogout}>
            <Text className="text-sm text-white/60 underline">Войти паролем</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
